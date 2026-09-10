import type { ReactNode } from 'react'
import styles from './ui.module.css'

/**
 * Contenido que se está actualizando: sigue visible y atenuado, con una barra
 * de progreso fina, en lugar de desaparecer y hacer saltar la página.
 */
export function Refreshable({
  refreshing,
  children,
}: Readonly<{ refreshing: boolean; children: ReactNode }>) {
  return (
    <div className={styles.refreshable} data-refreshing={refreshing} aria-busy={refreshing}>
      <div className={styles.refreshBar} aria-hidden="true" />
      <div className={styles.refreshContent}>{children}</div>
    </div>
  )
}
