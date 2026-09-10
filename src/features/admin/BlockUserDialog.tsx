import { useId, useState } from 'react'
import { blockUserRequestSchema } from '../../shared/api/contract.ts'
import type { User } from '../../shared/api/contract.ts'
import { errorMessage } from '../../shared/api/errorMessage.ts'
import { zodFieldErrors } from '../../shared/forms/zodFieldErrors.ts'
import { Button } from '../../shared/ui/Button.tsx'
import { Dialog } from '../../shared/ui/Dialog.tsx'
import { blockUser } from '../users/usersApi.ts'
import styles from './admin.module.css'

/** Bloquear pide confirmación y un motivo, que queda en la auditoría. */
export function BlockUserDialog({
  user,
  onBlocked,
  onCancel,
}: Readonly<{
  user: User
  onBlocked: (updated: User) => void
  onCancel: () => void
}>) {
  const reasonId = useId()

  const [reason, setReason] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    // El motivo es obligatorio y sus límites salen del contrato.
    const parsed = blockUserRequestSchema.safeParse({ reason })
    if (!parsed.success) {
      setFieldError(zodFieldErrors(parsed.error)['reason'] ?? null)
      return
    }

    setFieldError(null)
    setIsSaving(true)
    try {
      onBlocked(await blockUser(user.id, parsed.data))
    } catch (cause) {
      setError(cause)
      setIsSaving(false)
    }
  }

  return (
    <Dialog title={`¿Seguro que quieres bloquear a ${user.fullName}?`} onClose={onCancel}>
      <form className={styles.dialogForm} onSubmit={(e) => void handleSubmit(e)}>
        <p className={styles.muted}>
          Se cerrarán al instante todas sus sesiones abiertas. Podrás
          desbloquearlo después.
        </p>

        {error ? (
          <p className={styles.formError} role="alert">
            {errorMessage(error)}
          </p>
        ) : null}

        <label className={styles.field} htmlFor={reasonId}>
          <span>Motivo (obligatorio)</span>
          <textarea
            id={reasonId}
            className={styles.textarea}
            value={reason}
            maxLength={255}
            required
            onChange={(event) => setReason(event.target.value)}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? `${reasonId}-error` : undefined}
          />
        </label>
        {fieldError ? (
          <span id={`${reasonId}-error`} className={styles.fieldError}>
            {fieldError}
          </span>
        ) : null}

        <div className={styles.actions}>
          <Button onClick={onCancel} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Bloqueando…' : 'Bloquear'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
