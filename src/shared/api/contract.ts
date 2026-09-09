import { z } from 'zod'

/**
 * El contrato de la API como esquemas de validación.
 *
 * Espejo de `api_forward/docs/api-contract.yaml` (congelado en 8624d66). Si el
 * contrato cambia, se cambia allí primero y este archivo se ajusta después.
 *
 * Son esquemas y no solo tipos porque la respuesta de la API es entrada
 * externa: se valida en el borde y el resto de la app trabaja con datos ya
 * comprobados. Los tipos salen de aquí con `z.infer`, así no hay dos fuentes
 * de verdad que se puedan desincronizar.
 */

const uuid = z.string()
const dateTime = z.string()

export const ticketStatusSchema = z.enum([
  'open',
  'in_progress',
  'pending_customer',
  'resolved',
  'closed',
])

export const ticketPrioritySchema = z.enum(['low', 'medium', 'high', 'critical'])
export const userStatusSchema = z.enum(['active', 'blocked', 'inactive'])
export const roleCodeSchema = z.enum(['admin', 'supervisor', 'agent'])

export const problemSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  code: z.string(),
  traceId: z.string().optional(),
  errors: z
    .array(z.object({ field: z.string(), message: z.string() }))
    .optional(),
})

export const pageInfoSchema = z.object({
  nextCursor: z.string().nullable().optional(),
  hasMore: z.boolean(),
})

export const userRefSchema = z.object({
  id: uuid,
  fullName: z.string(),
})

export const userSchema = z.object({
  id: uuid,
  email: z.string(),
  fullName: z.string(),
  status: userStatusSchema,
  roles: z.array(roleCodeSchema),
  lastLoginAt: dateTime.nullable().optional(),
  blockedAt: dateTime.nullable().optional(),
  blockedReason: z.string().nullable().optional(),
  createdAt: dateTime,
})

export const authenticatedUserSchema = userSchema.extend({
  permissions: z.array(z.string()),
})

export const sessionResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
  user: authenticatedUserSchema,
})

export const clientSchema = z.object({
  id: uuid,
  name: z.string(),
  taxId: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  isActive: z.boolean(),
})

export const ticketCategorySchema = z.object({
  id: uuid,
  code: z.string(),
  name: z.string(),
  defaultPriority: ticketPrioritySchema.nullable().optional(),
  isActive: z.boolean(),
})

export const ticketSummarySchema = z.object({
  id: uuid,
  code: z.string(),
  title: z.string(),
  status: ticketStatusSchema,
  priority: ticketPrioritySchema,
  client: clientSchema,
  category: ticketCategorySchema.nullable().optional(),
  assignedTo: userRefSchema.nullable().optional(),
  commentCount: z.number().optional(),
  createdAt: dateTime,
  /** Última actividad de cualquier tipo, comentarios incluidos. No es `updatedAt`. */
  lastActivityAt: dateTime,
})

export const ticketDetailSchema = ticketSummarySchema.extend({
  description: z.string(),
  createdBy: userRefSchema,
  resolvedBy: userRefSchema.nullable().optional(),
  firstResponseAt: dateTime.nullable().optional(),
  resolvedAt: dateTime.nullable().optional(),
  closedAt: dateTime.nullable().optional(),
  dueAt: dateTime.nullable().optional(),
  reopenedCount: z.number(),
  reassignmentCount: z.number(),
  updatedAt: dateTime,
})

export const commentSchema = z.object({
  id: uuid,
  body: z.string(),
  isInternal: z.boolean(),
  author: userRefSchema,
  createdAt: dateTime,
})

export const historyEntrySchema = z.object({
  type: z.enum(['status_change', 'assignment']),
  actor: userRefSchema,
  fromStatus: ticketStatusSchema.nullable().optional(),
  toStatus: ticketStatusSchema.nullable().optional(),
  fromUser: userRefSchema.nullable().optional(),
  toUser: userRefSchema.nullable().optional(),
  note: z.string().nullable().optional(),
  occurredAt: dateTime,
})

export const dashboardMetricsSchema = z.object({
  generatedAt: dateTime,
  openTickets: z.number(),
  staleTickets: z.number(),
  unassignedTickets: z.number(),
  resolvedLast7Days: z.number().optional(),
  byStatus: z.array(z.object({ status: ticketStatusSchema, count: z.number() })),
  byPriority: z.array(
    z.object({ priority: ticketPrioritySchema, count: z.number() }),
  ),
  avgResolutionHoursByPriority: z
    .array(
      z.object({
        priority: ticketPrioritySchema,
        hours: z.number().nullable(),
      }),
    )
    .optional(),
})

/** Envoltorio de los listados paginados por keyset. */
export function pageSchema<T extends z.ZodType>(item: T) {
  return z.object({ data: z.array(item), pageInfo: pageInfoSchema })
}

export type TicketStatus = z.infer<typeof ticketStatusSchema>
export type TicketPriority = z.infer<typeof ticketPrioritySchema>
export type RoleCode = z.infer<typeof roleCodeSchema>
export type Problem = z.infer<typeof problemSchema>
export type PageInfo = z.infer<typeof pageInfoSchema>
export type UserRef = z.infer<typeof userRefSchema>
export type User = z.infer<typeof userSchema>
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>
export type SessionResponse = z.infer<typeof sessionResponseSchema>
export type Client = z.infer<typeof clientSchema>
export type TicketCategory = z.infer<typeof ticketCategorySchema>
export type TicketSummary = z.infer<typeof ticketSummarySchema>
export type TicketDetail = z.infer<typeof ticketDetailSchema>
export type Comment = z.infer<typeof commentSchema>
export type HistoryEntry = z.infer<typeof historyEntrySchema>
export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>
