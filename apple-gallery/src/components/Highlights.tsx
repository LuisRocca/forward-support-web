import { useEffect, useState } from 'react'
import { slides, type Slide } from '../data'
import { PlayPause } from './Icons'
import { Reveal } from './Reveal'

const INTERVAL_MS = 6000

export function Highlights() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [playing])

  return (
    <section className="band band--carbon" id="highlights" aria-labelledby="highlights-title">
      <div className="container">
        <Reveal className="band__header">
          <h2 id="highlights-title" className="section-title">Destacados.</h2>
          <a href="#features" className="link-electric">Ver el film ›</a>
        </Reveal>

        <Reveal>
          <div className="media-frame" aria-roledescription="carrusel" aria-label="Destacados del producto">
            {slides.map((slide, i) => (
              <figure
                key={slide.id}
                className={`media-frame__slide${i === index ? ' is-active' : ''}`}
                aria-hidden={i !== index}
                aria-roledescription="diapositiva"
              >
                <Scene scene={slide.scene} />
                <figcaption className="media-frame__caption">
                  <span className="media-frame__eyebrow">{slide.eyebrow}</span>
                  <span className="media-frame__title">{slide.title}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="pager" role="group" aria-label="Paginación">
            <div className="pager__dots">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`pager__dot${i === index ? ' is-active' : ''}`}
                  aria-label={`Ir a ${slide.eyebrow}`}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => setIndex(i)}
                >
                  {i === index && playing && <span className="pager__progress" style={{ animationDuration: `${INTERVAL_MS}ms` }} />}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="pager__toggle"
              aria-label={playing ? 'Pausar' : 'Reproducir'}
              onClick={() => setPlaying((p) => !p)}
            >
              <PlayPause playing={playing} />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** Escenas cinematográficas en SVG, en lugar de video. */
function Scene({ scene }: { scene: Slide['scene'] }) {
  if (scene === 'lens') {
    return (
      <svg className="scene" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="s-lens-bg" cx="0.65" cy="0.45" r="0.7">
            <stop offset="0" stopColor="#3a0e18" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <radialGradient id="s-lens-glass" cx="0.4" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#3b4f8c" />
            <stop offset="0.35" stopColor="#101528" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
        </defs>
        <rect width="1000" height="560" fill="url(#s-lens-bg)" />
        <circle cx="650" cy="260" r="230" fill="#12040a" stroke="#6b2533" strokeWidth="6" />
        <circle cx="650" cy="260" r="190" fill="#050507" stroke="#2a2a2c" strokeWidth="14" />
        <circle cx="650" cy="260" r="140" fill="url(#s-lens-glass)" />
        <circle cx="650" cy="260" r="58" fill="#020204" />
        <ellipse cx="600" cy="205" rx="42" ry="24" fill="#fff" opacity="0.28" transform="rotate(-35 600 205)" />
        <circle cx="712" cy="318" r="9" fill="#9fb3ff" opacity="0.4" />
        <text x="650" y="520" textAnchor="middle" fill="#ffd500" fontSize="22" fontWeight="600" letterSpacing="1">120 mm · ƒ/2.8 · 5x</text>
      </svg>
    )
  }
  if (scene === 'chip') {
    return (
      <svg className="scene" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="s-chip-bg" cx="0.5" cy="0.5" r="0.6">
            <stop offset="0" stopColor="#10213d" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <linearGradient id="s-chip-face" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3a3a3c" />
            <stop offset="1" stopColor="#0e0e0e" />
          </linearGradient>
        </defs>
        <rect width="1000" height="560" fill="url(#s-chip-bg)" />
        {Array.from({ length: 14 }, (_, i) => (
          <g key={i} stroke="#2997ff" strokeOpacity={0.15 + (i % 4) * 0.08} strokeWidth="2">
            <path d={`M${120 + i * 55} 0V130M${120 + i * 55} 430V560`} />
          </g>
        ))}
        <rect x="360" y="130" width="280" height="300" rx="36" fill="url(#s-chip-face)" stroke="#6e6e73" />
        <rect x="376" y="146" width="248" height="268" rx="26" fill="none" stroke="#333336" />
        <text x="500" y="300" textAnchor="middle" fill="#f5f5f7" fontSize="64" fontWeight="600" letterSpacing="-1">N5 Pro</text>
      </svg>
    )
  }
  return (
    <svg className="scene" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="s-night-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#02030a" />
          <stop offset="1" stopColor="#1a0a1e" />
        </linearGradient>
      </defs>
      <rect width="1000" height="560" fill="url(#s-night-sky)" />
      {Array.from({ length: 70 }, (_, i) => (
        <circle key={i} cx={(i * 137) % 1000} cy={(i * 71) % 300} r={i % 7 === 0 ? 1.8 : 0.9} fill="#f5f5f7" opacity={0.3 + (i % 5) * 0.12} />
      ))}
      <circle cx="780" cy="120" r="46" fill="#f5f5f7" opacity="0.9" />
      <circle cx="800" cy="110" r="46" fill="#02030a" opacity="0.9" />
      <path d="M0 440 120 360l90 50 130-110 110 90 140-130 120 100 120-60 170 110v140H0Z" fill="#07070a" />
      <path d="M0 500 160 430l140 40 180-70 160 60 160-50 200 70v120H0Z" fill="#000" />
    </svg>
  )
}
