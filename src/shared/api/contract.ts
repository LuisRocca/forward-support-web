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
  /** Siempre presente: `null` significa "no hay más", no "no me lo mandaron". */
  nextCursor: z.string().nullable(),
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
  createdAt: dateTime,
  /** Última actividad de cualquier tipo, comentarios incluidos. No es `updatedAt`. */
  lastActivityAt: dateTime,
})

export const ticketDetailSchema = ticketSummarySchema.extend({
  description: z.string(),
  /**
   * Solo en el detalle: ahí es un conteo sobre una fila. En el listado sería
   * una agregación por fila en la ruta más caliente de la aplicación.
   */
  commentCount: z.number(),
  /**
   * Destinos de estado que QUIEN PREGUNTA puede aplicar ahora (máquina de
   * estados ∩ rol ∩ pertenencia), calculados en el servidor. Vacío si no puede
   * cambiar el estado. El cliente no replica la matriz.
   */
  allowedStatusTransitions: z.array(ticketStatusSchema),
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

/**
 * Esquemas de las peticiones. Las reglas de validación del formulario salen de
 * aquí y no se reescriben a mano en la vista: el contrato es el que manda.
 */
export const createTicketRequestSchema = z.object({
  clientId: uuid.min(1, 'Selecciona un cliente'),
  categoryId: uuid.nullable().optional(),
  title: z
    .string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede pasar de 200 caracteres'),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(10000, 'La descripción no puede pasar de 10000 caracteres'),
  priority: ticketPrioritySchema,
  assignedToUserId: uuid.nullable().optional(),
})

/** PATCH parcial: al menos un campo. Estado y asignación van por sus endpoints. */
export const updateTicketRequestSchema = z
  .object({
    title: z
      .string()
      .min(5, 'El título debe tener al menos 5 caracteres')
      .max(200, 'El título no puede pasar de 200 caracteres'),
    description: z
      .string()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(10000, 'La descripción no puede pasar de 10000 caracteres'),
    priority: ticketPrioritySchema,
    categoryId: uuid.nullable(),
    dueAt: dateTime.nullable(),
  })
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'No hay cambios que guardar')

export const assignTicketRequestSchema = z.object({
  assignedToUserId: uuid.min(1, 'Selecciona a quién se asigna'),
  reason: z.string().max(255, 'El motivo no puede pasar de 255 caracteres').optional(),
})

export const changeStatusRequestSchema = z.object({
  status: ticketStatusSchema,
  note: z.string().max(255, 'La nota no puede pasar de 255 caracteres').optional(),
})

export const createCommentRequestSchema = z.object({
  body: z
    .string()
    .min(1, 'El comentario no puede estar vacío')
    .max(5000, 'El comentario no puede pasar de 5000 caracteres'),
  isInternal: z.boolean(),
})

export const blockUserRequestSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'El motivo debe tener al menos 3 caracteres')
    .max(255, 'El motivo no puede pasar de 255 caracteres'),
})

export type BlockUserRequest = z.infer<typeof blockUserRequestSchema>
export type CreateTicketRequest = z.infer<typeof createTicketRequestSchema>
export type UpdateTicketRequest = z.infer<typeof updateTicketRequestSchema>
export type AssignTicketRequest = z.infer<typeof assignTicketRequestSchema>
export type ChangeStatusRequest = z.infer<typeof changeStatusRequestSchema>
export type CreateCommentRequest = z.infer<typeof createCommentRequestSchema>

export type TicketStatus = z.infer<typeof ticketStatusSchema>
export type TicketPriority = z.infer<typeof ticketPrioritySchema>
export type RoleCode = z.infer<typeof roleCodeSchema>
export type UserStatus = z.infer<typeof userStatusSchema>
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
