import { afterEach, describe, expect, it, vi } from 'vitest'
import { CONTRACT_MISMATCH, NETWORK_ERROR } from './apiError.ts'
import { sessionResponseSchema } from './contract.ts'
import { request } from './httpClient.ts'
import { failure, json, mockFetch, sessionBody, sessionUser } from './testing.ts'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('validación de las respuestas contra el contrato', () => {
  it('una respuesta que no cumple el esquema falla como CONTRACT_MISMATCH, no como un TypeError', async () => {
    const { roles: _roles, ...userSinRoles } = sessionUser
    mockFetch(() => json(200, { accessToken: 't', expiresIn: 900, user: userSinRoles }))
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const error = await failure(request('/auth/refresh', { schema: sessionResponseSchema }))

    expect(error.code).toBe(CONTRACT_MISMATCH)
    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining('/auth/refresh'),
      expect.anything(),
    )
  })

  it('un campo que no está en el contrato no llega a la aplicación', async () => {
    mockFetch(() =>
      json(200, { ...sessionBody('t'), user: { ...sessionUser, passwordHash: 'x' } }),
    )

    const session = await request('/auth/refresh', { schema: sessionResponseSchema })

    expect(session.user).not.toHaveProperty('passwordHash')
  })

  it('un error que no es RFC 9457 (p. ej. HTML de un proxy) sigue siendo un ApiError', async () => {
    mockFetch(() => new Response('<html>Bad Gateway</html>', { status: 502 }))

    const error = await failure(request('/x', { schema: sessionResponseSchema }))

    expect(error.status).toBe(502)
    expect(error.code).toBe('HTTP_502')
  })

  it('un fallo de red se convierte en NETWORK_ERROR', async () => {
    mockFetch(() => {
      throw new TypeError('Failed to fetch')
    })

    const error = await failure(request('/x', { schema: sessionResponseSchema }))

    expect(error.code).toBe(NETWORK_ERROR)
  })

  it('una cancelación se propaga tal cual y no se disfraza de error de red', async () => {
    mockFetch(() => {
      throw new DOMException('Aborted', 'AbortError')
    })

    await expect(request('/x', { schema: sessionResponseSchema })).rejects.toMatchObject({
      name: 'AbortError',
    })
  })
})
