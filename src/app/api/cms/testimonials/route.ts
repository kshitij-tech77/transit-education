import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/cms-data';

export async function GET() {
  const data = await readJson('testimonials.json');
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await readJson('testimonials.json');
    const newItem = { ...body, id: Date.now().toString() };
    data.push(newItem);
    await writeJson('testimonials.json', data);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 400 });
  }
}
