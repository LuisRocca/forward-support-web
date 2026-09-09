import { HttpError } from './httpError.ts'

/**
 * Único punto de salida hacia la API.
 *
 * Deliberadamente no declara endpoints ni formas de respuesta: el contrato
 * todavía no está congelado. Cada feature llamará a `request<T>` con el tipo
 * que le corresponda cuando el contrato exista.
 */

const baseUrl = import.meta.env.VITE_API_URL

/**
 * El token vive en memoria, no en localStorage: lo que hay en localStorage lo
 * lee cualquier script inyectado en la página (XSS). El coste es que se pierde
 * al recargar; se recupera con el refresh token cuando exista ese flujo.
 */
let accessToken: string | null = null
let onUnauthorized: (() => void) | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

/** Registra qué hacer ante un 401 (típicamente: cerrar la sesión). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, signal } = options

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    signal,
    headers: buildHeaders(body !== undefined),
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 401) {
    onUnauthorized?.()
    throw new HttpError(401, await readBody(response))
  }

  if (!response.ok) {
    throw new HttpError(response.status, await readBody(response))
  }

  // La respuesta no está validada: es el punto exacto donde entrará la
  // validación de esquema cuando el contrato de la API esté congelado.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return (await readBody(response)) as T
}

function buildHeaders(hasBody: boolean): HeadersInit {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (hasBody) headers['Content-Type'] = 'application/json'
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
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
