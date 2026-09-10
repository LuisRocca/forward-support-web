import { NavLink } from 'react-router'
import { paths } from '../../shared/routing/paths.ts'
import styles from './admin.module.css'

const TABS = [
  { to: paths.adminUsers, label: 'Usuarios' },
  { to: paths.adminClients, label: 'Clientes' },
]

export function AdminTabs() {
  return (
    <nav className={styles.tabs} aria-label="Secciones de administración">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
