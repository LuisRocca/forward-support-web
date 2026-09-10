import { z } from 'zod'
import {
  commentSchema,
  historyEntrySchema,
  pageSchema,
  ticketDetailSchema,
  ticketSummarySchema,
} from '../../shared/api/contract.ts'
import type {
  AssignTicketRequest,
  ChangeStatusRequest,
  Comment,
  CreateCommentRequest,
  CreateTicketRequest,
  HistoryEntry,
  TicketDetail,
  TicketPriority,
  TicketStatus,
  UpdateTicketRequest,
} from '../../shared/api/contract.ts'
import { request } from '../../shared/api/httpClient.ts'

const ticketPageSchema = pageSchema(ticketSummarySchema)
const commentPageSchema = pageSchema(commentSchema)
const historySchema = z.array(historyEntrySchema)

export type TicketSort =
  | 'createdAt'
  | '-createdAt'
  | 'lastActivityAt'
  | '-lastActivityAt'
  | 'priority'
  | '-priority'

export interface TicketListParams {
  limit?: number
  cursor?: string | null
  status?: TicketStatus[]
  priority?: TicketPriority[]
  clientId?: string
  categoryId?: string
  /** `unassigned` devuelve la bandeja sin asignar. */
  assignedToUserId?: string
  search?: string
  /** Solo tickets abiertos sin actividad desde hace más de N horas. */
  staleHours?: number
  sort?: TicketSort
}

export async function listTickets(
  params: TicketListParams,
  signal?: AbortSignal,
) {
  return await request('/tickets', {
    schema: ticketPageSchema,
    query: { ...params },
    signal,
  })
}

export async function getTicket(
  ticketId: string,
  signal?: AbortSignal,
): Promise<TicketDetail> {
  return await request(`/tickets/${ticketId}`, {
    schema: ticketDetailSchema,
    signal,
  })
}

export async function createTicket(
  body: CreateTicketRequest,
): Promise<TicketDetail> {
  return await request('/tickets', {
    method: 'POST',
    body,
    schema: ticketDetailSchema,
  })
}

/** Solo admin, o el agente asignado. El supervisor no edita (403). */
export async function updateTicket(
  ticketId: string,
  body: UpdateTicketRequest,
): Promise<TicketDetail> {
  return await request(`/tickets/${ticketId}`, {
    method: 'PATCH',
    body,
    schema: ticketDetailSchema,
  })
}

/**
 * Asignar y cambiar estado tienen endpoint propio y no son campos del PATCH:
 * cada uno deja rastro en el historial del ticket.
 */
export async function assignTicket(
  ticketId: string,
  body: AssignTicketRequest,
): Promise<TicketDetail> {
  return await request(`/tickets/${ticketId}/assign`, {
    method: 'POST',
    body,
    schema: ticketDetailSchema,
  })
}

export async function changeTicketStatus(
  ticketId: string,
  body: ChangeStatusRequest,
): Promise<TicketDetail> {
  return await request(`/tickets/${ticketId}/status`, {
    method: 'POST',
    body,
    schema: ticketDetailSchema,
  })
}

export async function listComments(
  ticketId: string,
  params: { limit?: number; cursor?: string | null },
  signal?: AbortSignal,
) {
  return await request(`/tickets/${ticketId}/comments`, {
    schema: commentPageSchema,
    query: { ...params },
    signal,
  })
}

export async function addComment(
  ticketId: string,
  body: CreateCommentRequest,
): Promise<Comment> {
  return await request(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body,
    schema: commentSchema,
  })
}

export async function getHistory(
  ticketId: string,
  signal?: AbortSignal,
): Promise<HistoryEntry[]> {
  return await request(`/tickets/${ticketId}/history`, {
    schema: historySchema,
    signal,
  })
}
