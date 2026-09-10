import { useCallback, useEffect, useState } from 'react'
import type { PageInfo } from '../api/contract.ts'

export interface Page<T> {
  data: T[]
  pageInfo: PageInfo
}

interface State<T> {
  items: T[]
  pageInfo: PageInfo | null
  error: unknown
  isLoading: boolean
  isLoadingMore: boolean
  /** Consulta a la que pertenecen los datos mostrados. */
  source: unknown
}

/**
 * Listado paginado por keyset: la siguiente página se pide con el `nextCursor`
 * de la anterior y se acumula. No hay número de página ni total.
 *
 * `fetchPage` debe venir en `useCallback`: al cambiar (otros filtros) se pide
 * la primera página de nuevo. Mientras llega, se sigue mostrando la lista
 * anterior (`isRefreshing`): vaciarla haría saltar la página entera.
 */
export function useKeysetList<T>(
  fetchPage: (cursor: string | null, signal?: AbortSignal) => Promise<Page<T>>,
) {
  const [state, setState] = useState<State<T>>({
    items: [],
    pageInfo: null,
    error: null,
    isLoading: true,
    isLoadingMore: false,
    source: null,
  })

  useEffect(() => {
    const controller = new AbortController()

    async function loadFirstPage() {
      try {
        const page = await fetchPage(null, controller.signal)
        if (controller.signal.aborted) return
        setState({
          items: page.data,
          pageInfo: page.pageInfo,
          error: null,
          isLoading: false,
          isLoadingMore: false,
          source: fetchPage,
        })
      } catch (error) {
        if (controller.signal.aborted) return
        setState({
          items: [],
          pageInfo: null,
          error,
          isLoading: false,
          isLoadingMore: false,
          source: fetchPage,
        })
      }
    }

    void loadFirstPage()
    return () => controller.abort()
  }, [fetchPage])

  const isRefreshing = !state.isLoading && state.source !== fetchPage

  const loadMore = useCallback(async () => {
    const cursor = state.pageInfo?.nextCursor
    if (!cursor || state.isLoadingMore || isRefreshing) return

    setState((prev) => ({ ...prev, isLoadingMore: true }))

    try {
      const page = await fetchPage(cursor)
      // Si entretanto cambiaron los filtros, esta página ya no pertenece a la lista.
      setState((prev) =>
        prev.source === fetchPage
          ? {
              ...prev,
              items: [...prev.items, ...page.data],
              pageInfo: page.pageInfo,
              isLoadingMore: false,
            }
          : prev,
      )
    } catch (error) {
      setState((prev) =>
        prev.source === fetchPage ? { ...prev, error, isLoadingMore: false } : prev,
      )
    }
  }, [fetchPage, state.pageInfo, state.isLoadingMore, isRefreshing])

  /** Sustituye un elemento ya cargado, p. ej. tras bloquear a un usuario. */
  const replaceItem = useCallback((match: (item: T) => boolean, next: T) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) => (match(item) ? next : item)),
    }))
  }, [])

  return {
    items: state.items,
    pageInfo: state.pageInfo,
    error: state.error,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    isRefreshing,
    loadMore,
    replaceItem,
  }
}
