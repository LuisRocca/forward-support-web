import type { z } from 'zod'
import {
  AUTH_TOKEN_EXPIRED,
  ApiError,
  contractMismatch,
  isApiError,
  networkError,
  toApiError,
} from './apiError.ts'

/**
 * Único punto de salida hacia la API.
 *
 * Toda respuesta se valida contra el contrato antes de devolverla: la API es
 * entrada externa y se comprueba en el borde, no dentro de cada componente.
 */

const baseUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, '')

/**
 * El access token vive en memoria, no en localStorage: lo que hay en
 * localStorage lo lee cualquier script inyectado en la página. La sesión se
 * recupera tras recargar con la cookie `refresh_token`, que es httpOnly y el
 * JavaScript no puede leer.
 */
let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

interface SessionHandlers {
  /**
   * Renueva el access token y lo deja puesto con `setAccessToken`.
   *
   * DEBE estar protegida contra llamadas concurrentes. El refresh rota el
   * token en cada uso y un token ya rotado se interpreta como robo: dos
   * refrescos a la vez revocan la familia de sesiones entera. El único punto
   * donde se serializa es `refreshSession` en `features/auth/authApi`.
   */
  refresh: () => Promise<void>
  /** La sesión ya no se puede recuperar: hay que cerrarla. */
  onSessionEnded: (error: ApiError) => void
}

let handlers: SessionHandlers | null = null

export function setSessionHandlers(next: SessionHandlers | null): void {
  handlers = next
}

type QueryValue = string | number | boolean | string[] | null | undefined

export interface RequestOptions<T> {
  /** Esquema del contrato con el que se valida la respuesta. */
  schema: z.ZodType<T>
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, QueryValue>
  signal?: AbortSignal
  /**
   * `none` para los endpoints de autenticación: un 401 de `/auth/login` es
   * "credenciales incorrectas", no una sesión caducada, y no debe disparar
   * ni el refresh ni el cierre de sesión.
   */
  auth?: 'session' | 'none'
}

export async function request<T>(
  path: string,
  options: RequestOptions<T>,
): Promise<T> {
  const response = await send(path, options)

  if (response.status !== 401 || options.auth === 'none') {
    return await parseResponse(path, response, options.schema)
  }

  return await recoverFromUnauthorized(path, response, options)
}

/**
 * Un 401 se trata según su `code`, no según su título:
 *   expirado → refrescar y reintentar UNA vez;
 *   revocado o usuario bloqueado → cerrar sesión sin reintentar, porque
 *   reintentar sobre una sesión revocada es un bucle infinito.
 */
async function recoverFromUnauthorized<T>(
  path: string,
  response: Response,
  options: RequestOptions<T>,
): Promise<T> {
  const error = toApiError(401, await readBody(response))

  if (error.code !== AUTH_TOKEN_EXPIRED) {
    return endSession(error)
  }

  try {
    await refreshOnce()
  } catch (cause) {
    return endSession(isApiError(cause) ? cause : error)
  }

  const retried = await send(path, options)
  if (retried.status === 401) {
    return endSession(toApiError(401, await readBody(retried)))
  }

  return await parseResponse(path, retried, options.schema)
}

function endSession(error: ApiError): never {
  handlers?.onSessionEnded(error)
  throw error
}

async function refreshOnce(): Promise<void> {
  const refresh = handlers?.refresh
  if (!refresh) {
    throw new ApiError(401, AUTH_TOKEN_EXPIRED, 'No hay sesión que renovar')
  }

  // El handler serializa las llamadas concurrentes: si cinco peticiones fallan
  // a la vez por token expirado, sale un solo refresh y las demás lo esperan.
  await refresh()
}

async function send<T>(
  path: string,
  options: RequestOptions<T>,
): Promise<Response> {
  const { method = 'GET', body, query, signal } = options

  try {
    return await fetch(buildUrl(path, query), {
      method,
      signal,
      // La cookie de refresh es httpOnly: sin esto no viaja.
      credentials: 'include',
      headers: buildHeaders(body !== undefined, options.auth ?? 'session'),
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
    throw networkError(cause)
  }
}

async function parseResponse<T>(
  path: string,
  response: Response,
  schema: z.ZodType<T>,
): Promise<T> {
  const body = await readBody(response)

  if (!response.ok) {
    throw toApiError(response.status, body)
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    console.error(`[api] respuesta inesperada de ${path}`, parsed.error.issues)
    throw contractMismatch(path)
  }

  return parsed.data
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${baseUrl}${path}`)

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined) continue

    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, item)
      continue
    }

    url.searchParams.set(key, String(value))
  }

  return url.toString()
}

function buildHeaders(hasBody: boolean, auth: 'session' | 'none'): HeadersInit {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (hasBody) headers['Content-Type'] = 'application/json'
  if (auth === 'session' && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }
  return headers
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null

  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
