import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const MEDIA_DIR = path.join(process.cwd(), 'public/media');

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
                month
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
  // Simple upload logic (simulated for now as production upload needs formidable or similar in route handlers)
  // In a real Next.js route handler, we'd use req.formData()
  return NextResponse.json({ message: "Upload endpoint ready" });
}
