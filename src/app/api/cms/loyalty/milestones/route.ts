import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';
import { unstable_cache, revalidateTag } from 'next/cache';

const MilestoneSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  category: z.string().max(50).trim().optional(),
  icon: z.string().max(20).trim().optional(),
  points: z.coerce.number().int().positive(),
  referrer_bonus_points: z.union([z.coerce.number().int().positive(), z.null()]).optional(),
  sort_order: z.coerce.number().int().optional(),
  active: z.boolean().optional(),
});

// Milestone definitions are staff-curated and rarely change. Cached for 30
// minutes; any create/update/delete below calls revalidateTag to invalidate
// immediately so admins never see stale data after their own edit.
const getCachedMilestones = unstable_cache(
  async () => {
    const { data, error } = await supabaseAdmin
      .from('loyalty_milestones')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },
  ['cms-loyalty-milestones'],
  { revalidate: 1800, tags: ['loyalty-milestones'] }
);

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let data;
  try {
    data = await getCachedMilestones();
  } catch (error) {
    console.error('GET /api/cms/loyalty/milestones error:', error);
    return NextResponse.json({ error: 'Failed to load milestones' }, { status: 500 });
  }

  const formatted = data.map(m => ({
    id: m.id,
    title: m.title,
    description: m.description,
    category: m.category,
    icon: m.icon,
    points: m.points,
    referrerBonusPoints: m.referrer_bonus_points,
    sortOrder: m.sort_order,
    active: m.active,
  }));

  return NextResponse.json(formatted);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = MilestoneSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { title, description, category, icon, points, referrer_bonus_points, sort_order, active } = parsed.data;

  const { data: newItem, error } = await supabaseAdmin
    .from('loyalty_milestones')
    .insert({
      title,
      description: description || null,
      category: category || null,
      icon: icon || null,
      points,
      referrer_bonus_points: referrer_bonus_points ?? null,
      sort_order: sort_order ?? 0,
      active: active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('POST /api/cms/loyalty/milestones error:', error);
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 400 });
  }
  revalidateTag('loyalty-milestones', 'max');
  return NextResponse.json(newItem, { status: 201 });
}
