import { pageSchema, userSchema } from '../../shared/api/contract.ts'
import type {
  BlockUserRequest,
  RoleCode,
  User,
  UserStatus,
} from '../../shared/api/contract.ts'
import { request } from '../../shared/api/httpClient.ts'

const userPageSchema = pageSchema(userSchema)

export async function listUsers(
  params: {
    roleCode?: RoleCode
    status?: UserStatus
    limit?: number
    cursor?: string | null
  },
  signal?: AbortSignal,
) {
  return await request('/users', {
    schema: userPageSchema,
    query: { ...params },
    signal,
  })
}

/**
 * Bloquear revoca en el servidor todas las sesiones del usuario al instante.
 * Bloquearse a uno mismo responde 409.
 */
export async function blockUser(
  userId: string,
  body: BlockUserRequest,
): Promise<User> {
  return await request(`/users/${userId}/block`, {
    method: 'POST',
    body,
    schema: userSchema,
  })
}

export async function unblockUser(userId: string): Promise<User> {
  return await request(`/users/${userId}/unblock`, {
    method: 'POST',
    schema: userSchema,
  })
}
