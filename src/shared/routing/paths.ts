/** Rutas de la aplicación en un único sitio: nadie escribe strings sueltos. */
export const paths = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  tickets: '/tickets',
  ticketNew: '/tickets/nuevo',
  ticketDetail: '/tickets/:ticketId',
  adminUsers: '/admin/usuarios',
  adminClients: '/admin/clientes',
} as const

export function ticketDetailPath(ticketId: string): string {
  return `/tickets/${ticketId}`
}
