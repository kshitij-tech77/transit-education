import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        authors (
          name,
          credential,
          bio
        )
      `)
      .eq('id', id)
      .single();

    if (error || !post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Transform to match old JSON shape
    const formattedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      body: post.body,
      category: post.category,
      tags: post.tags,
      status: post.status,
      publishDate: post.publish_date,
      featuredImage: post.featured_image,
      metaTitle: post.meta_title,
      metaDescription: post.meta_description,
      focusKeyword: post.focus_keyword,
      canonicalUrl: post.canonical_url,
      authorName: post.authors?.name || 'Transit Education',
      authorCredential: post.authors?.credential || '',
      authorBio: post.authors?.bio || '',
      lastReviewed: post.last_reviewed_at,
      sources: post.sources,
      primaryQuestion: post.primary_question,
      answerSummary: post.answer_summary,
      faqItems: post.faq_schema,
      readingTime: post.reading_time
    };

    return NextResponse.json(formattedPost);
  } catch (err) {
    console.error('GET /api/cms/blog/[id] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const supabase = await createClient();

    const slug = data.slug
      ? data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      : data.slug;

    const { data: updated, error } = await supabase
      .from('blog_posts')
      .update({
        title: data.title,
        slug,
        body: data.body,
        category: data.category,
        tags: data.tags,
        status: data.status,
        publish_date: data.publishDate,
        featured_image: data.featuredImage,
        meta_title: data.metaTitle,
        meta_description: data.metaDescription,
        focus_keyword: data.focusKeyword,
        canonical_url: data.canonicalUrl,
        primary_question: data.primaryQuestion,
        answer_summary: data.answerSummary,
        faq_schema: data.faqItems,
        reading_time: data.readingTime,
        sources: data.sources ?? [],
        last_reviewed_at: data.lastReviewed || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT /api/cms/blog/[id] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/cms/blog/[id] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
