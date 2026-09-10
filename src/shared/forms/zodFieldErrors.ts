import type { ZodError } from 'zod'

/** Convierte los fallos de un esquema en un mapa campo → primer mensaje. */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {}

  for (const issue of error.issues) {
    const field = issue.path[0]
    if (typeof field !== 'string') continue
    result[field] ??= issue.message
  }

  return result
}
