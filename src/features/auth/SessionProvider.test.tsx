// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { request } from '../../shared/api/httpClient.ts'
import { failure, json, mockApi, problem, sessionBody } from '../../shared/api/testing.ts'
import { SessionProvider } from './SessionProvider.tsx'
import { useSession } from './useSession.ts'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function Probe() {
  const session = useSession()
  return (
    <div>
      <output data-testid="status">{session.status}</output>
      <output data-testid="user">{session.user?.fullName ?? ''}</output>
      <output data-testid="reason">{session.endedReason ?? ''}</output>
      <button type="button" onClick={() => void session.signOut()}>
        salir
      </button>
    </div>
  )
}

function renderSession() {
  render(
    <StrictMode>
      <SessionProvider>
        <Probe />
      </SessionProvider>
    </StrictMode>,
  )
}

const status = () => screen.getByTestId('status').textContent

describe('sesión', () => {
  it('se restaura al arrancar con la cookie de refresh, con una sola petición', async () => {
    const calls = mockApi([
      { method: 'POST', path: /^\/auth\/refresh$/, reply: () => json(200, sessionBody('token')) },
    ])

    renderSession()

    await waitFor(() => expect(status()).toBe('authenticated'))
    expect(screen.getByTestId('user').textContent).toBe('Agente de prueba')
    // StrictMode monta los efectos dos veces: el refresh debe salir una sola vez.
    expect(calls.filter((call) => call.path === '/auth/refresh')).toHaveLength(1)
  })

  it('sin cookie válida queda anónima', async () => {
    mockApi([
      { method: 'POST', path: /^\/auth\/refresh$/, reply: () => json(401, problem(401, 'AUTH_TOKEN_INVALID')) },
    ])

    renderSession()

    await waitFor(() => expect(status()).toBe('anonymous'))
  })

  it('cerrar sesión la cierra aunque la API no responda', async () => {
    mockApi([
      { method: 'POST', path: /^\/auth\/refresh$/, reply: () => json(200, sessionBody('token')) },
      { method: 'POST', path: /^\/auth\/logout$/, reply: () => json(500, problem(500, 'INTERNAL')) },
    ])
    renderSession()
    await waitFor(() => expect(status()).toBe('authenticated'))

    fireEvent.click(screen.getByRole('button', { name: 'salir' }))

    await waitFor(() => expect(status()).toBe('anonymous'))
  })

  it('un bloqueo en caliente cierra la sesión y guarda el motivo del servidor', async () => {
    const detail = 'Tu cuenta ha sido bloqueada por un administrador.'
    mockApi([
      { method: 'POST', path: /^\/auth\/refresh$/, reply: () => json(200, sessionBody('token')) },
      {
        path: /^\/tickets$/,
        reply: () => json(401, { ...problem(401, 'AUTH_USER_BLOCKED'), detail }),
      },
    ])
    renderSession()
    await waitFor(() => expect(status()).toBe('authenticated'))

    await failure(request('/tickets', { schema: z.unknown() }))

    await waitFor(() => expect(status()).toBe('anonymous'))
    expect(screen.getByTestId('reason').textContent).toBe(detail)
  })
})
