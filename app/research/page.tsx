'use client'

import { useState } from 'react'
import { BookOpen, FileText, Search, Sparkles } from 'lucide-react'

export default function ResearchPage() {
  const [subject, setSubject] = useState('')
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function startResearch() {
    setLoading(true); setError(''); setAnswer('')
    const response = await fetch('/api/research', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, question: prompt }) })
    const result = await response.json()
    if (!response.ok) setError(result.error ?? 'Research could not be completed')
    else setAnswer(result.answer)
    setLoading(false)
  }

  return <main className="min-h-screen bg-background text-foreground"><header className="border-b px-4 py-5 sm:px-8"><div className="mx-auto max-w-6xl"><p className="text-xs text-muted-foreground">Intelligence / Research</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">AI research</h1><p className="mt-1 text-sm text-muted-foreground">Turn permitted company and people sources into evidence-backed account briefs.</p></div></header><div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-8 lg:grid-cols-[1.1fr_.9fr]"><section className="rounded-lg border bg-card"><div className="border-b px-5 py-4"><h2 className="text-sm font-semibold">Start a research brief</h2><p className="mt-1 text-xs text-muted-foreground">Choose a record or list, then ask a focused question.</p></div><div className="flex flex-col gap-4 p-5"><label className="flex flex-col gap-2 text-xs font-medium">Company, person, or list<input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Search your workspace" className="min-h-11 rounded-md border bg-background px-3 text-base font-normal outline-none focus:ring-2 focus:ring-ring" /></label><label className="flex flex-col gap-2 text-xs font-medium">Research question<textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="What should I understand about this account?" className="min-h-28 resize-y rounded-md border bg-background px-3 py-3 text-base font-normal outline-none focus:ring-2 focus:ring-ring" /></label><button onClick={startResearch} disabled={!subject.trim() || !prompt.trim() || loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background disabled:opacity-40"><Sparkles className="size-4" />{loading ? 'Researching…' : 'Start research'}</button>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}{answer && <article className="border-t pt-5"><h3 className="mb-3 text-sm font-semibold">Research brief</h3><pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-muted-foreground">{answer}</pre></article>}</div></section><section className="rounded-lg border bg-card"><div className="border-b px-5 py-4"><h2 className="text-sm font-semibold">Research principles</h2><p className="mt-1 text-xs text-muted-foreground">Every brief keeps evidence visible.</p></div><div className="flex flex-col gap-5 p-5"><div className="flex gap-3"><Search className="mt-0.5 size-4 text-muted-foreground" /><div><p className="text-sm font-medium">Permitted sources</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Only configured, legitimate sources should be used for production evidence.</p></div></div><div className="flex gap-3"><FileText className="mt-0.5 size-4 text-muted-foreground" /><div><p className="text-sm font-medium">Evidence first</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Facts, inferences, and hypotheses stay clearly separated.</p></div></div><div className="flex gap-3"><BookOpen className="mt-0.5 size-4 text-muted-foreground" /><div><p className="text-sm font-medium">Traceable output</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Source references and freshness belong alongside important claims.</p></div></div></div></section></div></main>
}
