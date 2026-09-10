import type { ButtonHTMLAttributes } from 'react'
import styles from './ui.module.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary'
}

export function Button({ variant = 'default', className, ...rest }: Props) {
  const variantClass = variant === 'primary' ? styles.buttonPrimary : ''
  return (
    <button
      type="button"
      {...rest}
      className={`${styles.button} ${variantClass} ${className ?? ''}`}
    />
  )
}
