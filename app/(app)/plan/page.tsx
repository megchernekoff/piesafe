'use client'
import { useState, useEffect, useRef } from 'react'
import { ChefHat, Loader2, ShoppingCart, ClipboardList, Calendar, X, Send, BookmarkPlus, Check, Camera } from 'lucide-react'

interface Dinner {
  title: string
  description: string
  prep_time: number
  cook_time: number
  servings: number
  ingredients: string[]
  instructions: string[]
  toddler_notes: string | null
  tags: string[]
}

interface DayPlan { day: string; dinner: Dinner | null }
interface GroceryItem { item: string; amount: string; category: string }
interface Plan {
  weekStart: string
  rationale?: string
  days: DayPlan[]
  grocery_list: GroceryItem[]
  grocery_custom: GroceryItem[]
  grocery_checked: string[]
  prep_notes: string[]
}

function getMonday(d = new Date()): string {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const m = new Date(d)
  m.setDate(diff)
  return m.toISOString().split('T')[0]
}

interface ChatMessage { role: 'user' | 'assistant'; content: string }

function DinnerChat({ dinner, onApplyTweak }: { dinner: Dinner; onApplyTweak: (updated: Dinner) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [applying, setApplying] = useState(false)
  const [pendingImage, setPendingImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  function handleImageFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setPendingImage({ base64: dataUrl.split(',')[1], mimeType: file.type, preview: dataUrl })
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  async function send() {
    const text = input.trim()
    if ((!text && !pendingImage) || thinking) return
    const image = pendingImage
    setInput('')
    setPendingImage(null)
    const displayText = text || '📷 [Recipe screenshot]'
    const history = messages.map(m => ({ role: m.role, content: m.content }))
    setMessages(prev => [...prev, { role: 'user', content: displayText }])
    setThinking(true)
    const res = await fetch('/api/recipe-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe: dinner, message: text || 'I\'ve uploaded a recipe screenshot. Extract the full recipe and also return it as a JSON object wrapped in <recipe>{...}</recipe> tags so it can be applied directly.', history, image }),
    })
    const data = await res.json()
    setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, something went wrong.' }])

    // Auto-extract recipe from response if image was sent
    if (image && data.reply) {
      const recipeMatch = data.reply.match(/<recipe>([\s\S]*?)<\/recipe>/)
      if (recipeMatch) {
        try {
          const extracted = JSON.parse(recipeMatch[0].replace(/<\/?recipe>/g, ''))
          if (extracted.ingredients?.length > 0) onApplyTweak({ ...dinner, ...extracted })
        } catch { /* ignore */ }
      } else {
        // Try to extract JSON directly
        const jsonMatch = data.reply.match(/\{[\s\S]*"ingredients"[\s\S]*\}/)
        if (jsonMatch) {
          try {
            const extracted = JSON.parse(jsonMatch[0])
            if (extracted.ingredients?.length > 0) onApplyTweak({ ...dinner, ...extracted })
          } catch { /* ignore */ }
        }
      }
    }
    setThinking(false)
  }

  async function applyTweak() {
    const lastReply = [...messages].reverse().find(m => m.role === 'assistant')
    if (!lastReply) return
    setApplying(true)
    const res = await fetch('/api/recipe-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipe: dinner,
        message: `Based on our conversation, give me the complete updated recipe incorporating the changes we discussed. Return ONLY a JSON object with the same structure as the original recipe (title, description, ingredients, instructions, prep_time, cook_time, servings, tags, toddler_notes). No other text.`,
        history: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    })
    const data = await res.json()
    try {
      const match = data.reply?.match(/\{[\s\S]*\}/)
      if (match) {
        const updated = JSON.parse(match[0])
        onApplyTweak({ ...dinner, ...updated })
      }
    } catch { /* keep original */ }
    setApplying(false)
  }

  const SUGGESTIONS = ['Any substitutions?', 'How do I know when it\'s done?', 'Can I make this ahead?']

  return (
    <div>
      <div className="section-label" style={{ marginBottom: '0.75rem' }}>Ask about this recipe</div>
      {messages.length === 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {SUGGESTIONS.map(s => (
            <button key={s} className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
              onClick={() => setInput(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      {messages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem', maxHeight: '260px', overflowY: 'auto' }}>
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
          <button className="btn-secondary" onClick={applyTweak} disabled={applying || thinking}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.9rem' }}>
            {applying ? <><Loader2 size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> Applying…</> : '✦ Apply changes to recipe'}
          </button>
        </div>
      )}
      {pendingImage && (
        <div style={{ marginBottom: '0.5rem', position: 'relative', display: 'inline-block' }}>
          <img src={pendingImage.preview} alt="recipe" style={{ height: 72, borderRadius: 6, border: '1px solid var(--stone-dark)' }} />
          <button onClick={() => setPendingImage(null)} className="btn-ghost"
            style={{ position: 'absolute', top: -6, right: -6, background: 'var(--lavender)', color: 'white', borderRadius: '50%', padding: '0.15rem', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={10} />
          </button>
        </div>
      )}
      <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = '' }} />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn-ghost" onClick={() => imageInputRef.current?.click()}
          title="Upload recipe screenshot" style={{ padding: '0.65rem 0.75rem', flexShrink: 0 }}>
          <Camera size={15} />
        </button>
        <input className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Substitutions, technique, or drop a screenshot…"
          style={{ flex: 1, fontSize: '0.85rem' }}
        />
        <button className="btn-primary" onClick={send} disabled={thinking || (!input.trim() && !pendingImage)}
          style={{ padding: '0.65rem 0.85rem' }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

function DayPanel({ day, weekStart, onClose, onDinnerUpdate }: { day: DayPlan; weekStart: string; onClose: () => void; onDinnerUpdate: (d: Dinner) => void }) {
  const [currentDinner, setCurrentDinner] = useState(day.dinner!)
  // Sync if parent updates the dinner (e.g. from plan chat swap)
  useEffect(() => { if (day.dinner) setCurrentDinner(day.dinner) }, [day.dinner])
  const d = currentDinner
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const [swapReason, setSwapReason] = useState('')
  const [showSwap, setShowSwap] = useState(false)

  async function swapDay() {
    setSwapping(true)
    const res = await fetch('/api/meal-plan/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekStart, dayName: day.day, reason: swapReason }),
    })
    const data = await res.json()
    if (data.dinner) {
      setCurrentDinner(data.dinner)
      onDinnerUpdate(data.dinner)
      setShowSwap(false)
      setSwapReason('')
    }
    setSwapping(false)
  }

  async function saveToBox() {
    setSaving(true)
    await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: d.title,
        description: d.description,
        ingredients: d.ingredients,
        instructions: d.instructions,
        prep_time: d.prep_time,
        cook_time: d.cook_time,
        servings: d.servings,
        tags: d.tags,
      }),
    })
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h2 className="serif" style={{ fontSize: '2rem', fontWeight: 300, lineHeight: 1.1 }}>{d.title}</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginTop: '0.2rem' }}>{day.day}</div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {d.tags?.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        <p style={{ color: 'var(--ink-light)', fontSize: '0.9rem', lineHeight: 1.6 }}>{d.description}</p>

        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--ink-light)', alignItems: 'center', flexWrap: 'wrap' }}>
          {d.prep_time && <span>Prep {d.prep_time}m</span>}
          {d.cook_time && <span>Cook {d.cook_time}m</span>}
          {d.servings && <span>Serves {d.servings}</span>}
          <button
            onClick={saveToBox}
            disabled={saving || saved}
            className={saved ? 'btn-secondary' : 'btn-secondary'}
            style={{ marginLeft: 'auto', fontSize: '0.78rem', padding: '0.3rem 0.85rem', color: saved ? 'var(--lavender)' : undefined }}>
            {saved
              ? <><Check size={12} /> Saved to box</>
              : saving
              ? <><Loader2 size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</>
              : <><BookmarkPlus size={12} /> Save to recipe box</>}
          </button>
        </div>

        {d.toddler_notes && (
          <div style={{ background: '#fef3e2', borderRadius: 8, padding: '0.75rem 1rem' }}>
            <div className="toddler-badge" style={{ marginBottom: '0.4rem', display: 'inline-flex' }}>Toddler adaptation</div>
            <p style={{ fontSize: '0.85rem', color: '#7a4a00' }}>{d.toddler_notes}</p>
          </div>
        )}

        {(!d.ingredients || d.ingredients.length === 0) ? (
          <div style={{ background: 'var(--lavender-soft)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--lavender)', lineHeight: 1.6 }}>
            This recipe was saved as a link only — no ingredients are stored yet.
            Upload a screenshot below to add the full recipe, or use <strong>↺ Suggest something different</strong> to generate a similar one.
          </div>
        ) : (
          <>
            <div>
              <div className="section-label">Ingredients</div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
                {d.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
            </div>
            <div>
              <div className="section-label">Instructions</div>
              <ol style={{ paddingLeft: '1.2rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                {d.instructions?.map((step, i) => <li key={i} style={{ lineHeight: 1.6 }}>{step}</li>)}
              </ol>
            </div>
          </>
        )}

        <hr className="divider" />

        {/* Swap this day */}
        {!showSwap ? (
          <button className="btn-ghost" onClick={() => setShowSwap(true)}
            style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginBottom: '0.5rem' }}>
            ↺ Suggest something different for {day.day}
          </button>
        ) : (
          <div style={{ marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input className="input" placeholder="Any preference? e.g. something Italian, vegetarian, quick…"
              value={swapReason} onChange={e => setSwapReason(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && swapDay()}
              style={{ fontSize: '0.85rem' }} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-primary" onClick={swapDay} disabled={swapping} style={{ fontSize: '0.82rem' }}>
                {swapping ? <><Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Finding…</> : '↺ Swap this day'}
              </button>
              <button className="btn-ghost" onClick={() => setShowSwap(false)}>Cancel</button>
            </div>
          </div>
        )}

        <DinnerChat dinner={d} onApplyTweak={(updated) => { setCurrentDinner(updated); onDinnerUpdate(updated) }} />
      </div>
    </div>
  )
}

function PlanChat({ plan, onRegenerate, onPlanUpdate }: { plan: Plan; onRegenerate: (tweaks: string) => void; onPlanUpdate: (p: Plan) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [savedToast, setSavedToast] = useState<string[]>([])
  const [pendingImage, setPendingImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  function handleImageFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const base64 = dataUrl.split(',')[1]
      setPendingImage({ base64, mimeType: file.type, preview: dataUrl })
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  async function send() {
    const text = input.trim()
    if ((!text && !pendingImage) || thinking) return
    setInput('')
    const image = pendingImage
    setPendingImage(null)
    const history = messages.map(m => ({ role: m.role, content: m.content }))
    const displayText = text || '📷 [Recipe screenshot]'
    setMessages(prev => [...prev, { role: 'user', content: displayText }])
    setThinking(true)
    const res = await fetch('/api/plan-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, message: text || 'I\'ve attached a recipe screenshot. Please extract the recipe and suggest which day to add it, or ask me which day I want it on.', history, image }),
    })
    const data = await res.json()
    setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    if (data.savedDislikes?.length > 0) {
      setSavedToast(data.savedDislikes)
      setTimeout(() => setSavedToast([]), 4000)
    }
    // Apply swap action — update the plan in place
    if (data.swapAction?.recipe && data.swapAction?.day) {
      onPlanUpdate({
        ...plan,
        days: plan.days.map((d: DayPlan) =>
          d.day === data.swapAction.day ? { ...d, dinner: data.swapAction.recipe as unknown as Dinner } : d
        ),
      })
    }
    setThinking(false)
  }

  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')

  const SUGGESTIONS = ['Make it lighter this week', 'Swap in something vegetarian', 'I want more variety']

  return (
    <div className="card" style={{ marginTop: '2rem' }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleImageFile(f) }}>
      <div className="section-label" style={{ marginBottom: '0.75rem' }}>Tweak this plan</div>
      <p style={{ fontSize: '0.82rem', color: 'var(--ink-light)', marginBottom: '1rem' }}>
        Ask for changes — swap a meal, adjust the vibe, work around what you have. When you're happy, regenerate.
      </p>

      {messages.length === 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {SUGGESTIONS.map(s => (
            <button key={s} className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
              onClick={() => setInput(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '90%',
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

      {savedToast.length > 0 && (
        <div style={{ background: 'var(--lavender)', color: 'var(--stone)', borderRadius: 8, padding: '0.6rem 1rem', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
          ✓ Added to your dislikes: {savedToast.join(', ')} — future plans will avoid {savedToast.length === 1 ? 'it' : 'them'}.
        </div>
      )}

      {pendingImage && (
        <div style={{ marginBottom: '0.5rem', position: 'relative', display: 'inline-block' }}>
          <img src={pendingImage.preview} alt="recipe" style={{ height: 80, borderRadius: 6, border: '1px solid var(--stone-dark)' }} />
          <button onClick={() => setPendingImage(null)} className="btn-ghost"
            style={{ position: 'absolute', top: -6, right: -6, background: 'var(--lavender)', color: 'white', borderRadius: '50%', padding: '0.15rem', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={10} />
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: lastAssistantMessage ? '0.75rem' : 0 }}>
        <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = '' }} />
        <button className="btn-ghost" onClick={() => imageInputRef.current?.click()}
          title="Attach recipe screenshot" style={{ padding: '0.65rem 0.75rem', flexShrink: 0 }}>
          <Camera size={15} />
        </button>
        <input className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Swap a day, attach a screenshot, ask anything…"
          style={{ flex: 1, fontSize: '0.85rem' }}
        />
        <button className="btn-primary" onClick={send} disabled={thinking || (!input.trim() && !pendingImage)}
          style={{ padding: '0.65rem 0.85rem' }}>
          <Send size={14} />
        </button>
      </div>

      {lastAssistantMessage && (
        <button className="btn-secondary" style={{ fontSize: '0.8rem' }}
          onClick={() => {
            const feedback = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
            onRegenerate(feedback)
          }}>
          <ChefHat size={13} /> Regenerate entire plan with this feedback
        </button>
      )}
    </div>
  )
}

const CATEGORY_ORDER = ['produce', 'protein', 'dairy', 'pantry', 'other']

function GroceryView({ plan, weekStart, onPlanUpdate }: { plan: Plan; weekStart: string; onPlanUpdate: (p: Plan) => void }) {
  const [newItem, setNewItem] = useState('')
  const [adding, setAdding] = useState(false)

  const checkedKeys = plan.grocery_checked ?? []
  const customItems = plan.grocery_custom ?? []

  async function patchGrocery(action: string, payload: Record<string, unknown>) {
    await fetch('/api/meal-plan', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekStart, action, ...payload }),
    })
  }

  async function handleCheck(key: string, currentlyChecked: boolean) {
    const action = currentlyChecked ? 'uncheck' : 'check'
    onPlanUpdate({ ...plan, grocery_checked: currentlyChecked ? checkedKeys.filter(k => k !== key) : [...checkedKeys, key] })
    await patchGrocery(action, { key })
  }

  async function addItem() {
    const text = newItem.trim()
    if (!text) return
    setAdding(true)
    const item = { item: text, amount: '', category: 'other' }
    onPlanUpdate({ ...plan, grocery_custom: [...customItems, item] })
    setNewItem('')
    await patchGrocery('add', { item })
    setAdding(false)
  }

  const grouped: Record<string, { item: GroceryItem; key: string }[]> = {}
  plan.grocery_list.forEach((item, i) => {
    const cat = item.category || 'other'
    const key = `${cat}-${i}`;
    (grouped[cat] = grouped[cat] || []).push({ item, key })
  })

  return (
    <div style={{ maxWidth: '560px' }}>
      <div className="card">
        <h3 className="serif" style={{ fontSize: '1.4rem', fontWeight: 300, marginBottom: '1.25rem' }}>Grocery List</h3>

        {CATEGORY_ORDER.filter(cat => grouped[cat]?.length).map(cat => (
          <div key={cat} className="grocery-section">
            <div className="grocery-category">{cat}</div>
            {grouped[cat].filter(({ key }) => !checkedKeys.includes(key)).map(({ item, key }) => (
              <label key={key} className="grocery-item" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={false}
                  onChange={() => handleCheck(key, false)} />
                <span>{item.amount} {item.item}</span>
              </label>
            ))}
          </div>
        ))}

        {customItems.length > 0 && (
          <div className="grocery-section">
            <div className="grocery-category">added by me</div>
            {customItems.map((item, i) => {
              const key = `custom-${i}`
              const isChecked = checkedKeys.includes(key)
              if (isChecked) return null
              return (
                <label key={key} className="grocery-item" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={false}
                    onChange={() => handleCheck(key, false)} />
                  <span>{item.amount ? `${item.amount} ` : ''}{item.item}</span>
                </label>
              )
            })}
          </div>
        )}

        <hr className="divider" />

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input className="input"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="Add an item…"
            style={{ flex: 1, fontSize: '0.875rem' }}
          />
          <button className="btn-secondary" onClick={addItem} disabled={adding || !newItem.trim()}
            style={{ fontSize: '0.82rem', padding: '0.6rem 1rem' }}>
            {adding ? <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlanPage() {
  const [weekStart, setWeekStart] = useState(getMonday)
  const [nights, setNights] = useState<number>(() => {
    if (typeof window === 'undefined') return 7
    return parseInt(localStorage.getItem('plan-nights') || '7')
  })
  const [tweaks, setTweaks] = useState<string>(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('plan-tweaks') || ''
  })
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)
  const initialTab = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('tab') as 'plan' | 'grocery' | 'prep' | null) ?? 'plan'
    : 'plan'
  const [view, setView] = useState<'plan' | 'grocery' | 'prep'>(initialTab)
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null)
  const [, setChecked] = useState<Set<string>>(new Set())

  // Persist nights and tweaks across navigation
  const updateNights = (n: number) => { setNights(n); localStorage.setItem('plan-nights', String(n)) }
  const updateTweaks = (t: string) => { setTweaks(t); localStorage.setItem('plan-tweaks', t) }

  useEffect(() => {
    fetch(`/api/meal-plan?weekStart=${weekStart}`)
      .then(r => r.json())
      .then(data => { if (data) setPlan(data) })
  }, [weekStart])

  async function generate(extraTweaks?: string) {
    setLoading(true)
    const combinedTweaks = [tweaks, extraTweaks].filter(Boolean).join('\n')
    const res = await fetch('/api/meal-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekStart, tweaks: combinedTweaks, nights }),
    })
    const data = await res.json()
    setPlan(data)
    setChecked(new Set())
    setLoading(false)
  }

  const weekLabel = () => {
    const start = new Date(weekStart + 'T12:00:00')
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }

  const groceryByCategory = () => {
    if (!plan) return {}
    const grouped: Record<string, GroceryItem[]> = {}
    for (const item of plan.grocery_list) {
      const cat = item.category || 'other'
      ;(grouped[cat] = grouped[cat] || []).push(item)
    }
    return grouped
  }

  return (
    <div>
      {selectedDay && (
        <DayPanel day={selectedDay} weekStart={weekStart} onClose={() => setSelectedDay(null)}
          onDinnerUpdate={(updated) => {
            setSelectedDay(prev => prev ? { ...prev, dinner: updated } : prev)
            setPlan(prev => prev ? {
              ...prev,
              days: prev.days.map(d => d.day === selectedDay.day ? { ...d, dinner: updated } : d)
            } : prev)
          }} />
      )}

      <div className="page-header">
        <h1 className="page-title">Meal Plan</h1>
        <p className="page-subtitle">Your weekly dinner plan</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <div>
          <div className="section-label">Week of</div>
          <input type="date" className="input" value={weekStart}
            onChange={e => { setWeekStart(e.target.value); setPlan(null) }}
            style={{ maxWidth: '180px' }} />
        </div>
        <div>
          <div className="section-label">Nights</div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {[1,2,3,4,5,6,7].map(n => (
              <button key={n} type="button"
                onClick={() => updateNights(n)}
                className={nights === n ? 'btn-primary' : 'btn-secondary'}
                style={{ minWidth: '36px', padding: '0.45rem 0.5rem', fontSize: '0.875rem' }}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div className="section-label">Special requests (optional)</div>
          <input className="input"
            placeholder="e.g. one Thai night, nothing too heavy, use up the feta…"
            value={tweaks}
            onChange={e => updateTweaks(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
          />
        </div>
        <button className="btn-primary" onClick={() => generate()} disabled={loading}>
          {loading
            ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Generating…</>
            : <><ChefHat size={14} /> Generate Plan</>}
        </button>
      </div>

      {!plan && !loading && (
        <div className="empty-state">
          <ChefHat size={40} />
          <h3>No plan yet</h3>
          <p>Hit Generate to build a week of dinners around your preferences.</p>
        </div>
      )}

      {loading && (
        <div className="empty-state">
          <div className="spinner" style={{ width: 40, height: 40, marginBottom: '1rem' }} />
          <p style={{ color: 'var(--ink-light)' }}>Crafting your week…</p>
        </div>
      )}

      {plan && !loading && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: plan.rationale ? '0.75rem' : '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 className="serif" style={{ fontSize: '1.4rem', fontWeight: 300 }}>{weekLabel()}</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['plan', 'grocery', 'prep'] as const).map(v => (
                <button key={v}
                  className={view === v ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => setView(v)}
                  style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}>
                  {v === 'plan' && <><Calendar size={12} /> Plan</>}
                  {v === 'grocery' && <><ShoppingCart size={12} /> Grocery</>}
                  {v === 'prep' && <><ClipboardList size={12} /> Prep</>}
                </button>
              ))}
            </div>
          </div>

          {plan.rationale && (
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', fontStyle: 'italic', lineHeight: 1.65, marginBottom: '1.25rem', maxWidth: '680px' }}>
              {plan.rationale}
            </p>
          )}

          {view === 'plan' && (
            <div className="plan-grid">
              {plan.days.map(day => (
                <div key={day.day} className="day-cell"
                  onClick={() => day.dinner && setSelectedDay(day)}
                  style={{ cursor: day.dinner ? 'pointer' : 'default' }}>
                  <div className="day-label">{day.day}</div>
                  {day.dinner ? (
                    <>
                      <div className="day-meal-title">{day.dinner.title}</div>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {day.dinner.tags?.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                      </div>
                      {day.dinner.toddler_notes && (
                        <div className="toddler-badge" style={{ marginTop: 'auto', display: 'inline-flex' }}>toddler ✓</div>
                      )}
                      <div style={{ marginTop: 'auto', fontSize: '0.72rem', color: 'var(--ink-light)' }}>
                        {(day.dinner.prep_time || 0) + (day.dinner.cook_time || 0)}m total
                      </div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--ink-light)', fontSize: '0.82rem', marginTop: 'auto' }}>Rest day</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {view === 'grocery' && (
            <GroceryView plan={plan} weekStart={weekStart} onPlanUpdate={setPlan} />
          )}

          {view === 'prep' && (
            <div style={{ maxWidth: '560px' }}>
              <div className="card">
                <h3 className="serif" style={{ fontSize: '1.4rem', fontWeight: 300, marginBottom: '1.25rem' }}>Prep Notes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {plan.prep_notes.map((note, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--ochre)', fontSize: '1.2rem', lineHeight: 1.1, flexShrink: 0 }}>·</span>
                      <span style={{ fontSize: '0.875rem', lineHeight: 1.65 }}>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <PlanChat plan={plan} onRegenerate={generate} onPlanUpdate={setPlan} />
        </>
      )}
    </div>
  )
}
