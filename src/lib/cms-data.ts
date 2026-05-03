import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

const DATA_DIR = path.join(process.cwd(), 'src/data');

export async function readJson(filename: string) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

export async function writeJson(filename: string, data: any) {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  // Revalidate both the CMS and the Frontend paths that might use this data
  revalidatePath('/cms', 'layout');
  revalidatePath('/', 'layout');
}
