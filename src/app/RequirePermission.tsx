import { Outlet } from 'react-router'
import type { Permission } from '../shared/api/contract.ts'
import { useSession } from '../features/auth/useSession.ts'
import { HomeRedirect } from './HomeRedirect.tsx'
import { hasAnyPermission } from './navigation.ts'

/**
 * Sin el permiso, a la primera vista permitida en lugar de a una pantalla de
 * error. Es solo interfaz: las vistas mantienen su manejo del 403.
 */
export function RequirePermission({ anyOf }: { anyOf: readonly Permission[] }) {
  const { user } = useSession()

  if (!hasAnyPermission(user?.permissions ?? [], anyOf)) {
    return <HomeRedirect />
  }

  return <Outlet />
}
