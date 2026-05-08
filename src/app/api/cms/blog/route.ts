import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, authors (name, credential, bio)')
      .order('publish_date', { ascending: false });

    if (error) {
      console.error('GET /api/cms/blog Supabase error:', error.message);
      return NextResponse.json([]);
    }

    // Transform to match old JSON shape (author details at top level, camelCase)
    const posts = data.map((post: any) => ({
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
    }));

    return NextResponse.json(posts);
  } catch (err) {
    console.error('GET /api/cms/blog error:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const data = await req.json();

    const title = data.title || 'Untitled';
    const slug =
      data.slug ||
      (data.title
        ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        : crypto.randomUUID());

    const { data: newPost, error } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug,
        body: data.body || '',
        category: data.category || 'Visa Tips',
        tags: data.tags || [],
        status: data.status || 'draft',
        publish_date: data.publishDate || new Date().toISOString(),
        featured_image: data.featuredImage || '',
        meta_title: data.metaTitle || '',
        meta_description: data.metaDescription || '',
        focus_keyword: data.focusKeyword || '',
        canonical_url: data.canonicalUrl || '',
        primary_question: data.primaryQuestion || '',
        answer_summary: data.answerSummary || '',
        faq_schema: data.faqItems || [],
        reading_time: data.readingTime || '1 min read'
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(newPost, { status: 201 });
  } catch (err) {
    console.error('POST /api/cms/blog error:', err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
