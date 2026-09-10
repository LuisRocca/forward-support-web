import type { RoleCode, UserStatus } from '../../shared/api/contract.ts'
import type { BadgeTone } from '../../shared/ui/Badge.tsx'

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: 'Activo',
  blocked: 'Bloqueado',
  inactive: 'Inactivo',
}

export const ROLE_LABEL: Record<RoleCode, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  agent: 'Agente',
}

const STATUS_TONE: Record<UserStatus, BadgeTone> = {
  active: 'success',
  blocked: 'danger',
  inactive: 'neutral',
}

export function userStatusTone(status: UserStatus): BadgeTone {
  return STATUS_TONE[status]
}
