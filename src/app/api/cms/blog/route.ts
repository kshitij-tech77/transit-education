import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/server/fs';
import { BlogPost } from '@/lib/types/blog';
import { v4 as uuidv4 } from 'uuid';

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
        ? data.title.toLowerCase().replace(/\s+/g, '-')
        : uuidv4());

    const newPost: BlogPost = {
      id: uuidv4(),
      title,
      slug,
      body: data.body || '',
      category: data.category || '',
      tags: data.tags || [],
      status: data.status || 'draft',
      publishDate: data.publishDate || null,
      featuredImage: data.featuredImage || '',
    };

    posts.push(newPost);
    await writeJSON('blogPosts.json', posts);
    return NextResponse.json(newPost, { status: 201 });
  } catch (err) {
    console.error('POST /api/cms/blog error:', err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
