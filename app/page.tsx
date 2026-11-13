'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  CircleHelp,
  Command,
  Database,
  Download,
  FileText,
  Gauge,
  KeyRound,
  LayoutDashboard,
  ListFilter,
  Menu,
  PanelLeftClose,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Companies', icon: Building2 },
  { label: 'People', icon: Users },
  { label: 'Search', icon: Search },
  { label: 'Lists', icon: ListFilter },
  { label: 'Enrichment', icon: Sparkles },
  { label: 'AI Research', icon: FileText },
  { label: 'Signals', icon: Activity },
]

const workspaceNavigation = [
  { label: 'API', icon: KeyRound, route: '/api-portal' },
  { label: 'Integrations', icon: Zap, route: '/integrations' },
  { label: 'Usage', icon: Gauge, route: '/usage' },
  { label: 'Team', icon: Users, route: '/team' },
  { label: 'Billing', icon: BarChart3, route: '/billing' },
  { label: 'Settings', icon: Settings2, route: '/settings' },
]

const routeByLabel: Record<string, string> = {
  Overview: '/', Companies: '/companies', People: '/people', Search: '/companies', Lists: '/lists',
  Enrichment: '/enrichment', 'AI Research': '/research', Signals: '/signals', API: '/api-portal',
  Integrations: '/integrations', Usage: '/usage', Team: '/team', Billing: '/billing', Settings: '/settings',
}

const metrics = [
  { label: 'Credits remaining', value: '—', detail: 'Connect your workspace to begin', icon: Zap },
  { label: 'Companies discovered', value: '—', detail: 'No searches yet', icon: Building2 },
  { label: 'People discovered', value: '—', detail: 'No searches yet', icon: Users },
  { label: 'Verified emails', value: '—', detail: 'No verifications yet', icon: Database },
]

