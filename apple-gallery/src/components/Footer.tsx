import { BRAND } from '../data'

const columns = [
  { title: 'Explorar', links: ['Teléfonos', 'Portátiles', 'Relojes', 'Audio'] },
  { title: 'Comprar', links: ['Tienda online', 'Financiación', 'Plan Renove', 'Estado del pedido'] },
  { title: 'Cuenta', links: ['Gestionar cuenta', 'Nube Nocturne', 'Privacidad'] },
]

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p className="footer__legal">
          * El precio mensual requiere financiación a 24 meses con TAE 0%. Proyecto de demostración: marca, productos y
          cifras son ficticios.
        </p>
        <div className="footer__cols">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="footer__title">{col.title}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="footer__link">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="footer__copy">© {new Date().getFullYear()} {BRAND}. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
