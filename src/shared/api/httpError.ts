/** Error de una respuesta HTTP no satisfactoria. */
export class HttpError extends Error {
  readonly status: number
  /** Cuerpo tal cual lo devolvió la API. Sin contrato congelado, `unknown`. */
  readonly body: unknown

  constructor(status: number, body: unknown) {
    super(`La API respondió ${status}`)
    this.name = 'HttpError'
    this.status = status
    this.body = body
  }
}
