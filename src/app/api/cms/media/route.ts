import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const MEDIA_DIR = path.join(process.cwd(), 'public/media');
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

function buildSafeName(originalName: string): string | null {
  const lastDot = originalName.lastIndexOf('.');
  if (lastDot < 0) return null;

  const ext = originalName.slice(lastDot + 1).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) return null;

  // Sanitize base: alphanumeric, hyphens, underscores only — collapses dots so
  // "shell.php.jpg" becomes "shell-php.jpg" rather than keeping the fake extension.
  const safeBase = originalName
    .slice(0, lastDot)
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-{2,}/g, '-')
    .slice(0, 100)
    .replace(/^-+|-+$/g, '') || 'file';

  return `${safeBase}.${ext}`;
}

export async function GET() {
  try {
    const years = await fs.readdir(MEDIA_DIR);
    const mediaFiles: any = {};

    for (const year of years) {
      const yearPath = path.join(MEDIA_DIR, year);
      const stat = await fs.stat(yearPath);

      if (stat.isDirectory()) {
        const months = await fs.readdir(yearPath);
        mediaFiles[year] = [];

        for (const month of months) {
          const monthPath = path.join(yearPath, month);
          const monthStat = await fs.stat(monthPath);

          if (monthStat.isDirectory()) {
            const files = await fs.readdir(monthPath);
            for (const file of files) {
              const filePath = path.join(monthPath, file);
              const fileStat = await fs.stat(filePath);
              mediaFiles[year].push({
                name: file,
                size: (fileStat.size / 1024 / 1024).toFixed(2) + ' MB',
                path: `/media/${year}/${month}/${file}`,
                year,
                month,
                mtimeMs: fileStat.mtimeMs
              });
            }
          }
        }
      }
    }

    return NextResponse.json(mediaFiles);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read media directory" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Size check before reading into memory
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 400 });
    }

    // MIME type check
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    // Extension whitelist + double-extension sanitization
    const safeName = buildSafeName(file.name);
    if (!safeName) {
      return NextResponse.json({ error: "Invalid file name or extension" }, { status: 400 });
    }

    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const dir = path.join(process.cwd(), 'public', 'media', year, month);

    await fs.mkdir(dir, { recursive: true });

    const dest = path.join(dir, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(dest, buffer);

    return NextResponse.json({
      path: `/media/${year}/${month}/${safeName}`,
      name: safeName,
      size: (buffer.length / 1024 / 1024).toFixed(2) + ' MB'
    }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { filePath } = await req.json();
    if (!filePath) return NextResponse.json({ error: "No file path provided" }, { status: 400 });

    // Security check: ensure path is within public/media
    const absolutePath = path.join(process.cwd(), 'public', filePath);
    const mediaRoot = path.join(process.cwd(), 'public/media');

    if (!absolutePath.startsWith(mediaRoot)) {
      return NextResponse.json({ error: "Unauthorized path" }, { status: 403 });
    }

    await fs.unlink(absolutePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
