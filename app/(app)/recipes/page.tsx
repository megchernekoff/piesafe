'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { BookOpen, Link2, Loader2, Search, Trash2, X, Camera, Upload, ExternalLink, Send } from 'lucide-react'

interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  source_url: string | null
  tags: string[]
  prep_time: number | null
  cook_time: number | null
  servings: number | null
  toddler_notes: string | null
  created_at: string
}

// Convert a decimal to a readable fraction string e.g. 0.5 → "½"
function toFraction(n: number): string {
  if (n === 0) return '0'
  const whole = Math.floor(n)
  const dec = n - whole
  const fracs: [number, string][] = [[1/8,'⅛'],[1/4,'¼'],[1/3,'⅓'],[3/8,'⅜'],[1/2,'½'],[5/8,'⅝'],[2/3,'⅔'],[3/4,'¾'],[7/8,'⅞']]
  let frac = ''
  for (const [val, sym] of fracs) {
    if (Math.abs(dec - val) < 0.07) { frac = sym; break }
  }
  if (whole === 0) return frac || n.toFixed(1).replace(/\.0$/, '')
  return frac ? `${whole} ${frac}` : n % 1 < 0.05 ? String(whole) : n.toFixed(1).replace(/\.0$/, '')
}

// Scale numbers inside an ingredient string by a factor
function scaleIngredient(text: string, factor: number): string {
  if (factor === 1) return text
  // Match whole numbers, decimals, and simple fractions like 1/2 or 1 1/2
  return text.replace(/(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.?\d+)/g, (match) => {
    let val: number
    if (match.includes('/')) {
      const parts = match.trim().split(/\s+/)
      if (parts.length === 2) {
        // mixed number: "1 1/2"
        const [num, den] = parts[1].split('/')
        val = parseInt(parts[0]) + parseInt(num) / parseInt(den)
      } else {
        const [num, den] = parts[0].split('/')
        val = parseInt(num) / parseInt(den)
      }
    } else {
      val = parseFloat(match)
    }
    if (isNaN(val)) return match
    return toFraction(val * factor)
  })
}

