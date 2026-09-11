import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { vi } from 'vitest'
import { SessionContext } from '../features/auth/sessionContext.ts'
import type { SessionContextValue, SessionStatus } from '../features/auth/session.types.ts'
import type { AuthenticatedUser } from '../shared/api/contract.ts'
import { LocationProbe } from './LocationProbe.tsx'

interface Options {
  user?: AuthenticatedUser | null
  status?: SessionStatus
  route?: string
  /** Patrón de ruta con el que se monta la vista, p. ej. `/tickets/:ticketId`. */
  path?: string
}

function sessionValue({ user = null, status }: Options): SessionContextValue {
  return {
    status: status ?? (user ? 'authenticated' : 'anonymous'),
    user,
    isAuthenticated: (status ?? (user ? 'authenticated' : 'anonymous')) === 'authenticated',
    endedReason: null,
    signIn: vi.fn(async () => {}),
    signOut: vi.fn(async () => {}),
  }
}

/** Monta una vista con sesión y router, como la montaría la app. */
export function renderPage(ui: ReactElement, options: Options = {}) {
  const session = sessionValue(options)
  const utils = render(
    <SessionContext value={session}>
      <MemoryRouter initialEntries={[options.route ?? '/']}>
        <Routes>
          <Route path={options.path ?? '/'} element={ui} />
          <Route path="*" element={null} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </SessionContext>,
  )
  return { ...utils, session }
}

/** Monta un árbol de rutas completo (el suyo propio) con la sesión dada. */
export function renderRoutes(routes: ReactElement, options: Options = {}) {
  const session = sessionValue(options)
  const utils = render(
    <SessionContext value={session}>
      <MemoryRouter initialEntries={[options.route ?? '/']}>
        {routes}
        <LocationProbe />
      </MemoryRouter>
    </SessionContext>,
  )
  return { ...utils, session }
}

/** jsdom no implementa `<dialog>` modal: lo justo para abrir y cerrar. */
export function installDialogPolyfill() {
  const proto = HTMLDialogElement.prototype
  if (typeof proto.showModal === 'function') return
  proto.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  proto.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}
