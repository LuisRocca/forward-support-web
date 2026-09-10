import { useCallback, useEffect, useState } from 'react'
import type { PageInfo, TicketSummary } from '../../shared/api/contract.ts'
import { listTickets } from './ticketsApi.ts'
import type { TicketListParams } from './ticketsApi.ts'

interface TicketListState {
  items: TicketSummary[]
  pageInfo: PageInfo | null
  error: unknown
  isLoading: boolean
  isLoadingMore: boolean
}

/**
 * Paginación por keyset: la siguiente página se pide con el `nextCursor` de la
 * anterior. No hay número de página ni total de resultados, así que las páginas
 * se acumulan en la lista en vez de reemplazarla.
 *
 * Cambiar los filtros NO se gestiona aquí: quien usa el hook lo remonta con
 * una `key`, que es la forma de React de reiniciar estado. Así este hook no
 * necesita resetearse a sí mismo dentro de un efecto.
 */
export function useTicketList(params: TicketListParams) {
  const [state, setState] = useState<TicketListState>({
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
        const page = await listTickets(params, controller.signal)
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
  }, [params])

  const loadMore = useCallback(async () => {
    const cursor = state.pageInfo?.nextCursor
    if (!cursor || state.isLoadingMore) return

    setState((prev) => ({ ...prev, isLoadingMore: true }))

    try {
      const page = await listTickets({ ...params, cursor })
      setState((prev) => ({
        ...prev,
        items: [...prev.items, ...page.data],
        pageInfo: page.pageInfo,
        isLoadingMore: false,
      }))
    } catch (error) {
      setState((prev) => ({ ...prev, error, isLoadingMore: false }))
    }
  }, [params, state.pageInfo, state.isLoadingMore])

  return { ...state, loadMore }
}
