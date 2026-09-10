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
}

/**
 * Listado paginado por keyset: la siguiente página se pide con el `nextCursor`
 * de la anterior y se acumula. No hay número de página ni total.
 *
 * `fetchPage` debe venir en `useCallback`. Para reiniciar con otros filtros,
 * quien lo usa remonta el componente con una `key`: así el hook no tiene que
 * resetearse a sí mismo dentro de un efecto.
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
        })
      } catch (error) {
        if (controller.signal.aborted) return
        setState({
          items: [],
          pageInfo: null,
          error,
          isLoading: false,
          isLoadingMore: false,
        })
      }
    }

    void loadFirstPage()
    return () => controller.abort()
  }, [fetchPage])

  const loadMore = useCallback(async () => {
    const cursor = state.pageInfo?.nextCursor
    if (!cursor || state.isLoadingMore) return

    setState((prev) => ({ ...prev, isLoadingMore: true }))

    try {
      const page = await fetchPage(cursor)
      setState((prev) => ({
        ...prev,
        items: [...prev.items, ...page.data],
        pageInfo: page.pageInfo,
        isLoadingMore: false,
      }))
    } catch (error) {
      setState((prev) => ({ ...prev, error, isLoadingMore: false }))
    }
  }, [fetchPage, state.pageInfo, state.isLoadingMore])

  /** Sustituye un elemento ya cargado, p. ej. tras bloquear a un usuario. */
  const replaceItem = useCallback((match: (item: T) => boolean, next: T) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) => (match(item) ? next : item)),
    }))
  }, [])

  return { ...state, loadMore, replaceItem }
}
