import { Navigate, Route, Routes } from 'react-router'
import { ClientsPage } from '../features/admin/ClientsPage.tsx'
import { UsersPage } from '../features/admin/UsersPage.tsx'
import { LoginPage } from '../features/auth/LoginPage.tsx'
import { DashboardPage } from '../features/dashboard/DashboardPage.tsx'
import { TicketCreatePage } from '../features/tickets/TicketCreatePage.tsx'
import { TicketDetailPage } from '../features/tickets/TicketDetailPage.tsx'
import { TicketListPage } from '../features/tickets/TicketListPage.tsx'
import { AppLayout } from '../shared/layout/AppLayout.tsx'
import { paths } from '../shared/routing/paths.ts'
import { ProtectedRoute } from '../shared/routing/ProtectedRoute.tsx'
import { PublicOnlyRoute } from '../shared/routing/PublicOnlyRoute.tsx'
import { HomeRedirect } from './HomeRedirect.tsx'
import { AREA_PERMISSIONS } from './navigation.ts'
import { RequirePermission } from './RequirePermission.tsx'

export function AppRoutes() {
  return (
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
  )
}
