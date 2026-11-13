import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getEntitlements, isBillingPlan, verifyLemonSqueezySignature } from '@/lib/billing/provider'

function adminClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase server credentials are not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  if (!verifyLemonSqueezySignature(rawBody, request.headers.get('x-signature'))) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody) as { meta?: { event_name?: string; custom_data?: { workspace_id?: string } }; data?: { id?: string; attributes?: Record<string, unknown> } }
  const workspaceId = event.meta?.custom_data?.workspace_id
  const attributes = event.data?.attributes ?? {}
  const plan = String(attributes.product_name ?? attributes.variant_name ?? '').toLowerCase()
  const normalizedPlan = plan.includes('business') ? 'business' : plan.includes('growth') ? 'growth' : 'starter'
  const statusValue = String(attributes.status ?? 'active')
  const status = ['trialing', 'active', 'past_due', 'canceled', 'paused'].includes(statusValue) ? statusValue : 'active'

  if (!workspaceId || !event.data?.id) return NextResponse.json({ received: true })
  const supabase = adminClient()
  const eventName = event.meta?.event_name ?? 'unknown'
  const { error: eventError } = await supabase.from('billing_events').insert({ provider: 'lemonsqueezy', provider_event_id: `${eventName}:${event.data.id}`, event_type: eventName, payload: event })
  if (eventError && eventError.code !== '23505') return NextResponse.json({ error: 'Could not record billing event' }, { status: 500 })

  if (isBillingPlan(normalizedPlan)) {
    const entitlements = getEntitlements(normalizedPlan)
    const periodEnd = attributes.renews_at ?? attributes.ends_at ?? null
    await supabase.from('subscriptions').upsert({ workspace_id: workspaceId, provider: 'lemonsqueezy', provider_subscription_id: event.data.id, plan: normalizedPlan, status, current_period_end: periodEnd, updated_at: new Date().toISOString() }, { onConflict: 'workspace_id' })
    await supabase.from('workspace_entitlements').upsert({ workspace_id: workspaceId, plan: normalizedPlan, credits_limit: entitlements.credits, api_requests_limit: entitlements.apiRequests, team_members_limit: entitlements.teamMembers, ai_research_limit: entitlements.aiResearchRuns, updated_at: new Date().toISOString() }, { onConflict: 'workspace_id' })
  }
  return NextResponse.json({ received: true })
}
