import { promises as fs } from 'fs';
import path from 'path';

export const dataDir = path.resolve(process.cwd(), 'src', 'data');

export async function readJSON<T>(filename: string): Promise<T> {
  const filePath = path.join(dataDir, filename);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    // File doesn't exist yet — return an empty array as default
    return [] as unknown as T;
  }
}

export async function writeJSON<T>(filename: string, data: T): Promise<void> {
  // Ensure the data directory exists before writing
  await fs.mkdir(dataDir, { recursive: true });
  const filePath = path.join(dataDir, filename);
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, json, 'utf-8');
}
