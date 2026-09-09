import styles from './PagePlaceholder.module.css'

/** Vista aún sin implementar: espera a que el contrato de API esté congelado. */
export function PagePlaceholder({ title }: { title: string }) {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.note}>
        Pendiente de implementar. La vista se construye cuando el contrato de la
        API esté congelado.
      </p>
    </section>
  )
}
