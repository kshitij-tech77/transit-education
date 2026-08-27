import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { requireCmsAuth } from '@/lib/cms-auth-guard';

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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireCmsAuth();
  if (authError) return authError;

  const { id } = await params;
  const parsed = MilestoneSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { title, description, category, icon, points, referrer_bonus_points, sort_order, active } = parsed.data;

  const { data: updated, error } = await supabaseAdmin
    .from('loyalty_milestones')
    .update({
      title,
      description: description || null,
      category: category || null,
      icon: icon || null,
      points,
      referrer_bonus_points: referrer_bonus_points ?? null,
      sort_order: sort_order ?? 0,
      active: active ?? true,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('PUT /api/cms/loyalty/milestones/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 400 });
  }
  revalidateTag('loyalty-milestones', 'max');
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireCmsAuth();
  if (authError) return authError;

  const { id } = await params;
  const { error } = await supabaseAdmin.from('loyalty_milestones').delete().eq('id', id);

  if (error) {
    console.error('DELETE /api/cms/loyalty/milestones/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 400 });
  }
  revalidateTag('loyalty-milestones', 'max');
  return NextResponse.json({ success: true });
}
