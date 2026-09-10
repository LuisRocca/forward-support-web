import { pageSchema, userSchema } from '../../shared/api/contract.ts'
import type { RoleCode, UserStatus } from '../../shared/api/contract.ts'
import { request } from '../../shared/api/httpClient.ts'

const userPageSchema = pageSchema(userSchema)

export async function listUsers(
  params: { roleCode?: RoleCode; status?: UserStatus; limit?: number },
  signal?: AbortSignal,
) {
  return await request('/users', {
    schema: userPageSchema,
    query: { ...params },
    signal,
  })
}
