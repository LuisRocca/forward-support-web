import { useEffect, useState } from 'react'
import { PRODUCT, sectionLinks } from '../data'

/** Barra local fija: resalta la sección visible y se compacta al hacer scroll. */
export function ProductNav() {
  const [active, setActive] = useState<string | null>(null)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 120)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    for (const { id } of sectionLinks) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <div className={`product-nav-wrap${stuck ? ' is-stuck' : ''}`}>
      <nav className="product-nav" aria-label="Producto">
        <a href="#top" className="product-nav__title">{PRODUCT}</a>
        <ul className="product-nav__links">
          {sectionLinks.map(({ id, label }) => (
            <li key={id}>
              <a href={`#${id}`} className={`product-nav__link${active === id ? ' is-active' : ''}`} aria-current={active === id ? 'true' : undefined}>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="product-nav__actions">
          <a href="#models" className="pill pill--outline">Explorar</a>
          <a href="#buy" className="pill pill--blue">Comprar</a>
        </div>
      </nav>
    </div>
  )
}
