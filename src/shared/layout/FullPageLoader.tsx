/** Pantalla de espera mientras se resuelve si hay sesión. */
export function FullPageLoader({ label }: Readonly<{ label: string }>) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        color: 'var(--color-text-muted)',
      }}
    >
      {label}
    </div>
  )
}
