/** Rutas de la aplicación en un único sitio: nadie escribe strings sueltos. */
export const paths = {
  login: '/login',
  dashboard: '/dashboard',
  tickets: '/tickets',
  ticketNew: '/tickets/nuevo',
  ticketDetail: '/tickets/:ticketId',
} as const

export function ticketDetailPath(ticketId: string): string {
  return `/tickets/${ticketId}`
}
