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

async function callApi(body) {
  const res = await fetch(`${PIE_SAFE_URL}/api/extension/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // sends pie-safe.com cookies automatically
    body: JSON.stringify(body),
  })

  if (res.status === 401) return { error: 'not_logged_in' }
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Server error ${res.status}: ${text.slice(0, 100)}`)
  }
  return res.json()
}

async function parseRecipe(html, url) {
  return callApi({ html, url, preview: true })
}

async function saveRecipe(recipe, url) {
  return callApi({ html: recipe._html, url, preview: false, recipe })
}
