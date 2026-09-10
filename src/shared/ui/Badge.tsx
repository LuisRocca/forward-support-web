import styles from './ui.module.css'

export type BadgeTone = 'neutral' | 'info' | 'accent' | 'warning' | 'danger' | 'success'

export function Badge({
  children,
  tone = 'neutral',
}: Readonly<{
  children: string
  tone?: BadgeTone
}>) {
  const toneClass = styles[`tone-${tone}`] ?? ''
  return (
    <span className={`${styles.badge} ${toneClass}`}>
      {children}
    </span>
  )
}
