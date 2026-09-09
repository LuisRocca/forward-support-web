import {
  CONTRACT_MISMATCH,
  NETWORK_ERROR,
  isApiError,
} from './apiError.ts'

/**
 * Traduce cualquier error de la capa de datos a un texto para el usuario.
 *
 * Todos los errores de la API son RFC 9457 y traen `title` y `detail` escritos
 * para humanos: se prefieren a inventar un texto propio, que se quedaría
 * desincronizado del servidor.
 */
export function errorMessage(error: unknown): string {
  if (!isApiError(error)) {
    return 'Ha ocurrido un error inesperado.'
  }

  if (error.code === NETWORK_ERROR) {
    return 'No se pudo contactar con el servidor. Comprueba tu conexión.'
  }

  if (error.code === CONTRACT_MISMATCH) {
    return 'El servidor devolvió una respuesta con un formato inesperado.'
  }

  return error.problem?.detail ?? error.problem?.title ?? error.message
}

/**
 * Identificador de la petición, solo útil en errores del servidor: es lo que
 * permite correlacionar con sus logs cuando el usuario reporta el fallo.
 */
export function reportableTraceId(error: unknown): string | null {
  if (!isApiError(error) || error.status < 500) return null
  return error.traceId ?? null
}

/** Errores campo a campo de un 422, vacío si el error no es de validación. */
export function fieldErrorsOf(error: unknown): Record<string, string> {
  return isApiError(error) ? error.fieldErrors : {}
}
