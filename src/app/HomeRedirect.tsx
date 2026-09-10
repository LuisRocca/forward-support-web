import { Navigate } from 'react-router'
import { useSession } from '../features/auth/useSession.ts'
import { EmptyState } from '../shared/ui/states.tsx'
import { firstAllowedPath } from './navigation.ts'

/** Lleva a la primera vista permitida: raíz, rutas desconocidas y accesos sin permiso. */
export function HomeRedirect() {
  const { user } = useSession()
  const target = firstAllowedPath(user?.permissions ?? [])

  if (!target) {
    return <EmptyState label="Tu cuenta no tiene acceso a ninguna vista. Contacta con un administrador." />
  }

  return <Navigate to={target} replace />
}
