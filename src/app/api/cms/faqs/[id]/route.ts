import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/server/fs';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await readJSON<any[]>('faqs.json');
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    data[index] = { ...data[index], ...body };
    await writeJSON('faqs.json', data);
    return NextResponse.json(data[index]);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await readJSON<any[]>('faqs.json');
    const filtered = data.filter(item => item.id !== id);
    await writeJSON('faqs.json', filtered);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
