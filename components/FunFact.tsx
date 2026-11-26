'use client'
import { useEffect, useState } from 'react'
import { Send, Check } from 'lucide-react'

interface Tip { text: string; source: string }

const TIPS: Tip[] = [
  // Heat & pan
  { text: "Let your pan fully preheat before adding oil — a hot pan means food releases cleanly instead of sticking.", source: "Professional kitchens" },
  { text: "Don't crowd the pan. Too much food at once drops the temperature and you get steam instead of a sear.", source: "The Food Lab" },
  { text: "Cook in batches when browning meat. One good sear beats three pale, steamed pieces every time.", source: "The Food Lab" },
  { text: "A stainless pan is ready when a drop of water skitters across the surface and evaporates instantly.", source: "Chef's technique" },
  { text: "Cast iron retains heat beautifully but heats unevenly — always preheat it longer than you think.", source: "Chef's technique" },
  { text: "If your oil starts smoking, your pan is too hot. Pull it off the heat for 30 seconds before continuing.", source: "Professional kitchens" },
  { text: "Use low heat for eggs. High heat makes them rubbery. Low and slow keeps them silky.", source: "Jacques Pépin" },
  { text: "Deglaze your pan with wine, stock, or water right after searing — that browned residue is concentrated flavor.", source: "French culinary tradition" },
  { text: "Match pan size to portion. A large pan for a small amount of food causes butter and oil to burn at the edges.", source: "Chef's technique" },
  { text: "Cold butter into a hot pan will burn before the food is cooked. Room-temperature butter is more controllable.", source: "Professional kitchens" },
  // Seasoning & flavor
  { text: "Season in layers throughout cooking — not just at the end. Each stage builds depth.", source: "Salt, Fat, Acid, Heat" },
  { text: "Salt from high up (30cm above the food) distributes more evenly than salting close to the surface.", source: "Professional kitchens" },
  { text: "Taste constantly. The best cooks adjust as they go, not just before serving.", source: "Culinary tradition" },
  { text: "Acid — lemon juice or vinegar added at the end — brightens a dish that tastes flat before you reach for more salt.", source: "Salt, Fat, Acid, Heat" },
  { text: "A pinch of sugar can balance overly acidic tomato sauces without making them taste sweet.", source: "Italian culinary tradition" },
  { text: "Toast whole spices in a dry pan for 60 seconds before grinding. The difference in aroma is remarkable.", source: "Indian culinary tradition" },
  { text: "Fat carries flavor. A dish that tastes dull often just needs a small knob of butter or a drizzle of good olive oil.", source: "Salt, Fat, Acid, Heat" },
  { text: "Finish pasta dishes with a splash of starchy pasta water — it emulsifies the sauce and helps it cling.", source: "Italian culinary tradition" },
  { text: "Fresh herbs go in at the end. Dried herbs go in early so their flavor has time to bloom.", source: "Culinary tradition" },
  { text: "Parmesan rind simmered in a soup or stew adds an extraordinary depth of umami — save them in the freezer.", source: "Italian culinary tradition" },
  { text: "A tiny amount of fish sauce in a braised dish won't taste fishy — it just makes everything taste more savory.", source: "The Food Lab" },
  { text: "If a dish tastes almost right but not quite, it usually needs more salt, an acid, or fat — rarely anything else.", source: "Salt, Fat, Acid, Heat" },
  { text: "Bloom your spices: add ground spices to hot oil for 30 seconds before other ingredients to unlock their oils.", source: "Indian culinary tradition" },
  { text: "Seasoning ground meat? Fry a teaspoon of the mixture first, taste it, then adjust the whole batch.", source: "Professional kitchens" },
  { text: "Honey, miso, and soy sauce all add umami. Keep at least one on hand for finishing savory dishes.", source: "Chef's technique" },
  // Meat & protein
  { text: "Take meat out of the fridge 20–30 minutes before cooking. Cold meat hitting a hot pan steams in the center.", source: "Professional kitchens" },
  { text: "Pat meat dry before searing. Surface moisture creates steam, which prevents browning.", source: "The Food Lab" },
  { text: "Rest meat after cooking — 5 minutes for a steak, 15–20 for a roast. The juices redistribute as it cools.", source: "Culinary tradition" },
  { text: "Salt a steak generously at least 45 minutes before cooking (or overnight). A quick 10-minute salt draws moisture out.", source: "The Food Lab" },
  { text: "Pound chicken breasts to an even thickness before cooking so the thin end doesn't dry out first.", source: "Professional kitchens" },
  { text: "Cook chicken thighs instead of breasts when in doubt — more forgiving, more flavorful, harder to dry out.", source: "Chef's technique" },
  { text: "Truss a whole chicken before roasting. Tying the legs close keeps the breast from overcooking.", source: "Julia Child" },
  { text: "Use a meat thermometer. Visual cues lie: 165°F for poultry, 145°F for pork, 130°F for medium-rare beef.", source: "Food safety standards" },
  { text: "Slice against the grain for tender meat — the grain runs along the muscle fibers; cut perpendicular to it.", source: "Culinary tradition" },
  { text: "Marinate fish for no more than 30 minutes in acidic marinades. Too long and the acid starts to cook it.", source: "Chef's technique" },
  { text: "Sear fish skin-side down first, pressing it flat for the first 30 seconds so it doesn't curl.", source: "Professional kitchens" },
  { text: "Ground meat with more fat (80/20) stays juicier for burgers. Lean ground beef makes dry, tough patties.", source: "The Food Lab" },
  { text: "If a braise smells great but the meat is still tough, it just needs more time. Tough = not done. Falling apart = done.", source: "French culinary tradition" },
  { text: "Chicken legs and thighs need to reach 180°F+ to become truly tender — collagen breaks down into gelatin above 160°F.", source: "The Food Lab" },
  { text: "Let a whole roast chicken rest breast-side down to let the juices flow back into the breast meat.", source: "Chef's technique" },
  // Vegetables
  { text: "Roast vegetables at higher heat (425°F+) for caramelization and edges that crisp rather than steam.", source: "Chef's technique" },
  { text: "Don't boil — blanch and shock. Brief boiling, then ice water, keeps vegetables bright green and crisp-tender.", source: "French culinary tradition" },
  { text: "Wipe mushrooms with a damp cloth. Soaking them in water makes them soggy and they won't brown properly.", source: "Culinary tradition" },
  { text: "Salt eggplant or zucchini and let it sit 10 minutes to draw out moisture — they'll sauté instead of steam.", source: "Mediterranean culinary tradition" },
  { text: "Roast tomatoes before adding to a sauce for a richer, more concentrated flavor than raw.", source: "Italian culinary tradition" },
  { text: "Squeeze excess water from grated zucchini, raw potato, or spinach before cooking or they'll make everything watery.", source: "Chef's technique" },
  { text: "Save vegetable scraps — onion peels, carrot ends, celery tops — in the freezer for homemade stock.", source: "Culinary tradition" },
  { text: "Green vegetables cooked with the lid off stay vibrant. Lid on traps acids that turn them drab.", source: "Food science" },
  { text: "Caramelize onions low and slow for at least 30–45 minutes. Any shorter and they're just softened, not caramelized.", source: "French culinary tradition" },
  { text: "Corn loses sweetness within hours of picking. If not fresh-from-the-farm, a pinch of sugar in the water helps.", source: "Culinary tradition" },
  // Baking & pastry
  { text: "Baking is science. Measure by weight, not volume, for consistent results — especially flour.", source: "Professional baking" },
  { text: "Cold butter makes flaky pastry. The butter steams during baking, creating pockets. Warm butter melts in and makes it dense.", source: "French pastry tradition" },
  { text: "Bring eggs and dairy to room temperature before baking. Cold ingredients don't emulsify properly.", source: "Professional baking" },
  { text: "Don't overmix muffins or quick breads. Mix just until the flour disappears — lumps are fine. Overmixing = tough.", source: "Baking science" },
  { text: "Rotate baking trays halfway through cooking. Most ovens have hot spots.", source: "Professional kitchens" },
  { text: "Bake cakes and breads until they're deeper golden than you'd expect. Pale = underbaked, even if the toothpick is clean.", source: "Professional baking" },
  { text: "Rest cookie dough overnight in the fridge. The flavors concentrate and the cookies spread less and taste better.", source: "The Food Lab" },
  { text: "Use parchment paper, not greased foil, for most baking. Things release cleanly and cleanup is easy.", source: "Professional kitchens" },
  { text: "Dust a greased baking pan with flour after buttering for cakes that release perfectly without tearing.", source: "Baking tradition" },
  { text: "Sift flour when making cakes, not bread. Cake needs airiness; bread develops structure differently.", source: "Baking science" },
  // Knife & prep
  { text: "A sharp knife is safer than a dull one. A dull knife requires more force and slips unpredictably.", source: "Culinary tradition" },
  { text: "Use the claw grip: curl your fingertips inward so your knuckles guide the blade. Every professional kitchen teaches this.", source: "Professional kitchens" },
  { text: "Mise en place (everything in its place) — prep and measure everything before you start cooking. Cooking gets calmer.", source: "French culinary tradition" },
  { text: "Crush garlic with the flat of your knife before mincing. The skin slides off and it minces more easily.", source: "Chef's technique" },
  { text: "Peel ginger by scraping with a teaspoon rather than a knife — you waste almost nothing.", source: "Asian culinary tradition" },
  { text: "Chiffonade herbs by stacking leaves, rolling them up, and slicing thinly for a garnish that doesn't bruise.", source: "French culinary technique" },
  { text: "To dice an onion without tears, keep the root end intact — it holds the layers together as you cut.", source: "Chef's technique" },
  { text: "Zest citrus before juicing it. It's nearly impossible to zest once it's been squeezed.", source: "Pastry kitchens" },
  { text: "A plastic or wooden cutting board for vegetables, a separate one for raw meat. Cross-contamination is a real risk.", source: "Food safety standards" },
  { text: "Let your knife do the work — use the weight of the blade and a rocking motion rather than pressing down hard.", source: "Professional kitchens" },
  // Storage & freshness
  { text: "Store fresh herbs like flowers: trim the stems and keep them in a jar of water in the fridge. They last weeks.", source: "Chef's technique" },
  { text: "Ripe tomatoes lose aroma compounds within days in the fridge. Store at room temperature, stem-side down.", source: "Food science" },
  { text: "Avocados ripen faster in a paper bag with a banana — the ethylene gas from the banana speeds things up.", source: "Food science" },
  { text: "Ground spices lose potency after about a year. If it has no aroma when you rub it, it's spent.", source: "Culinary tradition" },
  { text: "Freeze bread you won't finish. Toast it straight from frozen — it comes back beautifully.", source: "Chef's technique" },
  { text: "Store onions and potatoes separately. Onions emit gases that cause potatoes to sprout faster.", source: "Food science" },
  { text: "Fresh ginger keeps for weeks in the freezer and grates easily from frozen — no need to thaw.", source: "Asian culinary tradition" },
  { text: "Save the oil from a jar of anchovies or sun-dried tomatoes — it's deeply flavored and excellent for dressings.", source: "Italian culinary tradition" },
  { text: "Leftover wine keeps 3–5 days with a vacuum stopper. Use the rest for cooking — it doesn't need to be great wine.", source: "Chef's technique" },
  { text: "Keep a Parmesan rind in the freezer and add it to soups, stews, and braised dishes while they cook.", source: "Italian culinary tradition" },
  // Equipment
  { text: "An instant-read thermometer is the most underrated kitchen tool. It removes guessing from meat, bread, and candy.", source: "Professional kitchens" },
  { text: "A bench scraper is invaluable for gathering chopped vegetables, cutting dough, and scraping a board clean.", source: "Professional kitchens" },
  { text: "Cast iron pans should never be soaked in water. Dry them on the stove after washing and add a thin coat of oil.", source: "Culinary tradition" },
  { text: "A heavy-bottomed pot distributes heat evenly. Thin pots have hot spots and scorch sauces.", source: "Chef's technique" },
  { text: "A microplane grater is the best tool for zesting citrus, grating fresh ginger, and finishing with hard cheese.", source: "Professional kitchens" },
  { text: "A digital kitchen scale removes the guesswork from baking and is faster than measuring cups for most ingredients.", source: "Professional baking" },
  { text: "Wooden spoons don't conduct heat and won't scratch your pans. Keep one dedicated to savory cooking.", source: "Culinary tradition" },
  { text: "Use a splatter screen when pan-frying. It keeps the stove clean and protects you from burns.", source: "Professional kitchens" },
  { text: "Line a baking sheet with parchment rather than foil. Foil conducts heat differently and can cause overbrowning.", source: "Professional baking" },
  { text: "A spider strainer (a wide mesh basket on a long handle) is better than tongs for lifting pasta or blanched vegetables.", source: "Professional kitchens" },
  // Pasta, rice & grains
  { text: "Pasta water should taste pleasantly salty — like mild sea water. This is how pasta gets seasoned throughout.", source: "Italian culinary tradition" },
  { text: "Never rinse cooked pasta unless making a cold salad. Rinsing washes off the starch that holds sauce.", source: "Italian culinary tradition" },
  { text: "Cook pasta one minute less than the package says, then finish it in the sauce to absorb flavor.", source: "Italian culinary tradition" },
  { text: "Toast dry rice in butter or oil for 1–2 minutes before adding water. It adds a subtle nuttiness.", source: "Culinary tradition" },
  { text: "Let cooked rice steam off the heat with the lid on for 10 minutes. It finishes without getting mushy.", source: "Asian culinary tradition" },
  // Mindset & technique
  { text: "Read the whole recipe before you start. There's nothing worse than discovering a 2-hour marinating step mid-cook.", source: "Culinary tradition" },
  { text: "Build a good fond (browned bits on the bottom of the pan) — it's the foundation of pan sauces and gravies.", source: "French culinary tradition" },
  { text: "Make the same dish several times in a row. Repetition is how technique becomes instinct.", source: "Jacques Pépin" },
  { text: "A recipe is a starting point, not a contract. Once you understand why something works, you can adjust freely.", source: "Salt, Fat, Acid, Heat" },
  { text: "Clean as you go. A clear workspace keeps your head clear and means no mountain of dishes at the end.", source: "Professional kitchens" },
  { text: "When a dish tastes almost there, let it cook a little longer. Time develops flavor in ways no ingredient can shortcut.", source: "Culinary tradition" },
  { text: "The best upgrade you can make to your cooking: buy better salt. Flaky sea salt as a finisher changes everything.", source: "Salt, Fat, Acid, Heat" },
  { text: "Make your own stock when you have the time and bones. The difference in a finished dish is immediately obvious.", source: "Julia Child" },
  { text: "Cook for other people as often as you can. Watching someone eat your food teaches you faster than anything.", source: "Jacques Pépin" },
  { text: "If something smells burnt, don't wait to check — it's burnt. Trust your nose.", source: "Culinary tradition" },
]

