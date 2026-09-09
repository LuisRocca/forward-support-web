import { createContext } from 'react'
import type { SessionContextValue } from './session.types.ts'

export const SessionContext = createContext<SessionContextValue | null>(null)
