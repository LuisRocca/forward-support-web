import { useCallback, useState } from 'react'
import type { Comment } from '../../shared/api/contract.ts'
import { createCommentRequestSchema } from '../../shared/api/contract.ts'
import { errorMessage } from '../../shared/api/errorMessage.ts'
import { formatDateTime } from '../../shared/format/datetime.ts'
import { zodFieldErrors } from '../../shared/forms/zodFieldErrors.ts'
import { useAsyncData } from '../../shared/hooks/useAsyncData.ts'
import { Badge } from '../../shared/ui/Badge.tsx'
import { Button } from '../../shared/ui/Button.tsx'
import { EmptyState, ErrorState, LoadingState } from '../../shared/ui/states.tsx'
import { addComment, listComments } from './ticketsApi.ts'
import styles from './TicketDetailPage.module.css'

/**
 * Los comentarios internos los filtra el servidor en la consulta: si uno llega
 * al navegador es porque quien mira puede verlo. Aquí solo se distingue
 * visualmente para que nadie escriba en el sitio equivocado.
 */
export function TicketComments({
  ticketId,
  canWriteInternal,
}: {
  ticketId: string
  canWriteInternal: boolean
}) {
  const load = useCallback(
    (signal: AbortSignal) => listComments(ticketId, { limit: 50 }, signal),
    [ticketId],
  )
  const { data, error, isLoading, reload } = useAsyncData(load)

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Comentarios</h2>

      <CommentForm
        ticketId={ticketId}
        canWriteInternal={canWriteInternal}
        onAdded={reload}
      />

      {isLoading ? <LoadingState label="Cargando comentarios…" /> : null}
      {!isLoading && error ? <ErrorState error={error} onRetry={reload} /> : null}
      {!isLoading && !error && data?.data.length === 0 ? (
        <EmptyState label="Todavía no hay comentarios." />
      ) : null}

      {data && data.data.length > 0 ? (
        <ul className={styles.list}>
          {data.data.map((comment) => (
            <li key={comment.id}>
              <CommentCard comment={comment} />
            </li>
          ))}
        </ul>
      ) : null}

      {data?.pageInfo.hasMore ? (
        <p className={styles.muted}>
          Se muestran los {data.data.length} más recientes.
        </p>
      ) : null}
    </section>
  )
}

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <article
      className={`${styles.comment} ${comment.isInternal ? styles.commentInternal : ''}`}
    >
      <div className={styles.commentMeta}>
        <strong>{comment.author.fullName}</strong>
        <span>{formatDateTime(comment.createdAt)}</span>
        {comment.isInternal ? <Badge tone="warning">Interno</Badge> : null}
      </div>
      <p className={styles.commentBody}>{comment.body}</p>
    </article>
  )
}

function CommentForm({
  ticketId,
  canWriteInternal,
  onAdded,
}: {
  ticketId: string
  canWriteInternal: boolean
  onAdded: () => void
}) {
  const [body, setBody] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<unknown>(null)

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    // Las reglas salen del esquema del contrato, no se reescriben aquí.
    const parsed = createCommentRequestSchema.safeParse({ body, isInternal })
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error))
      return
    }

    setFieldErrors({})
    setIsSaving(true)
    try {
      await addComment(ticketId, parsed.data)
      setBody('')
      setIsInternal(false)
      onAdded()
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

      <label className={styles.label} htmlFor="comment-body">
        Añadir comentario
      </label>
      <textarea
        id="comment-body"
        className={styles.textarea}
        value={body}
        maxLength={5000}
        onChange={(event) => setBody(event.target.value)}
        aria-invalid={fieldErrors['body'] ? true : undefined}
      />
      {fieldErrors['body'] ? (
        <span className={styles.fieldError}>{fieldErrors['body']}</span>
      ) : null}

      {canWriteInternal ? (
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={isInternal}
            onChange={(event) => setIsInternal(event.target.checked)}
          />
          Comentario interno (no visible para el cliente)
        </label>
      ) : null}

      <div className={styles.actions}>
        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Guardando…' : 'Comentar'}
        </Button>
      </div>
    </form>
  )
}
