'use client'
import { useState, useEffect } from 'react'
import { ThumbsDown, ThumbsUp, BookOpen } from 'lucide-react'

interface StarterRecipe {
  title: string
  description: string
  category: string
  emoji: string
  color: string
  prep_time: number
  cook_time: number
  servings: number
  ingredients: string[]
  instructions: string[]
  tags: string[]
  contains: string[] // e.g. ['meat', 'gluten', 'dairy', 'eggs', 'shellfish']
}

const RECIPES: StarterRecipe[] = [
  {
    title: 'Shakshuka',
    description: 'Eggs poached in a rich, spiced tomato and pepper sauce — a one-pan dinner that feels both exotic and deeply comforting.',
    category: 'Vegetarian', emoji: '🌿', color: '#4a7a4f',
    contains: ['eggs', 'dairy'],
    prep_time: 10, cook_time: 25, servings: 4,
    tags: ['vegetarian', 'eggs', 'one-pan', 'weeknight'],
    ingredients: ['2 tbsp olive oil', '1 onion, diced', '1 red bell pepper, diced', '4 garlic cloves, minced', '1 tsp cumin', '1 tsp smoked paprika', 'Pinch of cayenne', '1 can (28 oz) crushed tomatoes', '4–6 eggs', '100g feta, crumbled', 'Fresh parsley, salt and pepper'],
    instructions: ['Heat oil in a large skillet over medium heat. Sauté onion and pepper 7 minutes until softened.', 'Add garlic, cumin, paprika, and cayenne. Cook 1 minute until fragrant.', 'Pour in crushed tomatoes. Simmer 10 minutes, season generously with salt and pepper.', 'Make wells in the sauce and crack in eggs. Cover and cook 5–8 minutes until whites are set but yolks are still runny.', 'Top with feta and parsley. Serve straight from the pan with crusty bread.'],
  },
  {
    title: 'Mushroom & Parmesan Pasta',
    description: 'Earthy mushrooms, garlic, white wine, and a shower of Parmesan — a weeknight pasta that tastes like a restaurant.',
    category: 'Vegetarian', emoji: '🌿', color: '#4a7a4f',
    contains: ['gluten', 'dairy'],
    prep_time: 10, cook_time: 20, servings: 4,
    tags: ['vegetarian', 'pasta', 'mushroom', 'quick'],
    ingredients: ['400g pasta (tagliatelle or pappardelle)', '500g mixed mushrooms, sliced', '4 garlic cloves, minced', '1 shallot, diced', '100ml dry white wine', '200ml heavy cream', '60g Parmesan, grated', '2 tbsp butter', 'Fresh thyme, salt and pepper'],
    instructions: ['Cook pasta in well-salted boiling water until al dente. Reserve 1 cup pasta water.', 'Melt butter in a large skillet over high heat. Add mushrooms in a single layer — cook undisturbed 3 minutes then toss. Season.', 'Add shallot and garlic, cook 2 minutes. Add wine and reduce by half.', 'Pour in cream, simmer 3 minutes. Add Parmesan and toss with drained pasta, adding pasta water to loosen.', 'Finish with fresh thyme and extra Parmesan.'],
  },
  {
    title: 'Lemon Herb Chicken Thighs',
    description: 'Crispy-skinned chicken thighs roasted with lemon, garlic, and fresh herbs — endlessly reliable and always delicious.',
    category: 'Chicken', emoji: '🍗', color: '#c8911a',
    contains: ['meat'],
    prep_time: 10, cook_time: 35, servings: 4,
    tags: ['chicken', 'roasted', 'lemon', 'weeknight'],
    ingredients: ['8 bone-in, skin-on chicken thighs', '3 tbsp olive oil', '1 lemon, zested and halved', '4 garlic cloves, minced', '1 tsp dried oregano', '1 tsp dried thyme', '1 tsp paprika', 'Salt and pepper', 'Fresh parsley to serve'],
    instructions: ['Preheat oven to 425°F / 220°C.', 'Pat chicken dry. Mix olive oil, lemon zest, garlic, oregano, thyme, paprika, salt and pepper. Rub all over chicken.', 'Place skin-side up in a roasting dish. Squeeze lemon halves over and nestle them alongside.', 'Roast 35–40 minutes until skin is deep golden and juices run clear.', 'Rest 5 minutes. Garnish with parsley and serve with the pan juices.'],
  },
  {
    title: 'Thai Basil Chicken',
    description: 'Fragrant, spicy, and slightly sweet — this 20-minute stir-fry is the dish that makes you stop ordering takeout.',
    category: 'Chicken', emoji: '🍗', color: '#c8911a',
    contains: ['meat'],
    prep_time: 10, cook_time: 15, servings: 4,
    tags: ['chicken', 'thai', 'stir-fry', 'quick', 'spicy'],
    ingredients: ['500g ground chicken', '4 garlic cloves, minced', '2 Thai red chillies, minced', '1 bunch Thai basil leaves', '2 tbsp fish sauce', '1 tbsp oyster sauce', '1 tbsp soy sauce', '1 tsp sugar', '2 tbsp vegetable oil', 'Steamed rice to serve, 1 fried egg per person (optional)'],
    instructions: ['Mix fish sauce, oyster sauce, soy sauce, and sugar in a small bowl.', 'Heat oil in a wok or large skillet over high heat until smoking. Add garlic and chilli, stir 30 seconds.', 'Add chicken, breaking it apart, and stir-fry 5–6 minutes until cooked through.', 'Pour in the sauce mixture. Toss and cook 1 minute.', 'Remove from heat, fold in Thai basil. Serve immediately over rice, topped with a fried egg.'],
  },
  {
    title: 'Honey Garlic Chicken',
    description: 'Golden chicken in a sticky, sweet, garlicky glaze that the whole table will fight over. Done in 30 minutes.',
    category: 'Chicken', emoji: '🍗', color: '#c8911a',
    contains: ['meat'],
    prep_time: 5, cook_time: 25, servings: 4,
    tags: ['chicken', 'honey', 'garlic', 'weeknight', 'quick'],
    ingredients: ['8 chicken thighs (boneless, skinless)', '4 garlic cloves, minced', '3 tbsp honey', '2 tbsp soy sauce', '1 tbsp apple cider vinegar', '1 tbsp olive oil', 'Salt and pepper', 'Sesame seeds and scallions to serve'],
    instructions: ['Season chicken with salt and pepper.', 'Heat oil in a large skillet over medium-high. Sear chicken 5–6 minutes per side until golden. Remove and set aside.', 'In the same pan, cook garlic 1 minute. Add honey, soy sauce, and vinegar. Simmer 2 minutes until slightly thickened.', 'Return chicken to pan, turn to coat in glaze. Cook 5 more minutes until cooked through and glossy.', 'Garnish with sesame seeds and scallions. Serve with rice.'],
  },
  {
    title: 'Miso Glazed Salmon',
    description: 'A 4-ingredient glaze that caramelizes into something extraordinary. Under 20 minutes from fridge to table.',
    category: 'Fish', emoji: '🐟', color: '#3a7080',
    contains: ['fish'],
    prep_time: 5, cook_time: 12, servings: 4,
    tags: ['salmon', 'fish', 'miso', 'quick', 'asian-inspired'],
    ingredients: ['4 salmon fillets (skin-on)', '3 tbsp white miso paste', '2 tbsp mirin', '1 tbsp soy sauce', '1 tbsp honey', 'Sesame seeds, sliced scallions to serve'],
    instructions: ['Mix miso, mirin, soy sauce, and honey into a smooth glaze.', 'Pat salmon dry and coat flesh side generously with glaze. Marinate 10 minutes (or up to overnight).', 'Heat broiler to high. Place salmon skin-side down on a foil-lined baking sheet.', 'Broil 8–10 minutes until glaze is caramelized and salmon is just cooked through.', 'Garnish with sesame seeds and scallions. Serve with steamed rice and bok choy.'],
  },
  {
    title: 'Shrimp Scampi',
    description: 'Butter, white wine, garlic, and lemon — the simplest things done perfectly. Ready in 15 minutes.',
    category: 'Fish', emoji: '🐟', color: '#3a7080',
    contains: ['shellfish', 'gluten', 'dairy'],
    prep_time: 5, cook_time: 15, servings: 4,
    tags: ['shrimp', 'pasta', 'seafood', 'quick', 'italian'],
    ingredients: ['400g linguine', '500g large shrimp, peeled and deveined', '5 garlic cloves, thinly sliced', '100ml dry white wine', '4 tbsp unsalted butter', '2 tbsp olive oil', '1 lemon, juiced', 'Red pepper flakes, salt and pepper', 'Fresh parsley'],
    instructions: ['Cook linguine in salted water until al dente. Reserve 1 cup pasta water.', 'Heat olive oil in a large skillet over medium-high. Season shrimp, cook 1–2 minutes per side. Remove.', 'Add butter and garlic to pan, cook 1 minute. Add wine, simmer 2 minutes.', 'Add pasta, shrimp, lemon juice, and a splash of pasta water. Toss vigorously.', 'Season, add red pepper flakes, finish with parsley.'],
  },
  {
    title: 'Cacio e Pepe',
    description: 'Rome\'s most iconic pasta — just cheese, pepper, and pasta water transformed into a silky, impossibly creamy sauce.',
    category: 'Pasta', emoji: '🍝', color: '#8a6840',
    contains: ['gluten', 'dairy'],
    prep_time: 5, cook_time: 15, servings: 4,
    tags: ['pasta', 'italian', 'vegetarian', 'quick', 'classic'],
    ingredients: ['400g spaghetti or tonnarelli', '150g Pecorino Romano, finely grated', '50g Parmesan, finely grated', '2 tsp coarsely ground black pepper', 'Salt for pasta water'],
    instructions: ['Cook pasta in well-salted (but not too salty) water. Reserve 2 cups pasta water before draining.', 'Toast black pepper in a large dry skillet 1 minute. Add 1/2 cup pasta water, bring to a simmer.', 'Add drained pasta and toss vigorously. Remove from heat.', 'Add cheese in three additions, tossing constantly and adding pasta water gradually to create a creamy, smooth sauce.', 'Serve immediately with extra Pecorino and pepper.'],
  },
  {
    title: 'Pasta all\'Amatriciana',
    description: 'Guanciale, tomatoes, and Pecorino — this Roman classic is the proof that great food needs very few ingredients.',
    category: 'Pasta', emoji: '🍝', color: '#8a6840',
    contains: ['gluten', 'dairy', 'meat', 'pork'],
    prep_time: 10, cook_time: 25, servings: 4,
    tags: ['pasta', 'italian', 'pork', 'classic', 'tomato'],
    ingredients: ['400g rigatoni or spaghetti', '200g guanciale or pancetta, diced', '1 can (400g) whole San Marzano tomatoes, crushed by hand', '1 small dried red chilli', '100ml dry white wine', '80g Pecorino Romano, grated', 'Black pepper'],
    instructions: ['Cook guanciale in a cold skillet over medium heat until crispy and fat has rendered, about 8 minutes. Add chilli.', 'Add wine and cook 2 minutes. Add tomatoes, simmer 15 minutes until sauce thickens.', 'Cook pasta until 1 minute shy of al dente in heavily salted water. Reserve 1 cup pasta water.', 'Add pasta to sauce, toss over medium heat with splashes of pasta water until sauce clings.', 'Remove from heat, add Pecorino and generous black pepper. Toss and serve.'],
  },
  {
    title: 'Spaghetti Aglio e Olio',
    description: 'Garlic, olive oil, chilli, and parsley — the most beloved 10-ingredient dish in Italy, and yours in 20 minutes.',
    category: 'Pasta', emoji: '🍝', color: '#8a6840',
    contains: ['gluten', 'dairy'],
    prep_time: 5, cook_time: 15, servings: 4,
    tags: ['pasta', 'italian', 'vegetarian', 'quick', 'garlic'],
    ingredients: ['400g spaghetti', '8 garlic cloves, thinly sliced', '80ml good olive oil', '1 tsp red pepper flakes', 'Large handful fresh parsley, chopped', 'Salt, Parmesan to serve'],
    instructions: ['Cook spaghetti in generously salted water. Reserve 1½ cups pasta water before draining.', 'While pasta cooks, heat olive oil over medium-low. Add garlic and cook slowly, stirring, until golden (not brown) — about 5 minutes. Add red pepper flakes.', 'Add ½ cup pasta water to the garlic oil, bring to a simmer.', 'Add drained spaghetti, toss vigorously with more pasta water until a creamy emulsified sauce coats the pasta.', 'Remove from heat, toss in parsley. Serve immediately.'],
  },
  {
    title: 'Korean Beef Rice Bowl',
    description: 'Sweet, savory, slightly spicy ground beef over rice with a fried egg — a 20-minute dinner that never gets old.',
    category: 'Beef', emoji: '🥩', color: '#7a3a3a',
    contains: ['meat', 'eggs'],
    prep_time: 5, cook_time: 15, servings: 4,
    tags: ['beef', 'korean', 'rice bowl', 'quick', 'weeknight'],
    ingredients: ['500g ground beef', '4 garlic cloves, minced', '1 tbsp fresh ginger, grated', '3 tbsp soy sauce', '2 tbsp brown sugar', '1 tbsp sesame oil', '1 tsp gochujang or sriracha', 'Steamed rice, sesame seeds, scallions, fried eggs to serve'],
    instructions: ['Brown ground beef in a large skillet over high heat, breaking it apart. Drain excess fat.', 'Add garlic and ginger, cook 1 minute.', 'Mix soy sauce, brown sugar, sesame oil, and gochujang. Pour over beef.', 'Toss and cook 2 minutes until sauce caramelizes and coats the beef.', 'Serve over rice, top with sesame seeds, sliced scallions, and a fried egg.'],
  },
  {
    title: 'Classic Beef Tacos',
    description: 'Properly seasoned ground beef, quick-pickled onions, and all the toppings — taco night done right.',
    category: 'Beef', emoji: '🥩', color: '#7a3a3a',
    contains: ['meat', 'dairy', 'gluten'],
    prep_time: 15, cook_time: 15, servings: 4,
    tags: ['beef', 'tacos', 'mexican', 'weeknight', 'family'],
    ingredients: ['500g ground beef (80/20)', '1 tbsp chilli powder', '1 tsp cumin', '1 tsp garlic powder', '1/2 tsp oregano', 'Salt, pepper', '8–12 corn or flour tortillas', 'Toppings: sour cream, salsa, shredded cheese, avocado, lime, coriander', 'Quick pickled onion: 1 red onion, 100ml red wine vinegar, 1 tsp sugar, pinch of salt'],
    instructions: ['Quick-pickle onions: combine sliced onion, vinegar, sugar, and salt. Leave 15 minutes.', 'Brown beef over high heat, breaking apart. Season with chilli powder, cumin, garlic powder, oregano, salt and pepper.', 'Cook 8–10 minutes until well browned. Add a splash of water and simmer 2 minutes.', 'Warm tortillas directly on the gas flame or in a dry pan.', 'Assemble tacos with beef, pickled onions, and desired toppings. Squeeze of lime over everything.'],
  },
  {
    title: 'Sunday Beef Bolognese',
    description: 'A slow-simmered ragu that fills the house with the best smell imaginable. Freezes perfectly.',
    category: 'Beef', emoji: '🥩', color: '#7a3a3a',
    contains: ['meat', 'pork', 'gluten', 'dairy'],
    prep_time: 20, cook_time: 120, servings: 6,
    tags: ['beef', 'pasta', 'italian', 'slow cook', 'bolognese'],
    ingredients: ['500g ground beef', '150g pancetta, diced', '1 onion, finely diced', '2 carrots, finely diced', '2 celery stalks, finely diced', '4 garlic cloves, minced', '150ml whole milk', '150ml dry white wine', '2 cans (400g each) crushed tomatoes', '2 tbsp tomato paste', 'Fresh pasta or tagliatelle, Parmesan to serve'],
    instructions: ['Cook pancetta in a large Dutch oven until crispy. Add onion, carrot, and celery — cook 10 minutes until very soft.', 'Add garlic, cook 2 minutes. Add beef and cook until no pink remains.', 'Add milk, simmer until absorbed (5 mins). Add wine, simmer until absorbed.', 'Stir in crushed tomatoes and tomato paste. Season well. Simmer on the lowest heat 1.5–2 hours, stirring occasionally.', 'Adjust seasoning. Toss with fresh pasta and lots of Parmesan.'],
  },
  {
    title: 'Honey Mustard Pork Tenderloin',
    description: 'Juicy, quick-cooking pork tenderloin with a golden honey-mustard crust — an elegant 30-minute weeknight dinner.',
    category: 'Pork', emoji: '🐷', color: '#9a5060',
    contains: ['meat', 'pork'],
    prep_time: 10, cook_time: 25, servings: 4,
    tags: ['pork', 'tenderloin', 'honey', 'mustard', 'weeknight'],
    ingredients: ['2 pork tenderloins (about 500g each)', '3 tbsp Dijon mustard', '2 tbsp whole grain mustard', '2 tbsp honey', '3 garlic cloves, minced', '1 tbsp olive oil', '1 tsp fresh thyme', 'Salt and pepper'],
    instructions: ['Preheat oven to 400°F / 200°C. Season pork generously with salt and pepper.', 'Mix both mustards, honey, garlic, and thyme.', 'Heat oil in an oven-safe skillet over high heat. Sear tenderloins 2 minutes per side until golden.', 'Brush generously with mustard glaze. Transfer to oven and roast 15–18 minutes until internal temp reaches 145°F.', 'Rest 5 minutes before slicing. Serve with roasted vegetables or mashed potatoes.'],
  },
  {
    title: 'Sheet Pan Sausage & Vegetables',
    description: 'Everything on one pan, into the oven — crispy sausages, caramelized vegetables, almost zero clean-up.',
    category: 'Pork', emoji: '🐷', color: '#9a5060',
    contains: ['meat', 'pork'],
    prep_time: 10, cook_time: 35, servings: 4,
    tags: ['pork', 'sausage', 'sheet pan', 'easy', 'weeknight'],
    ingredients: ['6–8 pork sausages (Italian or bratwurst)', '2 bell peppers, chunked', '1 red onion, wedged', '2 courgettes, chunked', '250g cherry tomatoes', '4 garlic cloves, unpeeled', '3 tbsp olive oil', '1 tsp fennel seeds', '1 tsp dried oregano', 'Salt and pepper'],
    instructions: ['Preheat oven to 425°F / 220°C.', 'Toss all vegetables with olive oil, fennel seeds, oregano, salt, and pepper. Spread on a large sheet pan.', 'Nestle sausages among the vegetables.', 'Roast 30–35 minutes, turning once halfway, until sausages are golden and vegetables are caramelized.', 'Serve straight from the pan. Squeeze the roasted garlic cloves over everything.'],
  },
]

