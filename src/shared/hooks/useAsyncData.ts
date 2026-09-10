import { useCallback, useEffect, useRef, useState } from 'react'

export interface AsyncData<T> {
  data: T | null
  error: unknown
  isLoading: boolean
  reload: () => void
}

interface State<T> {
  data: T | null
  error: unknown
  isLoading: boolean
}

/**
 * Carga datos y cancela la petición en curso si el componente se desmonta o si
 * se vuelve a pedir, para que una respuesta vieja no pise a una nueva.
 *
 * `load` debe venir envuelta en `useCallback`: es lo que decide cuándo se
 * vuelve a pedir.
 */
export function useAsyncData<T>(
  load: (signal: AbortSignal) => Promise<T>,
): AsyncData<T> {
  const [state, setState] = useState<State<T>>({
    data: null,
    error: null,
    isLoading: true,
  })
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    controllerRef.current = controller

    void fetchInto(load, controller, setState)
    return () => controller.abort()
  }, [load])

  const reload = useCallback(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    void fetchInto(load, controller, setState)
  }, [load])

  return { ...state, reload }
}

async function fetchInto<T>(
  load: (signal: AbortSignal) => Promise<T>,
  controller: AbortController,
  setState: (state: State<T>) => void,
): Promise<void> {
  try {
    const data = await load(controller.signal)
    if (controller.signal.aborted) return
    setState({ data, error: null, isLoading: false })
  } catch (error) {
    if (controller.signal.aborted) return
    setState({ data: null, error, isLoading: false })
  }
}
