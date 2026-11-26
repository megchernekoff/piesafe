'use client'
import { useEffect, useState } from 'react'

const FACTS = [
  "Honey never spoils — edible honey has been found in 3,000-year-old Egyptian tombs.",
  "Searing meat doesn't actually seal in juices. The browning is a Maillard reaction that creates hundreds of new flavor compounds.",
  "One vanilla bean contains around 300 tiny seeds, each capable of pollinating a flower.",
  "Avocados are technically a berry — and so are bananas, kiwis, and watermelons.",
  "Fresh pasta cooks much faster than dried because it hasn't lost its moisture.",
  "Salt makes water boil slightly slower, but seasons the pasta water throughout cooking — worth it.",
  "Garlic that's been minced and left to sit for 10 minutes before cooking has more allicin — the compound that gives it its bite.",
  "The 'bloom' on chocolate is cocoa butter rising to the surface. It's safe to eat and doesn't affect flavor.",
  "Butter browns at around 250°F because of milk proteins. Ghee (clarified butter) can go much higher since those proteins are removed.",
  "Pasta water is salty for flavor, not to change the boiling temperature — you'd need a huge amount of salt for that.",
  "Resting meat after cooking isn't a myth — the internal temp keeps rising a few degrees and the juices redistribute.",
  "A 'pinch' is technically 1/16 of a teaspoon, but most cooks just use their fingers.",
  "Pineapple contains bromelain, an enzyme that breaks down protein — which is why fresh pineapple prevents gelatin from setting.",
  "The darkest part of a cast iron pan conducts heat the most evenly. That's why they're so good for searing.",
  "Acids like lemon juice and vinegar are added at the end of cooking because heat breaks down their bright flavor.",
  "Mise en place — having everything prepped before you cook — is used in every professional kitchen in the world.",
  "Baking is more precise than cooking because chemical reactions are exacting. A little too much baking soda and things taste soapy.",
  "Caramelization begins at around 320°F for most sugars. That's why you need a hot pan.",
  "Umami — the fifth taste — was only formally identified in 1908 by Japanese chemist Kikunae Ikeda, who was studying kombu seaweed.",
  "Tomatoes are both a fruit botanically and a vegetable legally — the US Supreme Court ruled on this in 1893 (Nix v. Hedden).",
  "Fat carries flavor. Many of the aroma compounds in food are fat-soluble, which is why low-fat versions often taste flat.",
  "Dried herbs are about 3× stronger than fresh — so 1 tablespoon fresh = 1 teaspoon dried.",
  "Overnight cold fermentation makes pizza dough more flavorful because yeast has more time to produce complex flavor compounds.",
  "Stainless steel pans don't rust but food sticks more. Carbon steel rusts but becomes naturally nonstick when seasoned.",
  "Eggs are graded by quality of the white and yolk, not by size or shell color. Shell color just depends on the breed of hen.",
  "Cornstarch thickens at a lower temperature than flour and creates a glossier, clearer sauce.",
  "Brining poultry in salt water before cooking seasons it throughout and helps it retain moisture.",
  "The Maillard reaction and caramelization are different — Maillard involves amino acids and sugars, caramelization is sugars only.",
  "Stock and broth aren't the same. Stock is made with bones (for gelatin and body), broth is made with meat (for flavor).",
  "A ripe tomato stored in the fridge loses up to 15% of its aroma compounds within days — always store at room temperature.",
  "Pasta shapes aren't arbitrary. Ridged shapes catch chunky sauces; flat wide noodles hold creamy ones; thin pasta suits light broths.",
  "Cast iron pans can last over 100 years if cared for — many cooks have pans passed down from their grandparents.",
]

export default function FunFact() {
  const [fact, setFact] = useState('')

  useEffect(() => {
    const today = new Date()
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
    setFact(FACTS[seed % FACTS.length])
  }, [])

  if (!fact) return null

  return (
    <div style={{
      marginTop: '2rem',
      background: 'var(--parchment)',
      border: '1px solid var(--stone-dark)',
      borderRadius: 12,
      padding: '1rem 1.1rem',
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '0.05rem' }}>🥄</span>
      <div>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ochre)', marginBottom: '0.3rem' }}>Did you know</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--ink-light)', lineHeight: 1.65 }}>{fact}</p>
      </div>
    </div>
  )
}
