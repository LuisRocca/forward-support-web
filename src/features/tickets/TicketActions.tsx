import { useCallback, useState } from 'react'
import type { TicketDetail, TicketStatus } from '../../shared/api/contract.ts'
import { errorMessage } from '../../shared/api/errorMessage.ts'
import { useAsyncData } from '../../shared/hooks/useAsyncData.ts'
import { Button } from '../../shared/ui/Button.tsx'
import { listUsers } from '../users/usersApi.ts'
import { STATUS_LABEL, STATUS_ORDER } from './labels.ts'
import { assignTicket, changeTicketStatus } from './ticketsApi.ts'
import styles from './TicketDetailPage.module.css'

/**
 * Asignar y cambiar estado van por sus endpoints propios, no por el PATCH del
 * ticket: cada acción deja rastro en el historial.
 */
export function TicketActions({
  ticket,
  canAssign,
  onUpdated,
}: {
  ticket: TicketDetail
  canAssign: boolean
  onUpdated: (updated: TicketDetail) => void
}) {
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Acciones</h2>
      <StatusForm ticket={ticket} onUpdated={onUpdated} />
      {canAssign ? <AssignForm ticket={ticket} onUpdated={onUpdated} /> : null}
    </section>
  )
}

function StatusForm({
  ticket,
  onUpdated,
}: {
  ticket: TicketDetail
  onUpdated: (updated: TicketDetail) => void
}) {
  const [status, setStatus] = useState<TicketStatus>(ticket.status)
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<unknown>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSaving(true)
    try {
      // Una transición no permitida responde 409 y su mensaje se muestra tal cual.
      onUpdated(await changeTicketStatus(ticket.id, { status, note: note || undefined }))
      setNote('')
    } catch (cause) {
      setError(cause)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
      {error ? (
        <p className={styles.formError} role="alert">
          {errorMessage(error)}
        </p>
      ) : null}

      <label className={styles.label} htmlFor="status-select">
        Cambiar estado
      </label>
      <select
        id="status-select"
        className={styles.select}
        value={status}
        onChange={(event) => setStatus(asStatus(event.target.value, status))}
      >
        {STATUS_ORDER.map((option) => (
          <option key={option} value={option}>
            {STATUS_LABEL[option]}
          </option>
        ))}
      </select>

      <label className={styles.label} htmlFor="status-note">
        Nota (opcional)
      </label>
      <input
        id="status-note"
        className={styles.input}
        value={note}
        maxLength={255}
        onChange={(event) => setNote(event.target.value)}
      />

      <div className={styles.actions}>
        <Button
          type="submit"
          variant="primary"
          disabled={isSaving || status === ticket.status}
        >
          {isSaving ? 'Guardando…' : 'Aplicar estado'}
        </Button>
      </div>
    </form>
  )
}

function AssignForm({
  ticket,
  onUpdated,
}: {
  ticket: TicketDetail
  onUpdated: (updated: TicketDetail) => void
}) {
  const loadAgents = useCallback(
    (signal: AbortSignal) =>
      listUsers({ roleCode: 'agent', status: 'active', limit: 100 }, signal),
    [],
  )
  const { data: agents, error: agentsError } = useAsyncData(loadAgents)

  const [assignedToUserId, setAssignedToUserId] = useState(
    ticket.assignedTo?.id ?? '',
  )
  const [reason, setReason] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<unknown>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!assignedToUserId) return

    setError(null)
    setIsSaving(true)
    try {
      onUpdated(
        await assignTicket(ticket.id, {
          assignedToUserId,
          reason: reason || undefined,
        }),
      )
      setReason('')
    } catch (cause) {
      setError(cause)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
      {error ? (
        <p className={styles.formError} role="alert">
          {errorMessage(error)}
        </p>
      ) : null}
      {agentsError ? (
        <p className={styles.formError} role="alert">
          No se pudo cargar la lista de agentes. {errorMessage(agentsError)}
        </p>
      ) : null}

      <label className={styles.label} htmlFor="assign-select">
        Asignar a
      </label>
      <select
        id="assign-select"
        className={styles.select}
        value={assignedToUserId}
        onChange={(event) => setAssignedToUserId(event.target.value)}
      >
        <option value="">Selecciona un agente…</option>
        {(agents?.data ?? []).map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.fullName}
          </option>
        ))}
      </select>

      <label className={styles.label} htmlFor="assign-reason">
        Motivo (opcional)
      </label>
      <input
        id="assign-reason"
        className={styles.input}
        value={reason}
        maxLength={255}
        onChange={(event) => setReason(event.target.value)}
      />

      <div className={styles.actions}>
        <Button
          type="submit"
          disabled={isSaving || !assignedToUserId || assignedToUserId === ticket.assignedTo?.id}
        >
          {isSaving ? 'Guardando…' : 'Asignar'}
        </Button>
      </div>
    </form>
  )
}

/** El valor de un `<select>` es string; solo se acepta si es del contrato. */
function asStatus(value: string, fallback: TicketStatus): TicketStatus {
  return STATUS_ORDER.find((status) => status === value) ?? fallback
}
