import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/server/fs';
import { BlogPost } from '@/lib/types/blog';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const posts = await readJSON<BlogPost[]>('blogPosts.json');
    const post = posts.find((p) => p.id === id);
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(post);
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
    const posts = await readJSON<BlogPost[]>('blogPosts.json');
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const updated = { ...posts[index], ...data };
    posts[index] = updated;
    await writeJSON('blogPosts.json', posts);
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
    const posts = await readJSON<BlogPost[]>('blogPosts.json');
    const filtered = posts.filter((p) => p.id !== id);
    await writeJSON('blogPosts.json', filtered);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/cms/blog/[id] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
