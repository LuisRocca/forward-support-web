// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AuthenticatedUser, TicketDetail } from '../../shared/api/contract.ts'
import type { ApiCall } from '../../shared/api/testing.ts'
import { json, mockApi, page, problem } from '../../shared/api/testing.ts'
import { ADMIN, AGENT, SUPERVISOR, comment, detail, staff } from '../../testing/fixtures.ts'
import { renderPage } from '../../testing/render.tsx'
import { TicketDetailPage } from './TicketDetailPage.tsx'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const MINE = { id: AGENT.id, fullName: AGENT.fullName }

/** Monta el detalle con una API que responde según el contrato. */
function setup(
  user: AuthenticatedUser,
  ticket: TicketDetail,
  status: (call: ApiCall) => Response = () => json(200, { ...ticket, status: 'in_progress' }),
) {
  const calls = mockApi([
    { path: /^\/tickets\/ticket-1$/, reply: () => json(200, ticket) },
    {
      path: /^\/tickets\/ticket-1\/comments$/,
      reply: () =>
        json(200, page([
          comment(),
          comment({ id: 'c-2', body: 'Nota para el equipo', isInternal: true }),
        ])),
    },
    { path: /^\/tickets\/ticket-1\/history$/, reply: () => json(200, []) },
    { path: /^\/users$/, reply: () => json(200, page([staff({ id: 'agent-2', fullName: 'Beto Agente' })])) },
    { path: /^\/ticket-categories$/, reply: () => json(200, []) },
    {
      method: 'PATCH',
      path: /^\/tickets\/ticket-1$/,
      reply: (call) => json(200, { ...ticket, title: 'Título corregido por el agente', ...Object(call.body) }),
    },
    { method: 'POST', path: /^\/tickets\/ticket-1\/status$/, reply: status },
    {
      method: 'POST',
      path: /^\/tickets\/ticket-1\/assign$/,
      reply: () => json(200, { ...ticket, assignedTo: { id: 'agent-2', fullName: 'Beto Agente' } }),
    },
    { method: 'POST', path: /^\/tickets\/ticket-1\/comments$/, reply: () => json(201, comment({ id: 'c-3' })) },
  ])
  renderPage(<TicketDetailPage />, { user, route: '/tickets/ticket-1', path: '/tickets/:ticketId' })
  return calls
}

const count = (calls: ApiCall[], method: string, path: string) =>
  calls.filter((call) => call.method === method && call.path === path).length
const sent = (calls: ApiCall[], method: string, path: string) =>
  calls.filter((call) => call.method === method && call.path === path).at(-1)?.body

