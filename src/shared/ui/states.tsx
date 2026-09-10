import { errorMessage, reportableTraceId } from '../api/errorMessage.ts'
import { Button } from './Button.tsx'
import styles from './ui.module.css'

export function LoadingState({ label }: { label: string }) {
  return (
    <p className={styles.state} role="status" aria-live="polite">
      {label}
    </p>
  )
}

export function EmptyState({ label }: { label: string }) {
  return <p className={styles.state}>{label}</p>
}

/** Estado de error con reintento. El traceId solo aparece en fallos del servidor. */
export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown
  onRetry?: () => void
}) {
  const traceId = reportableTraceId(error)

  return (
    <div className={`${styles.state} ${styles.errorState}`} role="alert">
      {errorMessage(error)}
      {traceId ? <span className={styles.traceId}>Referencia: {traceId}</span> : null}
      {onRetry ? (
        <div className={styles.errorActions}>
          <Button onClick={onRetry}>Reintentar</Button>
        </div>
      ) : null}
    </div>
  )
}
