// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { ApiCall } from '../../shared/api/testing.ts'
import { json, mockApi, page } from '../../shared/api/testing.ts'
import { ADMIN, SUPERVISOR, staff } from '../../testing/fixtures.ts'
import { installDialogPolyfill, renderPage } from '../../testing/render.tsx'
import { UsersPage } from './UsersPage.tsx'

beforeAll(installDialogPolyfill)

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const USERS = [
  staff({ id: ADMIN.id, fullName: ADMIN.fullName, roles: ['admin'] }),
  staff({ id: 'agent-13', fullName: 'Rubén Molina' }),
  staff({ id: 'agent-9', fullName: 'Carla Ruiz', status: 'blocked', blockedReason: 'Salida de la empresa' }),
]

function setup(user = ADMIN) {
  const calls = mockApi([
    { path: /^\/users$/, reply: () => json(200, page(USERS)) },
    {
      method: 'POST',
      path: /^\/users\/agent-13\/block$/,
      reply: () => json(200, staff({ id: 'agent-13', fullName: 'Rubén Molina', status: 'blocked', blockedReason: 'Uso indebido' })),
    },
    {
      method: 'POST',
      path: /^\/users\/agent-9\/unblock$/,
      reply: () => json(200, staff({ id: 'agent-9', fullName: 'Carla Ruiz' })),
    },
  ])
  renderPage(<UsersPage />, { user })
  return calls
}

const row = (name: string) => screen.getByRole('row', { name: new RegExp(name) })
const posts = (calls: ApiCall[], path: string) =>
  calls.filter((call) => call.method === 'POST' && call.path === path)

describe('administración de usuarios', () => {
  it('lista estado, roles y el motivo de los bloqueados; la propia cuenta no se bloquea', async () => {
    setup()
    await screen.findByText('Rubén Molina')

    expect(row('Carla Ruiz').textContent).toContain('Motivo: Salida de la empresa')
    expect(row('Ana García').textContent).toContain('Tu cuenta')
    expect(within(row('Ana García')).queryByRole('button')).toBeNull()
  })

  it('bloquear pide confirmación y no envía nada sin un motivo válido', async () => {
    const calls = setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Bloquear a Rubén Molina' }))
    const dialog = await screen.findByRole('dialog', { name: '¿Seguro que quieres bloquear a Rubén Molina?' })
    const reason = within(dialog).getByLabelText(/^Motivo/)

    // Vacío: lo frena el propio navegador (required) antes de la validación.
    expect(reason).toHaveProperty('required', true)
    fireEvent.click(within(dialog).getByRole('button', { name: 'Bloquear' }))

    // Demasiado corto: lo frena la regla del contrato, con su mensaje.
    fireEvent.change(reason, { target: { value: 'ab' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Bloquear' }))

    expect(await within(dialog).findByText('El motivo debe tener al menos 3 caracteres')).toBeTruthy()
    expect(posts(calls, '/users/agent-13/block')).toHaveLength(0)
  })

  it('bloquear con motivo lo envía y la fila refleja el bloqueo', async () => {
    const calls = setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Bloquear a Rubén Molina' }))
    const dialog = await screen.findByRole('dialog')

    fireEvent.change(within(dialog).getByLabelText(/^Motivo/), { target: { value: 'Uso indebido' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Bloquear' }))

    await waitFor(() => expect(row('Rubén Molina').textContent).toContain('Bloqueado'))
    expect(posts(calls, '/users/agent-13/block')[0]?.body).toEqual({ reason: 'Uso indebido' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('desbloquear devuelve al usuario a activo', async () => {
    const calls = setup()
    await screen.findByText('Carla Ruiz')

    fireEvent.click(within(row('Carla Ruiz')).getByRole('button', { name: 'Desbloquear' }))

    await waitFor(() => expect(row('Carla Ruiz').textContent).toContain('Activo'))
    expect(posts(calls, '/users/agent-9/unblock')).toHaveLength(1)
  })

  it('filtrar por estado lo pide a la API', async () => {
    const calls = setup()
    await screen.findByText('Rubén Molina')

    fireEvent.change(screen.getByLabelText(/^Estado/), { target: { value: 'blocked' } })

    await waitFor(() => expect(calls.at(-1)?.search.get('status')).toBe('blocked'))
  })

  it('sin permiso de bloqueo no hay columna de acciones', async () => {
    setup(SUPERVISOR)
    await screen.findByText('Rubén Molina')

    expect(screen.queryByRole('columnheader', { name: 'Acciones' })).toBeNull()
  })
})
