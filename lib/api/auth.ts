import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

function adminClient() {
  if (!secretKey || !process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Supabase server credentials are not configured')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, secretKey, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function authenticateApiKey(request: Request, requiredScope: string) {
  const value = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim()
  if (!value?.startsWith('ns_live_')) return { error: 'API key required', status: 401 as const }
  const hash = createHash('sha256').update(value).digest('hex')
  const client = adminClient()
  const { data: key, error } = await client.from('api_keys').select('id,workspace_id,scopes,revoked_at').eq('key_hash', hash).maybeSingle()
  if (error || !key || key.revoked_at) return { error: 'Invalid or revoked API key', status: 401 as const }
  if (!key.scopes.includes(requiredScope)) return { error: `Missing scope: ${requiredScope}`, status: 403 as const }
  await client.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', key.id)
  return { key, client }
}

export async function recordApiRequest(client: ReturnType<typeof adminClient>, values: { workspaceId: string; apiKeyId: string; endpoint: string; statusCode: number; credits?: number; startedAt: number }) {
  await client.from('api_requests').insert({ workspace_id: values.workspaceId, api_key_id: values.apiKeyId, endpoint: values.endpoint, status_code: values.statusCode, credits: values.credits ?? 0, latency_ms: Date.now() - values.startedAt })
}

export function adminSupabase() { return adminClient() }
