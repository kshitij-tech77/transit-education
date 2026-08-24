/**
 * migrate-to-cloudinary.ts
 *
 * One-time migration: copies every object in the Supabase Storage `media`
 * bucket (year/month/filename structure) into Cloudinary, preserving the
 * same path as the Cloudinary public_id.
 *
 * ── HOW TO RUN ────────────────────────────────────────────────────────────
 *   npm run migrate:cloudinary            # live run
 *   DRY_RUN=true npm run migrate:cloudinary   # list what would happen, no uploads
 *   npm run migrate:cloudinary -- --dry-run   # same as above, via flag
 *
 * Safe to re-run: objects that already exist in Cloudinary under the same
 * public_id are skipped, and per-object failures don't abort the run — they
 * land in the failed-paths list in the final manifest for a targeted re-run.
 */

import { config as loadEnv } from 'dotenv'
import path from 'path'
import fs from 'fs/promises'
import { createHash } from 'crypto'
import type { supabaseAdmin as SupabaseAdminClient } from '../src/lib/supabase-admin'
import type CloudinaryClient from '../src/lib/cloudinary'
import type { UploadApiResponse } from 'cloudinary'

// Loaded before importing src/lib/supabase-admin and src/lib/cloudinary below:
// both construct their clients from env vars at module-eval time, and static
// imports are hoisted above this call — so those two are imported dynamically
// (after loadEnv runs) instead of statically, to guarantee env vars are set first.
loadEnv({ path: path.join(process.cwd(), '.env.local') })

let supabaseAdmin: typeof SupabaseAdminClient
let cloudinary: typeof CloudinaryClient

const BUCKET = 'media'
const LIST_PAGE_SIZE = 1000
const MAX_RETRIES = 3
const RETRY_BASE_DELAY_MS = 1000

const DRY_RUN = process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
if (!SUPABASE_URL) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL is missing in .env.local')
  process.exit(1)
}

interface StorageObject {
  /** e.g. "2026/04/photo.webp" */
  storagePath: string
  year: string
  month: string
  fileName: string
  sizeBytes: number
}

interface MigrationResult {
  storagePath: string
  publicId: string
  status: 'migrated' | 'skipped' | 'failed'
  sourceBytes: number
  uploadedBytes: number | null
  sha256: string | null
  sizeMismatch: boolean
  durationMs: number
  error: string | null
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Cloudinary API rejections aren't Error instances — they're plain objects
// shaped like { error: { message, http_code } } (see node_modules/cloudinary/
// lib/api_client/execute_request.js). Handle both that shape and real Errors.
function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'error' in err) {
    const inner = (err as any).error
    if (inner?.message) return String(inner.message)
  }
  return String(err)
}

async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1)
        console.warn(`  retry ${attempt}/${MAX_RETRIES - 1} for ${label} after error: ${errorMessage(err)} (waiting ${delay}ms)`)
        await sleep(delay)
      }
    }
  }
  throw lastError
}

/** Recursively walks the year/month/filename structure of the bucket. */
async function listAllObjects(): Promise<StorageObject[]> {
  const objects: StorageObject[] = []

  const { data: years, error: yearsError } = await supabaseAdmin.storage
    .from(BUCKET)
    .list('', { limit: LIST_PAGE_SIZE })
  if (yearsError) throw yearsError

  for (const yearEntry of years ?? []) {
    if (yearEntry.id !== null) continue // skip stray files at bucket root
    const year = yearEntry.name

    const { data: months, error: monthsError } = await supabaseAdmin.storage
      .from(BUCKET)
      .list(year, { limit: LIST_PAGE_SIZE })
    if (monthsError) throw monthsError

    for (const monthEntry of months ?? []) {
      if (monthEntry.id !== null) continue // skip stray files at year level
      const month = monthEntry.name

      let offset = 0
      for (;;) {
        const { data: files, error: filesError } = await supabaseAdmin.storage
          .from(BUCKET)
          .list(`${year}/${month}`, { limit: LIST_PAGE_SIZE, offset })
        if (filesError) throw filesError
        if (!files || files.length === 0) break

        for (const file of files) {
          if (file.id === null) continue // skip nested folders, none expected
          objects.push({
            storagePath: `${year}/${month}/${file.name}`,
            year,
            month,
            fileName: file.name,
            sizeBytes: file.metadata?.size ?? 0,
          })
        }

        if (files.length < LIST_PAGE_SIZE) break
        offset += LIST_PAGE_SIZE
      }
    }
  }

  return objects
}

function toPublicId(obj: StorageObject): string {
  const extIndex = obj.fileName.lastIndexOf('.')
  const nameWithoutExt = extIndex > 0 ? obj.fileName.slice(0, extIndex) : obj.fileName
  return `${BUCKET}/${obj.year}/${obj.month}/${nameWithoutExt}`
}

// All source files are raster images (png/jpg/jpeg/webp/gif — confirmed, no
// video/raw), so Cloudinary always classifies our uploads as resource_type
// "image" even though the upload call itself uses "auto". The admin API used
// here to check existence requires a concrete resource_type, not "auto".
const EXISTING_LOOKUP_RESOURCE_TYPE = 'image'

/** Lists every public_id already present under `media/` in one paginated pass,
 * instead of one exists-check per object (avoids 544 round trips). */
async function fetchExistingPublicIds(): Promise<Set<string>> {
  const ids = new Set<string>()
  let nextCursor: string | undefined

  do {
    const page = await withRetry('list existing Cloudinary resources', () =>
      cloudinary.api.resources({
        type: 'upload',
        resource_type: EXISTING_LOOKUP_RESOURCE_TYPE,
        prefix: `${BUCKET}/`,
        max_results: 500,
        next_cursor: nextCursor,
      })
    )
    for (const resource of page.resources ?? []) ids.add(resource.public_id)
    nextCursor = page.next_cursor
  } while (nextCursor)

  return ids
}

