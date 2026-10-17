// Offline: the auth guard and Supabase client are replaced; no env, no network.
// Run with `npx --no-install tsx --test --experimental-test-module-mocks <this file>`.
import assert from 'node:assert/strict'
import { it, mock } from 'node:test'
import { NextResponse } from 'next/server'

globalThis.fetch = (() => {
  throw new Error('network is disabled in these tests')
}) as typeof fetch

let clients = 0
let authorized = false
mock.module('@/lib/cms-auth-guard', {
  namedExports: {
    requireCmsAuth: async () =>
      authorized
        ? { user: { id: 'editor' }, error: null }
        : { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) },
  },
})
mock.module('@/lib/supabase-server', {
  namedExports: {
    createClient: async () => {
      clients += 1
      throw new Error('no client in tests')
    },
  },
})

const request = (body: string) =>
  new Request('http://localhost/api/cms/content', { method: 'PATCH', body })

it('refuses without a CMS editor session and never creates a client', async () => {
  const { PATCH } = await import('./route')
  const response = await PATCH(request('{"record":"faq"}'))
  assert.equal(response.status, 401)
  assert.equal(clients, 0)
})

it('rejects malformed JSON after auth, before touching the database', async () => {
  authorized = true
  const { PATCH } = await import('./route')
  const response = await PATCH(request('not json'))
  assert.equal(response.status, 400)
  assert.equal(clients, 0)
})

it('hides internal failures behind a generic 500', async () => {
  authorized = true
  const { PATCH } = await import('./route')
  const response = await PATCH(request('{"record":"faq"}'))
  assert.equal(response.status, 500)
  assert.deepEqual(await response.json(), { error: 'Update failed' })
})
