import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/cms-data';

export async function GET() {
  const data = await readJson('siteSettings.json');
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    await writeJson('siteSettings.json', body);
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 400 });
  }
}
