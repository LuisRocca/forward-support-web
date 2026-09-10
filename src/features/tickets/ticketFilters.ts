import { ticketPrioritySchema, ticketStatusSchema } from '../../shared/api/contract.ts'
import type { TicketListParams, TicketSort } from './ticketsApi.ts'

const SORTS: TicketSort[] = [
  '-createdAt',
  'createdAt',
  '-lastActivityAt',
  'lastActivityAt',
  '-priority',
  'priority',
]

export const SORT_LABEL: Record<TicketSort, string> = {
  '-createdAt': 'Más recientes primero',
  createdAt: 'Más antiguos primero',
  '-lastActivityAt': 'Actividad más reciente',
  lastActivityAt: 'Sin actividad hace más tiempo',
  '-priority': 'Prioridad más alta',
  priority: 'Prioridad más baja',
}

export const SORT_OPTIONS = SORTS

/** Horas que definen "estancado", según el enunciado y la query del supervisor. */
export const STALE_HOURS = 48

/**
 * Los filtros viven en la URL: así una búsqueda se puede compartir y el botón
 * de atrás funciona. Todo lo que llega de la URL es entrada externa y se
 * valida contra el contrato antes de mandarlo a la API.
 */
export function paramsFromSearch(search: URLSearchParams): TicketListParams {
  const params: TicketListParams = {}

  // Se cruzan los valores del contrato con los de la URL: así el resultado ya
  // sale tipado y no hay que forzar el tipo de algo que viene de fuera.
  const status = ticketStatusSchema.options.filter((value) =>
    search.getAll('status').includes(value),
  )
  if (status.length > 0) params.status = status

  const priority = ticketPrioritySchema.options.filter((value) =>
    search.getAll('priority').includes(value),
  )
  if (priority.length > 0) params.priority = priority

  const query = search.get('search')?.trim()
  if (query) params.search = query

  if (search.get('stale') === '1') params.staleHours = STALE_HOURS
  if (search.get('unassigned') === '1') params.assignedToUserId = 'unassigned'

  const sort = search.get('sort')
  if (isSort(sort)) params.sort = sort

  return params
}

function isSort(value: string | null): value is TicketSort {
  return value !== null && SORTS.some((sort) => sort === value)
}
