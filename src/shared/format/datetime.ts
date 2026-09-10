const dateTime = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '—' : dateTime.format(date)
}

/** Horas transcurridas desde una marca ISO. Negativo si está en el futuro. */
export function hoursSince(iso: string): number {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 0
  return (Date.now() - date.getTime()) / 3_600_000
}
