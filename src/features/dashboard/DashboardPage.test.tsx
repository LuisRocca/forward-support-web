// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { json, mockApi, problem } from '../../shared/api/testing.ts'
import { METRICS, SUPERVISOR } from '../../testing/fixtures.ts'
import { renderPage } from '../../testing/render.tsx'
import { DashboardPage } from './DashboardPage.tsx'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('dashboard', () => {
  it('muestra las cifras en formato español y de cuándo son los datos', async () => {
    mockApi([{ path: /^\/metrics\/dashboard$/, reply: () => json(200, METRICS) }])
    renderPage(<DashboardPage />, { user: SUPERVISOR })

    expect(await screen.findByText('30.455')).toBeTruthy()
    expect(screen.getByText('85,9 h')).toBeTruthy()
    // Una resolución media sin datos no se inventa.
    expect(screen.getByText('—')).toBeTruthy()
    // Vista materializada: se dice de cuándo son los datos.
    expect(screen.getByText(/^Datos calculados el/)).toBeTruthy()
  })

  it('estancados y sin asignar llevan al listado ya filtrado', async () => {
    mockApi([{ path: /^\/metrics\/dashboard$/, reply: () => json(200, METRICS) }])
    renderPage(<DashboardPage />, { user: SUPERVISOR })

    const stale = await screen.findByRole('link', { name: /Estancados/ })
    const unassigned = screen.getByRole('link', { name: /Sin asignar/ })

    expect(stale.getAttribute('href')).toBe('/tickets?stale=1')
    expect(unassigned.getAttribute('href')).toBe('/tickets?unassigned=1')
  })

  it('sin permiso muestra el mensaje del servidor', async () => {
    mockApi([
      {
        path: /^\/metrics\/dashboard$/,
        reply: () => json(403, { ...problem(403, 'FORBIDDEN'), detail: 'Tu rol no permite esta acción.' }),
      },
    ])
    renderPage(<DashboardPage />, { user: SUPERVISOR })

    expect(await screen.findByText('Tu rol no permite esta acción.')).toBeTruthy()
  })
})
