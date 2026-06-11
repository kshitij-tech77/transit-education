import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { contestDb } from '@/lib/contest-supabase';
import { generateOtp, generateOtpEmailHtml } from '@/lib/contest-auth';
import { rateLimit } from '@/lib/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const emailLower = email.toLowerCase().trim();

    // Rate limit: max 3 OTP requests per email per hour
    const allowed = rateLimit(`otp:${emailLower}`, 3, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before requesting another code.' },
        { status: 429 }
      );
    }

    // Invalidate any existing unused OTPs for this email
    await contestDb
      .from('otp_codes')
      .update({ used: true })
      .eq('email', emailLower)
      .eq('used', false);

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insertError } = await contestDb.from('otp_codes').insert({
      email: emailLower,
      code: otp,
      expires_at: expiresAt,
      used: false,
    });

    if (insertError) {
      console.error('OTP insert error:', insertError);
      return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
    }

    const { error: emailError } = await resend.emails.send({
      from: 'Transit Education <noreply@transiteducation.com.np>',
      to: emailLower,
      subject: 'Your Transit Education Predict & Win verification code',
      html: generateOtpEmailHtml(otp, emailLower),
    });

    if (emailError) {
      console.error('Email send error:', emailError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email.',
    });
  } catch (err) {
    console.error('OTP send error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
