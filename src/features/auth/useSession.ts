import { useContext } from 'react'
import { SessionContext } from './sessionContext.ts'
import type { SessionContextValue } from './session.types.ts'

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext)
  if (!value) {
    throw new Error('useSession debe usarse dentro de <SessionProvider>')
  }
  return value
}
