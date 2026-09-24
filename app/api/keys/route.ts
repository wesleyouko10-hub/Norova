import { createHash, randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const workspaceId = typeof body.workspaceId === 'string' ? body.workspaceId : ''
  if (!name || name.length > 80 || !workspaceId) return NextResponse.json({ error: 'A key name and workspace are required' }, { status: 400 })
  const rawKey = `ns_live_${randomBytes(24).toString('base64url')}`
  const keyHash = createHash('sha256').update(rawKey).digest('hex')
  const { error } = await client.from('api_keys').insert({ workspace_id: workspaceId, created_by: user.id, name, key_prefix: rawKey.slice(0, 16), key_hash: keyHash })
  if (error) return NextResponse.json({ error: 'Unable to create API key' }, { status: 500 })
  return NextResponse.json({ key: rawKey, warning: 'Store this key securely. It will not be shown again.' }, { status: 201 })
}
