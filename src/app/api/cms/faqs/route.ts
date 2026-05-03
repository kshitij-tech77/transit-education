import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/server/fs';


export async function GET() {
  try {
    const data = await readJSON<any[]>('faqs.json');
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await readJSON<any[]>('faqs.json');
    const newItem = {
      ...body,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    data.push(newItem);
    await writeJSON('faqs.json', data);
    return NextResponse.json(newItem, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
