export type BillingPlan = 'free' | 'starter' | 'growth' | 'business' | 'enterprise'

export type Entitlements = {
  credits: number
  apiRequests: number
  teamMembers: number
  aiResearchRuns: number
  savedLists: number
  exports: boolean
  apiAccess: boolean
  webhooks: boolean
}

const ENTITLEMENTS: Record<BillingPlan, Entitlements> = {
  free: { credits: 50, apiRequests: 0, teamMembers: 1, aiResearchRuns: 5, savedLists: 1, exports: true, apiAccess: false, webhooks: false },
  starter: { credits: 1000, apiRequests: 10000, teamMembers: 1, aiResearchRuns: 100, savedLists: 10, exports: true, apiAccess: true, webhooks: false },
  growth: { credits: 5000, apiRequests: 50000, teamMembers: 5, aiResearchRuns: 500, savedLists: Number.MAX_SAFE_INTEGER, exports: true, apiAccess: true, webhooks: true },
  business: { credits: 20000, apiRequests: 250000, teamMembers: 15, aiResearchRuns: 2000, savedLists: Number.MAX_SAFE_INTEGER, exports: true, apiAccess: true, webhooks: true },
  enterprise: { credits: Number.MAX_SAFE_INTEGER, apiRequests: Number.MAX_SAFE_INTEGER, teamMembers: Number.MAX_SAFE_INTEGER, aiResearchRuns: Number.MAX_SAFE_INTEGER, savedLists: Number.MAX_SAFE_INTEGER, exports: true, apiAccess: true, webhooks: true },
}

export function getEntitlements(plan: BillingPlan): Entitlements {
  return ENTITLEMENTS[plan]
}

const VARIANT_ENV: Record<Exclude<BillingPlan, 'free' | 'enterprise'>, string> = {
  starter: 'LEMONSQUEEZY_STARTER_VARIANT_ID',
  growth: 'LEMONSQUEEZY_GROWTH_VARIANT_ID',
  business: 'LEMONSQUEEZY_BUSINESS_VARIANT_ID',
}

export function createCheckoutUrl(workspaceId: string, plan: BillingPlan, userEmail?: string): string {
  if (plan === 'free' || plan === 'enterprise') throw new Error('This plan does not have a self-serve checkout')
  const store = process.env.LEMONSQUEEZY_STORE_SUBDOMAIN
  const variant = process.env[VARIANT_ENV[plan]]
  if (!store || !variant) throw new Error(`Lemon Squeezy is not configured for ${plan}`)
  const params = new URLSearchParams({
    checkout: '1',
    'checkout[custom][workspace_id]': workspaceId,
  })
  if (userEmail) params.set('checkout[email]', userEmail)
  return `https://${store}.lemonsqueezy.com/checkout/buy/${variant}?${params.toString()}`
}

export function isBillingPlan(value: string): value is BillingPlan {
  return value in ENTITLEMENTS
}

export function verifyLemonSqueezySignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !process.env.LEMONSQUEEZY_WEBHOOK_SECRET) return false
  const crypto = require('node:crypto') as typeof import('node:crypto')
  const expected = crypto.createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET).update(rawBody).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}
