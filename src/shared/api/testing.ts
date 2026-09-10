import { vi } from 'vitest'
import { ApiError } from './apiError.ts'

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
