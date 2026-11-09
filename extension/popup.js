const app = document.getElementById('app')

function render(html) { app.innerHTML = html }

function loading(msg = 'Reading recipe…') {
  render(`
    <div class="state-loading">
      <div class="spinner"></div>
      <span>${msg}</span>
    </div>
  `)
}

function notLoggedIn() {
  render(`
    <div class="state-login">
      <p>Log in to Pie Safe to save recipes.</p>
      <a class="btn-open" href="https://pie-safe.com/sign-in" target="_blank">Open Pie Safe →</a>
    </div>
  `)
}

function showPreview(recipe) {
  const hasFullRecipe = recipe.ingredients && recipe.ingredients.length > 0
  const metaParts = []
  if (recipe.prep_time || recipe.cook_time) metaParts.push(`${(recipe.prep_time||0)+(recipe.cook_time||0)}m`)
  if (recipe.servings) metaParts.push(`Serves ${recipe.servings}`)

  render(`
    <div class="body">
      <div class="recipe-title">${recipe.title}</div>
      ${metaParts.length ? `<div class="recipe-meta">${metaParts.join(' · ')}</div>` : ''}
      ${recipe.description ? `<div class="recipe-desc">${recipe.description.slice(0, 120)}${recipe.description.length > 120 ? '…' : ''}</div>` : ''}
      ${hasFullRecipe
        ? `<div class="recipe-badge">✓ Full recipe · ${recipe.ingredients.length} ingredients</div>`
        : `<div class="no-recipe">Recipe title and link will be saved. Full ingredients not available on this page.</div>`
      }
      <div class="actions">
        <button class="btn-save" id="btn-save">Save to Recipe Box</button>
        <button class="btn-cancel" id="btn-cancel">Cancel</button>
      </div>
    </div>
  `)

  document.getElementById('btn-save').addEventListener('click', () => doSave(recipe))
  document.getElementById('btn-cancel').addEventListener('click', () => window.close())
}

function showSaved(title) {
  render(`
    <div class="state-saved">
      <div class="saved-check">🥧</div>
      <div class="saved-title">${title}</div>
      <div class="saved-sub">Saved to your Recipe Box</div>
      <a class="btn-view" href="https://pie-safe.com/recipes" target="_blank">View Recipe Box →</a>
    </div>
  `)
}

function showError(msg) {
  render(`<div class="state-error">⚠ ${msg}</div>`)
}

async function doSave(recipe) {
  document.getElementById('btn-save').disabled = true
  document.getElementById('btn-save').textContent = 'Saving…'

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const response = await chrome.runtime.sendMessage({
    type: 'SAVE_RECIPE',
    recipe,
    url: tab.url,
  })

  if (response?.error === 'not_logged_in') return notLoggedIn()
  if (response?.error) return showError(response.error)
  showSaved(recipe.title)
}

// Entry point — grab page HTML and parse
async function init() {
  loading()

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) return showError('Could not read this page.')

  let html = ''
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.documentElement.outerHTML,
    })
    html = results[0]?.result || ''
  } catch {
    return showError('Could not read this page. Try refreshing.')
  }

  const response = await chrome.runtime.sendMessage({
    type: 'PARSE_RECIPE',
    html,
    url: tab.url,
  })

  if (!response) return showError('No response from server.')
  if (response.error === 'not_logged_in') return notLoggedIn()
  if (response.error) return showError(response.error)
  if (!response.title) return showError('No recipe found on this page.')

  showPreview(response)
}

init()
