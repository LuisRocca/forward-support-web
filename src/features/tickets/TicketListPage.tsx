import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
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
        <div className={styles.searchRow}>
          <input
            className={styles.search}
            type="search"
            placeholder="Buscar por título o código…"
            aria-label="Buscar tickets"
            defaultValue={searchParams.get('search') ?? ''}
            onChange={(event) =>
              update((next) => {
                const value = event.target.value.trim()
                if (value) next.set('search', value)
                else next.delete('search')
              })
            }
          />
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
        </div>

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
                Estancados (+{STALE_HOURS} h)
              </label>
              <label className={styles.option}>
                <input
                  type="checkbox"
                  checked={searchParams.get('unassigned') === '1'}
                  onChange={(event) =>
                    toggleFlag('unassigned', event.target.checked)
                  }
                />
                Sin asignar
              </label>
            </div>
          </fieldset>
        </div>
      </div>

      <TicketResults key={query} params={params} />
    </section>
  )
}
