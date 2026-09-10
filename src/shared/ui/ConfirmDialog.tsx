import { Button } from './Button.tsx'
import { Dialog } from './Dialog.tsx'
import styles from './ui.module.css'

/**
 * Confirmación antes de una acción con consecuencias. El foco empieza en
 * "Cancelar", la opción segura, y Escape también cancela.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  busy = false,
  onConfirm,
  onCancel,
}: Readonly<{
  title: string
  message: string
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}>) {
  return (
    <Dialog title={title} onClose={onCancel}>
      <p className={styles.dialogText}>{message}</p>
      <div className={styles.dialogActions}>
        <Button onClick={onCancel} disabled={busy}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={busy}>
          {busy ? 'Un momento…' : confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
