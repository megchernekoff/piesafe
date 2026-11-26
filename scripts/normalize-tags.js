const { createClient } = require('@libsql/client')

const db = createClient({
  url: 'libsql://piesafe-megchernekoff.aws-us-west-2.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// Tags to rename to a canonical form
const RENAMES = {
  'easy': 'low lift',
  'low-lift': 'low lift',
  'gf': 'gluten-free',
  'gluten-free optional': 'gluten-free',
  'one-pan': 'sheet pan',
}

// Tags to remove entirely
const REMOVE = new Set([
  'no-ramekins', 'chocolate', 'baked', 'weeknight dinner', 'italian',
  'spinach', 'sweet potatoes', 'stuffing', 'southern', 'cajun', 'andouille',
  'cornbread', 'spicy', 'holiday', 'weeknight', 'vegan', // vegan → vegetarian is close enough for now
])

function normalize(tags) {
  const seen = new Set()
  const result = []
  for (let t of tags) {
    t = (RENAMES[t.toLowerCase()] ?? t.toLowerCase()).trim()
    if (!REMOVE.has(t) && !seen.has(t)) {
      seen.add(t)
      result.push(t)
    }
  }
  return result
}

async function main() {
  const rows = (await db.execute('SELECT id, title, tags FROM recipes')).rows
  let changed = 0

  for (const row of rows) {
    const old = JSON.parse(row.tags || '[]')
    const updated = normalize(old)
    const same = JSON.stringify(old.map(t => t.toLowerCase()).sort()) === JSON.stringify(updated.slice().sort())
    if (same) continue
    await db.execute({ sql: 'UPDATE recipes SET tags = ? WHERE id = ?', args: [JSON.stringify(updated), row.id] })
    console.log(`${row.title}`)
    console.log(`  was: [${old.join(', ')}]`)
    console.log(`  now: [${updated.join(', ')}]`)
    changed++
  }

  console.log(`\nUpdated ${changed} recipes.`)
}

main().catch(e => { console.error(e); process.exit(1) })
