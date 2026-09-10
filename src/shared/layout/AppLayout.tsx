import { NavLink, Outlet } from 'react-router'
import { hasAnyRole } from '../../features/auth/roles.ts'
import { useSession } from '../../features/auth/useSession.ts'
import { paths } from '../routing/paths.ts'
import styles from './AppLayout.module.css'

const NAV_ITEMS = [
  { to: paths.dashboard, label: 'Dashboard' },
  { to: paths.tickets, label: 'Tickets' },
  { to: paths.ticketNew, label: 'Nuevo ticket' },
]

export function AppLayout() {
  const { user, signOut } = useSession()
  // Solo decide qué se pinta; la API responde 403 a quien no tenga permiso.
  const navItems = hasAnyRole(user, ['admin', 'supervisor'])
    ? [...NAV_ITEMS, { to: '/admin', label: 'Administración' }]
    : NAV_ITEMS

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>Plataforma de Soporte</span>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === paths.tickets}
              className={({ isActive }) =>
                isActive
                  ? `${styles.navLink} ${styles.navLinkActive}`
                  : styles.navLink
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.user}>
          <span>{user?.fullName}</span>
          <button type="button" className={styles.signOut} onClick={() => void signOut()}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