function uploadBuffer(buffer: Buffer, publicId: string): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: 'auto', overwrite: false },
      (error, result) => {
        if (error || !result) reject(error ?? new Error('Cloudinary upload returned no result'))
        else resolve(result)
      }
    )
    stream.end(buffer)
  })
}

async function migrateOne(obj: StorageObject, existingPublicIds: Set<string>): Promise<MigrationResult> {
  const started = Date.now()
  const publicId = toPublicId(obj)
  const sourceUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${obj.storagePath}`

  const base: Omit<MigrationResult, 'status' | 'error' | 'uploadedBytes' | 'sha256' | 'sizeMismatch' | 'durationMs'> = {
    storagePath: obj.storagePath,
    publicId,
    sourceBytes: obj.sizeBytes,
  }

  try {
    if (existingPublicIds.has(publicId)) {
      return {
        ...base,
        status: 'skipped',
        uploadedBytes: null,
        sha256: null,
        sizeMismatch: false,
        durationMs: Date.now() - started,
        error: null,
      }
    }

    if (DRY_RUN) {
      console.log(`[DRY RUN] would migrate  ${obj.storagePath}  →  ${publicId}`)
      return {
        ...base,
        status: 'skipped',
        uploadedBytes: null,
        sha256: null,
        sizeMismatch: false,
        durationMs: Date.now() - started,
        error: null,
      }
    }

    const buffer = await withRetry(`download ${obj.storagePath}`, async () => {
      const res = await fetch(sourceUrl)
      if (!res.ok) throw new Error(`download failed: HTTP ${res.status} ${res.statusText}`)
      return Buffer.from(await res.arrayBuffer())
    })

    const sha256 = createHash('sha256').update(buffer).digest('hex')

    const result = await withRetry(`upload ${publicId}`, () => uploadBuffer(buffer, publicId))

    const sizeMismatch = result.bytes !== buffer.length
    const durationMs = Date.now() - started

    console.log(
      `OK    ${obj.storagePath}  →  ${publicId}  (${buffer.length}B, ${durationMs}ms)` +
        (sizeMismatch ? `  ⚠️  size mismatch: source ${buffer.length}B vs uploaded ${result.bytes}B` : '')
    )

    return {
      ...base,
      status: 'migrated',
      uploadedBytes: result.bytes,
      sha256,
      sizeMismatch,
      durationMs,
      error: null,
    }
  } catch (err) {
    const message = errorMessage(err)
    console.error(`FAIL  ${obj.storagePath}  →  ${message}`)
    return {
      ...base,
      status: 'failed',
      uploadedBytes: null,
      sha256: null,
      sizeMismatch: false,
      durationMs: Date.now() - started,
      error: message,
    }
  }
}

async function main() {
  ;({ supabaseAdmin } = await import('../src/lib/supabase-admin'))
  cloudinary = (await import('../src/lib/cloudinary')).default

  console.log(DRY_RUN ? '🔍 DRY RUN — no uploads will be made\n' : '🚀 Starting Supabase → Cloudinary migration\n')

  console.log('Listing all objects in the media bucket...')
  const objects = await listAllObjects()
  console.log(`Found ${objects.length} objects`)

  console.log('Listing already-migrated objects in Cloudinary...')
  const existingPublicIds = await fetchExistingPublicIds()
  console.log(`Found ${existingPublicIds.size} already in Cloudinary\n`)

  const results: MigrationResult[] = []
  for (const obj of objects) {
    results.push(await migrateOne(obj, existingPublicIds))
  }

  const migrated = results.filter((r) => r.status === 'migrated')
  const skipped = results.filter((r) => r.status === 'skipped')
  const failed = results.filter((r) => r.status === 'failed')
  const mismatches = results.filter((r) => r.sizeMismatch)

  console.log('\n─────────────────────────────────────────')
  console.log(`Total found:     ${objects.length}`)
  console.log(`Migrated:        ${migrated.length}`)
  console.log(`Skipped (dry-run / already present): ${skipped.length}`)
  console.log(`Failed:          ${failed.length}`)
  console.log(`Size mismatches: ${mismatches.length}`)
  console.log('─────────────────────────────────────────')

  if (failed.length > 0) {
    console.log('\nFailed paths (re-run this script to retry — it will skip already-migrated objects):')
    for (const r of failed) console.log(`  - ${r.storagePath}: ${r.error}`)
  }

  const manifestPath = path.join(process.cwd(), 'scripts', `migration-manifest${DRY_RUN ? '.dry-run' : ''}.json`)
  await fs.writeFile(
    manifestPath,
    JSON.stringify(
      {
        ranAt: new Date().toISOString(),
        dryRun: DRY_RUN,
        totalFound: objects.length,
        migrated: migrated.length,
        skipped: skipped.length,
        failed: failed.length,
        sizeMismatches: mismatches.map((r) => ({
          storagePath: r.storagePath,
          publicId: r.publicId,
          sourceBytes: r.sourceBytes,
          uploadedBytes: r.uploadedBytes,
        })),
        failedPaths: failed.map((r) => r.storagePath),
        results,
      },
      null,
      2
    )
  )
  console.log(`\nManifest written to ${path.relative(process.cwd(), manifestPath)}`)

  if (failed.length > 0) process.exit(1)
}

main().catch((err) => {
  console.error('\n❌ Migration script crashed:', err)
  process.exit(1)
})
