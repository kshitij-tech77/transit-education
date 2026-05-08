import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { config } from 'dotenv'

config({ path: path.join(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const MEDIA_DIR = path.join(process.cwd(), 'public', 'media')
const BUCKET = 'media'

const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
}

async function getAllFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath)))
    } else {
      files.push(fullPath)
    }
  }
  return files
}

async function main() {
  let allFiles: string[]
  try {
    allFiles = await getAllFiles(MEDIA_DIR)
  } catch {
    console.error(`Cannot read ${MEDIA_DIR} — does public/media/ exist?`)
    process.exit(1)
  }

  console.log(`Found ${allFiles.length} files to migrate\n`)

  let success = 0
  let failed = 0

  for (const filePath of allFiles) {
    // Convert Windows backslashes → forward slashes for storage path
    const relativePath = path.relative(MEDIA_DIR, filePath).replace(/\\/g, '/')
    const ext = path.extname(filePath).slice(1).toLowerCase()
    const contentType = MIME_MAP[ext] ?? 'application/octet-stream'

    const buffer = await fs.readFile(filePath)

    const { error } = await supabase.storage.from(BUCKET).upload(relativePath, buffer, {
      contentType,
      upsert: true,
    })

    if (error) {
      console.error(`FAIL  ${relativePath}  →  ${error.message}`)
      failed++
    } else {
      console.log(`OK    ${relativePath}`)
      success++
    }
  }

  console.log(`\n─────────────────────────────`)
  console.log(`Done. ${success} uploaded, ${failed} failed.`)

  if (success > 0) {
    console.log(`\nPublic URL pattern:`)
    console.log(`${SUPABASE_URL}/storage/v1/object/public/media/<year>/<month>/<filename>`)
  }
}

main().catch(console.error)
