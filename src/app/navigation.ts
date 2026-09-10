import type { Permission } from '../shared/api/contract.ts'
import { paths } from '../shared/routing/paths.ts'

/**
 * Qué permiso abre cada área de la aplicación. Única fuente para la barra de
 * navegación y para los guards de ruta, así nunca discrepan.
 *
 * Los permisos son el enum del contrato, así un nombre mal escrito no compila.
 * Esto decide qué se pinta; la autoridad sigue siendo el servidor, que
 * responde 403 igualmente.
 */
export const AREA_PERMISSIONS = {
  dashboard: ['metrics:read'],
  tickets: ['ticket:read:all', 'ticket:read:own'],
  ticketCreate: ['ticket:create'],
  admin: ['user:block'],
} as const satisfies Record<string, readonly Permission[]>

export type NavIconName = 'dashboard' | 'tickets' | 'new' | 'admin'

export interface NavEntry {
  to: string
  label: string
  icon: NavIconName
  /** Basta con tener uno de estos permisos. */
  anyOf: readonly Permission[]
}

export const NAV_ENTRIES: readonly NavEntry[] = [
  { to: paths.dashboard, label: 'Dashboard', icon: 'dashboard', anyOf: AREA_PERMISSIONS.dashboard },
  { to: paths.tickets, label: 'Tickets', icon: 'tickets', anyOf: AREA_PERMISSIONS.tickets },
  { to: paths.ticketNew, label: 'Nuevo ticket', icon: 'new', anyOf: AREA_PERMISSIONS.ticketCreate },
  { to: '/admin', label: 'Administración', icon: 'admin', anyOf: AREA_PERMISSIONS.admin },
]

export function hasAnyPermission(
  permissions: readonly Permission[],
  anyOf: readonly Permission[],
): boolean {
  return anyOf.some((permission) => permissions.includes(permission))
}

export function visibleEntries(permissions: readonly Permission[]): NavEntry[] {
  return NAV_ENTRIES.filter((entry) => hasAnyPermission(permissions, entry.anyOf))
}

/** Primera vista a la que el usuario tiene acceso, o null si no tiene ninguna. */
export function firstAllowedPath(permissions: readonly Permission[]): string | null {
  return visibleEntries(permissions)[0]?.to ?? null
}

/**
 * Entrada activa para una ruta. "Tickets" sigue activo en el detalle de un
 * ticket, pero no en "Nuevo ticket", que tiene su propia entrada.
 */
export function isEntryActive(to: string, pathname: string): boolean {
  if (to === paths.tickets) {
    return pathname === to || (pathname.startsWith(`${to}/`) && pathname !== paths.ticketNew)
  }
  return pathname === to || pathname.startsWith(`${to}/`)
}
