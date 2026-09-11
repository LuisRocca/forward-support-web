/// <reference types="vitest/config" />
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  test: {
    // httpClient lee la URL de la API al cargar el módulo.
    env: { VITE_API_URL: 'http://api.test' },
    coverage: {
      provider: 'v8',
      // lcov lo consume SonarQube (sonar.javascript.lcov.reportPaths).
      reporter: ['text-summary', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/shared/api/testing.ts', 'src/testing/**', 'src/env.d.ts'],
    },
  },
})
