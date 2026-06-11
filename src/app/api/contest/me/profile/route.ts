import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { contestDb } from '@/lib/contest-supabase';
import { getContestUserFromRequest } from '@/lib/contest-auth';

const schema = z.object({
  display_name: z.string().min(1).max(50),
  city: z.string().min(1).max(100),
  qualification: z.enum(['SEE/SLC', '+2/A-Levels', "Bachelor's", "Master's", 'Other']),
  favourite_team: z.string().max(100).optional(),
  avatar_color: z.enum(['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']),
});

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getContestUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { display_name, city, qualification, favourite_team, avatar_color } = parsed.data;

    const { data: updatedUser, error: updateError } = await contestDb
      .from('contest_users')
      .update({
        display_name,
        city,
        qualification,
        favourite_team: favourite_team || null,
        avatar_color,
        profile_complete: true,
      })
      .eq('id', authUser.userId)
      .select()
      .single();

    if (updateError || !updatedUser) {
      console.error('Profile update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Ensure leaderboard entry exists
    await contestDb
      .from('leaderboard_cache')
      .upsert(
        { user_id: authUser.userId },
        { onConflict: 'user_id', ignoreDuplicates: true }
      );

    // ── Lead pipeline integration ─────────────────────────────────────────
    // Silently upsert into main students table as a lead
    try {
      const { data: existingStudent } = await contestDb
        .from('students')
        .select('id, source')
        .eq('email', authUser.email)
        .single();

      if (!existingStudent) {
        await contestDb.from('students').insert({
          email: authUser.email,
          name: display_name,
          city,
          status: 'PENDING',
          source: 'world_cup_contest',
          notes: 'Joined via FIFA World Cup 2026 Predict & Win contest',
          created_at: new Date().toISOString(),
        });
      } else if (existingStudent.source !== 'world_cup_contest') {
        // Only append notes, don't overwrite existing lead data
        await contestDb
          .from('students')
          .update({
            notes: `Contest participant (WC2026 Predict & Win)`,
          })
          .eq('email', authUser.email);
      }
    } catch {
      // Non-critical: students table may have different schema — log and continue
      console.warn('Lead pipeline upsert skipped (students table schema mismatch)');
    }
    // ─────────────────────────────────────────────────────────────────────

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Profile update route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
