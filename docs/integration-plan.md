# Plan de Integración: Dashboard ↔ Backend API

## Estado actual

El frontend ya tiene rutas API internas (`/app/api/`) que actúan como proxy hacia el backend Express a través de `lib/backend-client.ts`. La autenticación del dashboard usa su propio sistema de sesiones (HMAC-SHA256 con cookie `jn_session`), **independiente** del JWT del backend.

---

## Arquitectura de integración

```
Usuario (browser)
    │
    ▼
Next.js Dashboard (session cookie jn_session)
    │
    ▼
Next.js API Routes (/app/api/*)   ← proxy con SERVICE_TOKEN
    │
    ▼
Express Backend (JWT Bearer)
    │
    ▼
PostgreSQL (treatments, blog, appointments, users)
```

El frontend **nunca** llama directamente al backend desde el cliente. Siempre pasa por las API routes de Next.js que añaden el `BACKEND_SERVICE_TOKEN`.

---

## Fases de integración

### FASE 1 — Tratamientos (`/dashboard/tratamientos`)

**Estado:** Página existe, falta conectar con backend.

**Cambios necesarios:**
- `/app/api/treatments/route.ts` — GET y POST → `backendFetch`
- `/app/api/treatments/[id]/route.ts` — GET, PUT, DELETE → `backendFetch`
- `/app/dashboard/tratamientos/page.tsx` — reemplazar datos mock/locales con fetch real

**Datos que mostrará el dashboard:**
- Lista de tratamientos con nombre, categoría, precio, estado activo/inactivo
- Formulario crear/editar tratamiento
- Botón eliminar con confirmación

---

### FASE 2 — Blog (`/dashboard/blog`)

**Estado:** Página existe, falta conectar con backend.

**Cambios necesarios:**
- `/app/api/blog/route.ts` — GET y POST → `backendFetch`
- `/app/api/blog/[id]/route.ts` — GET, PUT, DELETE → `backendFetch`
- `/app/dashboard/blog/page.tsx` — conectar formularios con API real

**Datos que mostrará el dashboard:**
- Lista de posts con título, estado publicado/borrador, fecha
- Editor de contenido (título, excerpt, contenido, imagen, toggle publicar)

---

### FASE 3 — Citas (`/dashboard/citas`)

**Estado:** Página existe, falta conectar con backend.

**Cambios necesarios:**
- `/app/api/appointments/route.ts` — GET → `backendFetch`
- `/app/api/appointments/[id]/route.ts` — GET, PUT, DELETE → `backendFetch`
- `/app/dashboard/citas/page.tsx` — tabla con filtros de estado

**Datos que mostrará el dashboard:**
- Tabla: paciente, teléfono, tratamiento, fecha, estado
- Filtros por estado: PENDING · CONFIRMED · CANCELLED · COMPLETED
- Acciones: cambiar estado, ver detalle, eliminar

---

### FASE 4 — Usuarios (`/dashboard/usuarios`) ← NUEVA PÁGINA

**Estado:** No existe aún. Requiere crear página nueva.

**Archivos a crear:**
- `/app/api/users/route.ts` — GET, POST → `backendFetch`
- `/app/api/users/[id]/route.ts` — GET, PUT, DELETE → `backendFetch`
- `/app/dashboard/usuarios/page.tsx` — gestión de usuarios del sistema
- Agregar entrada en `Sidebar.tsx`

**Datos que mostrará el dashboard:**
- Lista de usuarios (email, nombre, fecha creación)
- Formulario crear usuario
- Botón eliminar (con protección para no auto-eliminarse)

---

## Cambios en `lib/backend-client.ts`

El cliente actual ya está bien estructurado. Solo se necesita verificar que el `BACKEND_SERVICE_TOKEN` sea un JWT válido generado con el `JWT_ACCESS_SECRET` del backend.

```ts
// Verificar que el token se incluya correctamente
const SERVICE_TOKEN = process.env.BACKEND_SERVICE_TOKEN ?? ""
// Este token debe ser un JWT firmado con JWT_ACCESS_SECRET del backend
// con payload { sub: 'nextjs-app' } y expiración larga (365d)
```

---

## Variables de entorno a agregar en `.env`

```env
BACKEND_URL=https://service.drayasminmedrano-services.cloud
BACKEND_SERVICE_TOKEN=<jwt generado en el backend>
```

**Generar el SERVICE_TOKEN en el backend:**
```bash
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { sub: 'nextjs-app' },
  process.env.JWT_ACCESS_SECRET,
  { expiresIn: '365d' }
);
console.log(token);
"
```

---

## Orden de implementación recomendado

| Prioridad | Módulo | Motivo |
|-----------|--------|--------|
| 1 | Citas | Alta visibilidad operacional, solo lectura/actualización |
| 2 | Tratamientos | Datos públicos del sitio, alta frecuencia de cambio |
| 3 | Blog | Contenido editorial |
| 4 | Usuarios | Gestión administrativa, menos frecuente |

---

## Consideraciones importantes

1. **Autenticación dual**: El dashboard usa `jn_session` (cookie HMAC). El backend usa JWT. Las API routes de Next.js son el puente: verifican la sesión del dashboard y luego añaden el `SERVICE_TOKEN` para llamar al backend.

2. **Datos públicos**: Los endpoints GET de tratamientos, blog y creación de citas no requieren JWT en el backend. Solo los mutadores (POST/PUT/DELETE) requieren `SERVICE_TOKEN`.

3. **Slugs automáticos**: El backend genera slugs automáticamente desde el nombre/título. No es necesario que el dashboard los gestione.

4. **Sin duplicación de datos**: Tratamientos, blog y citas deben venir **exclusivamente** del backend. No guardar en PostgreSQL local (`site_content`).

5. **Tipos TypeScript**: Crear interfaces en `/types/` que reflejen los modelos del backend para type-safety en todo el frontend.
