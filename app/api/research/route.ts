import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const model = 'openai/gpt-4o-mini'

export async function POST(request: Request) {
  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
  const question = typeof body.question === 'string' ? body.question.trim() : ''
  if (!subject || !question || subject.length > 240 || question.length > 2000) return NextResponse.json({ error: 'Subject and question are required' }, { status: 400 })

  try {
    const result = await generateText({
      model,
      system: 'You are a careful B2B research analyst. Separate FACT, INFERENCE, and HYPOTHESIS. Never invent sources or claim verification. If evidence is unavailable, say so clearly. Return concise markdown with headings and an Evidence section.',
      prompt: `Research subject: ${subject}\nQuestion: ${question}\nOnly use information supplied in the prompt or generally known information you can state cautiously.`,
    })
    return NextResponse.json({ subject, question, answer: result.text, model, generatedAt: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'Research service is temporarily unavailable' }, { status: 503 })
  }
}
