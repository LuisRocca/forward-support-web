import { useCallback } from 'react'
import { useKeysetList } from '../../shared/hooks/useKeysetList.ts'
import { Badge } from '../../shared/ui/Badge.tsx'
import { Button } from '../../shared/ui/Button.tsx'
import { EmptyState, ErrorState, LoadingState } from '../../shared/ui/states.tsx'
import { listClients } from '../catalog/catalogApi.ts'
import styles from './admin.module.css'

/** Solo consulta. Se remonta con una `key` al cambiar la búsqueda. */
export function ClientsResults({
  search,
  onlyActive,
}: {
  search: string
  onlyActive: boolean
}) {
  const fetchPage = useCallback(
    (cursor: string | null, signal?: AbortSignal) =>
      listClients(
        {
          search: search || undefined,
          isActive: onlyActive ? true : undefined,
          cursor,
        },
        signal,
      ),
    [search, onlyActive],
  )
  const { items, pageInfo, error, isLoading, isLoadingMore, loadMore } =
    useKeysetList(fetchPage)

  if (isLoading) return <LoadingState label="Cargando clientes…" />
  if (error) return <ErrorState error={error} />
  if (items.length === 0) {
    return <EmptyState label="Ningún cliente coincide con la búsqueda." />
  }

  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption>
            {items.length} clientes cargados
            {pageInfo?.hasMore ? ', hay más disponibles' : ''}
          </caption>
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Identificación fiscal</th>
              <th scope="col">Email</th>
              <th scope="col">Teléfono</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((client) => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td className={styles.muted}>{client.taxId ?? '—'}</td>
                <td className={styles.muted}>{client.email ?? '—'}</td>
                <td className={styles.muted}>{client.phone ?? '—'}</td>
                <td>
                  <Badge tone={client.isActive ? 'success' : 'neutral'}>
                    {client.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        {pageInfo?.hasMore ? (
          <Button disabled={isLoadingMore} onClick={() => void loadMore()}>
            {isLoadingMore ? 'Cargando…' : 'Cargar más'}
          </Button>
        ) : (
          <span className={styles.muted}>No hay más resultados.</span>
        )}
      </div>
    </>
  )
}
