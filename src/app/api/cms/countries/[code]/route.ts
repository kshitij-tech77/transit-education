import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/cms-data';

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await readJson('countries.json');
  const item = data.find((c: any) => c.id === code || c.code === code);
  if (!item) return NextResponse.json({ error: "Country not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const body = await req.json();
    const data = await readJson('countries.json');
    const index = data.findIndex((c: any) => c.id === code || c.code === code);
    
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    data[index] = { ...data[index], ...body, date: new Date().toISOString().split('T')[0] };
    await writeJson('countries.json', data);
    
    return NextResponse.json(data[index]);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    let data = await readJson('countries.json');
    data = data.filter((c: any) => c.id !== code && c.code !== code);
    await writeJson('countries.json', data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
