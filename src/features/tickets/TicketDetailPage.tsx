import { useCallback, useState } from 'react'
import { useParams } from 'react-router'
import type { TicketDetail } from '../../shared/api/contract.ts'
import { formatDateTime } from '../../shared/format/datetime.ts'
import { useAsyncData } from '../../shared/hooks/useAsyncData.ts'
import { Badge } from '../../shared/ui/Badge.tsx'
import { Button } from '../../shared/ui/Button.tsx'
import { ErrorState, LoadingState } from '../../shared/ui/states.tsx'
import { hasAnyRole } from '../auth/roles.ts'
import { useSession } from '../auth/useSession.ts'
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  priorityTone,
  statusTone,
} from './labels.ts'
import { TicketActions } from './TicketActions.tsx'
import { TicketComments } from './TicketComments.tsx'
import { TicketEditForm } from './TicketEditForm.tsx'
import { TicketHistory } from './TicketHistory.tsx'
import { getTicket } from './ticketsApi.ts'
import styles from './TicketDetailPage.module.css'

export function TicketDetailPage() {
  const { ticketId } = useParams()

  if (!ticketId) {
    return <ErrorState error={new Error('Falta el identificador del ticket')} />
  }

  return <TicketDetailView key={ticketId} ticketId={ticketId} />
}

function TicketDetailView({ ticketId }: { ticketId: string }) {
  const { user } = useSession()
  const load = useCallback(
    (signal: AbortSignal) => getTicket(ticketId, signal),
    [ticketId],
  )
  const { data, error, isLoading, reload } = useAsyncData(load)
  const [updated, setUpdated] = useState<TicketDetail | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  // Cambia con cada acción para que el historial se vuelva a pedir.
  const [revision, setRevision] = useState(0)

  const ticket = updated ?? data

  function handleUpdated(next: TicketDetail) {
    setUpdated(next)
    setIsEditing(false)
    setRevision((value) => value + 1)
  }

  function handleConflict() {
    setUpdated(null)
    setRevision((value) => value + 1)
    reload()
  }

  // El cargador solo tapa la carga inicial; una recarga tras un 409 no borra
  // la página ni el mensaje de error del formulario.
  if (isLoading && !ticket) return <LoadingState label="Cargando ticket…" />
  if (!ticket) return <ErrorState error={error} onRetry={reload} />

  // Marcar un comentario como interno y reasignar están reservados a admin y
  // supervisor. Es solo interfaz: el servidor lo vuelve a comprobar.
  const isSupervisor = hasAnyRole(user, ['admin', 'supervisor'])
  const isAdmin = hasAnyRole(user, ['admin'])
  // Editar: el admin, o el agente asignado. El supervisor no edita (contrato).
  // Un ticket cerrado no se edita (409 TICKET_CLOSED): reabrir es del admin.
  const canEdit =
    ticket.status !== 'closed' &&
    (isAdmin || (hasAnyRole(user, ['agent']) && ticket.assignedTo?.id === user?.id))

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <span className={styles.code}>{ticket.code}</span>
        <h1 className={styles.title}>{ticket.title}</h1>
        <div className={styles.badges}>
          <Badge tone={statusTone(ticket.status)}>
            {STATUS_LABEL[ticket.status]}
          </Badge>
          <Badge tone={priorityTone(ticket.priority)}>
            {PRIORITY_LABEL[ticket.priority]}
          </Badge>
          <span className={styles.muted}>{ticket.client.name}</span>
        </div>
      </header>

      <div className={styles.columns}>
        <div className={styles.page}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                {isEditing ? 'Editar ticket' : 'Descripción'}
              </h2>
              {canEdit && !isEditing ? (
                <Button onClick={() => setIsEditing(true)}>Editar</Button>
              ) : null}
            </div>
            {isEditing ? (
              <TicketEditForm
                ticket={ticket}
                onSaved={handleUpdated}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <p className={styles.description}>{ticket.description}</p>
            )}
          </section>

          <TicketComments
            ticketId={ticket.id}
            canWriteInternal={isSupervisor}
          />
        </div>

        <div className={styles.page}>
          <TicketFacts ticket={ticket} />
          <TicketActions
            ticket={ticket}
            canAssign={isSupervisor}
            onUpdated={handleUpdated}
            onConflict={handleConflict}
          />
          <TicketHistory key={revision} ticketId={ticket.id} />
        </div>
      </div>
    </section>
  )
}

function TicketFacts({ ticket }: { ticket: TicketDetail }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Datos</h2>
      <dl className={styles.facts}>
        <dt>Asignado a</dt>
        <dd>{ticket.assignedTo?.fullName ?? 'Sin asignar'}</dd>

        <dt>Creado por</dt>
        <dd>{ticket.createdBy.fullName}</dd>

        <dt>Categoría</dt>
        <dd>{ticket.category?.name ?? '—'}</dd>

        <dt>Creado</dt>
        <dd>{formatDateTime(ticket.createdAt)}</dd>

        <dt>Última actividad</dt>
        <dd>{formatDateTime(ticket.lastActivityAt)}</dd>

        <dt>Vencimiento</dt>
        <dd>{ticket.dueAt ? formatDateTime(ticket.dueAt) : '—'}</dd>

        <dt>Resuelto por</dt>
        <dd>{ticket.resolvedBy?.fullName ?? '—'}</dd>

        <dt>Comentarios</dt>
        <dd>{ticket.commentCount}</dd>

        <dt>Reaperturas</dt>
        <dd>{ticket.reopenedCount}</dd>

        <dt>Reasignaciones</dt>
        <dd>{ticket.reassignmentCount}</dd>
      </dl>
    </section>
  )
}
