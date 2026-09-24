import { BRAND, globalLinks } from '../data'
import { BagIcon, BrandMark, SearchIcon } from './Icons'

export function GlobalNav() {
  return (
    <nav className="global-nav" aria-label="Global">
      <div className="global-nav__inner">
        <a href="#" className="global-nav__glyph" aria-label={BRAND}>
          <BrandMark />
        </a>
        <ul className="global-nav__list">
          {globalLinks.map((label) => (
            <li key={label}>
              <a href="#" className="global-nav__link">{label}</a>
            </li>
          ))}
        </ul>
        <div className="global-nav__utils">
          <button type="button" className="global-nav__glyph" aria-label="Buscar">
            <SearchIcon />
          </button>
          <button type="button" className="global-nav__glyph" aria-label="Bolsa">
            <BagIcon />
          </button>
        </div>
      </div>
    </nav>
  )
}
