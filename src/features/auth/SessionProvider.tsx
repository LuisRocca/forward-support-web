import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  setAccessToken,
  setUnauthorizedHandler,
} from '../../shared/api/httpClient.ts'
import { signInMock } from '../../shared/mocks/session.mock.ts'
import { SessionContext } from './sessionContext.ts'
import type { Session } from './session.types.ts'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  const signOut = useCallback(() => {
    setSession(null)
    setAccessToken(null)
  }, [])

  const signIn = useCallback(async () => {
    const next = await signInMock()
    setAccessToken(next.accessToken)
    setSession(next)
  }, [])

  // Un 401 en cualquier petición cierra la sesión desde un único sitio.
  useEffect(() => {
    setUnauthorizedHandler(signOut)
    return () => setUnauthorizedHandler(null)
  }, [signOut])

  const value = useMemo(
    () => ({ session, isAuthenticated: session !== null, signIn, signOut }),
    [session, signIn, signOut],
  )

  return <SessionContext value={value}>{children}</SessionContext>
}
