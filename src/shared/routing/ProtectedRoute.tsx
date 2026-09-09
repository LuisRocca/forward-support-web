import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '../../features/auth/useSession.ts'
import { FullPageLoader } from '../layout/FullPageLoader.tsx'
import { paths } from './paths.ts'

/** Deja pasar solo con sesión; si no, manda al login recordando el destino. */
export function ProtectedRoute() {
  const { status } = useSession()
  const location = useLocation()

  // Mientras se recupera la sesión con la cookie de refresh no se sabe todavía
  // si hay sesión: redirigir aquí echaría al usuario en cada recarga.
  if (status === 'loading') {
    return <FullPageLoader label="Comprobando sesión…" />
  }

  if (status === 'anonymous') {
    const from = `${location.pathname}${location.search}`
    return <Navigate to={paths.login} state={{ from }} replace />
  }

  return <Outlet />
}
