import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import styles from './ui.module.css'

/**
 * `<dialog>` nativo en modo modal: el navegador ya da foco atrapado, cierre
 * con Escape y fondo inerte, sin reimplementarlo a mano.
 */
export function Dialog({
  title,
  onClose,
  children,
}: Readonly<{ title: string; onClose: () => void; children: ReactNode }>) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId} onClose={onClose}>
      <div className={styles.dialogBody}>
        <h2 id={titleId} className={styles.dialogTitle}>
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  )
}
