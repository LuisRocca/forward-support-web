# Plataforma de Soporte — Frontend

Interfaz de operación para la gestión de tickets de soporte.

Prueba técnica — Tech Lead Full Stack JavaScript.
API en un repositorio aparte (`api_forward`), donde vive también la
documentación de arquitectura y el modelo de datos.

## Stack

| Capa | Elección |
|---|---|
| Build | Vite 8 |
| UI | React 19 (con React Compiler) |
| Lenguaje | TypeScript strict |
| Lint | oxlint |
| Paquetes | pnpm |

## Puesta en marcha

Requiere la API corriendo en `http://localhost:3000` (ver el README de `api_forward`).

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Disponible en `http://localhost:5173`.

## Configuración

Toda variable con prefijo `VITE_` **se empaqueta en el bundle y es pública**.
Nunca poner ahí secretos: el token de acceso se obtiene en tiempo de ejecución
contra la API, no se compila en el cliente.

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API |

## Vistas previstas

- [ ] Inicio de sesión — validación, manejo de errores y redirección según sesión
- [ ] Dashboard operativo — métricas del estado de la operación
- [ ] Listado de tickets — filtros y paginación
- [ ] Detalle de ticket — información, comentarios e historial
- [ ] Creación de ticket — formulario con validación
