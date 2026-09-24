import { metrics } from '../data'
import { MetricIcon } from './Icons'
import { Reveal } from './Reveal'

export function FeatureTiles() {
  return (
    <section className="band band--obsidian" id="features" aria-labelledby="features-title">
      <div className="container">
        <Reveal className="band__header">
          <h2 id="features-title" className="section-title">Cada detalle, bajo el foco.</h2>
        </Reveal>
        <ul className="tile-grid">
          {metrics.map((m) => (
            <li key={m.stat}>
              <Reveal className="tile">
                <div className="tile__visual">
                  <MetricIcon icon={m.icon} />
                </div>
                {m.isNew && <span className="new-marker">Nuevo</span>}
                <p className={`tile__stat${m.accent === 'yellow' ? ' tile__stat--yellow' : ''}`}>{m.stat}</p>
                <p className="tile__label">{m.label}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
