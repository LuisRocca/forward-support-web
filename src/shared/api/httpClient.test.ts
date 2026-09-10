import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { refreshSession } from '../../features/auth/authApi.ts'
import {
  AUTH_TOKEN_EXPIRED,
  AUTH_TOKEN_REVOKED,
  AUTH_USER_BLOCKED,
  isConcurrencyConflict,
} from './apiError.ts'
import { request, setAccessToken, setSessionHandlers } from './httpClient.ts'
import { authorizationOf, failure, json, mockFetch, problem, sessionBody } from './testing.ts'

const okSchema = z.object({ ok: z.boolean() })

function sessionHandlers(refresh: () => Promise<void> = async () => setAccessToken('new')) {
  const handlers = { refresh: vi.fn(refresh), onSessionEnded: vi.fn() }
  setSessionHandlers(handlers)
  return handlers
}

beforeEach(() => {
  setAccessToken('old')
  setSessionHandlers(null)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('401: la reacción depende del code', () => {
  it('AUTH_TOKEN_EXPIRED refresca y reintenta una vez con el token nuevo', async () => {
    const fetchMock = mockFetch((_url, init) =>
      authorizationOf(init) === 'Bearer old'
        ? json(401, problem(401, AUTH_TOKEN_EXPIRED))
        : json(200, { ok: true }),
    )
    const handlers = sessionHandlers()

    await expect(request('/x', { schema: okSchema })).resolves.toEqual({ ok: true })

    expect(handlers.refresh).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(authorizationOf(fetchMock.mock.calls[1]?.[1])).toBe('Bearer new')
    expect(handlers.onSessionEnded).not.toHaveBeenCalled()
  })

  it('si el reintento vuelve a dar 401 cierra la sesión y no refresca otra vez', async () => {
    const fetchMock = mockFetch(() => json(401, problem(401, AUTH_TOKEN_EXPIRED)))
    const handlers = sessionHandlers()

    const error = await failure(request('/x', { schema: okSchema }))

    expect(error.status).toBe(401)
    expect(handlers.refresh).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(handlers.onSessionEnded).toHaveBeenCalledTimes(1)
  })

  it('si el refresh falla cierra la sesión sin reintentar la petición', async () => {
    const fetchMock = mockFetch(() => json(401, problem(401, AUTH_TOKEN_EXPIRED)))
    const handlers = sessionHandlers(async () => {
      throw new Error('refresh caído')
    })

    await failure(request('/x', { schema: okSchema }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(handlers.onSessionEnded).toHaveBeenCalledTimes(1)
  })

  it.each([AUTH_TOKEN_REVOKED, AUTH_USER_BLOCKED, 'AUTH_TOKEN_INVALID'])(
    '%s cierra la sesión sin refrescar: reintentar sería un bucle',
    async (code) => {
      const fetchMock = mockFetch(() => json(401, problem(401, code)))
      const handlers = sessionHandlers()

      const error = await failure(request('/x', { schema: okSchema }))

      expect(error.code).toBe(code)
      expect(handlers.refresh).not.toHaveBeenCalled()
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(handlers.onSessionEnded).toHaveBeenCalledWith(
        expect.objectContaining({ code }),
      )
    },
  )

  it('AUTH_INVALID_CREDENTIALS en el login no toca la sesión', async () => {
    mockFetch(() => json(401, problem(401, 'AUTH_INVALID_CREDENTIALS')))
    const handlers = sessionHandlers()

    const error = await failure(
      request('/auth/login', { method: 'POST', body: {}, schema: okSchema, auth: 'none' }),
    )

    expect(error.code).toBe('AUTH_INVALID_CREDENTIALS')
    expect(handlers.refresh).not.toHaveBeenCalled()
    expect(handlers.onSessionEnded).not.toHaveBeenCalled()
  })
})

describe('refresh serializado', () => {
  it('cinco 401 simultáneos por token expirado lanzan un solo refresh', async () => {
    let refreshCalls = 0
    mockFetch(async (url, init) => {
      if (url.endsWith('/auth/refresh')) {
        refreshCalls += 1
        await new Promise((resolve) => setTimeout(resolve, 20))
        return json(200, sessionBody('new'))
      }
      return authorizationOf(init) === 'Bearer old'
        ? json(401, problem(401, AUTH_TOKEN_EXPIRED))
        : json(200, { ok: true })
    })
    // El handler real de la app: la serialización vive en refreshSession.
    sessionHandlers(async () => setAccessToken((await refreshSession()).accessToken))

    const results = await Promise.all(
      Array.from({ length: 5 }, () => request('/x', { schema: okSchema })),
    )

    expect(results).toEqual(Array.from({ length: 5 }, () => ({ ok: true })))
    expect(refreshCalls).toBe(1)
  })
})

describe('429', () => {
  it('lleva los segundos de Retry-After al error', async () => {
    mockFetch(() => json(429, problem(429, 'RATE_LIMITED'), { 'Retry-After': '60' }))

    const error = await failure(request('/auth/login', { schema: okSchema, auth: 'none' }))

    expect(error.status).toBe(429)
    expect(error.retryAfterSeconds).toBe(60)
  })

  it.each([
    ['ausente', {}],
    ['no numérico', { 'Retry-After': 'mañana' }],
  ])('con Retry-After %s no inventa una espera y avisa por consola', async (_caso, headers) => {
    mockFetch(() => json(429, problem(429, 'RATE_LIMITED'), headers))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const error = await failure(request('/auth/login', { schema: okSchema, auth: 'none' }))

    expect(error.retryAfterSeconds).toBeNull()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Access-Control-Expose-Headers'))
  })
})

describe('409: se distingue por code', () => {
  it.each([
    ['CONFLICT', true],
    ['INVALID_STATUS_TRANSITION', false],
    ['TICKET_CLOSED', false],
  ])('%s → recargar el recurso: %s', async (code, reload) => {
    mockFetch(() => json(409, problem(409, code)))

    const error = await failure(request('/tickets/1/status', { method: 'POST', schema: okSchema }))

    expect(error.status).toBe(409)
    expect(error.code).toBe(code)
    expect(isConcurrencyConflict(error)).toBe(reload)
  })
})
