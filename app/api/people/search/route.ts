import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''
  const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? 25), 1), 100)
  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  let builder = client.from('people').select('id,full_name,title,department,seniority,location,professional_profile_url,work_email_status,data_status,confidence,last_verified_at').order('updated_at', { ascending: false }).limit(limit)
  if (query) builder = builder.or(`full_name.ilike.%${query}%,title.ilike.%${query}%,department.ilike.%${query}%`)
  const { data, error } = await builder

  if (error) return NextResponse.json({ error: 'Unable to search people' }, { status: 500 })
  return NextResponse.json({ data: data ?? [], nextCursor: null })
}
