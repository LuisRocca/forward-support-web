import { NavLink, Outlet } from 'react-router'
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

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>Plataforma de Soporte</span>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
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
