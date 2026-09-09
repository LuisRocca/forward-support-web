/**
 * Forma PROVISIONAL de la sesión.
 *
 * El contrato de la API no está congelado: estos campos son lo mínimo que
 * necesita el shell (saber si hay sesión y a quién saludar en la barra), no un
 * DTO real. Cuando llegue el contrato, esto se sustituye por sus tipos.
 */
export interface Session {
  userId: string
  displayName: string
  accessToken: string
}

export interface SessionContextValue {
  session: Session | null
  isAuthenticated: boolean
  signIn: () => Promise<void>
  signOut: () => void
}
