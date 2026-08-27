import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import type { ResourceApiResponse, UploadApiResponse } from 'cloudinary';
import { requireCmsAuth } from '@/lib/cms-auth-guard';

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

// Cloudinary requires a concrete resource_type for admin/destroy calls (no
// "auto"). Our uploads use resource_type: 'auto', which classifies images as
// "image" and PDFs as "raw" — both are checked wherever a lookup is needed.
const LOOKUP_RESOURCE_TYPES = ['image', 'raw'] as const;

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

// Extracts a Cloudinary public_id (e.g. "media/2025/02/image") from either:
//   - a Cloudinary delivery URL (optionally versioned):
//       https://res.cloudinary.com/<cloud>/image/upload/media/2025/02/image.png
//       https://res.cloudinary.com/<cloud>/raw/upload/v169.../media/2025/02/doc.pdf
//   - a full Supabase Storage URL (old data not yet cleaned up):
//       https://*.supabase.co/storage/v1/object/public/media/2025/02/image.png
//   - the old relative format: /media/2025/02/image.png
function extractCloudinaryPublicId(filePath: string): string | null {
  let relativePath: string | null = null;

  const uploadMarker = '/upload/';
  const uploadIdx = filePath.indexOf(uploadMarker);
  if (uploadIdx !== -1) {
    const rest = filePath.slice(uploadIdx + uploadMarker.length).replace(/^v\d+\//, '');
    const bucketMarker = `${BUCKET}/`;
    relativePath = rest.startsWith(bucketMarker) ? rest.slice(bucketMarker.length) : rest;
  } else {
    const supabaseMarker = `/object/public/${BUCKET}/`;
    const supabaseIdx = filePath.indexOf(supabaseMarker);
    if (supabaseIdx !== -1) {
      relativePath = filePath.slice(supabaseIdx + supabaseMarker.length);
    } else if (filePath.startsWith(`/${BUCKET}/`)) {
      relativePath = filePath.slice(`/${BUCKET}/`.length);
    }
  }

  if (!relativePath) return null;

  return `${BUCKET}/${stripExtension(relativePath)}`;
}

export async function GET() {
  try {
    const { error: authError } = await requireCmsAuth();
    if (authError) return authError;

    const mediaFiles: Record<string, any[]> = {};

    for (const resourceType of LOOKUP_RESOURCE_TYPES) {
      let nextCursor: string | undefined;

      do {
        const page = (await cloudinary.api.resources({
          type: 'upload',
          resource_type: resourceType,
          prefix: `${BUCKET}/`,
          max_results: 500,
          next_cursor: nextCursor,
        })) as ResourceApiResponse;

        for (const resource of page.resources ?? []) {
          // public_id shape: "media/<year>/<month>/<name-without-ext>"
          const parts = resource.public_id.slice(BUCKET.length + 1).split('/');
          if (parts.length !== 3) continue;
          const [year, month, nameWithoutExt] = parts;

          if (!mediaFiles[year]) mediaFiles[year] = [];
          mediaFiles[year].push({
            name: `${nameWithoutExt}.${resource.format}`,
            size: resource.bytes ? (resource.bytes / 1024 / 1024).toFixed(2) + ' MB' : 'unknown',
            path: resource.secure_url,
            year,
            month,
            mtimeMs: resource.created_at ? new Date(resource.created_at).getTime() : 0,
          });
        }

        nextCursor = page.next_cursor;
      } while (nextCursor);
    }

    return NextResponse.json(mediaFiles);
  } catch (error) {
    console.error('Media list error:', error);
    return NextResponse.json({ error: 'Failed to read media' }, { status: 500 });
  }
}

function uploadToCloudinary(buffer: Buffer, publicId: string): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: 'auto', overwrite: false },
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
    const { error: authError } = await requireCmsAuth();
    if (authError) return authError;

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
    const publicId = `${BUCKET}/${year}/${month}/${stripExtension(safeName)}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    let result: UploadApiResponse;
    try {
      result = await uploadToCloudinary(buffer, publicId);
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    return NextResponse.json({
      path: result.secure_url,
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
    const { error: authError } = await requireCmsAuth();
    if (authError) return authError;

    const { filePath } = await req.json();
    if (!filePath) return NextResponse.json({ error: 'No file path provided' }, { status: 400 });

    const publicId = extractCloudinaryPublicId(filePath);
    if (!publicId) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    // Try each resource_type the route can upload (image, then raw/PDF) until
    // one reports the asset was actually there. Not found under either is
    // still treated as success below — the end state (file gone) is the same.
    let destroyResult: { result: string } = { result: 'not found' };
    for (const resourceType of LOOKUP_RESOURCE_TYPES) {
      destroyResult = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      if (destroyResult.result === 'ok') break;
    }

    if (destroyResult.result !== 'ok' && destroyResult.result !== 'not found') {
      console.error('Cloudinary destroy error:', destroyResult);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
