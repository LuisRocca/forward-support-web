import { z } from 'zod'
import { sessionResponseSchema } from '../../shared/api/contract.ts'
import type { SessionResponse } from '../../shared/api/contract.ts'
import { request } from '../../shared/api/httpClient.ts'

/**
 * `auth: 'none'` en login y refresh: su 401 significa "credenciales
 * incorrectas" o "refresh inválido", no "el access token caducó". Dejar que
 * pasaran por la política de sesión provocaría un refresh sobre un fallo de
 * login.
 */
export async function login(
  email: string,
  password: string,
): Promise<SessionResponse> {
  return await request('/auth/login', {
    method: 'POST',
    body: { email, password },
    schema: sessionResponseSchema,
    auth: 'none',
  })
}

/**
 * Renueva la sesión con la cookie `refresh_token`.
 *
 * Serializado a propósito y en un único sitio: cada refresh rota el token y
 * reusar uno ya rotado hace que el servidor revoque la familia entera de
 * sesiones. Sin esta guarda, el doble montaje de StrictMode en desarrollo
 * bastaría para tirar la sesión.
 */
let inFlight: Promise<SessionResponse> | null = null

export async function refreshSession(): Promise<SessionResponse> {
  inFlight ??= runRefresh()
  return await inFlight
}

async function runRefresh(): Promise<SessionResponse> {
  try {
    return await request('/auth/refresh', {
      method: 'POST',
      schema: sessionResponseSchema,
      auth: 'none',
    })
  } finally {
    inFlight = null
  }
}

export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST', schema: z.null() })
}
