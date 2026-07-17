import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'media';
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'pdf']);

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

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

// Extract storage path (e.g. "2025/02/image.png") from either:
//   - old format:  /media/2025/02/image.png
//   - new format:  https://*.supabase.co/storage/v1/object/public/media/2025/02/image.png
function toStoragePath(filePath: string): string | null {
  if (filePath.startsWith('/media/')) {
    return filePath.slice('/media/'.length);
  }
  const marker = `/object/public/${BUCKET}/`;
  const idx = filePath.indexOf(marker);
  if (idx !== -1) {
    return filePath.slice(idx + marker.length);
  }
  return null;
}

export async function GET() {
  try {
    const supabase = serviceClient();

    const { data: topLevel, error: topError } = await supabase.storage
      .from(BUCKET)
      .list('', { limit: 100 });

    if (topError) throw topError;

    const mediaFiles: Record<string, any[]> = {};

    for (const yearEntry of topLevel ?? []) {
      if (yearEntry.id !== null) continue; // skip files at root, only folders
      const year = yearEntry.name;
      mediaFiles[year] = [];

      const { data: monthLevel } = await supabase.storage
        .from(BUCKET)
        .list(year, { limit: 100 });

      for (const monthEntry of monthLevel ?? []) {
        if (monthEntry.id !== null) continue;
        const month = monthEntry.name;

        const { data: files } = await supabase.storage
          .from(BUCKET)
          .list(`${year}/${month}`, { limit: 1000 });

        for (const file of files ?? []) {
          if (file.id === null) continue; // skip sub-folders

          const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(`${year}/${month}/${file.name}`);

          mediaFiles[year].push({
            name: file.name,
            size: file.metadata?.size
              ? (file.metadata.size / 1024 / 1024).toFixed(2) + ' MB'
              : 'unknown',
            path: urlData.publicUrl,
            year,
            month,
            mtimeMs: file.updated_at ? new Date(file.updated_at).getTime() : 0,
          });
        }
      }
    }

    return NextResponse.json(mediaFiles);
  } catch (error) {
    console.error('Media list error:', error);
    return NextResponse.json({ error: 'Failed to read media' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large (max 20 MB)' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    const safeName = buildSafeName(file.name);
    if (!safeName) {
      return NextResponse.json({ error: 'Invalid file name or extension' }, { status: 400 });
    }

    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const storagePath = `${year}/${month}/${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = serviceClient();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: file.type, upsert: false, cacheControl: '86400' });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    return NextResponse.json({
      path: urlData.publicUrl,
      name: safeName,
      size: (buffer.length / 1024 / 1024).toFixed(2) + ' MB',
    }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { filePath } = await req.json();
    if (!filePath) return NextResponse.json({ error: 'No file path provided' }, { status: 400 });

    const storagePath = toStoragePath(filePath);
    if (!storagePath) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    const supabase = serviceClient();
    const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
