'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { BookOpen, Link2, Loader2, Search, Trash2, X, ExternalLink, Camera, Upload } from 'lucide-react'

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

function RecipePanel({ recipe, onClose, onDelete }: { recipe: Recipe; onClose: () => void; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false)

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

        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--ink-light)', flexWrap: 'wrap' }}>
          {recipe.prep_time && <span>Prep {recipe.prep_time}m</span>}
          {recipe.cook_time && <span>Cook {recipe.cook_time}m</span>}
          {recipe.servings && <span>Serves {recipe.servings}</span>}
        </div>

        {recipe.toddler_notes && (
          <div style={{ background: '#fef3e2', borderRadius: 8, padding: '0.75rem 1rem' }}>
            <div className="toddler-badge" style={{ marginBottom: '0.4rem', display: 'inline-flex' }}>
              Toddler adaptation
            </div>
            <p style={{ fontSize: '0.85rem', color: '#7a4a00' }}>{recipe.toddler_notes}</p>
          </div>
        )}

        <div>
          <div className="section-label">Ingredients</div>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
            {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
          </ul>
        </div>

        <div>
          <div className="section-label">Instructions</div>
          <ol style={{ paddingLeft: '1.2rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
            {recipe.instructions.map((step, i) => <li key={i} style={{ lineHeight: 1.6 }}>{step}</li>)}
          </ol>
        </div>

        {recipe.source_url && (
          <a href={recipe.source_url} target="_blank" rel="noopener"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--lavender)', marginTop: 'auto' }}>
            <ExternalLink size={12} /> Source
          </a>
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

type ImportTab = 'url' | 'photo'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Recipe | null>(null)
  const [importTab, setImportTab] = useState<ImportTab>('url')

  // URL import
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')

  // Photo import
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
      if (data.bookmarked) {
        setImportError('This site blocked full import — saved as a bookmark. Use photo import to add the full recipe.')
      }
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

  return (
    <div>
      {selected && (
        <RecipePanel
          recipe={selected}
          onClose={() => setSelected(null)}
          onDelete={() => { setSelected(null); load() }}
        />
      )}

      <div className="page-header">
        <h1 className="page-title">Recipe Box</h1>
        <p className="page-subtitle">Your recipe library</p>
      </div>

      {/* Import card */}
      <div className="card" style={{ maxWidth: '640px', marginBottom: '2rem' }}>
        {/* Tab switcher */}
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

        {/* URL import */}
        {importTab === 'url' && (
          <div>
            <div className="section-label" style={{ marginBottom: '0.75rem' }}>Paste a recipe URL</div>
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
                  ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Importing…</>
                  : <><Link2 size={14} /> Import</>}
              </button>
            </div>
            {importError && (
              <p style={{ color: 'var(--terracotta)', fontSize: '0.82rem', marginTop: '0.6rem' }}>{importError}</p>
            )}
          </div>
        )}

        {/* Photo import */}
        {importTab === 'photo' && (
          <div>
            <div className="section-label" style={{ marginBottom: '0.75rem' }}>Upload a photo of a recipe</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-light)', marginBottom: '0.75rem' }}>
              Works with cookbook pages, recipe cards, handwritten notes, or screenshots.
            </p>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed var(--linen-dark)`,
                borderRadius: 10,
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: imagePreview ? 'transparent' : 'var(--linen)',
                transition: 'border-color 0.15s',
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
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)' }}>
                    Click to choose a photo, or drag one here
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginTop: '0.25rem' }}>
                    JPG, PNG, WEBP
                  </p>
                </>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={handleFileChange} />

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-primary" onClick={handleImportPhoto}
                disabled={importingPhoto || !imageFile}>
                {importingPhoto
                  ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Reading recipe…</>
                  : <><Camera size={14} /> Import from photo</>}
              </button>
              {imagePreview && (
                <button className="btn-secondary" onClick={() => {
                  setImageFile(null)
                  setImagePreview(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}>
                  Clear
                </button>
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

      {/* Grid */}
      {loading && (
        <div className="empty-state">
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      )}

      {!loading && recipes.length === 0 && (
        <div className="empty-state">
          <BookOpen size={40} />
          <h3>No recipes yet</h3>
          <p>Import one from a URL or a photo above.</p>
        </div>
      )}

      <div className="recipe-grid">
        {recipes.map(r => (
          <div key={r.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelected(r)}>
            <h3 className="serif" style={{ fontSize: '1.2rem', fontWeight: 400 }}>{r.title}</h3>
            {r.description && (
              <p style={{ fontSize: '0.82rem', color: 'var(--ink-light)', marginTop: '0.4rem', lineHeight: 1.5 }}>
                {r.description.slice(0, 100)}{r.description.length > 100 ? '…' : ''}
              </p>
            )}
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {r.tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--ink-light)' }}>
              {r.prep_time && <span>{r.prep_time}m prep</span>}
              {r.cook_time && <span>{r.cook_time}m cook</span>}
              {r.source_url && <span style={{ color: 'var(--lavender)' }}>↗ imported</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
