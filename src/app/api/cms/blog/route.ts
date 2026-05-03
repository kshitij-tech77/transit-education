import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/server/fs';
import { BlogPost } from '@/lib/types/blog';


export async function GET() {
  try {
    const posts = await readJSON<BlogPost[]>('blogPosts.json');
    return NextResponse.json(posts);
  } catch (err) {
    console.error('GET /api/cms/blog error:', err);
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const posts = await readJSON<BlogPost[]>('blogPosts.json');

    const title = data.title || 'Untitled';
    const slug =
      data.slug ||
      (data.title
        ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        : crypto.randomUUID());

    const newPost: BlogPost = {
      id: crypto.randomUUID(),
      title,
      slug,
      body: data.body || '',
      category: data.category || 'Visa Tips',
      tags: data.tags || [],
      status: data.status || 'draft',
      publishDate: data.publishDate || new Date().toISOString(),
      featuredImage: data.featuredImage || '',
      
      // SEO Settings
      metaTitle: data.metaTitle || '',
      metaDescription: data.metaDescription || '',
      focusKeyword: data.focusKeyword || '',
      canonicalUrl: data.canonicalUrl || '',

      // EEAT Signals
      authorName: data.authorName || 'Kshitij Dhamala',
      authorCredential: data.authorCredential || '',
      authorBio: data.authorBio || '',
      lastReviewed: data.lastReviewed || '',
      sources: data.sources || [],

      // AEO (Answer Engine)
      primaryQuestion: data.primaryQuestion || '',
      answerSummary: data.answerSummary || '',
      faqItems: data.faqItems || [],

      // Analytics
      readingTime: data.readingTime || '1 min read'
    };

    posts.push(newPost);
    await writeJSON('blogPosts.json', posts);
    return NextResponse.json(newPost, { status: 201 });
  } catch (err) {
    console.error('POST /api/cms/blog error:', err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
