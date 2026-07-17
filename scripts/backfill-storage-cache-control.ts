import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'

config({ path: path.join(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const BUCKET = 'media'
const NEW_CACHE_CONTROL = '86400' // 1 day, matches the conservative first step already agreed on
const CONCURRENCY = 5
const DRY_RUN = process.argv.includes('--dry-run')

function getFlagValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag)
  if (index === -1) return undefined
  return process.argv[index + 1]
}

// Target a single object instead of the whole bucket, e.g. for testing
// whether re-upload actually changes the served Cache-Control header
// before committing to a full-bucket run.
const SINGLE_FILE = getFlagValue('--file')

type FileEntry = {
  path: string
  size: number
  mimetype: string
}

// storage-js's list() only returns one directory level, so this walks the
// year/month tree the same way the CMS media list endpoint does.
async function listAllFiles(prefix = ''): Promise<FileEntry[]> {
  const files: FileEntry[] = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } })

    if (error) throw error
    if (!data || data.length === 0) break

    for (const entry of data) {
      const entryPath = prefix ? `${prefix}${entry.name}` : entry.name
      if (entry.id === null) {
        // folder — recurse
        files.push(...(await listAllFiles(`${entryPath}/`)))
      } else {
        files.push({
          path: entryPath,
          size: entry.metadata?.size ?? 0,
          mimetype: entry.metadata?.mimetype ?? 'application/octet-stream',
        })
      }
    }

    if (data.length < 1000) break
    offset += 1000
  }

  return files
}

async function reuploadWithNewCacheControl(filePath: string): Promise<void> {
  const { data: blob, error: downloadError } = await supabase.storage
    .from(BUCKET)
    .download(filePath)

  if (downloadError || !blob) {
    throw new Error(`download failed: ${downloadError?.message ?? 'no data'}`)
  }

  const buffer = Buffer.from(await blob.arrayBuffer())

  // storage-js's update() requires re-sending the file body (PUT to the same
  // path) — there is no metadata-only cache-control update in this SDK
  // version. Bytes are identical to what was just downloaded, so content is
  // unchanged; only the object's cache-control metadata changes. blob.type
  // reflects the Content-Type Supabase actually served, which is a more
  // reliable source of truth than the list() metadata.
  const { error: updateError } = await supabase.storage
    .from(BUCKET)
    .update(filePath, buffer, {
      contentType: blob.type || 'application/octet-stream',
      cacheControl: NEW_CACHE_CONTROL,
    })

  if (updateError) {
    throw new Error(`update failed: ${updateError.message}`)
  }
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>
): Promise<{ succeeded: number; failed: Array<{ item: T; error: string }> }> {
  let succeeded = 0
  const failed: Array<{ item: T; error: string }> = []
  let cursor = 0

  async function runNext(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor++
      const item = items[index]
      try {
        await worker(item, index)
        succeeded++
      } catch (err) {
        failed.push({ item, error: err instanceof Error ? err.message : String(err) })
      }
      if ((succeeded + failed.length) % 25 === 0 || succeeded + failed.length === items.length) {
        console.log(`Progress: ${succeeded + failed.length} of ${items.length} (${failed.length} failed)`)
      }
    }
  }

  await Promise.all(Array.from({ length: limit }, () => runNext()))
  return { succeeded, failed }
}

async function main() {
  if (SINGLE_FILE) {
    console.log(`Targeting single file: ${SINGLE_FILE}`)
    if (DRY_RUN) {
      console.log('--dry-run passed — no changes will be made.')
      return
    }
    try {
      await reuploadWithNewCacheControl(SINGLE_FILE)
      console.log(`Done. Updated ${SINGLE_FILE} with cacheControl: '${NEW_CACHE_CONTROL}'.`)
    } catch (err) {
      console.error(`FAIL  ${SINGLE_FILE}  →  ${err instanceof Error ? err.message : String(err)}`)
      process.exit(1)
    }
    return
  }

  console.log(`Listing all objects in "${BUCKET}" bucket...`)
  const files = await listAllFiles()
  console.log(`Found ${files.length} files.\n`)

  if (DRY_RUN) {
    console.log('--dry-run passed — no changes will be made. Listing first 10 files:')
    for (const f of files.slice(0, 10)) {
      console.log(`  ${f.path}  (${(f.size / 1024).toFixed(1)} KB, ${f.mimetype})`)
    }
    console.log(`\n${files.length} files would be re-uploaded with cacheControl: '${NEW_CACHE_CONTROL}'.`)
    return
  }

  console.log(`Re-uploading all ${files.length} files with cacheControl: '${NEW_CACHE_CONTROL}'...\n`)

  const { succeeded, failed } = await runWithConcurrency(files, CONCURRENCY, (f) =>
    reuploadWithNewCacheControl(f.path)
  )

  console.log(`\n─────────────────────────────`)
  console.log(`Done. ${succeeded} updated, ${failed.length} failed.`)

  if (failed.length > 0) {
    console.log('\nFailed files:')
    for (const f of failed) {
      console.log(`  FAIL  ${f.item.path}  →  ${f.error}`)
    }
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
