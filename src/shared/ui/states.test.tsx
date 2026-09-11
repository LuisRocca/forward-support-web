// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { toApiError } from '../api/apiError.ts'
import { problem } from '../api/testing.ts'
import { ErrorState } from './states.tsx'

afterEach(cleanup)

describe('ErrorState', () => {
  it('en un error del servidor muestra la referencia para reportarlo', () => {
    render(<ErrorState error={toApiError(500, problem(500, 'INTERNAL'))} />)

    expect(screen.getByRole('alert').textContent).toContain('Referencia: trace-1')
  })

  it('en un error del cliente no muestra la referencia', () => {
    render(<ErrorState error={toApiError(404, problem(404, 'NOT_FOUND'))} />)

    expect(screen.getByRole('alert').textContent).not.toContain('Referencia')
  })

  it('ofrece reintentar cuando se le indica cómo', () => {
    const onRetry = vi.fn()
    render(<ErrorState error={toApiError(500, problem(500, 'INTERNAL'))} onRetry={onRetry} />)

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
