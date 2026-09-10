// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { toApiError } from '../../shared/api/apiError.ts'
import { problem } from '../../shared/api/testing.ts'
import { LoginPage } from './LoginPage.tsx'
import { SessionContext } from './sessionContext.ts'
import type { SessionContextValue } from './session.types.ts'

afterEach(cleanup)

function renderLogin(signIn: SessionContextValue['signIn']) {
  const value: SessionContextValue = {
    status: 'anonymous',
    user: null,
    isAuthenticated: false,
    endedReason: null,
    signIn,
    signOut: vi.fn(async () => {}),
  }
  render(
    <SessionContext value={value}>
      <LoginPage />
    </SessionContext>,
  )
}

function submit(email = 'agente@forward.test', password = 'contraseña-valida') {
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('LoginPage', () => {
  it('aplica en el formulario los límites del contrato', () => {
    renderLogin(vi.fn())

    const email = screen.getByLabelText('Correo electrónico')
    const password = screen.getByLabelText('Contraseña')

    expect(email.getAttribute('type')).toBe('email')
    expect(email).toHaveProperty('required', true)
    expect(email).toHaveProperty('maxLength', 255)
    expect(password).toHaveProperty('required', true)
    expect(password).toHaveProperty('minLength', 8)
    expect(password).toHaveProperty('maxLength', 128)
  })

  it('envía las credenciales tecleadas', () => {
    const signIn = vi.fn(async () => {})
    renderLogin(signIn)

    submit('agente@forward.test', 'contraseña-valida')

    expect(signIn).toHaveBeenCalledWith('agente@forward.test', 'contraseña-valida')
  })

  it('muestra el mensaje del servidor ante credenciales inválidas', async () => {
    const detail = 'El email o la contraseña no son correctos.'
    renderLogin(vi.fn(async () => {
      throw toApiError(401, { ...problem(401, 'AUTH_INVALID_CREDENTIALS'), detail })
    }))

    submit()

    expect((await screen.findByRole('alert')).textContent).toContain(detail)
  })

  it('pinta junto a su campo los errores de un 422', async () => {
    renderLogin(vi.fn(async () => {
      throw toApiError(422, {
        ...problem(422, 'VALIDATION_FAILED'),
        errors: [{ field: 'email', message: 'El email no tiene un formato válido' }],
      })
    }))

    submit()

    expect(await screen.findByText('El email no tiene un formato válido')).toBeTruthy()
    expect(screen.getByLabelText('Correo electrónico').getAttribute('aria-invalid')).toBe('true')
  })

  it('un 429 bloquea el envío con los segundos que manda el servidor', async () => {
    renderLogin(vi.fn(async () => {
      throw toApiError(429, problem(429, 'RATE_LIMITED'), 30)
    }))

    submit()

    const button = await screen.findByRole('button', { name: 'Espera 30 s' })
    expect(button).toHaveProperty('disabled', true)
  })
})
