'use client'
import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Link2, Loader2, Search, Trash2, X, ExternalLink } from 'lucide-react'

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

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Recipe | null>(null)

  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/recipes${q ? `?q=${encodeURIComponent(q)}` : ''}`)
    setRecipes(await res.json())
    setLoading(false)
  }, [q])

  useEffect(() => { load() }, [load])

  async function handleImport() {
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
        <h1 className="page-title">Recipes</h1>
        <p className="page-subtitle">Your recipe library</p>
      </div>

      {/* Import from URL */}
      <div className="card" style={{ maxWidth: '640px', marginBottom: '2rem' }}>
        <div className="section-label" style={{ marginBottom: '0.75rem' }}>Import a recipe from URL</div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input className="input"
            placeholder="https://www.seriouseats.com/..."
            value={importUrl}
            onChange={e => setImportUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleImport()}
            style={{ flex: 1 }}
          />
          <button className="btn-primary" onClick={handleImport} disabled={importing || !importUrl.trim()}>
            {importing
              ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Importing…</>
              : <><Link2 size={14} /> Import</>}
          </button>
        </div>
        {importError && (
          <p style={{ color: 'var(--terracotta)', fontSize: '0.82rem', marginTop: '0.6rem' }}>{importError}</p>
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
          <p>Paste a recipe URL above to import your first one.</p>
        </div>
      )}

      <div className="recipe-grid">
        {recipes.map(r => (
          <div key={r.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelected(r)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <h3 className="serif" style={{ fontSize: '1.2rem', fontWeight: 400 }}>{r.title}</h3>
            </div>
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
