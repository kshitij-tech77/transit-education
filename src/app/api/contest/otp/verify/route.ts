import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { contestDb } from '@/lib/contest-supabase';
import { signContestToken } from '@/lib/contest-auth';

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const { email, code } = parsed.data;
    const emailLower = email.toLowerCase().trim();

    // Find valid OTP
    const { data: otpRecord, error: otpError } = await contestDb
      .from('otp_codes')
      .select('*')
      .eq('email', emailLower)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await contestDb
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpRecord.id);

    // Get or create contest user
    let { data: existingUser } = await contestDb
      .from('contest_users')
      .select('*')
      .eq('email', emailLower)
      .single();

    let isNewUser = false;

    if (!existingUser) {
      const { data: newUser, error: createError } = await contestDb
        .from('contest_users')
        .insert({
          email: emailLower,
          is_verified: true,
          profile_complete: false,
          avatar_color: '#2563eb',
        })
        .select()
        .single();

      if (createError || !newUser) {
        console.error('User create error:', createError);
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
      }

      existingUser = newUser;
      isNewUser = true;
    } else {
      // Mark existing user as verified
      await contestDb
        .from('contest_users')
        .update({ is_verified: true })
        .eq('id', existingUser.id);
    }

    const token = await signContestToken({
      userId: existingUser.id,
      email: emailLower,
    });

    // Set httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('contest_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: existingUser,
      token,
      isNewUser,
    });
  } catch (err) {
    console.error('OTP verify error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
