import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '../../features/auth/useSession.ts'
import { paths } from './paths.ts'

/** Deja pasar solo con sesión; si no, manda al login recordando el destino. */
export function ProtectedRoute() {
  const { isAuthenticated } = useSession()
  const location = useLocation()

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}`
    return <Navigate to={paths.login} state={{ from }} replace />
  }

  return <Outlet />
}
