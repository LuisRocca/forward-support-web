import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '../../features/auth/useSession.ts'
import { FullPageLoader } from '../layout/FullPageLoader.tsx'
import { paths } from './paths.ts'

/** Con sesión abierta, el login no tiene sentido: al destino previo o al inicio. */
export function PublicOnlyRoute() {
  const { status } = useSession()
  const location = useLocation()

  if (status === 'loading') {
    return <FullPageLoader label="Comprobando sesión…" />
  }

  if (status === 'authenticated') {
    return <Navigate to={redirectTarget(location.state)} replace />
  }

  return <Outlet />
}

/** El estado de navegación llega sin tipar: solo se acepta si es lo esperado. */
function redirectTarget(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state) {
    const { from } = state
    if (typeof from === 'string') return from
  }
  // El inicio redirige a la primera vista que el usuario tiene permitida.
  return paths.home
}
