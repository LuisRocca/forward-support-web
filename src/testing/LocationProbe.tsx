import { useLocation } from 'react-router'

/** Muestra la URL actual: permite comprobar redirecciones y filtros en la URL. */
export function LocationProbe() {
  const { pathname, search } = useLocation()
  return <output data-testid="location">{`${pathname}${search}`}</output>
}