// Panel only used for photo-imported recipes that have full data
function RecipePanel({ recipe, onClose, onDelete }: { recipe: Recipe; onClose: () => void; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false)
  const [servings, setServings] = useState(recipe.servings ?? 4)
  const originalServings = recipe.servings ?? 4
  const scale = servings / originalServings

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/recipes?id=${recipe.id}`, { method: 'DELETE' })
    onDelete()
  }

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h2 className="serif" style={{ fontSize: '2rem', fontWeight: 300, lineHeight: 1.1 }}>{recipe.title}</h2>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {recipe.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        {recipe.description && (
          <p style={{ color: 'var(--ink-light)', fontSize: '0.9rem', lineHeight: 1.6 }}>{recipe.description}</p>
        )}

        {/* Timing + serving adjuster */}
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--ink-light)', flexWrap: 'wrap', alignItems: 'center' }}>
          {recipe.prep_time && <span>Prep {recipe.prep_time}m</span>}
          {recipe.cook_time && <span>Cook {recipe.cook_time}m</span>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Serves</span>
            <button className="btn-ghost" style={{ padding: '0 0.4rem', fontSize: '1rem', lineHeight: 1 }}
              onClick={() => setServings(s => Math.max(1, s - 1))}>−</button>
            <span style={{ fontWeight: 600, color: 'var(--ink)', minWidth: '1.5rem', textAlign: 'center' }}>{servings}</span>
            <button className="btn-ghost" style={{ padding: '0 0.4rem', fontSize: '1rem', lineHeight: 1 }}
              onClick={() => setServings(s => s + 1)}>+</button>
            {scale !== 1 && (
              <button className="btn-ghost" style={{ fontSize: '0.7rem', color: 'var(--clay)' }}
                onClick={() => setServings(originalServings)}>reset</button>
            )}
          </div>
        </div>

        {recipe.toddler_notes && (
          <div style={{ background: '#fef3e2', borderRadius: 8, padding: '0.75rem 1rem' }}>
            <div className="toddler-badge" style={{ marginBottom: '0.4rem', display: 'inline-flex' }}>Toddler adaptation</div>
            <p style={{ fontSize: '0.85rem', color: '#7a4a00' }}>{recipe.toddler_notes}</p>
          </div>
        )}

        <div>
          <div className="section-label">Ingredients</div>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>{scaleIngredient(ing, scale)}</li>
            ))}
          </ul>
        </div>

        <div>
          <div className="section-label">Instructions</div>
          <ol style={{ paddingLeft: '1.2rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
            {recipe.instructions.map((step, i) => <li key={i} style={{ lineHeight: 1.6 }}>{step}</li>)}
          </ol>
        </div>

        <hr className="divider" />

        {/* Recipe chat */}
        <RecipeChat recipe={recipe} />

        <hr className="divider" />
        <button className="btn-ghost" onClick={handleDelete} disabled={deleting}
          style={{ color: 'var(--terracotta)', alignSelf: 'flex-start' }}>
          {deleting ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Trash2 size={14} />}
          {deleting ? 'Deleting…' : 'Delete recipe'}
        </button>
      </div>
    </div>
  )
}

interface ChatMessage { role: 'user' | 'assistant'; content: string }

function RecipeChat({ recipe }: { recipe: Recipe }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  async function send() {
    const text = input.trim()
    if (!text || thinking) return
    setInput('')
    const history = messages.map(m => ({ role: m.role, content: m.content }))
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setThinking(true)

    const res = await fetch('/api/recipe-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe, message: text, history }),
    })
    const data = await res.json()
    setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, something went wrong.' }])
    setThinking(false)
  }

  const SUGGESTIONS = ['Any substitutions I should know about?', 'How do I know when it\'s done?', 'Can I make this ahead?']

  return (
    <div>
      <div className="section-label" style={{ marginBottom: '0.75rem' }}>Ask about this recipe</div>

      {messages.length === 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {SUGGESTIONS.map(s => (
            <button key={s} className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
              onClick={() => { setInput(s) }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem', maxHeight: '280px', overflowY: 'auto', padding: '0.25rem 0' }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
              background: m.role === 'user' ? 'var(--rosemary)' : 'var(--linen)',
              color: m.role === 'user' ? 'var(--linen)' : 'var(--ink)',
              borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              padding: '0.6rem 0.9rem',
              fontSize: '0.85rem',
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
            }}>
              {m.content}
            </div>
          ))}
          {thinking && (
            <div style={{ alignSelf: 'flex-start', background: 'var(--linen)', borderRadius: '12px 12px 12px 2px', padding: '0.6rem 0.9rem' }}>
              <span className="spinner" style={{ width: 14, height: 14 }} />
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Substitutions, technique, variations…"
          style={{ flex: 1, fontSize: '0.85rem' }}
        />
        <button className="btn-primary" onClick={send} disabled={thinking || !input.trim()}
          style={{ padding: '0.65rem 0.85rem' }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

type ImportTab = 'url' | 'photo'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Recipe | null>(null)
  const [importTab, setImportTab] = useState<ImportTab>('url')

  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [importingPhoto, setImportingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/recipes${q ? `?q=${encodeURIComponent(q)}` : ''}`)
    setRecipes(await res.json())
    setLoading(false)
  }, [q])

  useEffect(() => { load() }, [load])

  async function handleImportUrl() {
    if (!importUrl.trim()) return
    setImporting(true)
    setImportError('')
    const res = await fetch('/api/import-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: importUrl }),
    })
    const data = await res.json()
    if (data.error) {
      setImportError(data.error)
    } else {
      setImportUrl('')
      load()
    }
    setImporting(false)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPhotoError('')
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleImportPhoto() {
    if (!imageFile) return
    setImportingPhoto(true)
    setPhotoError('')
    const form = new FormData()
    form.append('image', imageFile)
    const res = await fetch('/api/import-image', { method: 'POST', body: form })
    const data = await res.json()
    if (data.error) {
      setPhotoError(data.error)
    } else {
      setImageFile(null)
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      load()
    }
    setImportingPhoto(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/recipes?id=${id}`, { method: 'DELETE' })
    setSelected(null)
    load()
  }

  function handleCardClick(recipe: Recipe) {
    if (recipe.source_url && recipe.ingredients.length === 0) {
      // Link-only recipe — go straight to the source
      window.open(recipe.source_url, '_blank', 'noopener')
    } else {
      // Photo-imported recipe with full data — open panel
      setSelected(recipe)
    }
  }

  return (
    <div>
      {selected && (
        <RecipePanel
          recipe={selected}
          onClose={() => setSelected(null)}
          onDelete={() => handleDelete(selected.id)}
        />
      )}

      <div className="page-header">
        <h1 className="page-title">Recipe Box</h1>
        <p className="page-subtitle">Your recipe library</p>
      </div>

      {/* Import card */}
      <div className="card" style={{ maxWidth: '640px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => { setImportTab('url'); setImportError(''); setPhotoError('') }}
            className={importTab === 'url' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
            <Link2 size={13} /> From URL
          </button>
          <button
            onClick={() => { setImportTab('photo'); setImportError(''); setPhotoError('') }}
            className={importTab === 'photo' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
            <Camera size={13} /> From Photo
          </button>
        </div>

        {importTab === 'url' && (
          <div>
            <div className="section-label" style={{ marginBottom: '0.75rem' }}>Save a recipe from any website</div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input className="input"
                placeholder="https://www.seriouseats.com/..."
                value={importUrl}
                onChange={e => setImportUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleImportUrl()}
                style={{ flex: 1 }}
              />
              <button className="btn-primary" onClick={handleImportUrl} disabled={importing || !importUrl.trim()}>
                {importing
                  ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</>
                  : <><Link2 size={14} /> Save</>}
              </button>
            </div>
            {importError && (
              <p style={{ color: 'var(--terracotta)', fontSize: '0.82rem', marginTop: '0.6rem' }}>{importError}</p>
            )}
          </div>
        )}

        {importTab === 'photo' && (
          <div>
            <div className="section-label" style={{ marginBottom: '0.75rem' }}>Upload a photo of a recipe</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-light)', marginBottom: '0.75rem' }}>
              Works with cookbook pages, recipe cards, handwritten notes, or screenshots.
            </p>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--linen-dark)',
                borderRadius: 10,
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: imagePreview ? 'transparent' : 'var(--linen)',
                marginBottom: '0.75rem',
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file) {
                  setImageFile(file)
                  setPhotoError('')
                  const reader = new FileReader()
                  reader.onload = ev => setImagePreview(ev.target?.result as string)
                  reader.readAsDataURL(file)
                }
              }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview"
                  style={{ maxHeight: 220, maxWidth: '100%', borderRadius: 8, margin: '0 auto', display: 'block' }} />
              ) : (
                <>
                  <Upload size={28} style={{ color: 'var(--clay)', margin: '0 auto 0.5rem', display: 'block' }} />
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)' }}>Click to choose a photo, or drag one here</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginTop: '0.25rem' }}>JPG, PNG, WEBP</p>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-primary" onClick={handleImportPhoto} disabled={importingPhoto || !imageFile}>
                {importingPhoto
                  ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Reading recipe…</>
                  : <><Camera size={14} /> Import from photo</>}
              </button>
              {imagePreview && (
                <button className="btn-secondary" onClick={() => {
                  setImageFile(null); setImagePreview(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}>Clear</button>
              )}
            </div>
            {photoError && (
              <p style={{ color: 'var(--terracotta)', fontSize: '0.82rem', marginTop: '0.6rem' }}>{photoError}</p>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '1.5rem' }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-light)' }} />
        <input className="input" style={{ paddingLeft: '2rem' }}
          placeholder="Search recipes…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {loading && <div className="empty-state"><div className="spinner" style={{ width: 32, height: 32 }} /></div>}

      {!loading && recipes.length === 0 && (
        <div className="empty-state">
          <BookOpen size={40} />
          <h3>No recipes yet</h3>
          <p>Save one from a URL or upload a photo above.</p>
        </div>
      )}

      <div className="recipe-grid">
        {recipes.map(r => {
          const isLink = r.source_url && r.ingredients.length === 0
          return (
            <div key={r.id} className="card"
              style={{ cursor: 'pointer', position: 'relative' }}
              onClick={() => handleCardClick(r)}>
              <h3 className="serif" style={{ fontSize: '1.2rem', fontWeight: 400, paddingRight: '1.5rem' }}>{r.title}</h3>
              {r.description && (
                <p style={{ fontSize: '0.82rem', color: 'var(--ink-light)', marginTop: '0.4rem', lineHeight: 1.5 }}>
                  {r.description.slice(0, 100)}{r.description.length > 100 ? '…' : ''}
                </p>
              )}
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {r.tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--ink-light)', alignItems: 'center' }}>
                {r.prep_time && <span>{r.prep_time}m prep</span>}
                {r.cook_time && <span>{r.cook_time}m cook</span>}
                {isLink && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--clay)' }}>
                    <ExternalLink size={11} /> {new URL(r.source_url!).hostname.replace('www.', '')}
                  </span>
                )}
              </div>
              {/* Subtle delete button in corner */}
              <button
                className="btn-ghost"
                style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.25rem', color: 'var(--ink-light)', opacity: 0.4 }}
                onClick={e => { e.stopPropagation(); handleDelete(r.id) }}>
                <Trash2 size={13} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
