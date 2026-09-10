import { z } from 'zod'
import {
  clientSchema,
  pageSchema,
  ticketCategorySchema,
} from '../../shared/api/contract.ts'
import type { TicketCategory } from '../../shared/api/contract.ts'
import { request } from '../../shared/api/httpClient.ts'

const clientPageSchema = pageSchema(clientSchema)
const categoriesSchema = z.array(ticketCategorySchema)

export async function listClients(
  params: { search?: string; isActive?: boolean; limit?: number },
  signal?: AbortSignal,
) {
  return await request('/clients', {
    schema: clientPageSchema,
    query: { ...params },
    signal,
  })
}

/**
 * Catálogo pequeño y estable: se pide una vez por sesión y no en cada carga de
 * formulario. La API además lo sirve con `Cache-Control`.
 */
let categoriesCache: Promise<TicketCategory[]> | null = null

export async function listCategories(): Promise<TicketCategory[]> {
  categoriesCache ??= loadCategories()
  return await categoriesCache
}

async function loadCategories(): Promise<TicketCategory[]> {
  try {
    return await request('/ticket-categories', { schema: categoriesSchema })
  } catch (error) {
    // Un fallo no debe quedarse cacheado: el siguiente intento vuelve a pedirlo.
    categoriesCache = null
    throw error
  }
}
