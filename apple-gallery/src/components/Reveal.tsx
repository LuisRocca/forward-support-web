import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Aparición sutil al entrar en pantalla; respeta prefers-reduced-motion vía CSS. */
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal${visible ? ' is-visible' : ''} ${className}`.trim()}>
      {children}
    </div>
  )
}
