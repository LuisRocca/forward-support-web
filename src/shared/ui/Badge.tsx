import styles from './ui.module.css'

export type BadgeTone = 'neutral' | 'info' | 'warning' | 'danger' | 'success'

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: string
  tone?: BadgeTone
}) {
  return (
    <span className={`${styles.badge} ${styles[`tone-${tone}`] ?? ''}`}>
      {children}
    </span>
  )
}