export default function FunFact() {
  const [tip, setTip] = useState<Tip | null>(null)
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const today = new Date()
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
    setTip(TIPS[seed % TIPS.length])
  }, [])

  async function submit() {
    if (!input.trim() || submitting) return
    setSubmitting(true)
    await fetch('/api/cooking-tips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tip: input.trim() }),
    })
    setSubmitting(false)
    setSubmitted(true)
    setInput('')
  }

  if (!tip) return null

  return (
    <div style={{
      marginTop: '2rem',
      background: 'var(--parchment)',
      border: '1px solid var(--stone-dark)',
      borderRadius: 12,
      padding: '1rem 1.1rem',
    }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '0.05rem' }}>🥄</span>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ochre)', marginBottom: '0.3rem' }}>Food for Thought</div>
          <p style={{ fontSize: '0.82rem', color: 'var(--ink-light)', lineHeight: 1.65, marginBottom: '0.4rem' }}>{tip.text}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--ink-light)', opacity: 0.6, fontStyle: 'italic' }}>— {tip.source}</p>
        </div>
      </div>

      {submitted ? (
        <p style={{ fontSize: '0.78rem', color: 'var(--olive)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Check size={13} /> Thanks — we'll add it to the collection!
        </p>
      ) : (
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--ink-light)', marginBottom: '0.4rem' }}>Have a tip of your own?</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <textarea
                className="textarea"
                value={input}
                onChange={e => setInput(e.target.value.slice(0, 300))}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) submit() }}
                placeholder="Share a cooking tip…"
                style={{ fontSize: '0.82rem', minHeight: '60px', resize: 'none' }}
              />
              <div style={{ fontSize: '0.68rem', color: 'var(--ink-light)', textAlign: 'right', marginTop: '0.2rem' }}>
                {input.length}/300
              </div>
            </div>
            <button className="btn-primary" onClick={submit}
              disabled={submitting || !input.trim()}
              style={{ padding: '0.65rem 0.85rem', flexShrink: 0, marginBottom: '1.4rem' }}>
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
