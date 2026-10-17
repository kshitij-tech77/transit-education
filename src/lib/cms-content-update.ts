/**
 * Field-level compare-and-set for CMS content (PATCH /api/cms/content).
 *
 * Only allowlisted record types and text fields can change, one field per request.
 * The write is a single conditional UPDATE — `WHERE id = :id AND <field> = :expected` —
 * so the database itself refuses it if the value changed since the caller read it.
 * There is never an unconditional update after a separate read.
 *
 * A conditional update that matches no row is ambiguous (stale value, missing row, or a
 * row-level-security refusal). A follow-up read only *classifies* that outcome for the
 * response; it never decides or performs a write.
 *
 * No Supabase or Next.js imports here: the route binds a real client, tests a fake one.
 */

export const CONTENT_FIELDS = {
  country: { table: 'countries', fields: ['why_study', 'feature2_desc'] },
  faq: { table: 'faqs', fields: ['answer'] },
} as const

export type RecordType = keyof typeof CONTENT_FIELDS

export const MAX_VALUE_CHARS = 20_000
// The expected value travels as a URL filter (PostgREST `eq`); keep the encoded URL modest.
export const MAX_EXPECTED_ENCODED = 6_000

const ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/

export interface ContentUpdate {
  record: RecordType
  id: string
  field: string
  expected_value: string
  new_value: string
}

export interface Outcome {
  status: number
  body: Record<string, unknown>
}

/** What the handler needs from the database; the route binds it to Supabase. */
export interface ContentStore {
  /** Rows with this id (0, 1, or more if `id` were ever not unique). */
  countById(table: string, id: string): Promise<number>
  /** One conditional UPDATE of `field` only; returns the ids of the rows it changed. */
  compareAndSet(
    table: string,
    id: string,
    field: string,
    expected: string,
    next: string,
  ): Promise<string[]>
  /** The current value as this session can see it, or `found: false`. */
  readField(table: string, id: string, field: string): Promise<{ found: boolean; value: unknown }>
}

const fail = (status: number, error: string, extra: Record<string, unknown> = {}): Outcome => ({
  status,
  body: { error, ...extra },
})

export function parseContentUpdate(input: unknown): ContentUpdate | Outcome {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return fail(400, 'Expected a JSON object.')
  }
  const body = input as Record<string, unknown>
  const allowed = new Set(['record', 'id', 'field', 'expected_value', 'new_value'])
  const unknownKeys = Object.keys(body).filter((key) => !allowed.has(key))
  if (unknownKeys.length) return fail(400, `Unknown keys: ${unknownKeys.join(', ')}.`)

  const { record, id, field, expected_value: expected, new_value: next } = body
  if (typeof record !== 'string' || !(record in CONTENT_FIELDS)) {
    return fail(400, 'Unsupported record type.')
  }
  const fields: readonly string[] = CONTENT_FIELDS[record as RecordType].fields
  if (typeof field !== 'string' || !fields.includes(field)) {
    return fail(400, 'Unsupported field for this record type.')
  }
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) return fail(400, 'Invalid record id.')
  if (typeof expected !== 'string' || typeof next !== 'string') {
    return fail(400, 'expected_value and new_value must be strings.')
  }
  if (!expected || !next.trim()) return fail(400, 'Values must not be empty.')
  if (expected.length > MAX_VALUE_CHARS || next.length > MAX_VALUE_CHARS) {
    return fail(413, 'Value too long.')
  }
  if (encodeURIComponent(expected).length > MAX_EXPECTED_ENCODED) {
    return fail(413, 'expected_value is too long for a conditional update.')
  }
  if (expected === next) return fail(400, 'new_value equals expected_value; nothing to change.')
  return { record: record as RecordType, id, field, expected_value: expected, new_value: next }
}

export async function applyContentUpdate(store: ContentStore, input: unknown): Promise<Outcome> {
  const parsed = parseContentUpdate(input)
  if ('status' in parsed) return parsed
  const { record, id, field, expected_value: expected, new_value: next } = parsed
  const table = CONTENT_FIELDS[record].table
  const target = { record, id, field }

  // Refuse before writing if the id does not name exactly one visible row.
  const count = await store.countById(table, id)
  if (count === 0) return fail(404, 'Record not found.', target)
  if (count > 1) return fail(409, 'Record id is ambiguous; nothing was changed.', target)

  const changed = await store.compareAndSet(table, id, field, expected, next)
  if (changed.length === 1) return { status: 200, body: { updated: true, ...target } }
  if (changed.length > 1) {
    // Unreachable while ids are unique (checked above); reported, never hidden.
    return fail(500, 'More than one row changed.', { ...target, rows: changed.length })
  }

  // Nothing changed. Classify only; no further write is attempted.
  const now = await store.readField(table, id, field)
  if (!now.found) return fail(404, 'Record not found.', target)
  if (now.value !== expected) {
    return fail(409, 'The current value differs from expected_value; nothing was changed.', target)
  }
  return fail(403, 'The update was not permitted; nothing was changed.', target)
}

/** Minimal shape of the Supabase query builder calls used below. */
interface QueryResult<T> {
  data: T | null
  error: { message: string } | null
  count?: number | null
}
interface Filterable<T> extends PromiseLike<QueryResult<T>> {
  eq(column: string, value: string): Filterable<T>
}
interface Selectable {
  select(columns: string, options?: { count: 'exact'; head: true }): Filterable<unknown[]>
  update(values: Record<string, string>): {
    eq(column: string, value: string): {
      eq(column: string, value: string): { select(columns: string): Filterable<{ id: unknown }[]> }
    }
  }
}
export interface SupabaseLike {
  from(table: string): Selectable
}

class StoreError extends Error {}

export function supabaseContentStore(client: SupabaseLike): ContentStore {
  return {
    async countById(table, id) {
      const { error, count } = await client
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('id', id)
      if (error) throw new StoreError('count failed')
      return count ?? 0
    },
    async compareAndSet(table, id, field, expected, next) {
      // PATCH ...?id=eq.<id>&<field>=eq.<expected> — one UPDATE ... WHERE ... RETURNING.
      const { data, error } = await client
        .from(table)
        .update({ [field]: next })
        .eq('id', id)
        .eq(field, expected)
        .select('id')
      if (error) throw new StoreError('update failed')
      return (data ?? []).map((row) => String(row.id))
    },
    async readField(table, id, field) {
      const { data, error } = await client.from(table).select(`id, ${field}`).eq('id', id)
      if (error) throw new StoreError('read failed')
      const rows = (data ?? []) as Record<string, unknown>[]
      return rows.length === 1 ? { found: true, value: rows[0][field] } : { found: false, value: null }
    },
  }
}
