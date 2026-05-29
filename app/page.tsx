"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Calendar, BookOpen, Link2, Mail, ChefHat,
  Plus, Search, RefreshCw, Trash2, ExternalLink,
  ShoppingCart, ClipboardList, Baby, X, Loader2, Utensils
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = "planner" | "library" | "import" | "emails";

interface Meal { title: string; description: string; ingredients: string[]; instructions: string[]; prepTime: number; cookTime: number; servings: number; toddlerAdaptation: string; tags: string[]; }
interface DayPlan { day: string; dinner: Meal | null; lunch?: Meal | null; }
interface GroceryList { produce: string[]; protein: string[]; dairy: string[]; pantry: string[]; other: string[]; }
interface MealPlan { id?: number; weekStart: string; days: DayPlan[]; groceryList: GroceryList; prepNotes: string[]; }

interface Recipe {
  id: number; title: string; description: string; ingredients: string; instructions: string;
  prep_time: number; cook_time: number; servings: number; tags: string;
  source_url: string; toddler_notes: string; image_url: string; created_at: string;
}

interface EmailRecipe {
  id: number; sender: string; subject: string; recipe_links: string;
  raw_snippet: string; email_date: string; scanned_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getMonday = (d = new Date()) => {
  const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split("T")[0];
};

const formatDate = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const parseJSON = (s: string) => { try { return JSON.parse(s); } catch { return s; } };

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast">{msg}</div>;
}

