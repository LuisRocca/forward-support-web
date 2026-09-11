// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ApiCall } from '../../shared/api/testing.ts'
import { deferred, json, mockApi, page } from '../../shared/api/testing.ts'
import { SUPERVISOR, summary } from '../../testing/fixtures.ts'
import { renderPage } from '../../testing/render.tsx'
import { TicketListPage } from './TicketListPage.tsx'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const OLD = new Date(Date.now() - 72 * 3_600_000).toISOString()

function renderList() {
  return renderPage(<TicketListPage />, { user: SUPERVISOR, route: '/tickets', path: '/tickets' })
}

const listCalls = (calls: ApiCall[]) => calls.filter((call) => call.path === '/tickets')
const lastList = (calls: ApiCall[]) => listCalls(calls).at(-1)
const dataRows = () => screen.getAllByRole('row').length - 1
const location = () => screen.getByTestId('location').textContent

describe('listado de tickets', () => {
  it('los filtros viven en la URL y viajan a la API', async () => {
    const calls = mockApi([{ path: /^\/tickets$/, reply: () => json(200, page([summary()])) }])
    renderList()
    await screen.findByText('El informe mensual no carga')

    fireEvent.click(screen.getByLabelText('Abierto'))
    await waitFor(() => expect(lastList(calls)?.search.getAll('status')).toEqual(['open']))
    expect(location()).toContain('status=open')

    fireEvent.click(screen.getByLabelText('Estancados (+48 h)'))
    await waitFor(() => expect(lastList(calls)?.search.get('staleHours')).toBe('48'))

    fireEvent.click(screen.getByLabelText('Sin asignar'))
    await waitFor(() => expect(lastList(calls)?.search.get('assignedToUserId')).toBe('unassigned'))
  })

  it('la búsqueda se aplica al enviar, no con cada tecla', async () => {
    const calls = mockApi([{ path: /^\/tickets$/, reply: () => json(200, page([summary()])) }])
    renderList()
    await screen.findByText('El informe mensual no carga')
    const before = listCalls(calls).length

    fireEvent.change(screen.getByLabelText('Buscar tickets'), { target: { value: 'factura' } })
    expect(listCalls(calls)).toHaveLength(before)

    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))
    await waitFor(() => expect(lastList(calls)?.search.get('search')).toBe('factura'))
  })

  it('cargar más acumula páginas usando el cursor opaco tal cual', async () => {
    const calls = mockApi([
      {
        path: /^\/tickets$/,
        reply: (call) =>
          call.search.get('cursor') === 'opaco-2'
            ? json(200, page([summary({ id: 't-2', code: 'TCK-000002', title: 'Segunda página' })]))
            : json(200, page([summary()], 'opaco-2')),
      },
    ])
    renderList()
    await screen.findByText('El informe mensual no carga')

    fireEvent.click(screen.getByRole('button', { name: 'Cargar más' }))

    await screen.findByText('Segunda página')
    expect(dataRows()).toBe(2)
    expect(lastList(calls)?.search.get('cursor')).toBe('opaco-2')
    expect(screen.getByText('No hay más resultados.')).toBeTruthy()
  })

  it('al filtrar mantiene la lista anterior hasta que llegan los resultados', async () => {
    const pending = deferred<Response>()
    let requests = 0
    mockApi([
      {
        path: /^\/tickets$/,
        reply: async () => {
          requests += 1
          return requests === 1 ? json(200, page([summary()])) : await pending.promise
        },
      },
    ])
    const { container } = renderList()
    await screen.findByText('El informe mensual no carga')

    fireEvent.click(screen.getByLabelText('Abierto'))

    await waitFor(() =>
      expect(container.querySelector('[data-refreshing="true"]')).not.toBeNull(),
    )
    expect(screen.getByText('El informe mensual no carga')).toBeTruthy()

    pending.resolve(json(200, page([summary({ id: 't-9', title: 'Resultado filtrado' })])))

    await screen.findByText('Resultado filtrado')
    expect(container.querySelector('[data-refreshing="true"]')).toBeNull()
  })

  it('marca como estancados solo los abiertos sin actividad en 48 h', async () => {
    mockApi([
      {
        path: /^\/tickets$/,
        reply: () =>
          json(200, page([
            summary({ id: 'a', title: 'Abierto antiguo', status: 'open', lastActivityAt: OLD }),
            summary({ id: 'b', title: 'Resuelto antiguo', status: 'resolved', lastActivityAt: OLD }),
          ])),
      },
    ])
    renderList()

    const open = (await screen.findByText('Abierto antiguo')).closest('tr')
    const resolved = screen.getByText('Resuelto antiguo').closest('tr')

    expect(open?.textContent).toContain('Estancado')
    expect(resolved?.textContent).not.toContain('Estancado')
  })
})
