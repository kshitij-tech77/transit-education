// Offline tests for PATCH /api/cms/content's core. No Supabase client, no env, no network:
// run with `npx --no-install tsx --test src/lib/cms-content-update.test.ts`.
import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import {
  applyContentUpdate,
  MAX_EXPECTED_ENCODED,
  supabaseContentStore,
  type SupabaseLike,
} from './cms-content-update'

globalThis.fetch = (() => {
  throw new Error('network is disabled in these tests')
}) as typeof fetch

type Row = Record<string, unknown>

/** In-memory tables behind the same builder calls, with PostgREST-like filtering. */
class FakeSupabase implements SupabaseLike {
  tables: Record<string, Row[]>
  hidden = new Set<string>() // ids invisible to this session (RLS select)
  readOnly = new Set<string>() // ids this session may see but not update (RLS update)
  updates: { table: string; values: Row; filters: [string, string][] }[] = []

  constructor(tables: Record<string, Row[]>) {
    this.tables = structuredClone(tables)
  }

  private visible(table: string, filters: [string, string][]) {
    return (this.tables[table] ?? []).filter(
      (row) => !this.hidden.has(String(row.id)) && filters.every(([c, v]) => String(row[c]) === v),
    )
  }

  from(table: string) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const db = this
    type Query = { eq: (c: string, v: string) => Query; then: (resolve: (r: unknown) => unknown) => Promise<unknown> }
    const query = (columns: string, head: boolean, filters: [string, string][] = []): Query => ({
      eq: (c: string, v: string) => query(columns, head, [...filters, [c, v]]),
      then: (resolve: (r: unknown) => unknown) => {
        const rows = db.visible(table, filters)
        const picked = rows.map((r) => Object.fromEntries(columns.split(', ').map((c) => [c, r[c]])))
        return Promise.resolve(
          head ? { data: null, error: null, count: rows.length } : { data: picked, error: null },
        ).then(resolve)
      },
    })
    return {
      select: (columns: string, options?: { head: true }) => query(columns, !!options?.head),
      update: (values: Row) => ({
        eq: (c1: string, v1: string) => ({
          eq: (c2: string, v2: string) => ({
            select: () => {
              const filters: [string, string][] = [[c1, v1], [c2, v2]]
              db.updates.push({ table, values, filters })
              // One UPDATE ... WHERE ... RETURNING: every filter must match, atomically.
              const rows = db
                .visible(table, filters)
                .filter((row) => !db.readOnly.has(String(row.id)))
              rows.forEach((row) => Object.assign(row, values))
              return Promise.resolve({ data: rows.map((r) => ({ id: r.id })), error: null })
            },
          }),
        }),
      }),
    } as unknown as ReturnType<SupabaseLike['from']>
  }
}

const ORIGINAL = {
  countries: [
    {
      id: 'australia',
      why_study: 'Students can work up to 48 hours per fortnight. Other text.',
      feature2_desc: 'Unlimited hours, from a policy change.',
      visa_process: [{ step: 1 }],
      top_universities: ['A', 'B'],
    },
  ],
  faqs: [
    { id: '41', answer: 'Old answer.', question: 'Can I work?', status: 'published' },
    { id: '42', answer: 'Other answer.', question: 'Other?', status: 'published' },
  ],
}

let db: FakeSupabase
const run = (body: unknown) => applyContentUpdate(supabaseContentStore(db), body)
const country = (changes: Record<string, unknown> = {}) => ({
  record: 'country',
  id: 'australia',
  field: 'feature2_desc',
  expected_value: ORIGINAL.countries[0].feature2_desc,
  new_value: 'Corrected text.',
  ...changes,
})

beforeEach(() => {
  db = new FakeSupabase(ORIGINAL)
})

describe('PATCH /api/cms/content core', () => {
  it('changes exactly one allowlisted field with one conditional update', async () => {
    const outcome = await run(country())
    assert.equal(outcome.status, 200)
    const row = db.tables.countries[0]
    assert.equal(row.feature2_desc, 'Corrected text.')
    assert.deepEqual(
      { ...row, feature2_desc: ORIGINAL.countries[0].feature2_desc },
      ORIGINAL.countries[0],
    ) // every other column untouched
    assert.deepEqual(db.updates, [
      {
        table: 'countries',
        values: { feature2_desc: 'Corrected text.' },
        filters: [
          ['id', 'australia'],
          ['feature2_desc', ORIGINAL.countries[0].feature2_desc],
        ],
      },
    ])
  })

  it('refuses unsupported records, fields, ids, keys and sizes before any query', async () => {
    const bad = [
      [country({ record: 'profiles' }), 400],
      [country({ field: 'status' }), 400],
      [country({ field: 'answer' }), 400], // allowed for faq, not for country
      [country({ id: 'australia,code.eq.AU' }), 400],
      [{ ...country(), extra: 1 }, 400],
      [country({ new_value: '' }), 400],
      [country({ new_value: ORIGINAL.countries[0].feature2_desc }), 400],
      [country({ expected_value: 'é'.repeat(MAX_EXPECTED_ENCODED) }), 413],
      [[1, 2], 400],
    ] as const
    for (const [body, status] of bad) assert.equal((await run(body)).status, status)
    assert.equal(db.updates.length, 0)
  })

  it('returns 409 for a stale expected value and changes nothing', async () => {
    db.tables.countries[0].feature2_desc = 'Edited in the CMS meanwhile.'
    const outcome = await run(country())
    assert.equal(outcome.status, 409)
    assert.equal(db.tables.countries[0].feature2_desc, 'Edited in the CMS meanwhile.')
  })

  it('distinguishes missing, invisible, ambiguous and not-permitted targets', async () => {
    assert.equal((await run(country({ id: 'atlantis' }))).status, 404)
    db.hidden.add('australia')
    assert.equal((await run(country())).status, 404)
    db.hidden.clear()
    db.tables.faqs.push({ ...db.tables.faqs[0] }) // a duplicated id
    const ambiguous = await run({
      record: 'faq', id: '41', field: 'answer', expected_value: 'Old answer.', new_value: 'New.',
    })
    assert.equal(ambiguous.status, 409)
    assert.equal(db.updates.length, 0) // refused before writing
    db.tables.faqs.pop()
    db.readOnly.add('41')
    const blocked = await run({
      record: 'faq', id: '41', field: 'answer', expected_value: 'Old answer.', new_value: 'New.',
    })
    assert.equal(blocked.status, 403)
    assert.equal(db.tables.faqs[0].answer, 'Old answer.')
  })

  it('updates an FAQ answer only, and a repeat with the old expected value is stale', async () => {
    const body = {
      record: 'faq', id: '41', field: 'answer', expected_value: 'Old answer.', new_value: 'New.',
    }
    assert.equal((await run(body)).status, 200)
    assert.deepEqual(db.tables.faqs[0], { ...ORIGINAL.faqs[0], answer: 'New.' })
    assert.deepEqual(db.tables.faqs[1], ORIGINAL.faqs[1])
    assert.equal((await run(body)).status, 409) // no duplicate change
  })
})
