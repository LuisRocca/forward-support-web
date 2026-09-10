import { useCallback } from 'react'
import { Link } from 'react-router'
import type { DashboardMetrics } from '../../shared/api/contract.ts'
import { formatDateTime } from '../../shared/format/datetime.ts'
import { formatDecimal, formatInteger } from '../../shared/format/number.ts'
import { useAsyncData } from '../../shared/hooks/useAsyncData.ts'
import { paths } from '../../shared/routing/paths.ts'
import { ErrorState, LoadingState } from '../../shared/ui/states.tsx'
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
} from '../tickets/labels.ts'
import { STALE_HOURS } from '../tickets/ticketFilters.ts'
import { getDashboardMetrics } from './metricsApi.ts'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const load = useCallback(
    (signal: AbortSignal) => getDashboardMetrics(signal),
    [],
  )
  const { data, error, isLoading, reload } = useAsyncData(load)

  if (isLoading) return <LoadingState label="Cargando métricas…" />
  if (error || !data) return <ErrorState error={error} onRetry={reload} />

  return (
    <section className={`${styles.page} reveal`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard operativo</h1>
        {/* Los datos vienen de una vista materializada: se dice de cuándo son
            en vez de aparentar tiempo real. */}
        <span className={styles.generatedAt}>
          Datos calculados el {formatDateTime(data.generatedAt)}
        </span>
      </div>

      <div className={styles.tiles}>
        <Tile label="Tickets abiertos" value={data.openTickets} />
        <Tile
          label={`Estancados (+${STALE_HOURS} h sin actividad)`}
          value={data.staleTickets}
          to={`${paths.tickets}?stale=1`}
        />
        <Tile
          label="Sin asignar"
          value={data.unassignedTickets}
          to={`${paths.tickets}?unassigned=1`}
        />
        {data.resolvedLast7Days === undefined ? null : (
          <Tile label="Resueltos (7 días)" value={data.resolvedLast7Days} />
        )}
      </div>

      <div className={styles.panels}>
        <Breakdown
          title="Por estado"
          rows={data.byStatus.map((entry) => ({
            key: entry.status,
            label: STATUS_LABEL[entry.status],
            value: entry.count,
          }))}
        />
        <Breakdown
          title="Por prioridad"
          rows={data.byPriority.map((entry) => ({
            key: entry.priority,
            label: PRIORITY_LABEL[entry.priority],
            value: entry.count,
          }))}
        />
        <AverageResolution data={data.avgResolutionHoursByPriority} />
      </div>
    </section>
  )
}

function Tile({
  label,
  value,
  to,
}: Readonly<{
  label: string
  value: number
  to?: string
}>) {
  const content = (
    <>
      <span className={styles.tileValue}>{formatInteger(value)}</span>
      <span className={styles.tileLabel}>{label}</span>
    </>
  )

  if (!to) return <div className={styles.tile}>{content}</div>
  return (
    <Link className={styles.tile} to={to}>
      {content}
    </Link>
  )
}

interface BreakdownRow {
  key: string
  label: string
  value: number
}

function Breakdown({ title, rows }: Readonly<{ title: string; rows: BreakdownRow[] }>) {
  const max = Math.max(1, ...rows.map((row) => row.value))

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>{title}</h2>
      <ul className={styles.rows}>
        {rows.map((row) => (
          <li key={row.key} className={styles.row}>
            <span>{row.label}</span>
            <span className={styles.count}>{formatInteger(row.value)}</span>
            <span className={styles.bar}>
              <span
                className={styles.barFill}
                style={{ width: `${(row.value / max) * 100}%` }}
              />
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function AverageResolution({
  data,
}: Readonly<{
  data: DashboardMetrics['avgResolutionHoursByPriority']
}>) {
  if (!data || data.length === 0) return null

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Resolución media</h2>
      <ul className={styles.rows}>
        {data.map((entry) => (
          <li key={entry.priority} className={styles.row}>
            <span>{PRIORITY_LABEL[entry.priority]}</span>
            <span className={styles.count}>
              {entry.hours === null ? '—' : `${formatDecimal(entry.hours)} h`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
