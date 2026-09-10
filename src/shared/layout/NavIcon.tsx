import type { NavIconName } from '../../app/navigation.ts'

const PATHS: Record<NavIconName, string> = {
  dashboard: 'M4 4h6v8H4zM14 4h6v4h-6zM14 12h6v8h-6zM4 16h6v4H4z',
  tickets: 'M4 6h16M4 12h16M4 18h10',
  new: 'M12 5v14M5 12h14',
  admin: 'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z',
}

/** Icono decorativo: el texto del enlace ya lo nombra. */
export function NavIcon({ name }: Readonly<{ name: NavIconName }>) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
