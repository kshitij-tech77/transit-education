import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { rateLimit } from '@/lib/rate-limit';
import type { UploadApiResponse } from 'cloudinary';

const FOLDER = 'career-uploads';
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);

function buildSafeName(originalName: string): string | null {
  const lastDot = originalName.lastIndexOf('.');
  if (lastDot < 0) return null;

  const ext = originalName.slice(lastDot + 1).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) return null;

  const safeBase = originalName
    .slice(0, lastDot)
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-{2,}/g, '-')
    .slice(0, 100)
    .replace(/^-+|-+$/g, '') || 'file';

  return `${safeBase}.${ext}`;
}

function stripExtension(name: string): string {
  const lastDot = name.lastIndexOf('.');
  return lastDot > 0 ? name.slice(0, lastDot) : name;
}

function uploadToCloudinary(buffer: Buffer, publicId: string): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: 'raw', overwrite: false },
      (error, result) => {
        if (error || !result) reject(error ?? new Error('Cloudinary upload returned no result'));
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
    if (!rateLimit(ip, 5, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Only PDF, DOC, or DOCX files are accepted' }, { status: 400 });
    }

    const safeName = buildSafeName(file.name);
    if (!safeName) {
      return NextResponse.json({ error: 'Invalid file name or extension' }, { status: 400 });
    }

    const publicId = `${FOLDER}/${Date.now()}-${stripExtension(safeName)}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    let result: UploadApiResponse;
    try {
      result = await uploadToCloudinary(buffer, publicId);
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    return NextResponse.json({ url: result.secure_url }, { status: 201 });
  } catch (error) {
    console.error('Career upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
