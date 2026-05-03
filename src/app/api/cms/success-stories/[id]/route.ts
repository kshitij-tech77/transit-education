import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/cms-data';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await readJson('successStories.json');
    const index = data.findIndex((item: any) => item.id === id);
    
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    data[index] = { ...data[index], ...body };
    await writeJson('successStories.json', data);
    
    return NextResponse.json(data[index]);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let data = await readJson('successStories.json');
    data = data.filter((item: any) => item.id !== id);
    await writeJson('successStories.json', data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
