import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan, message, history } = await req.json()

  const mealSummary = plan.days
    .filter((d: { dinner: { title: string } | null }) => d.dinner)
    .map((d: { day: string; dinner: { title: string } }) => `${d.day}: ${d.dinner.title}`)
    .join('\n')

  const system = `You are a helpful meal planning assistant. The user has a generated weekly dinner plan and wants to discuss changes or ask questions about it.

Current plan:
${mealSummary}

${plan.rationale ? `Why this plan was chosen: ${plan.rationale}` : ''}

Help the user refine the plan. If they want to swap meals, suggest alternatives that fit their preferences. If they ask about ingredients or technique, answer helpfully. Be conversational and concise.

When the user wants to make specific changes to the plan, summarise the changes clearly at the end of your message so they can use the "Regenerate with feedback" button.`

  const messages = [
    ...(history || []),
    { role: 'user' as const, content: message },
  ]

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system,
    messages,
  })

  return NextResponse.json({ reply: (response.content[0] as { text: string }).text })
}
