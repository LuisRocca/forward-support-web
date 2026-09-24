import type { Metric } from '../data'

type IconProps = { size?: number }

export function BrandMark({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1.75a6.25 6.25 0 0 0 0 12.5 4.5 4.5 0 0 1 0-12.5Z" fill="currentColor" />
    </svg>
  )
}

export function SearchIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="6.75" cy="6.75" r="5" />
      <path d="m10.5 10.5 4 4" strokeLinecap="round" />
    </svg>
  )
}

export function BagIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="2" y="5" width="12" height="10" rx="2" />
      <path d="M5.5 5V4a2.5 2.5 0 0 1 5 0v1" />
    </svg>
  )
}

export function ChevronDown({ size = 12 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="m2.5 4.5 3.5 3.5 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PlayPause({ playing }: { playing: boolean }) {
  return playing ? (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="currentColor">
      <rect x="2.5" y="2" width="2.5" height="8" rx="0.75" />
      <rect x="7" y="2" width="2.5" height="8" rx="0.75" />
    </svg>
  ) : (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="currentColor">
      <path d="M3 1.8v8.4a.6.6 0 0 0 .9.5l6.8-4.2a.6.6 0 0 0 0-1L3.9 1.3a.6.6 0 0 0-.9.5Z" />
    </svg>
  )
}

/** Glifos técnicos monocromos; la batería verde y el amarillo de cámara son las únicas señales de color. */
export function MetricIcon({ icon }: { icon: Metric['icon'] }) {
  const common = { width: 64, height: 64, viewBox: '0 0 64 64', 'aria-hidden': true, fill: 'none' } as const
  switch (icon) {
    case 'chip':
      return (
        <svg {...common}>
          <defs>
            <linearGradient id="chip-face" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3a3a3c" />
              <stop offset="1" stopColor="#111" />
            </linearGradient>
          </defs>
          {[14, 22, 30, 38, 46].map((p) => (
            <g key={p} stroke="#6e6e73" strokeWidth="2" strokeLinecap="round">
              <path d={`M${p + 2} 6v6M${p + 2} 52v6M6 ${p + 2}h6M52 ${p + 2}h6`} />
            </g>
          ))}
          <rect x="12" y="12" width="40" height="40" rx="7" fill="url(#chip-face)" stroke="#86868b" strokeWidth="1" />
          <text x="32" y="36" textAnchor="middle" fill="#f5f5f7" fontSize="10" fontWeight="600" fontFamily="inherit">N5</text>
        </svg>
      )
    case 'battery':
      return (
        <svg {...common}>
          <rect x="6" y="20" width="46" height="24" rx="7" stroke="#86868b" strokeWidth="2" />
          <rect x="10" y="24" width="34" height="16" rx="4" fill="#30d158" />
          <path d="M55 28v8" stroke="#86868b" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    case 'camera':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="24" stroke="#6e6e73" strokeWidth="2" />
          <circle cx="32" cy="32" r="16" fill="#0b0b0d" stroke="#333336" strokeWidth="4" />
          <circle cx="32" cy="32" r="7" fill="#1b2340" />
          <circle cx="28" cy="28" r="2.2" fill="#f5f5f7" opacity="0.7" />
          <path d="M8 32h6M50 32h6" stroke="#ffd500" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'display':
      return (
        <svg {...common}>
          <rect x="18" y="4" width="28" height="56" rx="8" stroke="#86868b" strokeWidth="2" />
          <rect x="27" y="8" width="10" height="3" rx="1.5" fill="#86868b" />
          <path d="M23 50 41 18" stroke="#f5f5f7" strokeWidth="1.5" opacity="0.5" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M32 6 52 13v17c0 13-8.5 22.5-20 28-11.5-5.5-20-15-20-28V13l20-7Z" stroke="#86868b" strokeWidth="2" />
          <path d="m23 32 6 6 12-13" stroke="#f5f5f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'button':
      return (
        <svg {...common}>
          <rect x="22" y="4" width="22" height="56" rx="7" stroke="#6e6e73" strokeWidth="2" />
          <rect x="42" y="30" width="6" height="14" rx="3" fill="#f5f5f7" />
          <path d="M54 33c2 1.5 2 6.5 0 8M58 30c3.5 3 3.5 11 0 14" stroke="#86868b" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
  }
}