describe('detalle de ticket: qué ofrece a cada rol', () => {
  it('al agente asignado: editar y cambiar estado, sin reasignar ni comentar en interno', async () => {
    setup(AGENT, detail({ assignedTo: MINE }))

    expect(await screen.findByRole('button', { name: 'Editar' })).toBeTruthy()
    expect(screen.getByLabelText('Cambiar estado')).toBeTruthy()
    expect(screen.queryByLabelText('Asignar a')).toBeNull()
    expect(screen.queryByLabelText('Comentario interno (no visible para el cliente)')).toBeNull()
  })

  it('al supervisor: reasignar y comentar en interno, sin editar ni cambiar estado', async () => {
    setup(SUPERVISOR, detail({ allowedStatusTransitions: [] }))

    expect(await screen.findByLabelText('Asignar a')).toBeTruthy()
    expect(screen.getByLabelText('Comentario interno (no visible para el cliente)')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull()
    expect(screen.queryByLabelText('Cambiar estado')).toBeNull()
  })

  it('un ticket cerrado no se edita ni se reasigna', async () => {
    setup(ADMIN, detail({ status: 'closed', allowedStatusTransitions: ['open'] }))

    expect(await screen.findByText('Un ticket cerrado no se reasigna: primero hay que reabrirlo.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull()
    expect(screen.queryByLabelText('Asignar a')).toBeNull()
  })

  it('distingue los comentarios internos de los públicos', async () => {
    setup(AGENT, detail({ assignedTo: MINE }))

    const internal = (await screen.findByText('Nota para el equipo')).closest('article')
    const shared = screen.getByText('El cliente confirma que sigue fallando.').closest('article')

    expect(internal?.textContent).toContain('Interno')
    expect(shared?.textContent).not.toContain('Interno')
  })
})

describe('detalle de ticket: acciones', () => {
  it('editar envía solo los campos cambiados', async () => {
    const calls = setup(AGENT, detail({ assignedTo: MINE }))
    fireEvent.click(await screen.findByRole('button', { name: 'Editar' }))

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Título corregido por el agente' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await screen.findByRole('heading', { name: 'Título corregido por el agente' })
    expect(sent(calls, 'PATCH', '/tickets/ticket-1')).toEqual({ title: 'Título corregido por el agente' })
  })

  it('cambiar el estado lo manda a su endpoint y vuelve a pedir el historial', async () => {
    const calls = setup(AGENT, detail({ assignedTo: MINE }))
    const select = await screen.findByLabelText('Cambiar estado')
    await waitFor(() => expect(count(calls, 'GET', '/tickets/ticket-1/history')).toBe(1))

    fireEvent.change(select, { target: { value: 'in_progress' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar estado' }))

    await waitFor(() => expect(count(calls, 'GET', '/tickets/ticket-1/history')).toBe(2))
    expect(sent(calls, 'POST', '/tickets/ticket-1/status')).toEqual({ status: 'in_progress' })
  })

  it('un 409 por concurrencia avisa y recarga el ticket', async () => {
    const calls = setup(AGENT, detail({ assignedTo: MINE }), () =>
      json(409, { ...problem(409, 'CONFLICT'), detail: 'Otra persona cambió el ticket.' }),
    )
    fireEvent.change(await screen.findByLabelText('Cambiar estado'), { target: { value: 'in_progress' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar estado' }))

    expect(await screen.findByText('Otra persona cambió el ticket.')).toBeTruthy()
    await waitFor(() => expect(count(calls, 'GET', '/tickets/ticket-1')).toBe(2))
  })

  it('un 409 por ticket cerrado solo avisa, sin recargar', async () => {
    const calls = setup(AGENT, detail({ assignedTo: MINE }), () =>
      json(409, { ...problem(409, 'TICKET_CLOSED'), detail: 'El ticket está cerrado.' }),
    )
    fireEvent.change(await screen.findByLabelText('Cambiar estado'), { target: { value: 'in_progress' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar estado' }))

    expect(await screen.findByText('El ticket está cerrado.')).toBeTruthy()
    expect(count(calls, 'GET', '/tickets/ticket-1')).toBe(1)
  })

  it('el supervisor comenta en interno y la lista se actualiza', async () => {
    const calls = setup(SUPERVISOR, detail({ allowedStatusTransitions: [] }))
    await screen.findByText('Nota para el equipo')

    fireEvent.change(screen.getByLabelText('Añadir comentario'), { target: { value: 'Revisar con desarrollo' } })
    fireEvent.click(screen.getByLabelText('Comentario interno (no visible para el cliente)'))
    fireEvent.click(screen.getByRole('button', { name: 'Comentar' }))

    await waitFor(() => expect(count(calls, 'GET', '/tickets/ticket-1/comments')).toBe(2))
    expect(sent(calls, 'POST', '/tickets/ticket-1/comments')).toEqual({
      body: 'Revisar con desarrollo',
      isInternal: true,
    })
  })

  it('el supervisor reasigna por el endpoint de asignación', async () => {
    const calls = setup(SUPERVISOR, detail({ allowedStatusTransitions: [] }))
    const select = await screen.findByLabelText('Asignar a')
    await within(select).findByRole('option', { name: 'Beto Agente' })

    fireEvent.change(select, { target: { value: 'agent-2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Asignar' }))

    await waitFor(() => expect(sent(calls, 'POST', '/tickets/ticket-1/assign')).toEqual({ assignedToUserId: 'agent-2' }))
    await waitFor(() => expect(screen.getAllByText('Beto Agente').length).toBeGreaterThan(1))
  })
})
