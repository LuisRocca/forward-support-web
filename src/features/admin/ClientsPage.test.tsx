// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { json, mockApi, page } from '../../shared/api/testing.ts'
import { ADMIN, CLIENT } from '../../testing/fixtures.ts'
import { renderPage } from '../../testing/render.tsx'
import { ClientsPage } from './ClientsPage.tsx'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('clientes (solo consulta)', () => {
  it('la búsqueda se aplica al enviar y "solo activos" filtra en la API', async () => {
    const calls = mockApi([{ path: /^\/clients$/, reply: () => json(200, page([CLIENT])) }])
    renderPage(<ClientsPage />, { user: ADMIN })
    await screen.findByText('Acme S.A.')
    const before = calls.length

    fireEvent.change(screen.getByLabelText('Buscar cliente'), { target: { value: 'acme' } })
    expect(calls).toHaveLength(before)

    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))
    await waitFor(() => expect(calls.at(-1)?.search.get('search')).toBe('acme'))

    fireEvent.click(screen.getByLabelText('Solo activos'))
    await waitFor(() => expect(calls.at(-1)?.search.get('isActive')).toBe('true'))
  })

  it('no ofrece ninguna acción de edición', async () => {
    mockApi([{ path: /^\/clients$/, reply: () => json(200, page([CLIENT])) }])
    renderPage(<ClientsPage />, { user: ADMIN })
    const cell = await screen.findByText('Acme S.A.')

    expect(cell.closest('tr')?.querySelector('button')).toBeNull()
  })
})
