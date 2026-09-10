import { useLayoutEffect, useRef } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { isEntryActive, visibleEntries } from '../../app/navigation.ts'
import { useSession } from '../../features/auth/useSession.ts'
import { ROLE_LABEL } from '../../features/users/labels.ts'
import { NavIcon } from './NavIcon.tsx'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const { user, signOut } = useSession()
  const { pathname } = useLocation()
  // Solo decide qué se pinta; la API responde 403 a quien no tenga permiso.
  const navItems = visibleEntries(user?.permissions ?? [])
  const activeIndex = navItems.findIndex((item) => isEntryActive(item.to, pathname))

  const navRef = useRef<HTMLElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)

  // La línea naranja se desliza hasta la entrada activa. Se escribe el estilo
  // en el DOM directamente: es sincronizar con el layout, no estado de React.
  useLayoutEffect(() => {
    const indicator = indicatorRef.current
    const active = navRef.current?.querySelectorAll<HTMLElement>('a')[activeIndex]
    if (!indicator) return
    indicator.style.opacity = active ? '1' : '0'
    if (active) indicator.style.transform = `translateY(${active.offsetTop}px)`
  }, [activeIndex])

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img className={styles.brandMark} src="/favicon.svg" alt="" width={28} height={28} />
          <span>Plataforma de Soporte</span>
        </div>

        <nav ref={navRef} className={styles.nav} aria-label="Principal">
          <span ref={indicatorRef} className={styles.indicator} aria-hidden="true" />
          {navItems.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              className={styles.navLink}
              aria-current={index === activeIndex ? 'page' : undefined}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.user}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.fullName}</span>
            <span className={styles.userRole}>
              {user?.roles.map((role) => ROLE_LABEL[role]).join(', ')}
            </span>
          </div>
          <button type="button" className={styles.signOut} onClick={() => void signOut()}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        {/* La clave reinicia la entrada suave en cada cambio de vista. */}
        <div key={pathname} className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
