import type { AuthenticatedUser } from '../../shared/api/contract.ts'

export type SessionStatus = 'loading' | 'anonymous' | 'authenticated'

export interface SessionContextValue {
  status: SessionStatus
  user: AuthenticatedUser | null
  isAuthenticated: boolean
  /** Motivo por el que se cerró la última sesión, para mostrarlo en el login. */
  endedReason: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