export default function Page() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('Overview')

  useEffect(() => {
    const current = Object.entries(routeByLabel).find(([, route]) => route === window.location.pathname)
    if (current) setActiveNav(current[0])
  }, [])

  const goTo = (label: string) => {
    const route = routeByLabel[label]
    if (route) window.location.assign(route)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {mobileNavOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-foreground/20 lg:hidden" onClick={() => setMobileNavOpen(false)} />}
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r bg-card transition-transform lg:static lg:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-16 items-center justify-between border-b px-5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-md bg-foreground text-background"><Command className="size-4" /></div>
              <span className="text-[15px] font-semibold tracking-tight">Northstar</span>
            </div>
            <button className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted lg:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X className="size-4" /></button>
          </div>
          <div className="flex flex-1 flex-col gap-7 overflow-y-auto p-3">
            <div>
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Workspace</p>
              <button className="flex min-h-10 w-full items-center justify-between rounded-md border bg-muted/50 px-2.5 text-left text-sm font-medium" aria-label="Current workspace">
                <span className="flex items-center gap-2.5"><span className="flex size-6 items-center justify-center rounded bg-foreground text-[10px] font-bold text-background">A</span> Acme, Inc.</span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>
            </div>
            <nav aria-label="Primary navigation" className="flex flex-col gap-0.5">
              {navigation.map((item) => <NavItem key={item.label} {...item} active={activeNav === item.label} onClick={() => { setMobileNavOpen(false); goTo(item.label) }} />)}
            </nav>
            <div>
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Workspace tools</p>
              <nav aria-label="Workspace tools" className="flex flex-col gap-0.5">
                {workspaceNavigation.map((item) => <NavItem key={item.label} {...item} active={activeNav === item.label} onClick={() => { setMobileNavOpen(false); goTo(item.label) }} />)}
              </nav>
            </div>
          </div>
          <div className="border-t p-3">
            <button className="flex min-h-11 w-full items-center gap-2.5 rounded-md px-2.5 text-left hover:bg-muted"><span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">JD</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">Jordan Davis</span><span className="block truncate text-xs text-muted-foreground">Admin</span></span><ChevronDown className="size-4 text-muted-foreground" /></button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3"><button className="flex size-10 items-center justify-center rounded-md border lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu className="size-4" /></button><div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"><span>Workspace</span><span>/</span><span className="text-foreground">{activeNav}</span></div><span className="text-sm font-medium sm:hidden">{activeNav}</span></div>
            <div className="flex items-center gap-1"><button onClick={() => goTo('Search')} className="hidden h-9 items-center gap-2 rounded-md border px-3 text-xs text-muted-foreground hover:bg-muted sm:flex"><Search className="size-3.5" /> Search <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px]">/</kbd></button><button className="flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" aria-label="Help"><CircleHelp className="size-4" /></button><button className="relative flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" aria-label="Notifications"><Bell className="size-4" /><span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-foreground" /></button></div>
          </header>

          <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
            <div className="flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-sm text-muted-foreground">Wednesday, September 24, 2026</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Good morning, Jordan</h1><p className="mt-2 max-w-xl text-sm text-muted-foreground">Your intelligence workspace is ready. Start with a search to discover your next opportunity.</p></div><button onClick={() => goTo('Search')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"><Plus className="size-4" /> New search</button></div>

            <section aria-labelledby="metrics-heading" className="mt-7"><h2 id="metrics-heading" className="sr-only">Workspace metrics</h2><div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <div key={metric.label} className="bg-card p-5"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{metric.label}</span><metric.icon className="size-4 text-muted-foreground" /></div><p className="mt-5 text-2xl font-semibold tracking-tight">{metric.value}</p><p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p></div>)}</div></section>

            <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
              <section className="rounded-lg border bg-card" aria-labelledby="activity-heading"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 id="activity-heading" className="text-sm font-semibold">Usage overview</h2><p className="mt-1 text-xs text-muted-foreground">Activity will appear as your team works</p></div><button className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" aria-label="Usage options"><PanelLeftClose className="size-4" /></button></div><div className="flex min-h-[250px] flex-col items-center justify-center px-6 py-10 text-center"><div className="mb-4 flex size-11 items-center justify-center rounded-full border bg-muted/40"><BarChart3 className="size-5 text-muted-foreground" /></div><h3 className="text-sm font-medium">No usage data yet</h3><p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">Run a search, enrich a record, or create an API key to start seeing workspace activity here.</p></div></section>
              <section className="rounded-lg border bg-card" aria-labelledby="start-heading"><div className="border-b px-5 py-4"><h2 id="start-heading" className="text-sm font-semibold">Get started</h2><p className="mt-1 text-xs text-muted-foreground">Build your first qualified list</p></div><div className="flex flex-col divide-y">{[{ icon: Search, title: 'Search companies', description: 'Find businesses by firmographics, technology, and signals.' }, { icon: Users, title: 'Find decision makers', description: 'Identify relevant people at the companies you care about.' }, { icon: Download, title: 'Import your data', description: 'Enrich a CSV with traceable, quality-scored records.' }].map((item) => <button key={item.title} className="group flex min-h-[82px] items-center gap-3 px-5 text-left hover:bg-muted/50"><span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background"><item.icon className="size-4 text-muted-foreground" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{item.title}</span><span className="mt-1 block text-xs leading-4 text-muted-foreground">{item.description}</span></span><ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" /></button>)}</div></section>
            </div>

            <section className="mt-6 rounded-lg border bg-card" aria-labelledby="recent-heading"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 id="recent-heading" className="text-sm font-semibold">Recent activity</h2><p className="mt-1 text-xs text-muted-foreground">Searches, enrichment jobs, and exports from your workspace</p></div><button className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground sm:flex">View all <ArrowUpRight className="size-3.5" /></button></div><div className="flex min-h-32 items-center justify-center px-5 py-8 text-center text-xs text-muted-foreground">No activity to display.</div></section>
          </main>
        </div>
      </div>
    </div>
  )
}

function NavItem({ label, icon: Icon, active, onClick }: { label: string; icon: typeof Search; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`flex min-h-10 items-center gap-3 rounded-md px-2.5 text-sm transition-colors ${active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}><Icon className="size-4" />{label}{label === 'API' && <span className="ml-auto rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground">v1</span>}</button>
}
