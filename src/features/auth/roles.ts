import type { AuthenticatedUser, RoleCode } from '../../shared/api/contract.ts'

/**
 * Solo decide qué se pinta: el servidor vuelve a comprobar el permiso en cada
 * endpoint. Ocultar un botón no es autorización.
 */
export function hasAnyRole(
  user: AuthenticatedUser | null,
  roles: RoleCode[],
): boolean {
  return user?.roles.some((role) => roles.includes(role)) ?? false
}
