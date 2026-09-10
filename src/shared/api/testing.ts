import { vi } from 'vitest'
import { ApiError } from './apiError.ts'
import type { TicketDetail } from './contract.ts'

/** Utilidades solo para tests de la capa de datos. */

export type FetchHandler = (url: string, init?: RequestInit) => Response | Promise<Response>

export function mockFetch(handler: FetchHandler) {
  const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
    async (url, init) => await handler(url, init),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

export function json(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

/** Cuerpo RFC 9457 mínimo, como los que manda la API. */
export function problem(status: number, code: string) {
  return { type: 'about:blank', title: `Error ${code}`, status, code, traceId: 'trace-1' }
}

export function authorizationOf(init: RequestInit | undefined): string | null {
  return new Headers(init?.headers).get('Authorization')
}

/** Devuelve el ApiError con el que falla la promesa, o falla el test. */
export async function failure(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise
  } catch (error) {
    if (error instanceof ApiError) return error
    throw error
  }
  throw new Error('Se esperaba que la petición fallara')
}

export const sessionUser = {
  id: 'user-1',
  email: 'agente@forward.test',
  fullName: 'Agente de prueba',
  status: 'active',
  roles: ['agent'],
  createdAt: '2026-01-01T00:00:00Z',
  permissions: [],
}

export function sessionBody(accessToken: string) {
  return { accessToken, expiresIn: 900, user: sessionUser }
}

/** Detalle de ticket válido según el contrato, para tests de componente. */
export const ticketDetailFixture: TicketDetail = {
  id: 'ticket-1',
  code: 'TCK-000001',
  title: 'El informe mensual no carga',
  status: 'open',
  priority: 'medium',
  client: { id: 'client-1', name: 'Acme S.A.', isActive: true },
  category: null,
  assignedTo: null,
  createdAt: '2026-01-01T00:00:00Z',
  lastActivityAt: '2026-01-01T00:00:00Z',
  description: 'El informe se queda cargando indefinidamente.',
  commentCount: 0,
  allowedStatusTransitions: ['in_progress', 'resolved'],
  createdBy: { id: 'user-1', fullName: 'Agente de prueba' },
  reopenedCount: 0,
  reassignmentCount: 0,
  updatedAt: '2026-01-01T00:00:00Z',
}
