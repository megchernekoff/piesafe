const PIE_SAFE_URL = 'https://pie-safe.com'

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'PARSE_RECIPE') {
    parseRecipe(message.html, message.url)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }))
    return true // keep channel open for async
  }

  if (message.type === 'SAVE_RECIPE') {
    saveRecipe(message.recipe, message.url)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }))
    return true
  }
})

async function getSessionToken() {
  const cookies = await chrome.cookies.getAll({ url: PIE_SAFE_URL })
  // Clerk stores the session JWT in __session or __clerk_db_jwt
  const session = cookies.find(c => c.name === '__session' || c.name.startsWith('__clerk'))
  return session?.value ?? null
}

async function parseRecipe(html, url) {
  const token = await getSessionToken()
  if (!token) return { error: 'not_logged_in' }

  const res = await fetch(`${PIE_SAFE_URL}/api/extension/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-pie-safe-session': token,
    },
    body: JSON.stringify({ html, url, preview: true }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Server error ${res.status}: ${text.slice(0, 100)}`)
  }

  return res.json()
}

async function saveRecipe(recipe, url) {
  const token = await getSessionToken()
  if (!token) return { error: 'not_logged_in' }

  const res = await fetch(`${PIE_SAFE_URL}/api/extension/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-pie-safe-session': token,
    },
    body: JSON.stringify({ html: recipe._html, url, preview: false, recipe }),
  })

  if (!res.ok) throw new Error(`Server error ${res.status}`)
  return res.json()
}