const RESTRICTION_EXCLUDES: Record<string, string[]> = {
  'vegetarian': ['meat', 'fish', 'shellfish'],
  'vegan':      ['meat', 'fish', 'shellfish', 'dairy', 'eggs'],
  'gluten-free': ['gluten'],
  'dairy-free':  ['dairy'],
  'nut-free':    ['nuts'],
  'halal':       ['pork'],
  'kosher':      ['pork', 'shellfish'],
}

function filterRecipes(dietary: string[], dislikes: string[]): StarterRecipe[] {
  const forbidden = new Set(dietary.flatMap(d => RESTRICTION_EXCLUDES[d] ?? []))
  return RECIPES.filter(recipe => {
    if (recipe.contains.some(c => forbidden.has(c))) return false
    const haystack = `${recipe.title} ${recipe.description} ${recipe.ingredients.join(' ')}`.toLowerCase()
    return !dislikes.some(d => haystack.includes(d.toLowerCase()))
  })
}

export default function StarterRecipePicker({
  dietaryRestrictions = [],
  dislikes = [],
}: {
  dietaryRestrictions?: string[]
  dislikes?: string[]
}) {
  const filtered = filterRecipes(dietaryRestrictions, dislikes)
  const [index, setIndex] = useState(0)
  const [saved, setSaved] = useState(0)
  const [visible, setVisible] = useState(false)
  const [done, setDone] = useState(false)
  const [exiting, setExiting] = useState<null | 'left' | 'right'>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (
      localStorage.getItem('tour-complete') &&
      !localStorage.getItem('starter-done')
    ) {
      if (filtered.length === 0) {
        localStorage.setItem('starter-done', '1')
      } else {
        setVisible(true)
      }
    }
  }, [filtered.length])

  function finish() {
    localStorage.setItem('starter-done', '1')
    setDone(true)
  }

  function advance(direction: 'left' | 'right') {
    setExiting(direction)
    setTimeout(() => {
      setExiting(null)
      if (index >= filtered.length - 1) {
        finish()
      } else {
        setIndex(i => i + 1)
      }
    }, 280)
  }

  async function accept() {
    if (saving) return
    setSaving(true)
    const r = RECIPES[index]
    await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: r.title, description: r.description,
        ingredients: r.ingredients, instructions: r.instructions,
        prep_time: r.prep_time, cook_time: r.cook_time,
        servings: r.servings, tags: r.tags,
      }),
    }).catch(() => {})
    setSaved(s => s + 1)
    setSaving(false)
    advance('right')
  }

  function reject() {
    advance('left')
  }

  if (!visible) return null

  if (done) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(42,30,16,0.65)',
        backdropFilter: 'blur(2px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}>
        <div style={{
          background: 'var(--parchment)', borderRadius: 16,
          padding: '2.5rem', textAlign: 'center',
          maxWidth: 380, width: '100%',
          boxShadow: '0 24px 64px rgba(42,30,16,0.3)',
          border: '1px solid rgba(200,145,26,0.25)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🥧</div>
          <h2 className="serif" style={{ fontSize: '1.6rem', fontWeight: 300, marginBottom: '0.5rem' }}>
            You&apos;re all set
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {saved > 0
              ? `${saved} recipe${saved > 1 ? 's' : ''} added to your Recipe Box. Time to build a plan.`
              : 'Your Recipe Box is ready whenever you are.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={() => { setVisible(false); window.location.href = '/recipes' }}
              style={{ fontSize: '0.9rem', padding: '0.75rem' }}>
              <BookOpen size={14} /> See your Recipe Box
            </button>
            <button className="btn-secondary" onClick={() => setVisible(false)}
              style={{ fontSize: '0.85rem', padding: '0.65rem' }}>
              Go to dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const recipe = filtered[index]

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(42,30,16,0.65)',
      backdropFilter: 'blur(2px)',
      zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
    }}>
      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 400,
        transform: exiting === 'right' ? 'translateX(80px)' : exiting === 'left' ? 'translateX(-80px)' : 'translateX(0)',
        opacity: exiting ? 0 : 1,
        transition: 'transform 0.28s ease, opacity 0.28s ease',
      }}>
        <div style={{
          background: 'var(--parchment)',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(42,30,16,0.35)',
          border: '1px solid rgba(200,145,26,0.2)',
        }}>
          {/* Category header */}
          <div style={{
            background: recipe.color,
            padding: '1rem 1.4rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span style={{ fontSize: '1.2rem' }}>{recipe.emoji}</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)' }}>
              {recipe.category}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}>
              {index + 1} / {filtered.length}
            </span>
          </div>

          {/* Body */}
          <div style={{ padding: '1.5rem 1.4rem' }}>
            <h2 className="serif" style={{ fontSize: '1.65rem', fontWeight: 300, lineHeight: 1.15, marginBottom: '0.65rem', color: 'var(--ink)' }}>
              {recipe.title}
            </h2>

            <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', lineHeight: 1.7, marginBottom: '1rem' }}>
              {recipe.description}
            </p>

            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.78rem', color: 'var(--ink-light)', marginBottom: '1.4rem', flexWrap: 'wrap' }}>
              <span>🕐 {recipe.prep_time + recipe.cook_time}m total</span>
              <span>👤 Serves {recipe.servings}</span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: 'var(--stone-dark)', borderRadius: 2, marginBottom: '1.4rem' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: recipe.color,
                width: `${((index + 1) / filtered.length) * 100}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={reject}
                style={{
                  flex: 1, padding: '0.9rem',
                  background: 'var(--stone)',
                  border: '1.5px solid var(--stone-dark)',
                  borderRadius: 12, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
                  transition: 'background 0.15s',
                  color: 'var(--ink-light)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#d8c8a8')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--stone)')}>
                <ThumbsDown size={22} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Skip</span>
              </button>

              <button
                onClick={accept}
                disabled={saving}
                style={{
                  flex: 1.4, padding: '0.9rem',
                  background: recipe.color,
                  border: 'none',
                  borderRadius: 12, cursor: saving ? 'default' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
                  opacity: saving ? 0.7 : 1,
                  transition: 'opacity 0.15s, filter 0.15s',
                  color: 'white',
                }}
                onMouseEnter={e => !saving && ((e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.filter = 'none')}>
                <ThumbsUp size={22} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {saving ? 'Saving…' : 'Save it'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Saved count */}
        {saved > 0 && (
          <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.78rem', color: 'rgba(253,246,232,0.8)' }}>
            {saved} recipe{saved > 1 ? 's' : ''} saved so far ✓
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <button onClick={finish} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(253,246,232,0.55)', fontSize: '0.75rem',
          }}>
            I&apos;m done for now
          </button>
        </div>
      </div>
    </div>
  )
}
