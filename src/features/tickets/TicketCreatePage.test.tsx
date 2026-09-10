// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { json, mockFetch, ticketDetailFixture } from '../../shared/api/testing.ts'
import { TicketCreatePage } from './TicketCreatePage.tsx'

let posted: unknown[] = []

beforeEach(() => {
  posted = []
  mockFetch((url, init) => {
    if (url.includes('/clients')) {
      return json(200, {
        data: [{ id: 'client-1', name: 'Acme S.A.', isActive: true }],
        pageInfo: { nextCursor: null, hasMore: false },
      })
    }
    if (url.includes('/ticket-categories')) return json(200, [])
    if (url.endsWith('/tickets') && init?.method === 'POST') {
      posted.push(typeof init.body === 'string' ? JSON.parse(init.body) : init.body)
      return json(201, ticketDetailFixture)
    }
    return json(404, {})
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/tickets/nuevo']}>
      <Routes>
        <Route path="/tickets/nuevo" element={<TicketCreatePage />} />
        <Route path="/tickets/:ticketId" element={<p>Detalle del ticket creado</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('TicketCreatePage', () => {
  it('valida con las reglas del contrato y no envía nada si fallan', async () => {
    renderPage()
    await screen.findByRole('option', { name: 'Acme S.A.' })

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Mal' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear ticket' }))

    expect(await screen.findByText('Selecciona un cliente')).toBeTruthy()
    expect(screen.getByText('El título debe tener al menos 5 caracteres')).toBeTruthy()
    expect(screen.getByText('La descripción debe tener al menos 10 caracteres')).toBeTruthy()
    expect(screen.getByLabelText('Título').getAttribute('aria-invalid')).toBe('true')
    expect(posted).toEqual([])
  })

  it('envía solo lo validado y lleva al detalle del ticket creado', async () => {
    renderPage()
    await screen.findByRole('option', { name: 'Acme S.A.' })

    fireEvent.change(screen.getByLabelText('Cliente'), { target: { value: 'client-1' } })
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'El informe mensual no carga' } })
    fireEvent.change(screen.getByLabelText('Descripción'), {
      target: { value: 'Se queda cargando indefinidamente.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Crear ticket' }))

    expect(await screen.findByText('Detalle del ticket creado')).toBeTruthy()
    expect(posted).toEqual([
      {
        clientId: 'client-1',
        categoryId: null,
        title: 'El informe mensual no carga',
        description: 'Se queda cargando indefinidamente.',
        priority: 'medium',
      },
    ])
  })
})
