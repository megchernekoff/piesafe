'use client'
import { useState, useEffect, useRef } from 'react'
import { ChefHat, Loader2, ShoppingCart, ClipboardList, Calendar, X, Send, BookmarkPlus, Check } from 'lucide-react'

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

function DinnerChat({ dinner }: { dinner: Dinner }) {
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
      body: JSON.stringify({ recipe: dinner, message: text, history }),
    })
    const data = await res.json()
    setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, something went wrong.' }])
    setThinking(false)
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

function DayPanel({ day, onClose }: { day: DayPlan; onClose: () => void }) {
  const d = day.dinner!
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

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

        <div>
          <div className="section-label">Ingredients</div>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
            {d.ingredients?.map((ing, i) => <li key={i}>{ing}</li>)}
          </ul>
        </div>

        <div>
          <div className="section-label">Instructions</div>
          <ol style={{ paddingLeft: '1.2rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
            {d.instructions?.map((step, i) => <li key={i} style={{ lineHeight: 1.6 }}>{step}</li>)}
          </ol>
        </div>

        <hr className="divider" />
        <DinnerChat dinner={d} />
      </div>
    </div>
  )
}

function PlanChat({ plan, onRegenerate }: { plan: Plan; onRegenerate: (tweaks: string) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [savedToast, setSavedToast] = useState<string[]>([])
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
    const res = await fetch('/api/plan-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, message: text, history }),
    })
    const data = await res.json()
    setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    if (data.savedDislikes?.length > 0) {
      setSavedToast(data.savedDislikes)
      setTimeout(() => setSavedToast([]), 4000)
    }
    setThinking(false)
  }

  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')

  const SUGGESTIONS = ['Make it lighter this week', 'Swap in something vegetarian', 'I want more variety']

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
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

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: lastAssistantMessage ? '0.75rem' : 0 }}>
        <input className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Swap Thursday, make it lighter, add a pasta night…"
          style={{ flex: 1, fontSize: '0.85rem' }}
        />
        <button className="btn-primary" onClick={send} disabled={thinking || !input.trim()}
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
          <ChefHat size={13} /> Regenerate with this feedback
        </button>
      )}
    </div>
  )
}

const CATEGORY_ORDER = ['produce', 'protein', 'dairy', 'pantry', 'other']

export default function PlanPage() {
  const [weekStart, setWeekStart] = useState(getMonday)
  const [nights, setNights] = useState(7)
  const [tweaks, setTweaks] = useState('')
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'plan' | 'grocery' | 'prep'>('plan')
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())

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
        <DayPanel day={selectedDay} onClose={() => setSelectedDay(null)} />
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
                onClick={() => setNights(n)}
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
            onChange={e => setTweaks(e.target.value)}
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
            <div style={{ maxWidth: '560px' }}>
              <div className="card">
                <h3 className="serif" style={{ fontSize: '1.4rem', fontWeight: 300, marginBottom: '1.25rem' }}>Grocery List</h3>
                {CATEGORY_ORDER.filter(cat => groceryByCategory()[cat]?.length).map(cat => (
                  <div key={cat} className="grocery-section">
                    <div className="grocery-category">{cat}</div>
                    {groceryByCategory()[cat].map((item, i) => {
                      const key = `${cat}-${i}`
                      return (
                        <label key={key} className="grocery-item" style={{ cursor: 'pointer' }}>
                          <input type="checkbox" checked={checked.has(key)}
                            onChange={() => setChecked(prev => {
                              const next = new Set(prev)
                              next.has(key) ? next.delete(key) : next.add(key)
                              return next
                            })} />
                          <span style={{ textDecoration: checked.has(key) ? 'line-through' : 'none', opacity: checked.has(key) ? 0.5 : 1 }}>
                            {item.amount} {item.item}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
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

          <PlanChat plan={plan} onRegenerate={generate} />
        </>
      )}
    </div>
  )
}
