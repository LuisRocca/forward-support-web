import type {
  AuthenticatedUser,
  Comment,
  DashboardMetrics,
  Permission,
  TicketDetail,
  TicketSummary,
  User,
} from '../shared/api/contract.ts'

/** Permisos por rol según la tabla del contrato (AuthenticatedUser). */
export const ROLE_PERMISSIONS: Record<'admin' | 'supervisor' | 'agent', Permission[]> = {
  admin: [
    'ticket:read:all', 'ticket:read:own', 'ticket:create', 'ticket:update',
    'ticket:assign', 'ticket:status', 'comment:create', 'comment:read:internal',
    'user:read', 'user:block', 'client:read', 'metrics:read',
  ],
  supervisor: [
    'ticket:read:all', 'ticket:create', 'ticket:assign', 'comment:create',
    'comment:read:internal', 'user:read', 'client:read', 'metrics:read',
  ],
  agent: [
    'ticket:read:own', 'ticket:create', 'ticket:update', 'ticket:status',
    'comment:create', 'comment:read:internal', 'client:read',
  ],
}

function person(id: string, fullName: string, role: 'admin' | 'supervisor' | 'agent'): AuthenticatedUser {
  return {
    id,
    email: `${id}@forward.test`,
    fullName,
    status: 'active',
    roles: [role],
    createdAt: '2026-01-01T00:00:00Z',
    permissions: ROLE_PERMISSIONS[role],
  }
}

export const ADMIN = person('admin-1', 'Ana García', 'admin')
export const SUPERVISOR = person('supervisor-1', 'Luis Díaz', 'supervisor')
export const AGENT = person('agent-1', 'Rubén Molina', 'agent')

export function staff(overrides: Partial<User> & Pick<User, 'id' | 'fullName'>): User {
  return {
    email: `${overrides.id}@forward.test`,
    status: 'active',
    roles: ['agent'],
    createdAt: '2026-01-01T00:00:00Z',
    lastLoginAt: null,
    blockedAt: null,
    blockedReason: null,
    ...overrides,
  }
}

export const CLIENT = { id: 'client-1', name: 'Acme S.A.', isActive: true }

export function summary(overrides: Partial<TicketSummary> = {}): TicketSummary {
  return {
    id: 'ticket-1',
    code: 'TCK-000001',
    title: 'El informe mensual no carga',
    status: 'open',
    priority: 'medium',
    client: CLIENT,
    category: null,
    assignedTo: null,
    createdAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    ...overrides,
  }
}

export function detail(overrides: Partial<TicketDetail> = {}): TicketDetail {
  return {
    ...summary(),
    description: 'El informe se queda cargando indefinidamente.',
    commentCount: 1,
    allowedStatusTransitions: ['in_progress', 'resolved'],
    createdBy: { id: SUPERVISOR.id, fullName: SUPERVISOR.fullName },
    reopenedCount: 0,
    reassignmentCount: 0,
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

export function comment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 'comment-1',
    body: 'El cliente confirma que sigue fallando.',
    isInternal: false,
    author: { id: AGENT.id, fullName: AGENT.fullName },
    createdAt: '2026-09-01T10:00:00Z',
    ...overrides,
  }
}

export const METRICS: DashboardMetrics = {
  generatedAt: '2026-09-10T18:05:00Z',
  openTickets: 30455,
  staleTickets: 20288,
  unassignedTickets: 3026,
  resolvedLast7Days: 795,
  byStatus: [
    { status: 'open', count: 11912 },
    { status: 'closed', count: 54774 },
  ],
  byPriority: [
    { priority: 'low', count: 25109 },
    { priority: 'critical', count: 7905 },
  ],
  avgResolutionHoursByPriority: [
    { priority: 'low', hours: 85.9 },
    { priority: 'critical', hours: null },
  ],
}
