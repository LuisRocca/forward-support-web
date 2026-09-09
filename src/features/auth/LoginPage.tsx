import { useId, useState } from 'react'
import {
  errorMessage,
  fieldErrorsOf,
  reportableTraceId,
} from '../../shared/api/errorMessage.ts'
import { useSession } from './useSession.ts'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const { signIn, endedReason } = useSession()
  const emailId = useId()
  const passwordId = useId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const fieldErrors = fieldErrorsOf(error)
  const traceId = reportableTraceId(error)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await signIn(email, password)
    } catch (cause) {
      setError(cause)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={(e) => void handleSubmit(e)}>
        <h1 className={styles.title}>Plataforma de Soporte</h1>

        {endedReason && !error ? (
          <p className={styles.notice}>{endedReason}</p>
        ) : null}

        {error ? (
          <p className={styles.alert} role="alert">
            {errorMessage(error)}
            {traceId ? (
              <span className={styles.traceId}>Referencia: {traceId}</span>
            ) : null}
          </p>
        ) : null}

        <div className={styles.field}>
          <label className={styles.label} htmlFor={emailId}>
            Correo electrónico
          </label>
          <input
            id={emailId}
            className={styles.input}
            type="email"
            name="email"
            autoComplete="username"
            required
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={fieldErrors['email'] ? true : undefined}
            aria-describedby={fieldErrors['email'] ? `${emailId}-error` : undefined}
          />
          {fieldErrors['email'] ? (
            <span id={`${emailId}-error`} className={styles.fieldError}>
              {fieldErrors['email']}
            </span>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={passwordId}>
            Contraseña
          </label>
          <input
            id={passwordId}
            className={styles.input}
            type="password"
            name="password"
            autoComplete="current-password"
            required
            minLength={8}
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={fieldErrors['password'] ? true : undefined}
            aria-describedby={
              fieldErrors['password'] ? `${passwordId}-error` : undefined
            }
          />
          {fieldErrors['password'] ? (
            <span id={`${passwordId}-error`} className={styles.fieldError}>
              {fieldErrors['password']}
            </span>
          ) : null}
        </div>

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
