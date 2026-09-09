/// <reference types="vite/client" />

// Recordatorio: todo lo que empieza por VITE_ se empaqueta en el bundle y es
// público. Aquí solo va configuración, nunca un secreto.
interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
