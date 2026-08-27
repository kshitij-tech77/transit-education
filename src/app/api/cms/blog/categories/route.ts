import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { requireCmsAuth } from '@/lib/cms-auth-guard';

// Always offered, even before any post uses them, so the editor's dropdown
// is never empty for a fresh blog.
const DEFAULT_CATEGORIES = [
  'Visa Tips',
  'University Guide',
  'Student Lifestyle',
  'News & Updates',
  'Study Abroad',
  'Country Guides',
];

export async function GET() {
  try {
    const { error: authError } = await requireCmsAuth();
    if (authError) return authError;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('category')
      .eq('status', 'published');

    if (error) throw error;

    const fromPosts = (data ?? [])
      .map((row) => row.category)
      .filter((category): category is string => !!category);

    const categories = Array.from(new Set([...DEFAULT_CATEGORIES, ...fromPosts])).sort();

    return NextResponse.json(categories);
  } catch (err) {
    console.error('GET /api/cms/blog/categories error:', err);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}
