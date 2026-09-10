import { useId, useState } from 'react'
import { Button } from '../../shared/ui/Button.tsx'
import { AdminTabs } from './AdminTabs.tsx'
import { ClientsResults } from './ClientsResults.tsx'
import styles from './admin.module.css'

export function ClientsPage() {
  const searchId = useId()
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [onlyActive, setOnlyActive] = useState(false)

  // La búsqueda se aplica al enviar, no con cada tecla: una petición por
  // búsqueda y no una por carácter.
  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearch(draft.trim())
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Administración</h1>
        <AdminTabs />
      </header>

      <form className={styles.filters} role="search" onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor={searchId}>Buscar cliente</label>
          <div className={styles.search}>
            <input
              id={searchId}
              className={styles.input}
              type="search"
              maxLength={120}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <Button type="submit">Buscar</Button>
          </div>
        </div>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={(event) => setOnlyActive(event.target.checked)}
          />
          <span>Solo activos</span>
        </label>
      </form>

      <ClientsResults
        key={`${search}|${onlyActive ? '1' : '0'}`}
        search={search}
        onlyActive={onlyActive}
      />
    </section>
  )
}
