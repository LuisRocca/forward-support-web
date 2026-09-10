import { useCallback, useState } from 'react'
import type { RoleCode, User, UserStatus } from '../../shared/api/contract.ts'
import { errorMessage } from '../../shared/api/errorMessage.ts'
import { formatDateTime } from '../../shared/format/datetime.ts'
import { useKeysetList } from '../../shared/hooks/useKeysetList.ts'
import { Badge } from '../../shared/ui/Badge.tsx'
import { Button } from '../../shared/ui/Button.tsx'
import { Refreshable } from '../../shared/ui/Refreshable.tsx'
import { EmptyState, ErrorState, LoadingState } from '../../shared/ui/states.tsx'
import { ROLE_LABEL, USER_STATUS_LABEL, userStatusTone } from '../users/labels.ts'
import { listUsers, unblockUser } from '../users/usersApi.ts'
import { BlockUserDialog } from './BlockUserDialog.tsx'
import styles from './admin.module.css'

interface Props {
  status?: UserStatus
  roleCode?: RoleCode
  currentUserId: string | undefined
  canManage: boolean
}

/** Se remonta con una `key` al cambiar los filtros: la paginación empieza limpia. */
export function UsersResults({ status, roleCode, currentUserId, canManage }: Readonly<Props>) {
  const fetchPage = useCallback(
    (cursor: string | null, signal?: AbortSignal) =>
      listUsers({ status, roleCode, cursor }, signal),
    [status, roleCode],
  )
  const { items, pageInfo, error, isLoading, isLoadingMore, isRefreshing, loadMore, replaceItem } =
    useKeysetList(fetchPage)

  const [blocking, setBlocking] = useState<User | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [rowError, setRowError] = useState<{ id: string; error: unknown } | null>(
    null,
  )

  const replace = useCallback(
    (updated: User) => replaceItem((item) => item.id === updated.id, updated),
    [replaceItem],
  )

  async function handleUnblock(user: User) {
    setRowError(null)
    setPendingId(user.id)
    try {
      replace(await unblockUser(user.id))
    } catch (cause) {
      setRowError({ id: user.id, error: cause })
    } finally {
      setPendingId(null)
    }
  }

  if (isLoading) return <LoadingState label="Cargando usuarios…" />
  if (error) return <ErrorState error={error} />

  return (
    <div className="reveal">
      <Refreshable refreshing={isRefreshing}>
        {items.length === 0 ? (
          <EmptyState label="Ningún usuario coincide con estos filtros." />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption>
                {items.length} usuarios cargados
                {pageInfo?.hasMore ? ', hay más disponibles' : ''}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Email</th>
                  <th scope="col">Roles</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Último acceso</th>
                  {canManage ? <th scope="col">Acciones</th> : null}
                </tr>
              </thead>
              <tbody>
                {items.map((user) => (
                  <tr key={user.id}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>
                      <div className={styles.badges}>
                        {user.roles.map((role) => (
                          <Badge key={role}>{ROLE_LABEL[role]}</Badge>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Badge tone={userStatusTone(user.status)}>
                        {USER_STATUS_LABEL[user.status]}
                      </Badge>
                      {user.status === 'blocked' && user.blockedReason ? (
                        <span className={`${styles.muted} ${styles.rowError}`}>
                          Motivo: {user.blockedReason}
                        </span>
                      ) : null}
                    </td>
                    <td className={styles.muted}>
                      {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Nunca'}
                    </td>
                    {canManage ? (
                      <td>
                        <UserAction
                          user={user}
                          isSelf={user.id === currentUserId}
                          isPending={pendingId === user.id}
                          onBlock={() => setBlocking(user)}
                          onUnblock={() => void handleUnblock(user)}
                        />
                        {rowError?.id === user.id ? (
                          <span className={styles.rowError} role="alert">
                            {errorMessage(rowError.error)}
                          </span>
                        ) : null}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.footer}>
          {pageInfo?.hasMore ? (
            <Button disabled={isLoadingMore || isRefreshing} onClick={() => void loadMore()}>
              {isLoadingMore ? 'Cargando…' : 'Cargar más'}
            </Button>
          ) : (
            <span className={styles.muted}>No hay más resultados.</span>
          )}
        </div>
      </Refreshable>

      {blocking ? (
        <BlockUserDialog
          user={blocking}
          onBlocked={(updated) => {
            replace(updated)
            setBlocking(null)
          }}
          onCancel={() => setBlocking(null)}
        />
      ) : null}
    </div>
  )
}

function UserAction({
  user,
  isSelf,
  isPending,
  onBlock,
  onUnblock,
}: Readonly<{
  user: User
  isSelf: boolean
  isPending: boolean
  onBlock: () => void
  onUnblock: () => void
}>) {
  // Bloquearse a uno mismo dejaría el sistema sin quien pueda desbloquear.
  if (isSelf) return <span className={styles.muted}>Tu cuenta</span>

  if (user.status === 'blocked') {
    return (
      <Button disabled={isPending} onClick={onUnblock}>
        {isPending ? 'Desbloqueando…' : `Desbloquear`}
      </Button>
    )
  }

  return (
    <Button onClick={onBlock} aria-label={`Bloquear a ${user.fullName}`}>
      Bloquear
    </Button>
  )
}
