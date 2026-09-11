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
| `VITE_API_URL` | URL base de la API. Absoluta en local (`http://localhost:3000`); relativa (`/api`) cuando front y API comparten dominio, como en el despliegue de `api_forward/infra` |

## Vistas

- Inicio de sesión — validación, manejo de errores y redirección según sesión
- Dashboard operativo — métricas del estado de la operación
- Listado de tickets — filtros en la URL y paginación keyset
- Detalle de ticket — información, comentarios, historial, asignación y estado
- Creación de ticket — formulario validado contra el contrato
- Administración — usuarios y clientes, visibles según permisos

`pnpm test` ejecuta la suite de interfaz (Vitest + Testing Library); los fallos
no triviales encontrados por el camino están en [`KNOWN_ISSUES.md`](KNOWN_ISSUES.md).

## Uso de herramientas de IA

> Declaración exigida por el enunciado. **Pendiente de revisar y completar por
> el autor con los porcentajes reales antes de la entrega.**

- **Herramienta:** Claude Code (Anthropic).
- **Dónde se usó:** implementación de las vistas y de los tests bajo dirección
  y revisión del autor, y documentación.
- **Criterio propio:** el contrato OpenAPI compartido con la API
  (`api_forward/docs/api-contract.yaml`) fija qué hace el cliente; las
  decisiones de arquitectura están en la documentación de la API.
- **Verificación:** cada vista se probó contra la API corriendo en el
  navegador, y un test se dio por bueno solo si fallaba al romper a propósito
  el comportamiento que cubre.
