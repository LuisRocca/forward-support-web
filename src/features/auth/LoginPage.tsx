import { useState } from 'react'
import { useSession } from './useSession.ts'
import styles from './LoginPage.module.css'

/**
 * Placeholder del inicio de sesión: solo abre la sesión simulada para poder
 * recorrer las rutas protegidas. El formulario real (validación, errores)
 * llega con el contrato de autenticación.
 */
export function LoginPage() {
  const { signIn } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSignIn() {
    setIsSubmitting(true)
    try {
      await signIn()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Plataforma de Soporte</h1>
        <p className={styles.note}>
          Formulario pendiente. De momento se abre una sesión simulada para
          poder recorrer el resto de vistas.
        </p>
        <button
          type="button"
          className={styles.submit}
          disabled={isSubmitting}
          onClick={() => void handleSignIn()}
        >
          {isSubmitting ? 'Entrando…' : 'Entrar (sesión simulada)'}
        </button>
      </section>
    </div>
  )
}
