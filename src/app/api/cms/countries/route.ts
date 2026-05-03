import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/cms-data';

export async function GET() {
  const data = await readJson('countries.json');
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await readJson('countries.json');
    const newItem = { ...body, lastEdited: new Date().toISOString() };
    data.push(newItem);
    await writeJson('countries.json', data);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create country" }, { status: 400 });
  }
}
