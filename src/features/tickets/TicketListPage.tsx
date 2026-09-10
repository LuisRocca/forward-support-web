import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '../../shared/ui/Button.tsx'
import {
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  STATUS_LABEL,
  STATUS_ORDER,
} from './labels.ts'
import {
  SORT_LABEL,
  SORT_OPTIONS,
  STALE_HOURS,
  paramsFromSearch,
} from './ticketFilters.ts'
import { TicketResults } from './TicketResults.tsx'
import styles from './TicketListPage.module.css'

export function TicketListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.toString()

  const params = useMemo(
    () => paramsFromSearch(new URLSearchParams(query)),
    [query],
  )

  const update = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(query)
      mutate(next)
      setSearchParams(next, { replace: true })
    },
    [query, setSearchParams],
  )

  // La búsqueda se aplica al enviar: con 100.000 tickets, una petición por
  // tecla es carga inútil contra la API.
  function handleSearch(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const raw = new FormData(event.currentTarget).get('search')
    const value = typeof raw === 'string' ? raw.trim() : ''
    update((next) => {
      if (value) next.set('search', value)
      else next.delete('search')
    })
  }

  const toggleValue = useCallback(
    (key: string, value: string) => {
      update((next) => {
        const current = next.getAll(key)
        next.delete(key)
        for (const item of current) {
          if (item !== value) next.append(key, item)
        }
        if (!current.includes(value)) next.append(key, value)
      })
    },
    [update],
  )

  const toggleFlag = useCallback(
    (key: string, enabled: boolean) => {
      update((next) => {
        if (enabled) next.set(key, '1')
        else next.delete(key)
      })
    },
    [update],
  )

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tickets</h1>
      </div>

      <div className={styles.filters}>
        <form className={styles.searchRow} role="search" onSubmit={handleSearch}>
          <input
            className={styles.search}
            type="search"
            name="search"
            maxLength={120}
            placeholder="Buscar por título o código…"
            aria-label="Buscar tickets"
            defaultValue={searchParams.get('search') ?? ''}
          />
          <Button type="submit">Buscar</Button>
          <select
            className={styles.select}
            aria-label="Ordenar por"
            value={searchParams.get('sort') ?? '-createdAt'}
            onChange={(event) =>
              update((next) => next.set('sort', event.target.value))
            }
          >
            {SORT_OPTIONS.map((sort) => (
              <option key={sort} value={sort}>
                {SORT_LABEL[sort]}
              </option>
            ))}
          </select>
        </form>

        <div className={styles.groups}>
          <fieldset className={styles.group}>
            <legend className={styles.groupTitle}>Estado</legend>
            <div className={styles.options}>
              {STATUS_ORDER.map((status) => (
                <label key={status} className={styles.option}>
                  <input
                    type="checkbox"
                    checked={searchParams.getAll('status').includes(status)}
                    onChange={() => toggleValue('status', status)}
                  />
                  {STATUS_LABEL[status]}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.groupTitle}>Prioridad</legend>
            <div className={styles.options}>
              {PRIORITY_ORDER.map((priority) => (
                <label key={priority} className={styles.option}>
                  <input
                    type="checkbox"
                    checked={searchParams.getAll('priority').includes(priority)}
                    onChange={() => toggleValue('priority', priority)}
                  />
                  {PRIORITY_LABEL[priority]}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.groupTitle}>Vistas</legend>
            <div className={styles.options}>
              <label className={styles.option}>
                <input
                  type="checkbox"
                  checked={searchParams.get('stale') === '1'}
                  onChange={(event) => toggleFlag('stale', event.target.checked)}
                />
                <span>Estancados (+{STALE_HOURS} h)</span>
              </label>
              <label className={styles.option}>
                <input
                  type="checkbox"
                  checked={searchParams.get('unassigned') === '1'}
                  onChange={(event) =>
                    toggleFlag('unassigned', event.target.checked)
                  }
                />
                <span>Sin asignar</span>
              </label>
            </div>
          </fieldset>
        </div>
      </div>

      <TicketResults key={query} params={params} />
    </section>
  )
}
