import { describe, expect, it } from 'vitest'
import type { Permission, RoleCode } from '../shared/api/contract.ts'
import { firstAllowedPath, visibleEntries } from './navigation.ts'

// Permisos efectivos por rol según la tabla del contrato (AuthenticatedUser).
const PERMISSIONS: Record<RoleCode, Permission[]> = {
  admin: [
    'ticket:read:all', 'ticket:read:own', 'ticket:create', 'ticket:update',
    'ticket:assign', 'ticket:status', 'comment:create', 'comment:read:internal',
    'user:read', 'user:block', 'client:read', 'metrics:read',
  ],
  supervisor: [
    'ticket:read:all', 'ticket:create', 'ticket:assign', 'comment:create',
    'comment:read:internal', 'user:read', 'client:read', 'metrics:read',
  ],
  agent: [
    'ticket:read:own', 'ticket:create', 'ticket:update', 'ticket:status',
    'comment:create', 'comment:read:internal', 'client:read',
  ],
}

const labels = (permissions: readonly Permission[]) =>
  visibleEntries(permissions).map((entry) => entry.label)

describe('mapeo permiso → entradas visibles', () => {
  it('admin ve todas las entradas', () => {
    expect(labels(PERMISSIONS.admin)).toEqual([
      'Dashboard', 'Tickets', 'Nuevo ticket', 'Administración',
    ])
    expect(firstAllowedPath(PERMISSIONS.admin)).toBe('/dashboard')
  })

  it('supervisor ve el dashboard pero no Administración', () => {
    expect(labels(PERMISSIONS.supervisor)).toEqual(['Dashboard', 'Tickets', 'Nuevo ticket'])
    expect(firstAllowedPath(PERMISSIONS.supervisor)).toBe('/dashboard')
  })

  it('agente no ve el dashboard y empieza en su listado de tickets', () => {
    expect(labels(PERMISSIONS.agent)).toEqual(['Tickets', 'Nuevo ticket'])
    expect(firstAllowedPath(PERMISSIONS.agent)).toBe('/tickets')
  })

  it('sin permisos no hay entradas ni vista inicial', () => {
    expect(labels([])).toEqual([])
    expect(firstAllowedPath([])).toBeNull()
  })
})
