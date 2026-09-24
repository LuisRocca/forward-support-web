/**
 * Render del dispositivo en SVG: aluminio burdeos con luz de contorno,
 * módulo de cámara triple y reflejo especular. Sustituye a la fotografía de producto.
 */
export function PhoneRender({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 520 620" role="img" aria-label="Nocturne One Pro en acabado burdeos, vista trasera">
      <defs>
        <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7a2436" />
          <stop offset="0.45" stopColor="#4a1320" />
          <stop offset="1" stopColor="#1a0509" />
        </linearGradient>
        <linearGradient id="rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c9a2a9" />
          <stop offset="0.2" stopColor="#5a1a27" />
          <stop offset="0.8" stopColor="#2a0a11" />
          <stop offset="1" stopColor="#b38790" />
        </linearGradient>
        <linearGradient id="gloss" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lens" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#2b3a66" />
          <stop offset="0.45" stopColor="#0c0f1c" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#7a2436" stopOpacity="0.45" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="plateau" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5e1b2a" />
          <stop offset="1" stopColor="#2a0a11" />
        </linearGradient>
      </defs>

      <ellipse cx="260" cy="330" rx="250" ry="280" fill="url(#glow)" />

      {/* Cuerpo, ligeramente girado para mostrar el canto */}
      <g transform="rotate(-8 260 310)">
        <rect x="118" y="30" width="284" height="560" rx="58" fill="url(#rim)" />
        <rect x="126" y="37" width="268" height="546" rx="52" fill="url(#body)" />
        <rect x="126" y="37" width="268" height="546" rx="52" fill="url(#gloss)" />

        {/* Meseta de cámara */}
        <rect x="146" y="58" width="146" height="152" rx="36" fill="url(#plateau)" stroke="#8a3446" strokeOpacity="0.5" />
        {([
          [186, 98],
          [186, 170],
          [252, 134],
        ] as const).map(([cx, cy]) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r="30" fill="#140409" stroke="#9c5563" strokeOpacity="0.6" strokeWidth="2" />
            <circle cx={cx} cy={cy} r="22" fill="url(#lens)" />
            <circle cx={cx} cy={cy} r="9" fill="#05060b" />
            <circle cx={cx - 7} cy={cy - 7} r="3.5" fill="#fff" opacity="0.55" />
          </g>
        ))}
        <circle cx="252" cy="82" r="8" fill="#1a0509" stroke="#6b2533" />
        <circle cx="252" cy="186" r="6" fill="#e8dcc0" opacity="0.8" />

        {/* Marca */}
        <g transform="translate(260 340)" opacity="0.55">
          <circle r="22" fill="none" stroke="#e7c9cf" strokeWidth="2.5" />
          <path d="M0-22a22 22 0 0 0 0 44 16 16 0 0 1 0-44Z" fill="#e7c9cf" />
        </g>

        {/* Botones laterales */}
        <rect x="400" y="170" width="6" height="70" rx="3" fill="#6b2533" />
        <rect x="400" y="380" width="6" height="56" rx="3" fill="#6b2533" />
        <rect x="114" y="150" width="6" height="36" rx="3" fill="#6b2533" />
      </g>
    </svg>
  )
}
