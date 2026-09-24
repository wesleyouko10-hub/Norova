import { NextResponse } from 'next/server'
import { authenticateApiKey, recordApiRequest } from '@/lib/api/auth'

export async function GET(request: Request) {
  const startedAt = Date.now()
  const auth = await authenticateApiKey(request, 'people:read')
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''
  const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? 25), 1), 100)
  let builder = auth.client.from('people').select('id,full_name,title,department,seniority,location,professional_profile_url,work_email_status,data_status,confidence,last_verified_at').eq('workspace_id', auth.key.workspace_id).order('updated_at', { ascending: false }).limit(limit)
  if (query) builder = builder.or(`full_name.ilike.%${query}%,title.ilike.%${query}%,department.ilike.%${query}%`)
  const { data, error } = await builder
  const status = error ? 500 : 200
  await recordApiRequest(auth.client, { workspaceId: auth.key.workspace_id, apiKeyId: auth.key.id, endpoint: '/api/v1/people/search', statusCode: status, credits: 1, startedAt })
  if (error) return NextResponse.json({ error: 'Unable to search people' }, { status })
  return NextResponse.json({ data: data ?? [], nextCursor: null, usage: { credits: 1 } }, { headers: { 'X-RateLimit-Limit': '60', 'X-RateLimit-Remaining': '59', 'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + 60) } })
}
