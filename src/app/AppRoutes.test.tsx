// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { json, mockApi, page } from '../shared/api/testing.ts'
import { ADMIN, AGENT, METRICS, SUPERVISOR, summary } from '../testing/fixtures.ts'
import { installDialogPolyfill, renderRoutes } from '../testing/render.tsx'
import { AppRoutes } from './AppRoutes.tsx'

beforeAll(installDialogPolyfill)

beforeEach(() => {
  mockApi([
    { path: /^\/tickets$/, reply: () => json(200, page([summary()])) },
    { path: /^\/metrics\/dashboard$/, reply: () => json(200, METRICS) },
    { path: /^\/users$/, reply: () => json(200, page([])) },
  ])
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const location = () => screen.getByTestId('location').textContent
const navLabels = () =>
  within(screen.getByRole('navigation', { name: 'Principal' }))
    .getAllByRole('link')
    .map((link) => link.textContent)

describe('rutas y navegación por permisos', () => {
  it('sin sesión, una ruta protegida lleva al login', async () => {
    renderRoutes(<AppRoutes />, { route: '/tickets' })

    expect(await screen.findByLabelText('Correo electrónico')).toBeTruthy()
    expect(location()).toBe('/login')
  })

  it('mientras se comprueba la sesión no redirige a ningún sitio', () => {
    renderRoutes(<AppRoutes />, { route: '/tickets', status: 'loading' })

    expect(screen.getByText('Comprobando sesión…')).toBeTruthy()
    expect(location()).toBe('/tickets')
  })

  it('el agente no ve el dashboard: entrar ahí lo lleva a su listado', async () => {
    renderRoutes(<AppRoutes />, { route: '/dashboard', user: AGENT })

    await waitFor(() => expect(location()).toBe('/tickets'))
    expect(navLabels()).toEqual(['Tickets', 'Nuevo ticket'])
  })

  it('el supervisor no entra en administración', async () => {
    renderRoutes(<AppRoutes />, { route: '/admin/usuarios', user: SUPERVISOR })

    await waitFor(() => expect(location()).toBe('/dashboard'))
    expect(navLabels()).toEqual(['Dashboard', 'Tickets', 'Nuevo ticket'])
  })

  it('una ruta desconocida lleva a la primera vista permitida', async () => {
    renderRoutes(<AppRoutes />, { route: '/ruta-que-no-existe', user: ADMIN })

    await waitFor(() => expect(location()).toBe('/dashboard'))
    expect(navLabels()).toEqual(['Dashboard', 'Tickets', 'Nuevo ticket', 'Administración'])
  })
})

describe('cerrar sesión', () => {
  it('pide confirmación y solo cierra si se confirma', async () => {
    const { session } = renderRoutes(<AppRoutes />, { route: '/tickets', user: AGENT })
    const openConfirm = async () => {
      const sidebar = await screen.findByRole('complementary')
      fireEvent.click(within(sidebar).getByRole('button', { name: 'Cerrar sesión' }))
      return await screen.findByRole('dialog', { name: '¿Seguro que quieres cerrar sesión?' })
    }

    fireEvent.click(within(await openConfirm()).getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(session.signOut).not.toHaveBeenCalled()

    fireEvent.click(within(await openConfirm()).getByRole('button', { name: 'Cerrar sesión' }))
    await waitFor(() => expect(session.signOut).toHaveBeenCalledTimes(1))
  })
})
