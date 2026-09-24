export type BillingPlan = 'starter' | 'growth' | 'pro' | 'business' | 'enterprise'

export type Entitlements = { credits: number; apiRequests: number; teamMembers: number; exports: boolean; aiResearch: boolean; integrations: number }

const ENTITLEMENTS: Record<BillingPlan, Entitlements> = {
  starter: { credits: 1000, apiRequests: 10000, teamMembers: 3, exports: true, aiResearch: true, integrations: 1 },
  growth: { credits: 5000, apiRequests: 50000, teamMembers: 10, exports: true, aiResearch: true, integrations: 3 },
  pro: { credits: 20000, apiRequests: 250000, teamMembers: 25, exports: true, aiResearch: true, integrations: 10 },
  business: { credits: 100000, apiRequests: 1000000, teamMembers: 100, exports: true, aiResearch: true, integrations: 25 },
  enterprise: { credits: Number.MAX_SAFE_INTEGER, apiRequests: Number.MAX_SAFE_INTEGER, teamMembers: Number.MAX_SAFE_INTEGER, exports: true, aiResearch: true, integrations: Number.MAX_SAFE_INTEGER },
}

export interface BillingProvider { createCheckout(workspaceId: string, plan: BillingPlan): Promise<{ checkoutUrl: string }>; cancelSubscription(subscriptionId: string): Promise<void>; getPortalUrl(customerId: string): Promise<string> }
export function getEntitlements(plan: BillingPlan): Entitlements { return ENTITLEMENTS[plan] }
