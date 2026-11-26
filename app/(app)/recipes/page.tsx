'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import ExtensionBanner from '@/components/ExtensionBanner'
import { BookOpen, Link2, Loader2, Search, Trash2, X, Camera, Upload, ExternalLink, Send, Share2, Check } from 'lucide-react'

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
  notes: string | null
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
function RecipePanel({ recipe, onClose, onDelete, onRefresh }: { recipe: Recipe; onClose: () => void; onDelete: () => void; onRefresh: (updated: Recipe) => void }) {
  const [deleting, setDeleting] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [servings, setServings] = useState(recipe.servings ?? 4)
  const originalServings = recipe.servings ?? 4
  const scale = servings / originalServings
  const isEmpty = recipe.ingredients.length === 0 && recipe.source_url
  const [shared, setShared] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(recipe.title)
  const [editDesc, setEditDesc] = useState(recipe.description || '')
  const [editIngredients, setEditIngredients] = useState(recipe.ingredients.join('\n'))
  const [editInstructions, setEditInstructions] = useState(recipe.instructions.join('\n'))
  const [editTags, setEditTags] = useState(recipe.tags)
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !editTags.includes(t)) setEditTags(prev => [...prev, t])
    setTagInput('')
  }

  async function saveEdits() {
    setSaving(true)
    const ingredients = editIngredients.split('\n').map(s => s.trim()).filter(Boolean)
    const instructions = editInstructions.split('\n').map(s => s.trim()).filter(Boolean)
    await fetch('/api/recipes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: recipe.id, title: editTitle, description: editDesc, ingredients, instructions, tags: editTags, prep_time: recipe.prep_time, cook_time: recipe.cook_time, servings: recipe.servings }),
    })
    onRefresh({ ...recipe, title: editTitle, description: editDesc, ingredients, instructions, tags: editTags })
    setEditing(false)
    setSaving(false)
  }

  async function shareRecipe() {
    const lines: string[] = [recipe.title]
    if (recipe.description) lines.push('', recipe.description)
    if (recipe.ingredients.length) {
      lines.push('', 'Ingredients:')
      recipe.ingredients.forEach(i => lines.push(`• ${i}`))
    }
    if (recipe.instructions.length) {
      lines.push('', 'Instructions:')
      recipe.instructions.forEach((s, i) => lines.push(`${i + 1}. ${s}`))
    }
    if (recipe.notes) lines.push('', `Notes: ${recipe.notes}`)
    lines.push('', '— Shared from Pie Safe (pie-safe.com)')
    const text = lines.join('\n')

    if (typeof navigator.share === 'function') {
      try { await navigator.share({ title: recipe.title, text }); return } catch { /* cancelled */ }
    }
    await navigator.clipboard.writeText(text)
    setShared(true)
    setTimeout(() => setShared(false), 2500)
  }

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/recipes?id=${recipe.id}`, { method: 'DELETE' })
    onDelete()
  }

  async function fetchFullRecipe() {
    if (!recipe.source_url) return
    setFetching(true)
    // Re-import the URL to get full recipe, then update this record
    const res = await fetch('/api/import-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: recipe.source_url, updateId: recipe.id }),
    })
    const data = await res.json()
    if (data.success && data.full) {
      onRefresh({ ...recipe, ...data.recipe })
    }
    setFetching(false)
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
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button className="btn-ghost" onClick={shareRecipe} style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {shared ? <><Check size={13} /> Copied</> : <><Share2 size={13} /> Share</>}
            </button>
            <button className="btn-ghost" onClick={() => setEditing(e => !e)} style={{ fontSize: '0.78rem' }}>
              {editing ? 'Cancel' : '✎ Edit'}
            </button>
            <button className="btn-ghost" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <div className="section-label" style={{ marginBottom: '0.4rem' }}>Title</div>
              <input className="input" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            </div>
            <div>
              <div className="section-label" style={{ marginBottom: '0.4rem' }}>Description</div>
              <input className="input" value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="One sentence description" />
            </div>
            <div>
              <div className="section-label" style={{ marginBottom: '0.5rem' }}>Tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                {editTags.map(t => (
                  <span key={t} className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'default' }}>
                    {t}
                    <button onClick={() => setEditTags(prev => prev.filter(x => x !== t))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: 'inherit', opacity: 0.6 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input className="input" value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  placeholder="Add a tag…" style={{ flex: 1, fontSize: '0.85rem' }} />
                <button className="btn-secondary" onClick={addTag} style={{ fontSize: '0.82rem' }}>Add</button>
              </div>
            </div>

            {recipe.ingredients.length > 0 && (
              <>
                <div>
                  <div className="section-label" style={{ marginBottom: '0.4rem' }}>Ingredients <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(one per line)</span></div>
                  <textarea className="textarea" value={editIngredients} onChange={e => setEditIngredients(e.target.value)} style={{ minHeight: '120px' }} />
                </div>
                <div>
                  <div className="section-label" style={{ marginBottom: '0.4rem' }}>Instructions <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(one per line)</span></div>
                  <textarea className="textarea" value={editInstructions} onChange={e => setEditInstructions(e.target.value)} style={{ minHeight: '120px' }} />
                </div>
              </>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-primary" onClick={saveEdits} disabled={saving} style={{ fontSize: '0.85rem' }}>
                {saving ? <><Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</> : 'Save changes'}
              </button>
              <button className="btn-secondary" onClick={() => setEditing(false)} style={{ fontSize: '0.85rem' }}>Cancel</button>
            </div>
          </div>
        ) : (
        <>

        {recipe.description && (
          <p style={{ color: 'var(--ink-light)', fontSize: '0.9rem', lineHeight: 1.6 }}>{recipe.description}</p>
        )}

        {isEmpty && (
          <button className="btn-secondary" onClick={fetchFullRecipe} disabled={fetching}
            style={{ fontSize: '0.82rem', alignSelf: 'flex-start' }}>
            {fetching
              ? <><Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Fetching…</>
              : '↻ Fetch full recipe'}
          </button>
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
              <button className="btn-ghost" style={{ fontSize: '0.7rem', color: 'var(--ochre)' }}
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

        {recipe.notes && (
          <div style={{ background: 'var(--stone)', borderRadius: 8, padding: '0.75rem 1rem', borderLeft: '3px solid var(--ochre)' }}>
            <div className="section-label" style={{ marginBottom: '0.4rem' }}>Notes</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-light)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{recipe.notes}</p>
          </div>
        )}

        </>
        )}

        <hr className="divider" />

        {!editing && <RecipeChat recipe={recipe} onUpdate={(updated) => onRefresh(updated)} />}

        {recipe.source_url && recipe.ingredients.length > 0 && (
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-light)', lineHeight: 1.6, padding: '0.6rem 0.75rem', background: 'var(--parchment)', borderRadius: 8, border: '1px solid var(--stone-dark)' }}>
            Adapted from{' '}
            <a href={recipe.source_url} target="_blank" rel="noopener"
              style={{ color: 'var(--lavender)', textDecoration: 'underline' }}>
              {(() => {
                try {
                  const u = new URL(recipe.source_url!)
                  const slug = u.pathname.split('/').filter(Boolean).pop() || ''
                  const name = /^\d+$/.test(slug)
                    ? u.hostname.replace('www.', '')
                    : slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                  return name || u.hostname.replace('www.', '')
                } catch { return recipe.source_url }
              })()}
            </a>
          </div>
        )}

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

function RecipeChat({ recipe, onUpdate }: { recipe: Recipe; onUpdate: (updated: Recipe) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [applying, setApplying] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function applyChanges() {
    setApplying(true)
    const res = await fetch('/api/recipe-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipe,
        message: 'Based on our conversation, give me the complete updated recipe. Return ONLY a JSON object with fields: title, description, ingredients, instructions, prep_time, cook_time, servings, tags, toddler_notes. No other text.',
        history: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    })
    const data = await res.json()
    try {
      const match = data.reply?.match(/\{[\s\S]*\}/)
      if (match) {
        const updated = JSON.parse(match[0])
        const newRecipe = { ...recipe, ...updated }
        // Persist to DB
        await fetch('/api/recipes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: recipe.id, ...updated }),
        })
        onUpdate(newRecipe)
        setMessages(prev => [...prev, { role: 'assistant', content: '✓ Recipe updated and saved!' }])
      }
    } catch { /* ignore */ }
    setApplying(false)
  }

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

  const SUGGESTIONS = ['Any substitutions?', 'How do I know when it\'s done?', 'Change the name to…', 'Can I make this ahead?']

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
              background: m.role === 'user' ? 'var(--lavender)' : 'var(--stone)',
              color: m.role === 'user' ? 'var(--stone)' : 'var(--ink)',
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
            <div style={{ alignSelf: 'flex-start', background: 'var(--stone)', borderRadius: '12px 12px 12px 2px', padding: '0.6rem 0.9rem' }}>
              <span className="spinner" style={{ width: 14, height: 14 }} />
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {messages.some(m => m.role === 'assistant') && (
        <div style={{ marginBottom: '0.5rem' }}>
          <button className="btn-secondary" onClick={applyChanges} disabled={applying || thinking}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.9rem' }}>
            {applying ? <><Loader2 size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</> : '✦ Save changes to recipe'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask anything, or say 'rename this to…'"
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

type ImportTab = 'url' | 'photo' | 'prompt'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [selected, setSelected] = useState<Recipe | null>(null)
  const [importTab, setImportTab] = useState<ImportTab>(() => {
    if (typeof window === 'undefined') return 'url'
    const p = new URLSearchParams(window.location.search).get('tab')
    return (p === 'photo' || p === 'prompt') ? p : 'url'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('fromCamera') !== '1') return
    try {
      const stored = sessionStorage.getItem('quick-camera-photo')
      if (!stored) return
      sessionStorage.removeItem('quick-camera-photo')
      const { data, name, type } = JSON.parse(stored)
      const arr = data.split(',')[1]
      const bytes = Uint8Array.from(atob(arr), c => c.charCodeAt(0))
      const file = new File([bytes], name || 'photo.jpg', { type: type || 'image/jpeg' })
      setImageFiles([file])
      setImagePreviews([data])
    } catch { /* ignore */ }
  }, [])

  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [urlDuplicate, setUrlDuplicate] = useState<{ title: string; onConfirm: () => void } | null>(null)

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [importingPhoto, setImportingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [photoDuplicate, setPhotoDuplicate] = useState<{ title: string; onConfirm: () => void } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [promptMessages, setPromptMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [promptInput, setPromptInput] = useState('')
  const [promptThinking, setPromptThinking] = useState(false)
  const [promptRecipe, setPromptRecipe] = useState<Record<string, unknown> | null>(null)
  const [promptSaving, setPromptSaving] = useState(false)
  const [promptSaved, setPromptSaved] = useState(false)
  const [promptError, setPromptError] = useState('')
  const [promptDuplicate, setPromptDuplicate] = useState<{ title: string; onConfirm: () => void } | null>(null)
  const promptBottomRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/recipes${q ? `?q=${encodeURIComponent(q)}` : ''}`)
    setRecipes(await res.json())
    setLoading(false)
  }, [q])

  useEffect(() => { load() }, [load])

  async function handleImportUrl(force = false) {
    if (!importUrl.trim()) return
    setImporting(true)
    setImportError('')
    setUrlDuplicate(null)
    try {
      const res = await fetch('/api/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl, force }),
      })
      const data = await res.json()
      if (data.duplicate) {
        setUrlDuplicate({ title: data.existing.title, onConfirm: () => handleImportUrl(true) })
      } else if (data.error) {
        setImportError(data.error)
      } else {
        setImportUrl('')
        setUrlDuplicate(null)
        load()
      }
    } catch {
      setImportError('Something went wrong — try again.')
    } finally {
      setImporting(false)
    }
  }

  // Returns null if the file is HEIC and can't be decoded (e.g. Chrome on Mac).
  function normalizeToJpeg(file: File): Promise<File | null> {
    const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')
    return new Promise(resolve => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const MAX = 1500
        let w = img.naturalWidth, h = img.naturalHeight
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX }
          else { w = Math.round(w * MAX / h); h = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h)
        canvas.toBlob(blob => {
          URL.revokeObjectURL(url)
          resolve(blob ? new File([blob], 'photo.jpg', { type: 'image/jpeg' }) : file)
        }, 'image/jpeg', 0.88)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(isHeic ? null : file)
      }
      img.src = url
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files || [])
    if (!incoming.length) return
    setPhotoError('')
    setImageFiles(prev => [...prev, ...incoming])
    incoming.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setImagePreviews(prev => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeImage(index: number) {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function handleImportPhoto(force = false) {
    if (!imageFiles.length) return
    setImportingPhoto(true)
    setPhotoError('')
    setPhotoDuplicate(null)
    try {
      const normalized = await Promise.all(imageFiles.map(normalizeToJpeg))
      if (normalized.some(f => f === null)) {
        setPhotoError('HEIC photos can\'t be uploaded directly from a Mac. Open the photo in Preview → File → Export → JPEG, then upload that file.')
        return
      }
      const form = new FormData()
      normalized.forEach(f => form.append('images', f as File))
      if (force) form.append('force', 'true')
      const res = await fetch('/api/import-image', { method: 'POST', body: form })
      const data = await res.json()
      if (data.duplicate) {
        setPhotoDuplicate({ title: data.existing.title, onConfirm: () => handleImportPhoto(true) })
      } else if (data.error) {
        setPhotoError(data.error)
      } else {
        setImageFiles([])
        setImagePreviews([])
        setPhotoDuplicate(null)
        load()
      }
    } catch {
      setPhotoError('Something went wrong — try again.')
    } finally {
      setImportingPhoto(false)
    }
  }

  async function handlePromptSend() {
    const text = promptInput.trim()
    if (!text || promptThinking) return
    setPromptInput('')
    setPromptError('')
    const history = promptMessages.map(m => ({ role: m.role, content: m.content }))
    setPromptMessages(prev => [...prev, { role: 'user', content: text }])
    setPromptThinking(true)
    try {
      const res = await fetch('/api/recipes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })
      const data = await res.json()
      setPromptMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      if (data.recipe) { setPromptRecipe(data.recipe); setPromptSaved(false) }
    } catch {
      setPromptError('Something went wrong — try again.')
    }
    setPromptThinking(false)
    setTimeout(() => promptBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  async function handlePromptSave(force = false) {
    if (!promptRecipe) return
    setPromptSaving(true)
    setPromptError('')
    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...promptRecipe, force }),
    })
    const data = await res.json()
    if (data.duplicate) {
      setPromptDuplicate({ title: data.existing.title, onConfirm: () => handlePromptSave(true) })
    } else if (data.error) {
      setPromptError(data.error)
    } else {
      setPromptSaved(true)
      load()
    }
    setPromptSaving(false)
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
          onRefresh={(updated) => {
            setSelected(updated)
            setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r))
          }}
        />
      )}

      <ExtensionBanner />

      <div className="page-header">
        <h1 className="page-title">Recipe Box</h1>
        <p className="page-subtitle">Your recipe library</p>
      </div>

      {/* Import card */}
      <div className="card" style={{ maxWidth: '640px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button data-tour="import-url"
            onClick={() => { setImportTab('url'); setImportError(''); setPhotoError('') }}
            className={importTab === 'url' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
            <Link2 size={13} /> From URL
          </button>
          <button data-tour="import-photo"
            onClick={() => { setImportTab('photo'); setImportError(''); setPhotoError('') }}
            className={importTab === 'photo' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
            <Camera size={13} /> From Photo
          </button>
          <button data-tour="import-prompt"
            onClick={() => { setImportTab('prompt'); setImportError(''); setPhotoError(''); setPromptError('') }}
            className={importTab === 'prompt' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
            ✦ From Prompt
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
              <button className="btn-primary" onClick={() => handleImportUrl()} disabled={importing || !importUrl.trim()}>
                {importing
                  ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</>
                  : <><Link2 size={14} /> Save</>}
              </button>
            </div>
            {urlDuplicate && (
              <div style={{ marginTop: '0.6rem', fontSize: '0.82rem', color: 'var(--ink-light)', lineHeight: 1.5 }}>
                Looks like you already have <strong>"{urlDuplicate.title}"</strong> in your recipe box. Want to add it anyway?{' '}
                <button className="btn-ghost" style={{ fontSize: '0.82rem', color: 'var(--lavender)', textDecoration: 'underline', padding: 0 }}
                  onClick={() => { setUrlDuplicate(null); urlDuplicate.onConfirm() }}>Add anyway</button>
              </div>
            )}
            {importError && (
              <p style={{ color: 'var(--terracotta)', fontSize: '0.82rem', marginTop: '0.6rem' }}>{importError}</p>
            )}
          </div>
        )}

        {importTab === 'photo' && (
          <div>
            <div className="section-label" style={{ marginBottom: '0.75rem' }}>Upload photos of a recipe</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-light)', marginBottom: '0.75rem' }}>
              Cookbook pages, recipe cards, handwritten notes, screenshots. Add multiple pages and they'll be combined.
            </p>

            {/* Thumbnails */}
            {imagePreviews.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {imagePreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={src} alt={`page ${i + 1}`}
                      style={{ height: 90, width: 70, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--stone-dark)' }} />
                    <button onClick={() => removeImage(i)}
                      style={{ position: 'absolute', top: -6, right: -6, background: 'var(--lavender)', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                      <X size={10} />
                    </button>
                    <div style={{ fontSize: '0.65rem', textAlign: 'center', color: 'var(--ink-light)', marginTop: 2 }}>p.{i + 1}</div>
                  </div>
                ))}
                {/* Add more */}
                <button onClick={() => fileInputRef.current?.click()}
                  style={{ height: 90, width: 70, border: '2px dashed var(--stone-dark)', borderRadius: 6, background: 'var(--stone)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-light)', fontSize: '1.5rem' }}>
                  +
                </button>
              </div>
            )}

            {/* Drop zone — only shown when no images yet */}
            {imagePreviews.length === 0 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault()
                  const incoming = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
                  if (!incoming.length) return
                  setPhotoError('')
                  setImageFiles(prev => [...prev, ...incoming])
                  incoming.forEach(file => {
                    const reader = new FileReader()
                    reader.onload = ev => setImagePreviews(prev => [...prev, ev.target?.result as string])
                    reader.readAsDataURL(file)
                  })
                }}
                style={{ border: '2px dashed var(--stone-dark)', borderRadius: 10, padding: '2rem', textAlign: 'center', cursor: 'pointer', background: 'var(--stone)', marginBottom: '0.75rem' }}
              >
                <Upload size={28} style={{ color: 'var(--ochre)', margin: '0 auto 0.5rem', display: 'block' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)' }}>Click or drag photos here</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginTop: '0.25rem' }}>You can add multiple pages</p>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-primary" onClick={() => handleImportPhoto()} disabled={importingPhoto || !imageFiles.length}>
                {importingPhoto
                  ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Reading recipe…</>
                  : <><Camera size={14} /> Import {imageFiles.length > 1 ? `${imageFiles.length} pages` : 'photo'}</>}
              </button>
              {imageFiles.length > 0 && (
                <button className="btn-secondary" onClick={() => { setImageFiles([]); setImagePreviews([]) }}>Clear all</button>
              )}
            </div>
            {photoDuplicate && (
              <div style={{ marginTop: '0.6rem', fontSize: '0.82rem', color: 'var(--ink-light)', lineHeight: 1.5 }}>
                Looks like you already have <strong>"{photoDuplicate.title}"</strong> in your recipe box. Want to add it anyway?{' '}
                <button className="btn-ghost" style={{ fontSize: '0.82rem', color: 'var(--lavender)', textDecoration: 'underline', padding: 0 }}
                  onClick={() => { setPhotoDuplicate(null); photoDuplicate.onConfirm() }}>Add anyway</button>
              </div>
            )}
            {photoError && (
              <p style={{ color: 'var(--terracotta)', fontSize: '0.82rem', marginTop: '0.6rem' }}>{photoError}</p>
            )}
          </div>
        )}

        {importTab === 'prompt' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Chat thread */}
            {promptMessages.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto', padding: '0.25rem 0' }}>
                {promptMessages.map((m, i) => (
                  <div key={i} style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    background: m.role === 'user' ? 'var(--lavender)' : 'var(--stone)',
                    color: m.role === 'user' ? 'var(--parchment)' : 'var(--ink)',
                    borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    padding: '0.6rem 0.9rem',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {m.content}
                  </div>
                ))}
                {promptThinking && (
                  <div style={{ alignSelf: 'flex-start', background: 'var(--stone)', borderRadius: '12px 12px 12px 2px', padding: '0.6rem 0.9rem' }}>
                    <span className="spinner" style={{ width: 14, height: 14 }} />
                  </div>
                )}
                <div ref={promptBottomRef} />
              </div>
            )}

            {/* Recipe preview + save */}
            {promptRecipe && (
              <div style={{ background: 'var(--parchment)', border: '1px solid var(--stone-dark)', borderRadius: 10, padding: '0.85rem 1rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--ochre)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Recipe ready</div>
                <div className="serif" style={{ fontSize: '1.1rem', fontWeight: 400, marginBottom: '0.2rem' }}>{String(promptRecipe.title)}</div>
                {!!promptRecipe.description && <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{String(promptRecipe.description)}</p>}
                <button className="btn-primary" onClick={() => handlePromptSave()}
                  disabled={promptSaving || promptSaved}
                  style={{ fontSize: '0.82rem' }}>
                  {promptSaved ? '✓ Saved to recipe box'
                    : promptSaving ? <><Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</>
                    : '+ Save to recipe box'}
                </button>
              </div>
            )}

            {/* Input */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="input"
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePromptSend()}
                placeholder={promptMessages.length === 0 ? 'What are you in the mood for?' : 'Refine it, ask anything…'}
                style={{ flex: 1, fontSize: '0.875rem' }}
              />
              <button className="btn-primary" onClick={handlePromptSend}
                disabled={promptThinking || !promptInput.trim()}
                style={{ padding: '0.65rem 0.85rem' }}>
                <Send size={14} />
              </button>
            </div>

            {promptMessages.length > 0 && (
              <button className="btn-ghost" style={{ fontSize: '0.78rem', color: 'var(--ink-light)', alignSelf: 'flex-start' }}
                onClick={() => { setPromptMessages([]); setPromptRecipe(null); setPromptSaved(false); setPromptError('') }}>
                Start over
              </button>
            )}

            {promptDuplicate && (
              <div style={{ fontSize: '0.82rem', color: 'var(--ink-light)', lineHeight: 1.5 }}>
                Looks like you already have <strong>"{promptDuplicate.title}"</strong> in your recipe box. Want to add it anyway?{' '}
                <button className="btn-ghost" style={{ fontSize: '0.82rem', color: 'var(--lavender)', textDecoration: 'underline', padding: 0 }}
                  onClick={() => { setPromptDuplicate(null); promptDuplicate.onConfirm() }}>Add anyway</button>
              </div>
            )}
            {promptError && <p style={{ color: 'var(--terracotta)', fontSize: '0.82rem' }}>{promptError}</p>}
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '1rem' }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-light)' }} />
        <input className="input" style={{ paddingLeft: '2rem' }}
          placeholder="Search recipes…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {/* Tag filter chips */}
      {!loading && recipes.length > 0 && (() => {
        const allTags = [...new Set(recipes.flatMap(r => r.tags))].sort()
        if (!allTags.length) return null
        return (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <button onClick={() => setActiveTag(null)}
              className={activeTag === null ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: 20 }}>
              All
            </button>
            {allTags.map(t => (
              <button key={t} onClick={() => setActiveTag(activeTag === t ? null : t)}
                className={activeTag === t ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: 20 }}>
                {t}
              </button>
            ))}
          </div>
        )
      })()}

      {loading && <div className="empty-state"><div className="spinner" style={{ width: 32, height: 32 }} /></div>}

      {!loading && recipes.length === 0 && (
        <div className="empty-state">
          <BookOpen size={40} />
          <h3>No recipes yet</h3>
          <p>Save one from a URL or upload a photo above.</p>
        </div>
      )}

      <div className="recipe-grid">
        {recipes.filter(r => !activeTag || r.tags.includes(activeTag)).map(r => {
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
                {isLink && (() => {
                  try {
                    const host = new URL(r.source_url!).hostname.replace('www.', '')
                    return (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--ochre)' }}>
                        <ExternalLink size={11} /> {host}
                      </span>
                    )
                  } catch { return null }
                })()}
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
