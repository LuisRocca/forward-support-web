import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App.tsx'
import '@fontsource-variable/ibm-plex-sans'
import '@fontsource-variable/sora'
import './styles/global.css'

const container = document.getElementById('root')
if (!container) throw new Error('No se encontró el nodo #root')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
