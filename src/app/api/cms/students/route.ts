import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/cms-data';

export async function GET() {
  const data = await readJson('students.json');
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await readJson('students.json');
    const newItem = {
      ...body,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    };
    data.unshift(newItem); // New students at top
    await writeJson('students.json', data);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create student" }, { status: 400 });
  }
}
