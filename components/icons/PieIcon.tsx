export default function PieIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Dish/plate base */}
      <ellipse cx="32" cy="52" rx="26" ry="6" fill="#c8911a" opacity="0.25" />
      {/* Pie body */}
      <ellipse cx="32" cy="38" rx="24" ry="8" fill="#c8911a" />
      {/* Pie side */}
      <path d="M8 32 Q8 28 32 28 Q56 28 56 32 L56 38 Q56 42 32 42 Q8 42 8 38 Z" fill="#a87514" />
      {/* Pie top crust */}
      <ellipse cx="32" cy="28" rx="24" ry="8" fill="#e8c06a" />
      {/* Lattice lines */}
      <ellipse cx="32" cy="28" rx="24" ry="8" fill="none" stroke="#c8911a" strokeWidth="1.5" />
      <line x1="20" y1="21" x2="18" y2="35" stroke="#c8911a" strokeWidth="1" opacity="0.6" />
      <line x1="32" y1="20" x2="32" y2="36" stroke="#c8911a" strokeWidth="1" opacity="0.6" />
      <line x1="44" y1="21" x2="46" y2="35" stroke="#c8911a" strokeWidth="1" opacity="0.6" />
      <line x1="12" y1="27" x2="52" y2="29" stroke="#c8911a" strokeWidth="1" opacity="0.4" />
      {/* Crimped edge dots */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((angle, i) => {
        const r = angle * Math.PI / 180
        const x = 32 + 24 * Math.cos(r)
        const y = 28 + 8 * Math.sin(r)
        return <circle key={i} cx={x} cy={y} r="1.5" fill="#a87514" />
      })}
      {/* Steam wisps */}
      <path d="M24 20 Q22 16 24 12 Q26 8 24 4" stroke="#6b5c8a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M32 18 Q30 14 32 10 Q34 6 32 2" stroke="#6b5c8a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M40 20 Q38 16 40 12 Q42 8 40 4" stroke="#6b5c8a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
    </svg>
  )
}
