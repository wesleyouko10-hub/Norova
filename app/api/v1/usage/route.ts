import { NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api/auth'

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request, 'usage:read')
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { data, error } = await auth.client.from('api_requests').select('endpoint,status_code,credits,latency_ms,created_at').eq('workspace_id', auth.key.workspace_id).order('created_at', { ascending: false }).limit(100)
  if (error) return NextResponse.json({ error: 'Unable to read usage' }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}
