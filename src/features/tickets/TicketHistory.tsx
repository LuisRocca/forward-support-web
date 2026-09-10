import { useCallback } from 'react'
import type { HistoryEntry } from '../../shared/api/contract.ts'
import { formatDateTime } from '../../shared/format/datetime.ts'
import { useAsyncData } from '../../shared/hooks/useAsyncData.ts'
import { EmptyState, ErrorState, LoadingState } from '../../shared/ui/states.tsx'
import { STATUS_LABEL } from './labels.ts'
import { getHistory } from './ticketsApi.ts'
import styles from './TicketDetailPage.module.css'

export function TicketHistory({ ticketId }: Readonly<{ ticketId: string }>) {
  const load = useCallback(
    (signal: AbortSignal) => getHistory(ticketId, signal),
    [ticketId],
  )
  const { data, error, isLoading, reload } = useAsyncData(load)

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Trazabilidad</h2>

      {isLoading ? <LoadingState label="Cargando historial…" /> : null}
      {!isLoading && error ? <ErrorState error={error} onRetry={reload} /> : null}
      {!isLoading && !error && data?.length === 0 ? (
        <EmptyState label="Sin movimientos registrados." />
      ) : null}

      {data && data.length > 0 ? (
        <ol className={`${styles.list} reveal`}>
          {data.map((entry, index) => (
            <li key={`${entry.occurredAt}-${index}`} className={styles.historyItem}>
              <span>{describe(entry)}</span>
              <span className={styles.historyMeta}>
                {entry.actor.fullName} · {formatDateTime(entry.occurredAt)}
              </span>
              {entry.note ? (
                <span className={styles.muted}>«{entry.note}»</span>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  )
}

function describe(entry: HistoryEntry): string {
  if (entry.type === 'status_change') {
    const from = entry.fromStatus ? STATUS_LABEL[entry.fromStatus] : 'creación'
    const to = entry.toStatus ? STATUS_LABEL[entry.toStatus] : '—'
    return `Estado: ${from} → ${to}`
  }

  const from = entry.fromUser?.fullName ?? 'sin asignar'
  const to = entry.toUser?.fullName ?? 'sin asignar'
  return `Asignación: ${from} → ${to}`
}
