import { useCallback, useId, useState } from 'react'
import { updateTicketRequestSchema } from '../../shared/api/contract.ts'
import type {
  TicketDetail,
  TicketPriority,
  UpdateTicketRequest,
} from '../../shared/api/contract.ts'
import { errorMessage, fieldErrorsOf } from '../../shared/api/errorMessage.ts'
import { zodFieldErrors } from '../../shared/forms/zodFieldErrors.ts'
import { useAsyncData } from '../../shared/hooks/useAsyncData.ts'
import { Button } from '../../shared/ui/Button.tsx'
import { listCategories } from '../catalog/catalogApi.ts'
import { PRIORITY_LABEL, PRIORITY_ORDER } from './labels.ts'
import { updateTicket } from './ticketsApi.ts'
import styles from './TicketDetailPage.module.css'

/** Edición del contenido. Estado y asignación van por sus propios endpoints. */
export function TicketEditForm({
  ticket,
  onSaved,
  onCancel,
}: {
  ticket: TicketDetail
  onSaved: (updated: TicketDetail) => void
  onCancel: () => void
}) {
  const ids = { title: useId(), description: useId(), priority: useId(), category: useId() }
  const loadCategories = useCallback(() => listCategories(), [])
  const { data: categories } = useAsyncData(loadCategories)

  const [title, setTitle] = useState(ticket.title)
  const [description, setDescription] = useState(ticket.description)
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority)
  const [categoryId, setCategoryId] = useState(ticket.category?.id ?? '')
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<unknown>(null)
  const [isSaving, setIsSaving] = useState(false)

  const fieldErrors = { ...localErrors, ...fieldErrorsOf(error) }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    // Solo viajan los campos que cambiaron: el PATCH es parcial.
    const changes: UpdateTicketRequest = {}
    if (title !== ticket.title) changes.title = title
    if (description !== ticket.description) changes.description = description
    if (priority !== ticket.priority) changes.priority = priority
    if (categoryId !== (ticket.category?.id ?? '')) changes.categoryId = categoryId || null

    const parsed = updateTicketRequestSchema.safeParse(changes)
    if (!parsed.success) {
      const errors = zodFieldErrors(parsed.error)
      setLocalErrors(Object.keys(errors).length > 0 ? errors : { form: parsed.error.issues[0]?.message ?? '' })
      return
    }

    setLocalErrors({})
    setIsSaving(true)
    try {
      onSaved(await updateTicket(ticket.id, parsed.data))
    } catch (cause) {
      setError(cause)
      setIsSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
      {error || fieldErrors['form'] ? (
        <p className={styles.formError} role="alert">
          {error ? errorMessage(error) : fieldErrors['form']}
        </p>
      ) : null}

      <label className={styles.label} htmlFor={ids.title}>Título</label>
      <input
        id={ids.title}
        className={styles.input}
        value={title}
        maxLength={200}
        onChange={(event) => setTitle(event.target.value)}
        aria-invalid={fieldErrors['title'] ? true : undefined}
        aria-describedby={fieldErrors['title'] ? `${ids.title}-error` : undefined}
      />
      {fieldErrors['title'] ? (
        <span id={`${ids.title}-error`} className={styles.fieldError}>{fieldErrors['title']}</span>
      ) : null}

      <label className={styles.label} htmlFor={ids.description}>Descripción</label>
      <textarea
        id={ids.description}
        className={styles.textarea}
        value={description}
        maxLength={10000}
        onChange={(event) => setDescription(event.target.value)}
        aria-invalid={fieldErrors['description'] ? true : undefined}
        aria-describedby={fieldErrors['description'] ? `${ids.description}-error` : undefined}
      />
      {fieldErrors['description'] ? (
        <span id={`${ids.description}-error`} className={styles.fieldError}>
          {fieldErrors['description']}
        </span>
      ) : null}

      <label className={styles.label} htmlFor={ids.priority}>Prioridad</label>
      <select
        id={ids.priority}
        className={styles.select}
        value={priority}
        onChange={(event) =>
          setPriority(PRIORITY_ORDER.find((p) => p === event.target.value) ?? priority)
        }
      >
        {PRIORITY_ORDER.map((option) => (
          <option key={option} value={option}>{PRIORITY_LABEL[option]}</option>
        ))}
      </select>

      <label className={styles.label} htmlFor={ids.category}>Categoría</label>
      <select
        id={ids.category}
        className={styles.select}
        value={categoryId}
        onChange={(event) => setCategoryId(event.target.value)}
      >
        <option value="">Sin categoría</option>
        {(categories ?? []).map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Guardando…' : 'Guardar cambios'}
        </Button>
        <Button onClick={onCancel} disabled={isSaving}>Cancelar</Button>
      </div>
    </form>
  )
}
