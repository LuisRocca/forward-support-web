import { useCallback, useId, useState } from 'react'
import { useNavigate } from 'react-router'
import { createTicketRequestSchema } from '../../shared/api/contract.ts'
import type { TicketPriority } from '../../shared/api/contract.ts'
import {
  errorMessage,
  fieldErrorsOf,
  reportableTraceId,
} from '../../shared/api/errorMessage.ts'
import { zodFieldErrors } from '../../shared/forms/zodFieldErrors.ts'
import { useAsyncData } from '../../shared/hooks/useAsyncData.ts'
import { ticketDetailPath } from '../../shared/routing/paths.ts'
import { Button } from '../../shared/ui/Button.tsx'
import { listCategories, listClients } from '../catalog/catalogApi.ts'
import { PRIORITY_LABEL, PRIORITY_ORDER } from './labels.ts'
import { createTicket } from './ticketsApi.ts'
import styles from './TicketCreatePage.module.css'

export function TicketCreatePage() {
  const navigate = useNavigate()
  const ids = {
    client: useId(),
    category: useId(),
    title: useId(),
    description: useId(),
    priority: useId(),
  }

  const loadClients = useCallback(
    (signal: AbortSignal) => listClients({ isActive: true, limit: 100 }, signal),
    [],
  )
  const { data: clients, error: clientsError } = useAsyncData(loadClients)

  // El catálogo se pide una vez por sesión, no en cada carga del formulario.
  const loadCategories = useCallback(() => listCategories(), [])
  const { data: categories } = useAsyncData(loadCategories)

  const [clientId, setClientId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TicketPriority>('medium')

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<unknown>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Los 422 del servidor llegan campo a campo y se mezclan con los locales.
  const fieldErrors = { ...localErrors, ...fieldErrorsOf(error) }
  const traceId = reportableTraceId(error)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsed = createTicketRequestSchema.safeParse({
      clientId,
      categoryId: categoryId || null,
      title,
      description,
      priority,
    })

    if (!parsed.success) {
      setLocalErrors(zodFieldErrors(parsed.error))
      return
    }

    setLocalErrors({})
    setIsSaving(true)
    try {
      const created = await createTicket(parsed.data)
      await navigate(ticketDetailPath(created.id), { replace: true })
    } catch (cause) {
      setError(cause)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Nuevo ticket</h1>

      <form className={styles.card} onSubmit={(e) => void handleSubmit(e)}>
        {error ? (
          <p className={styles.formError} role="alert">
            {errorMessage(error)}
            {traceId ? (
              <span className={styles.traceId}>Referencia: {traceId}</span>
            ) : null}
          </p>
        ) : null}

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={ids.client}>
              Cliente
            </label>
            <select
              id={ids.client}
              className={styles.select}
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              aria-invalid={fieldErrors['clientId'] ? true : undefined}
            >
              <option value="">Selecciona un cliente…</option>
              {(clients?.data ?? []).map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {fieldErrors['clientId'] ? (
              <span className={styles.fieldError}>{fieldErrors['clientId']}</span>
            ) : null}
            {clientsError ? (
              <span className={styles.fieldError}>
                No se pudo cargar la lista de clientes.
              </span>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={ids.category}>
              Categoría (opcional)
            </label>
            <select
              id={ids.category}
              className={styles.select}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              <option value="">Sin categoría</option>
              {(categories ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={ids.title}>
            Título
          </label>
          <input
            id={ids.title}
            className={styles.input}
            value={title}
            maxLength={200}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={fieldErrors['title'] ? true : undefined}
          />
          {fieldErrors['title'] ? (
            <span className={styles.fieldError}>{fieldErrors['title']}</span>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={ids.description}>
            Descripción
          </label>
          <textarea
            id={ids.description}
            className={styles.textarea}
            value={description}
            maxLength={10000}
            onChange={(event) => setDescription(event.target.value)}
            aria-invalid={fieldErrors['description'] ? true : undefined}
          />
          {fieldErrors['description'] ? (
            <span className={styles.fieldError}>
              {fieldErrors['description']}
            </span>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={ids.priority}>
            Prioridad
          </label>
          <select
            id={ids.priority}
            className={styles.select}
            value={priority}
            onChange={(event) =>
              setPriority(asPriority(event.target.value, priority))
            }
          >
            {PRIORITY_ORDER.map((option) => (
              <option key={option} value={option}>
                {PRIORITY_LABEL[option]}
              </option>
            ))}
          </select>
        </div>

        <p className={styles.hint}>
          La asignación se hace desde el detalle del ticket, para que quede
          registrada en su historial.
        </p>

        <div className={styles.actions}>
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Creando…' : 'Crear ticket'}
          </Button>
        </div>
      </form>
    </section>
  )
}

/** El valor de un `<select>` es string; solo se acepta si es del contrato. */
function asPriority(value: string, fallback: TicketPriority): TicketPriority {
  return PRIORITY_ORDER.find((priority) => priority === value) ?? fallback
}