// ─── Recipe Panel ─────────────────────────────────────────────────────────────
function RecipePanel({ meal, onClose, onSave }: { meal: Meal; onClose: () => void; onSave: () => void }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: meal.title, description: meal.description,
        ingredients: meal.ingredients, instructions: meal.instructions,
        prepTime: meal.prepTime, cookTime: meal.cookTime, servings: meal.servings,
        tags: meal.tags, toddlerNotes: meal.toddlerAdaptation,
      }),
    });
    setSaving(false); setSaved(true); onSave();
  };

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 300, lineHeight: 1.1 }}>{meal.title}</h2>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              {meal.tags?.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        <p style={{ color: "var(--ink-light)", fontSize: "0.9rem" }}>{meal.description}</p>

        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8rem", color: "var(--ink-light)" }}>
          {meal.prepTime && <span>Prep: {meal.prepTime}m</span>}
          {meal.cookTime && <span>Cook: {meal.cookTime}m</span>}
          <span>Serves: {meal.servings}</span>
        </div>

        {meal.toddlerAdaptation && (
          <div style={{ background: "#fef3e2", borderRadius: 8, padding: "0.75rem 1rem" }}>
            <div className="toddler-badge" style={{ marginBottom: "0.4rem" }}><Baby size={11} /> Russell adaptation</div>
            <p style={{ fontSize: "0.85rem", color: "#7a4a00" }}>{meal.toddlerAdaptation}</p>
          </div>
        )}

        <div>
          <div className="section-label">Ingredients</div>
          <ul style={{ paddingLeft: "1.2rem", fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {meal.ingredients?.map((ing, i) => <li key={i}>{ing}</li>)}
          </ul>
        </div>

        <div>
          <div className="section-label">Instructions</div>
          <ol style={{ paddingLeft: "1.2rem", fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {meal.instructions?.map((step, i) => <li key={i} style={{ lineHeight: 1.5 }}>{step}</li>)}
          </ol>
        </div>

        <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
          {saved
            ? <span style={{ color: "var(--kelp)", fontSize: "0.875rem" }}>✓ Saved to library</span>
            : <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : <><Plus size={14} /> Save to Library</>}
              </button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── Planner Tab ──────────────────────────────────────────────────────────────
function PlannerTab() {
  const [weekStart, setWeekStart] = useState(getMonday());
  const [tweaks, setTweaks] = useState("");
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<"plan" | "grocery" | "prep">("plan");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [toast, setToast] = useState("");

  const generate = async () => {
    setLoading(true);
    const res = await fetch("/api/meal-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart, tweaks }),
    });
    const data = await res.json();
    setPlan(data);
    setLoading(false);
  };

  const weekLabel = () => {
    const d = new Date(weekStart + "T12:00:00");
    const end = new Date(d); end.setDate(end.getDate() + 6);
    return `${formatDate(weekStart)} – ${formatDate(end.toISOString())}`;
  };

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      {selectedMeal && (
        <RecipePanel
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
          onSave={() => { setToast("Saved to library!"); setSelectedMeal(null); }}
        />
      )}

      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="section-label">Week of</div>
          <input type="date" className="input" value={weekStart}
            onChange={e => setWeekStart(e.target.value)} style={{ maxWidth: 200 }} />
        </div>
        <div style={{ flex: 3, minWidth: 280 }}>
          <div className="section-label">Tweaks or requests (optional)</div>
          <input className="input" placeholder="e.g. One Thai night, nothing too heavy, use up the feta…"
            value={tweaks} onChange={e => setTweaks(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={generate} disabled={loading}>
          {loading ? <><Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> Generating…</> : <><ChefHat size={14} /> Generate Plan</>}
        </button>
      </div>

      {!plan && !loading && (
        <div className="empty-state">
          <ChefHat size={48} />
          <h3>No plan yet</h3>
          <p>Generate a week of dinners tailored to your preferences.</p>
        </div>
      )}

      {loading && (
        <div className="empty-state">
          <div className="spinner" style={{ width: 40, height: 40, marginBottom: "1rem" }} />
          <p>Crafting your week…</p>
        </div>
      )}

      {plan && !loading && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", fontWeight: 300 }}>
              Week of {weekLabel()}
            </h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(["plan", "grocery", "prep"] as const).map(v => (
                <button key={v} className={activeView === v ? "btn-primary" : "btn-secondary"}
                  onClick={() => setActiveView(v)}
                  style={{ fontSize: "0.8rem", padding: "0.45rem 1rem" }}>
                  {v === "plan" ? <><Calendar size={12} /> Plan</> : v === "grocery" ? <><ShoppingCart size={12} /> Grocery</> : <><ClipboardList size={12} /> Prep</>}
                </button>
              ))}
            </div>
          </div>

          {activeView === "plan" && (
            <div className="plan-grid">
              {plan.days.map(day => (
                <div key={day.day} className="day-cell" onClick={() => day.dinner && setSelectedMeal(day.dinner)}>
                  <div className="day-label">{day.day.slice(0, 3)}</div>
                  {day.dinner ? (
                    <>
                      <div className="day-meal-title">{day.dinner.title}</div>
                      <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                        {day.dinner.tags?.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                      </div>
                      {day.dinner.toddlerAdaptation && (
                        <div className="toddler-badge"><Baby size={10} /> toddler-friendly</div>
                      )}
                      <div style={{ marginTop: "auto", fontSize: "0.75rem", color: "var(--ink-light)" }}>
                        {day.dinner.prepTime + day.dinner.cookTime}m total
                      </div>
                    </>
                  ) : (
                    <div style={{ color: "var(--ink-light)", fontSize: "0.85rem", marginTop: "auto" }}>Rest day</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeView === "grocery" && plan.groceryList && (
            <div style={{ maxWidth: 600 }}>
              <div className="card">
                <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", fontWeight: 300, marginBottom: "1.25rem" }}>Grocery List</h3>
                {Object.entries(plan.groceryList).map(([cat, items]) =>
                  (items as string[]).length > 0 && (
                    <div key={cat} className="grocery-section">
                      <div className="grocery-category">{cat}</div>
                      {(items as string[]).map((item, i) => (
                        <label key={i} className="grocery-item">
                          <input type="checkbox" />
                          {item}
                        </label>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {activeView === "prep" && plan.prepNotes && (
            <div style={{ maxWidth: 600 }}>
              <div className="card">
                <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", fontWeight: 300, marginBottom: "1.25rem" }}>Prep Notes</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {plan.prepNotes.map((note, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <span style={{ color: "var(--driftwood)", fontSize: "1.2rem", lineHeight: 1.2, flexShrink: 0 }}>·</span>
                      <span style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Library Tab ──────────────────────────────────────────────────────────────
function LibraryTab() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/recipes${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    setRecipes(await res.json());
    setLoading(false);
  }, [q]);

  useEffect(() => { load(); }, [load]);

  const del = async (id: number) => {
    await fetch(`/api/recipes?id=${id}`, { method: "DELETE" });
    setRecipes(r => r.filter(x => x.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const toMeal = (r: Recipe): Meal => ({
    title: r.title, description: r.description,
    ingredients: parseJSON(r.ingredients), instructions: parseJSON(r.instructions),
    prepTime: r.prep_time, cookTime: r.cook_time, servings: r.servings,
    tags: parseJSON(r.tags), toddlerAdaptation: r.toddler_notes,
  });

  return (
    <div>
      {selected && (
        <RecipePanel meal={toMeal(selected)} onClose={() => setSelected(null)} onSave={() => {}} />
      )}

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-light)" }} />
          <input className="input" style={{ paddingLeft: "2rem" }} placeholder="Search recipes…"
            value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      {loading && <div className="empty-state"><div className="spinner" style={{ width: 32, height: 32 }} /></div>}

      {!loading && recipes.length === 0 && (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>No recipes yet</h3>
          <p>Generate a meal plan and save dishes, or import via URL.</p>
        </div>
      )}

      <div className="recipe-grid">
        {recipes.map(r => (
          <div key={r.id} className="card" style={{ cursor: "pointer" }} onClick={() => setSelected(r)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
              <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", fontWeight: 400 }}>{r.title}</h3>
              <button className="btn-ghost" onClick={e => { e.stopPropagation(); del(r.id); }} style={{ flexShrink: 0 }}>
                <Trash2 size={13} />
              </button>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--ink-light)", marginTop: "0.4rem", lineHeight: 1.5 }}>
              {r.description?.slice(0, 100)}{r.description?.length > 100 ? "…" : ""}
            </p>
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {parseJSON(r.tags)?.slice(0, 3).map((t: string) => <span key={t} className="tag">{t}</span>)}
            </div>
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--ink-light)" }}>
              {r.prep_time && <span>{r.prep_time}m prep</span>}
              {r.cook_time && <span>{r.cook_time}m cook</span>}
              {r.source_url && <span style={{ color: "var(--tide)" }}>↗ imported</span>}
            </div>
            {r.toddler_notes && (
              <div className="toddler-badge" style={{ marginTop: "0.6rem" }}><Baby size={10} /> toddler notes</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Import Tab ───────────────────────────────────────────────────────────────
function ImportTab() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(Meal & { sourceUrl?: string }) | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const doImport = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(""); setResult(null);
    const res = await fetch("/api/import-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); }
    else {
      setResult({
        title: data.title, description: data.description,
        ingredients: data.ingredients, instructions: data.instructions,
        prepTime: data.prepTime, cookTime: data.cookTime, servings: data.servings,
        tags: data.tags, toddlerAdaptation: data.toddlerNotes,
        sourceUrl: data.sourceUrl,
      });
      setToast("Recipe imported and saved!");
      setUrl("");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 680 }}>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="section-label" style={{ marginBottom: "0.75rem" }}>Recipe URL</div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <input className="input" placeholder="https://www.seriouseats.com/..."
            value={url} onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doImport()} />
          <button className="btn-primary" onClick={doImport} disabled={loading || !url.trim()}>
            {loading ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> : <Link2 size={14} />}
            {loading ? "Importing…" : "Import"}
          </button>
        </div>
        {error && <p style={{ color: "var(--rust)", fontSize: "0.85rem", marginTop: "0.75rem" }}>⚠ {error}</p>}
      </div>

      {result && (
        <div className="card">
          <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.8rem", fontWeight: 300, marginBottom: "0.5rem" }}>{result.title}</h2>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            {result.tags?.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--ink-light)", marginBottom: "1rem" }}>{result.description}</p>

          {result.toddlerAdaptation && (
            <div style={{ background: "#fef3e2", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem" }}>
              <div className="toddler-badge" style={{ marginBottom: "0.4rem" }}><Baby size={11} /> Russell adaptation</div>
              <p style={{ fontSize: "0.85rem", color: "#7a4a00" }}>{result.toddlerAdaptation}</p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <div className="section-label">Ingredients</div>
              <ul style={{ paddingLeft: "1.2rem", fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {result.ingredients?.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
            </div>
            <div>
              <div className="section-label">Instructions</div>
              <ol style={{ paddingLeft: "1.2rem", fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {result.instructions?.map((s, i) => <li key={i} style={{ lineHeight: 1.5 }}>{s}</li>)}
              </ol>
            </div>
          </div>

          <p style={{ fontSize: "0.75rem", color: "var(--tide)", marginTop: "1rem" }}>✓ Saved to your library</p>
        </div>
      )}
    </div>
  );
}

// ─── Emails Tab ───────────────────────────────────────────────────────────────
function EmailsTab() {
  const [emails, setEmails] = useState<EmailRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  const scan = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/email-scan", { method: "POST" });
    const data = await res.json();
    setEmails(data.emails || []);
    setScanned(true);
    setLoading(false);
  }, []);

  const loadExisting = useCallback(async () => {
    const res = await fetch("/api/email-scan");
    const data = await res.json();
    if (data.emails?.length) { setEmails(data.emails); setScanned(true); }
    scan();
  }, [scan]);

  useEffect(() => { loadExisting(); }, [loadExisting]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--ink-light)" }}>
          Recipe links from newsletters & food bloggers in your Gmail.
        </p>
        <button className="btn-secondary" onClick={scan} disabled={loading}>
          {loading ? <Loader2 size={13} style={{ animation: "spin 0.7s linear infinite" }} /> : <RefreshCw size={13} />}
          {loading ? "Scanning…" : "Refresh"}
        </button>
      </div>

      {loading && emails.length === 0 && (
        <div className="empty-state">
          <div className="spinner" style={{ width: 36, height: 36, marginBottom: "1rem" }} />
          <p>Scanning your inbox for recipe emails…</p>
        </div>
      )}

      {scanned && emails.length === 0 && !loading && (
        <div className="empty-state">
          <Mail size={48} />
          <h3>No recipe emails found</h3>
          <p>Try subscribing to Serious Eats, Bon Appétit, Half Baked Harvest, or similar newsletters.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {emails.map(e => {
          const links: string[] = parseJSON(e.recipe_links) || [];
          return (
            <div key={e.id} className="email-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="email-sender">{e.sender}</div>
                  <div className="email-subject">{e.subject}</div>
                  {e.email_date && (
                    <div style={{ fontSize: "0.72rem", color: "var(--ink-light)", marginTop: "0.1rem" }}>
                      {new Date(e.email_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  )}
                </div>
                {links.length > 0 && (
                  <span style={{ fontSize: "0.72rem", background: "var(--sand)", padding: "0.2rem 0.5rem", borderRadius: 20, color: "var(--ink-light)" }}>
                    {links.length} link{links.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {e.raw_snippet && <p className="email-snippet" style={{ marginTop: "0.5rem" }}>{e.raw_snippet}</p>}
              {links.length > 0 && (
                <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  {links.map((link, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <a href={link} target="_blank" rel="noopener" className="email-link">
                        <ExternalLink size={11} style={{ display: "inline", marginRight: "0.25rem" }} />
                        {link.length > 60 ? link.slice(0, 60) + "…" : link}
                      </a>
                      <button className="btn-ghost" style={{ fontSize: "0.72rem" }}
                        onClick={async () => {
                          await fetch("/api/import-url", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ url: link }),
                          });
                          alert("Saved to library!");
                        }}>
                        <Plus size={11} /> Save
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState<Tab>("planner");

  const navItems = [
    { id: "planner", label: "Meal Planner", icon: <Calendar size={15} /> },
    { id: "library", label: "Recipe Library", icon: <BookOpen size={15} /> },
    { id: "import", label: "Import URL", icon: <Link2 size={15} /> },
    { id: "emails", label: "Email Recipes", icon: <Mail size={15} /> },
  ] as const;

  const titles: Record<Tab, { title: string; sub: string }> = {
    planner: { title: "Meal Planner", sub: "Generate your week, get groceries & prep notes" },
    library: { title: "Recipe Library", sub: "All your saved recipes in one place" },
    import: { title: "Import a Recipe", sub: "Paste a URL and we'll parse and save it" },
    emails: { title: "Email Recipes", sub: "Recipe links from your newsletter subscriptions" },
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Utensils size={20} style={{ color: "var(--driftwood)" }} />
          Plato
        </div>
        {navItems.map(n => (
          <button key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`}
            onClick={() => setTab(n.id)}>
            {n.icon} {n.label}
          </button>
        ))}
      </aside>

      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">{titles[tab].title}</h1>
          <p className="page-subtitle">{titles[tab].sub}</p>
        </div>
        <hr className="divider" />

        {tab === "planner" && <PlannerTab />}
        {tab === "library" && <LibraryTab />}
        {tab === "import" && <ImportTab />}
        {tab === "emails" && <EmailsTab />}
      </main>
    </div>
  );
}
