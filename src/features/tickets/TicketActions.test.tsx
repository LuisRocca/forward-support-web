// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TicketDetail, TicketStatus } from '../../shared/api/contract.ts'
import { json, mockFetch, ticketDetailFixture } from '../../shared/api/testing.ts'
import { TicketActions } from './TicketActions.tsx'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function renderActions(allowedStatusTransitions: TicketStatus[], canAssign: boolean) {
  const ticket: TicketDetail = { ...ticketDetailFixture, allowedStatusTransitions }
  return render(
    <TicketActions
      ticket={ticket}
      canAssign={canAssign}
      onUpdated={vi.fn()}
      onConflict={vi.fn()}
    />,
  )
}

function statusOptions(): string[] {
  const select = screen.getByLabelText('Cambiar estado')
  return [...select.querySelectorAll('option')]
    .map((option) => option.getAttribute('value') ?? '')
    .filter(Boolean)
}

describe('control de estado del detalle', () => {
  it('ofrece exactamente los destinos de allowedStatusTransitions', () => {
    renderActions(['in_progress', 'resolved'], false)

    expect(statusOptions()).toEqual(['in_progress', 'resolved'])
  })

  it('no replica la matriz: si el servidor solo permite uno, solo hay uno', () => {
    renderActions(['closed'], false)

    expect(statusOptions()).toEqual(['closed'])
  })

  it('sin transiciones permitidas y sin poder asignar, no pinta nada', () => {
    const { container } = renderActions([], false)

    expect(container.innerHTML).toBe('')
  })

  it('sin transiciones pero pudiendo asignar, solo queda la asignación', async () => {
    mockFetch(() => json(200, { data: [], pageInfo: { nextCursor: null, hasMore: false } }))

    renderActions([], true)

    expect(screen.queryByLabelText('Cambiar estado')).toBeNull()
    expect(await screen.findByLabelText('Asignar a')).toBeTruthy()
  })
})
