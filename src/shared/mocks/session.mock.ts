import type { Session } from '../../features/auth/session.types.ts'

/**
 * ⚠️ MOCK — ÚNICO SITIO CON DATOS FALSOS DEL PROYECTO.
 *
 * Existe solo para poder navegar el shell mientras no hay contrato de API.
 * Cuando el contrato esté congelado, este archivo se borra y `signIn` pasa a
 * ser una llamada real a través de `shared/api/httpClient`.
 */
const MOCK_SESSION: Session = {
  userId: 'mock-user',
  displayName: 'Usuario de prueba',
  accessToken: 'mock-token',
}

export async function signInMock(): Promise<Session> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  return MOCK_SESSION
}
