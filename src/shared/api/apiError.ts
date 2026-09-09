import { problemSchema } from './contract.ts'
import type { Problem } from './contract.ts'

/**
 * Códigos de 401 sobre los que el cliente ramifica.
 *
 * Se ramifica sobre `code` y nunca sobre `title`: el título está escrito para
 * humanos y puede cambiar sin previo aviso.
 */
export const AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED'
export const AUTH_TOKEN_REVOKED = 'AUTH_TOKEN_REVOKED'
export const AUTH_USER_BLOCKED = 'AUTH_USER_BLOCKED'

/** No se pudo hablar con la API (red caída, CORS, servidor apagado). */
export const NETWORK_ERROR = 'NETWORK_ERROR'
/** La API respondió algo que no encaja con el contrato. */
export const CONTRACT_MISMATCH = 'CONTRACT_MISMATCH'

/** Único tipo de error de la capa de datos, venga de donde venga. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly traceId: string | undefined
  readonly problem: Problem | null

  constructor(status: number, code: string, message: string, problem?: Problem) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.traceId = problem?.traceId
    this.problem = problem ?? null
  }

  /** Errores campo a campo de un 422, para pintarlos junto a cada input. */
  get fieldErrors(): Record<string, string> {
    const entries = this.problem?.errors ?? []
    return Object.fromEntries(entries.map((e) => [e.field, e.message]))
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/** Construye el error a partir del cuerpo RFC 9457 de una respuesta fallida. */
export function toApiError(status: number, body: unknown): ApiError {
  const parsed = problemSchema.safeParse(body)
  if (!parsed.success) {
    return new ApiError(status, `HTTP_${status}`, `La API respondió ${status}`)
  }
  return new ApiError(status, parsed.data.code, parsed.data.title, parsed.data)
}

export function networkError(cause: unknown): ApiError {
  const detail = cause instanceof Error ? cause.message : 'causa desconocida'
  return new ApiError(0, NETWORK_ERROR, `No se pudo contactar con la API: ${detail}`)
}

export function contractMismatch(path: string): ApiError {
  return new ApiError(
    0,
    CONTRACT_MISMATCH,
    `La respuesta de ${path} no coincide con el contrato`,
  )
}
