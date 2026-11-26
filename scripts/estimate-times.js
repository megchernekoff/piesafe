const { createClient } = require('@libsql/client')
const Anthropic = require('@anthropic-ai/sdk').default

const db = createClient({
  url: 'libsql://piesafe-megchernekoff.aws-us-west-2.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function estimate(recipe) {
  const context = [
    recipe.title,
    recipe.description || '',
    `Ingredients: ${JSON.parse(recipe.ingredients || '[]').slice(0, 10).join(', ')}`,
    recipe.instructions ? `Instructions snippet: ${JSON.parse(recipe.instructions || '[]').slice(0, 3).join(' ')}` : '',
  ].filter(Boolean).join('\n')

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 40,
    messages: [{
      role: 'user',
      content: `Estimate prep and cook time in minutes for this recipe. Return only JSON: {"prep_time": 10, "cook_time": 30}\n\n${context}`,
    }],
  })

  try {
    const raw = msg.content[0].text.trim()
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) {
      const { prep_time, cook_time } = JSON.parse(match[0])
      return { prep_time: parseInt(prep_time) || null, cook_time: parseInt(cook_time) || null }
    }
  } catch { /* ignore */ }
  return null
}

async function main() {
  const rows = (await db.execute(
    'SELECT id, title, description, ingredients, instructions FROM recipes WHERE prep_time IS NULL OR cook_time IS NULL'
  )).rows

  console.log(`Estimating times for ${rows.length} recipes…\n`)

  for (const row of rows) {
    const times = await estimate(row)
    if (!times) { console.log(`SKIP ${row.title}`); continue }
    await db.execute({
      sql: 'UPDATE recipes SET prep_time = COALESCE(prep_time, ?), cook_time = COALESCE(cook_time, ?) WHERE id = ?',
      args: [times.prep_time, times.cook_time, row.id],
    })
    console.log(`✓ ${row.title} — prep ${times.prep_time}m, cook ${times.cook_time}m`)
  }

  console.log('\nDone.')
}

main().catch(e => { console.error(e); process.exit(1) })
