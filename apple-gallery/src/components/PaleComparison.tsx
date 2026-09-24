import { models } from '../data'
import { Reveal } from './Reveal'

export function PaleComparison() {
  return (
    <section className="band band--porcelain" id="models" aria-labelledby="models-title">
      <div className="container">
        <Reveal className="band__header">
          <h2 id="models-title" className="section-title section-title--dark">¿Cuál es el tuyo?</h2>
          <a href="#compare" className="link-cobalt">Comparar todos los modelos ›</a>
        </Reveal>
        <ul className="pale-grid">
          {models.map((m) => (
            <li key={m.id}>
              <Reveal className="pale-card">
                <ul className="swatches" aria-label="Acabados">
                  {m.finishes.map((f) => (
                    <li key={f} className="swatch" style={{ background: f }} />
                  ))}
                </ul>
                {m.isNew && <span className="new-marker">Nuevo</span>}
                <h3 className="pale-card__name">{m.name}</h3>
                <p className="pale-card__tagline">{m.tagline}</p>
                <p className="pale-card__price">{m.price}</p>
                <div className="pale-card__actions">
                  <a href="#buy" className="pill pill--blue">Comprar</a>
                  <a href="#features" className="link-cobalt">Más información ›</a>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
