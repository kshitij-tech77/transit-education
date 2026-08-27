import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { requireCmsAuth } from '@/lib/cms-auth-guard';

const RewardSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  points_cost: z.coerce.number().int().positive(),
  stock: z.union([z.coerce.number().int().min(0), z.null()]).optional(),
  active: z.boolean().optional(),
  image_url: z.string().max(500).trim().optional(),
  min_tier: z.union([z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']), z.null()]).optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireCmsAuth();
  if (authError) return authError;

  const { id } = await params;
  const parsed = RewardSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { title, description, points_cost, stock, active, image_url, min_tier } = parsed.data;

  const { data: updated, error } = await supabaseAdmin
    .from('loyalty_rewards')
    .update({
      title,
      description: description || null,
      points_cost,
      stock: stock ?? null,
      active: active ?? true,
      image_url: image_url || null,
      min_tier: min_tier ?? null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('PUT /api/cms/loyalty/rewards/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update reward' }, { status: 400 });
  }
  revalidateTag('loyalty-rewards', 'max');
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireCmsAuth();
  if (authError) return authError;

  const { id } = await params;
  const { error } = await supabaseAdmin.from('loyalty_rewards').delete().eq('id', id);

  if (error) {
    console.error('DELETE /api/cms/loyalty/rewards/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete reward' }, { status: 400 });
  }
  revalidateTag('loyalty-rewards', 'max');
  return NextResponse.json({ success: true });
}
