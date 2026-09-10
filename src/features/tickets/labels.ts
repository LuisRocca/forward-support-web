import type { TicketPriority, TicketStatus } from '../../shared/api/contract.ts'
import type { BadgeTone } from '../../shared/ui/Badge.tsx'

/** La API devuelve códigos; la interfaz habla español. */
export const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  pending_customer: 'Esperando al cliente',
  resolved: 'Resuelto',
  closed: 'Cerrado',
}

export const PRIORITY_LABEL: Record<TicketPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
}

export const STATUS_ORDER: TicketStatus[] = [
  'open',
  'in_progress',
  'pending_customer',
  'resolved',
  'closed',
]

/**
 * Definición única de ticket abierto (contrato, 2f957d5): `resolved` espera
 * cierre y no requiere acción, así que no cuenta. Estancado y sin asignar son
 * siempre subconjuntos de esto.
 */
export const OPEN_STATUSES: TicketStatus[] = ['open', 'in_progress', 'pending_customer']

export function isOpen(status: TicketStatus): boolean {
  return OPEN_STATUSES.includes(status)
}

export const PRIORITY_ORDER: TicketPriority[] = [
  'low',
  'medium',
  'high',
  'critical',
]

const STATUS_TONE: Record<TicketStatus, BadgeTone> = {
  open: 'info',
  in_progress: 'accent',
  pending_customer: 'neutral',
  resolved: 'success',
  closed: 'neutral',
}

const PRIORITY_TONE: Record<TicketPriority, BadgeTone> = {
  low: 'neutral',
  medium: 'neutral',
  high: 'warning',
  critical: 'danger',
}

export function statusTone(status: TicketStatus): BadgeTone {
  return STATUS_TONE[status]
}

export function priorityTone(priority: TicketPriority): BadgeTone {
  return PRIORITY_TONE[priority]
}
