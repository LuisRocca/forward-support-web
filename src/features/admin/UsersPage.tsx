import { useState } from 'react'
import { roleCodeSchema, userStatusSchema } from '../../shared/api/contract.ts'
import type { RoleCode, UserStatus } from '../../shared/api/contract.ts'
import { hasAnyRole } from '../auth/roles.ts'
import { useSession } from '../auth/useSession.ts'
import { ROLE_LABEL, USER_STATUS_LABEL } from '../users/labels.ts'
import { AdminTabs } from './AdminTabs.tsx'
import { UsersResults } from './UsersResults.tsx'
import styles from './admin.module.css'

export function UsersPage() {
  const { user } = useSession()
  const [status, setStatus] = useState<UserStatus | undefined>(undefined)
  const [roleCode, setRoleCode] = useState<RoleCode | undefined>(undefined)

  // Listar es de admin y supervisor; bloquear y desbloquear, solo de admin.
  const canManage = hasAnyRole(user, ['admin'])

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Administración</h1>
        <AdminTabs />
      </header>

      <div className={styles.filters}>
        <label className={styles.field}>
          Estado
          <select
            className={styles.select}
            value={status ?? ''}
            onChange={(event) =>
              setStatus(userStatusSchema.options.find((s) => s === event.target.value))
            }
          >
            <option value="">Todos</option>
            {userStatusSchema.options.map((option) => (
              <option key={option} value={option}>
                {USER_STATUS_LABEL[option]}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          Rol
          <select
            className={styles.select}
            value={roleCode ?? ''}
            onChange={(event) =>
              setRoleCode(roleCodeSchema.options.find((r) => r === event.target.value))
            }
          >
            <option value="">Todos</option>
            {roleCodeSchema.options.map((option) => (
              <option key={option} value={option}>
                {ROLE_LABEL[option]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <UsersResults
        key={`${status ?? ''}|${roleCode ?? ''}`}
        status={status}
        roleCode={roleCode}
        currentUserId={user?.id}
        canManage={canManage}
      />
    </section>
  )
}
