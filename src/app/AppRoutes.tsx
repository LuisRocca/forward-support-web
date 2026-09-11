import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { FullPageLoader } from '../shared/layout/FullPageLoader.tsx'
import { paths } from '../shared/routing/paths.ts'
import { ProtectedRoute } from '../shared/routing/ProtectedRoute.tsx'
import { PublicOnlyRoute } from '../shared/routing/PublicOnlyRoute.tsx'
import { HomeRedirect } from './HomeRedirect.tsx'
import { AREA_PERMISSIONS } from './navigation.ts'
import { RequirePermission } from './RequirePermission.tsx'

/*
 * Cada vista es un trozo aparte que se descarga al entrar por primera vez.
 * Sin sesión solo se baja el login; con sesión, el login no se baja nunca.
 */
const LoginPage = lazy(async () => ({
  default: (await import('../features/auth/LoginPage.tsx')).LoginPage,
}))
const AppLayout = lazy(async () => ({
  default: (await import('../shared/layout/AppLayout.tsx')).AppLayout,
}))
const DashboardPage = lazy(async () => ({
  default: (await import('../features/dashboard/DashboardPage.tsx')).DashboardPage,
}))
const TicketListPage = lazy(async () => ({
  default: (await import('../features/tickets/TicketListPage.tsx')).TicketListPage,
}))
const TicketDetailPage = lazy(async () => ({
  default: (await import('../features/tickets/TicketDetailPage.tsx')).TicketDetailPage,
}))
const TicketCreatePage = lazy(async () => ({
  default: (await import('../features/tickets/TicketCreatePage.tsx')).TicketCreatePage,
}))
const UsersPage = lazy(async () => ({
  default: (await import('../features/admin/UsersPage.tsx')).UsersPage,
}))
const ClientsPage = lazy(async () => ({
  default: (await import('../features/admin/ClientsPage.tsx')).ClientsPage,
}))

export function AppRoutes() {
  return (
    <Suspense fallback={<FullPageLoader label="Cargando…" />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path={paths.login} element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route element={<RequirePermission anyOf={AREA_PERMISSIONS.dashboard} />}>
              <Route path={paths.dashboard} element={<DashboardPage />} />
            </Route>

            <Route element={<RequirePermission anyOf={AREA_PERMISSIONS.tickets} />}>
              <Route path={paths.tickets} element={<TicketListPage />} />
              <Route path={paths.ticketDetail} element={<TicketDetailPage />} />
            </Route>

            <Route element={<RequirePermission anyOf={AREA_PERMISSIONS.ticketCreate} />}>
              <Route path={paths.ticketNew} element={<TicketCreatePage />} />
            </Route>

            <Route element={<RequirePermission anyOf={AREA_PERMISSIONS.admin} />}>
              <Route path="/admin" element={<Navigate to={paths.adminUsers} replace />} />
              <Route path={paths.adminUsers} element={<UsersPage />} />
              <Route path={paths.adminClients} element={<ClientsPage />} />
            </Route>
          </Route>

          {/* Raíz y rutas desconocidas: a la primera vista permitida. */}
          <Route path={paths.home} element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
