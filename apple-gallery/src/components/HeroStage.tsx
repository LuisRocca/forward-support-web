import { PRODUCT } from '../data'
import { PhoneRender } from './PhoneRender'

export function HeroStage() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__media">
        <PhoneRender className="hero__phone" />
      </div>
      <div className="hero__copy">
        <p className="hero__product">{PRODUCT}</p>
        <h1 id="hero-title" className="hero__display">Hecho para la noche.</h1>
        <div className="purchase" id="buy">
          <p className="price-capsule">
            Desde 1.199 € o 49,95 €/mes en 24 meses<sup>*</sup>
          </p>
          <a href="#models" className="pill pill--blue">Comprar</a>
        </div>
      </div>
    </section>
  )
}
