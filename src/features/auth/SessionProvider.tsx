import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AUTH_USER_BLOCKED, NETWORK_ERROR } from '../../shared/api/apiError.ts'
import type { ApiError } from '../../shared/api/apiError.ts'
import type {
  AuthenticatedUser,
  SessionResponse,
} from '../../shared/api/contract.ts'
import {
  setAccessToken,
  setSessionHandlers,
} from '../../shared/api/httpClient.ts'
import { login, logout, refreshSession } from './authApi.ts'
import { SessionContext } from './sessionContext.ts'
import type { SessionStatus } from './session.types.ts'

export function SessionProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [endedReason, setEndedReason] = useState<string | null>(null)

  const applySession = useCallback((session: SessionResponse) => {
    setAccessToken(session.accessToken)
    setUser(session.user)
    setStatus('authenticated')
    setEndedReason(null)
  }, [])

  const clearSession = useCallback((reason: string | null) => {
    setAccessToken(null)
    setUser(null)
    setStatus('anonymous')
    setEndedReason(reason)
  }, [])

  const signIn = useCallback(
    async (email: string, password: string) => {
      applySession(await login(email, password))
    },
    [applySession],
  )

  const signOut = useCallback(async () => {
    try {
      await logout()
    } catch {
      // Si la API no responde, la sesión local se cierra igual: el token está
      // en memoria y desaparece con ella.
    }
    clearSession(null)
  }, [clearSession])

  useEffect(() => {
    setSessionHandlers({
      refresh: async () => {
        applySession(await refreshSession())
      },
      onSessionEnded: (error) => clearSession(sessionEndReason(error)),
    })

    return () => setSessionHandlers(null)
  }, [applySession, clearSession])

  // Al arrancar hay cookie de refresh o no la hay: eso decide si hay sesión.
  useEffect(() => {
    let cancelled = false

    async function restore() {
      try {
        const session = await refreshSession()
        if (!cancelled) applySession(session)
      } catch {
        if (!cancelled) clearSession(null)
      }
    }

    void restore()
    return () => {
      cancelled = true
    }
  }, [applySession, clearSession])

  const value = useMemo(
    () => ({
      status,
      user,
      isAuthenticated: status === 'authenticated',
      endedReason,
      signIn,
      signOut,
    }),
    [status, user, endedReason, signIn, signOut],
  )

  return <SessionContext value={value}>{children}</SessionContext>
}

/** Qué contarle al usuario cuando la sesión se cierra sola. */
function sessionEndReason(error: ApiError): string {
  if (error.code === AUTH_USER_BLOCKED) {
    return error.problem?.detail ?? 'Tu cuenta ha sido bloqueada.'
  }
  if (error.code === NETWORK_ERROR) {
    return 'Se perdió la conexión con el servidor.'
  }
  return 'Tu sesión ha caducado. Vuelve a iniciar sesión.'
}
