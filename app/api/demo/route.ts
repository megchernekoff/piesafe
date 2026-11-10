import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

function extractJSON(text: string): string {
  const block = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (block) return block[1]
  const obj = text.match(/\{[\s\S]*\}/)
  if (obj) return obj[0]
  return text
}

export async function POST(req: NextRequest) {
  const { dietary = [], dislikes = [], nights = 5 } = await req.json()

  const prompt = `Generate a ${nights}-day dinner meal plan for a household of 2 people.
${dietary.length ? `Dietary restrictions: ${dietary.join(', ')}.` : ''}
${dislikes.length ? `Never use: ${dislikes.join(', ')}.` : ''}

Return JSON. Be concise:
{
  "days": [
    {
      "day": "Day 1",
      "dinner": {
        "title": "Dish name",
        "description": "One appetising sentence",
        "prep_time": 15,
        "cook_time": 30,
        "tags": ["tag"]
      }
    }
  ]
}
Only titles, descriptions and times — no ingredients or instructions for the demo. Return only valid JSON.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  try {
    const plan = JSON.parse(extractJSON((message.content[0] as { text: string }).text))
    return NextResponse.json(plan)
  } catch {
    return NextResponse.json({ error: 'Failed to generate demo plan' }, { status: 500 })
  }
}
