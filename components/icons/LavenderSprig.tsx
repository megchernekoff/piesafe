export default function LavenderSprig({
  size = 48,
  opacity = 1,
  className,
}: {
  size?: number
  opacity?: number
  className?: string
}) {
  return (
    <svg width={size} height={size * 2} viewBox="0 0 40 80" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} style={{ opacity }}>
      {/* Main stem */}
      <line x1="20" y1="78" x2="20" y2="20" stroke="#6b7a4a" strokeWidth="2" strokeLinecap="round" />
      {/* Side stems */}
      <line x1="20" y1="60" x2="10" y2="50" stroke="#6b7a4a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="60" x2="30" y2="50" stroke="#6b7a4a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="50" x2="12" y2="42" stroke="#6b7a4a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="50" x2="28" y2="42" stroke="#6b7a4a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="40" x2="13" y2="34" stroke="#6b7a4a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="20" y1="40" x2="27" y2="34" stroke="#6b7a4a" strokeWidth="1.2" strokeLinecap="round" />
      {/* Buds — lower */}
      <ellipse cx="10" cy="48" rx="3.5" ry="5" fill="#7b6b9e" transform="rotate(-15 10 48)" />
      <ellipse cx="30" cy="48" rx="3.5" ry="5" fill="#8b7aae" transform="rotate(15 30 48)" />
      <ellipse cx="12" cy="40" rx="3" ry="4.5" fill="#7b6b9e" transform="rotate(-10 12 40)" />
      <ellipse cx="28" cy="40" rx="3" ry="4.5" fill="#8b7aae" transform="rotate(10 28 40)" />
      <ellipse cx="13" cy="32" rx="2.5" ry="4" fill="#6b5c8a" transform="rotate(-8 13 32)" />
      <ellipse cx="27" cy="32" rx="2.5" ry="4" fill="#7b6b9e" transform="rotate(8 27 32)" />
      {/* Top buds */}
      <ellipse cx="20" cy="30" rx="3" ry="4.5" fill="#6b5c8a" />
      <ellipse cx="20" cy="24" rx="2.5" ry="4" fill="#534670" />
      <ellipse cx="20" cy="19" rx="2" ry="3.5" fill="#534670" />
      {/* Bud tips */}
      <ellipse cx="10" cy="45" rx="1.5" ry="2" fill="#534670" transform="rotate(-15 10 45)" />
      <ellipse cx="30" cy="45" rx="1.5" ry="2" fill="#534670" transform="rotate(15 30 45)" />
      <ellipse cx="12" cy="37" rx="1.2" ry="1.8" fill="#534670" transform="rotate(-10 12 37)" />
      <ellipse cx="28" cy="37" rx="1.2" ry="1.8" fill="#534670" transform="rotate(10 28 37)" />
    </svg>
  )
}
