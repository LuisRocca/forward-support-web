import { useCallback } from 'react'
import { Link } from 'react-router'
import type { TicketSummary } from '../../shared/api/contract.ts'
import { formatDateTime, hoursSince } from '../../shared/format/datetime.ts'
import { useKeysetList } from '../../shared/hooks/useKeysetList.ts'
import { ticketDetailPath } from '../../shared/routing/paths.ts'
import { Badge } from '../../shared/ui/Badge.tsx'
import { Button } from '../../shared/ui/Button.tsx'
import { EmptyState, ErrorState, LoadingState } from '../../shared/ui/states.tsx'
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  isOpen,
  priorityTone,
  statusTone,
} from './labels.ts'
import { STALE_HOURS } from './ticketFilters.ts'
import { listTickets } from './ticketsApi.ts'
import type { TicketListParams } from './ticketsApi.ts'
import styles from './TicketListPage.module.css'

/**
 * Resultados del listado. Se remonta con una `key` cuando cambian los filtros,
 * de modo que la paginación acumulada empieza limpia sin resetear estado a mano.
 */
export function TicketResults({ params }: Readonly<{ params: TicketListParams }>) {
  const fetchPage = useCallback(
    (cursor: string | null, signal?: AbortSignal) =>
      listTickets({ ...params, cursor }, signal),
    [params],
  )
  const { items, pageInfo, error, isLoading, isLoadingMore, loadMore } =
    useKeysetList(fetchPage)

  if (isLoading) return <LoadingState label="Cargando tickets…" />
  if (error) return <ErrorState error={error} />
  if (items.length === 0) {
    return <EmptyState label="Ningún ticket coincide con estos filtros." />
  }

  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.muted}>
            {items.length} tickets cargados
            {pageInfo?.hasMore ? ', hay más disponibles' : ''}
          </caption>
          <thead>
            <tr>
              <th scope="col">Código</th>
              <th scope="col">Título</th>
              <th scope="col">Cliente</th>
              <th scope="col">Estado</th>
              <th scope="col">Prioridad</th>
              <th scope="col">Asignado a</th>
              <th scope="col">Última actividad</th>
            </tr>
          </thead>
          <tbody>
            {items.map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} />
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        {pageInfo?.hasMore ? (
          <Button disabled={isLoadingMore} onClick={() => void loadMore()}>
            {isLoadingMore ? 'Cargando…' : 'Cargar más'}
          </Button>
        ) : (
          <span className={styles.muted}>No hay más resultados.</span>
        )}
      </div>
    </>
  )
}

function TicketRow({ ticket }: Readonly<{ ticket: TicketSummary }>) {
  const isStale =
    isOpen(ticket.status) && hoursSince(ticket.lastActivityAt) > STALE_HOURS

  return (
    <tr>
      <td className={styles.code}>{ticket.code}</td>
      <td className={styles.ticketTitle}>
        <Link to={ticketDetailPath(ticket.id)}>{ticket.title}</Link>
      </td>
      <td>{ticket.client.name}</td>
      <td>
        <Badge tone={statusTone(ticket.status)}>
          {STATUS_LABEL[ticket.status]}
        </Badge>
      </td>
      <td>
        <Badge tone={priorityTone(ticket.priority)}>
          {PRIORITY_LABEL[ticket.priority]}
        </Badge>
      </td>
      <td className={ticket.assignedTo ? '' : styles.muted}>
        {ticket.assignedTo?.fullName ?? 'Sin asignar'}
      </td>
      <td>
        {formatDateTime(ticket.lastActivityAt)}{' '}
        {isStale ? <Badge tone="danger">Estancado</Badge> : null}
      </td>
    </tr>
  )
}
