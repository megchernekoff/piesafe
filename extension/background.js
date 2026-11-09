const PIE_SAFE_URL = 'https://pie-safe.com'

// Set up right-click context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-to-pie-safe',
    title: 'Save to Pie Safe 🥧',
    contexts: ['page'],
  })
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'save-to-pie-safe' || !tab?.id) return

  // Inject a script to get the page HTML, then open the popup flow
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.documentElement.outerHTML,
    })
    const html = results[0]?.result || ''
    const response = await callApi({ html, url: tab.url, preview: true })

    if (response?.error === 'not_logged_in') {
      chrome.tabs.create({ url: `${PIE_SAFE_URL}/sign-in` })
      return
    }

    if (response?.title) {
      // Save immediately on right-click (no preview)
      await callApi({ html, url: tab.url, preview: false, recipe: response })
      // Show a brief notification
      chrome.action.setBadgeText({ text: '✓', tabId: tab.id })
      chrome.action.setBadgeBackgroundColor({ color: '#6b5c8a', tabId: tab.id })
      setTimeout(() => chrome.action.setBadgeText({ text: '', tabId: tab.id }), 3000)
    }
  } catch (e) {
    console.error('Context menu save failed:', e)
  }
})

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
