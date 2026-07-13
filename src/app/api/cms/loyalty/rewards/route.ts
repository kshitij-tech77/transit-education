import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';

const RewardSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  points_cost: z.coerce.number().int().positive(),
  stock: z.union([z.coerce.number().int().min(0), z.null()]).optional(),
  active: z.boolean().optional(),
  image_url: z.string().max(500).trim().optional(),
  min_tier: z.union([z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']), z.null()]).optional(),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('loyalty_rewards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('GET /api/cms/loyalty/rewards error:', error);
    return NextResponse.json({ error: 'Failed to load rewards' }, { status: 500 });
  }

  const formatted = data.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    pointsCost: r.points_cost,
    stock: r.stock,
    active: r.active,
    imageUrl: r.image_url,
    minTier: r.min_tier,
  }));

  return NextResponse.json(formatted);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = RewardSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { title, description, points_cost, stock, active, image_url, min_tier } = parsed.data;

  const { data: newItem, error } = await supabaseAdmin
    .from('loyalty_rewards')
    .insert({
      title,
      description: description || null,
      points_cost,
      stock: stock ?? null,
      active: active ?? true,
      image_url: image_url || null,
      min_tier: min_tier ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('POST /api/cms/loyalty/rewards error:', error);
    return NextResponse.json({ error: 'Failed to create reward' }, { status: 400 });
  }
  return NextResponse.json(newItem, { status: 201 });
}
