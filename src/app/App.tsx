import { BrowserRouter } from 'react-router'
import { SessionProvider } from '../features/auth/SessionProvider.tsx'
import { AppRoutes } from './AppRoutes.tsx'

export function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <AppRoutes />
      </SessionProvider>
    </BrowserRouter>
  )
}
