# Backend API — medical-service-office

**Base URL:** `https://service.drayasminmedrano-services.cloud`
**Stack:** Node.js + Express 5 + Prisma ORM + PostgreSQL
**Auth:** JWT (Access Token 15m + Refresh Token 7d)

---

## Autenticación

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/api/auth/login` | No | `{email, password}` | `{accessToken, refreshToken, user}` |
| POST | `/api/auth/refresh` | No | `{refreshToken}` | `{accessToken}` |
| POST | `/api/auth/logout` | No | `{refreshToken}` | 204 |

- Rate limit login: 10 req / 15 min por IP
- Header requerido: `Authorization: Bearer <accessToken>`

---

## Usuarios `/api/users`

> Todos los endpoints requieren JWT

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/me` | Perfil del usuario autenticado |
| GET | `/api/users` | Listar todos los usuarios |
| GET | `/api/users/:id` | Obtener usuario por ID |
| POST | `/api/users` | Crear usuario `{email*, name*, password*}` |
| PUT | `/api/users/:id` | Actualizar usuario `{email?, name?, password?}` |
| DELETE | `/api/users/:id` | Eliminar usuario |

---

## Tratamientos `/api/treatments`

> Todos los endpoints requieren JWT

| Method | Path | Query | Body | Description |
|--------|------|-------|------|-------------|
| GET | `/api/treatments` | `category?, active?` | — | Listar tratamientos |
| GET | `/api/treatments/:id` | — | — | Obtener por ID |
| POST | `/api/treatments` | — | `{name*, price*, category*, description?, longDescription?, imageUrl?, active?}` | Crear tratamiento |
| PUT | `/api/treatments/:id` | — | `{name?, price?, category?, description?, longDescription?, imageUrl?, active?}` | Actualizar |
| DELETE | `/api/treatments/:id` | — | — | Eliminar |

---

## Blog `/api/blog`

> Todos los endpoints requieren JWT

| Method | Path | Query | Body | Description |
|--------|------|-------|------|-------------|
| GET | `/api/blog` | `published?` | — | Listar posts |
| GET | `/api/blog/:id` | — | — | Obtener por ID |
| POST | `/api/blog` | — | `{title*, content*, excerpt?, imageUrl?, published?}` | Crear post |
| PUT | `/api/blog/:id` | — | `{title?, content?, excerpt?, imageUrl?, published?}` | Actualizar |
| DELETE | `/api/blog/:id` | — | — | Eliminar |

---

## Citas `/api/appointments`

| Method | Path | Auth | Query | Body | Description |
|--------|------|------|-------|------|-------------|
| POST | `/api/appointments` | No | — | `{patientName*, patientPhone*, treatmentName*, patientEmail?, treatmentId?, notes?, scheduledAt?}` | Crear cita (pública) |
| GET | `/api/appointments` | Sí | `status?` | — | Listar citas |
| GET | `/api/appointments/:id` | Sí | — | — | Obtener por ID |
| PUT | `/api/appointments/:id` | Sí | — | `{patientName?, patientPhone?, patientEmail?, treatmentId?, treatmentName?, notes?, status?, scheduledAt?}` | Actualizar |
| DELETE | `/api/appointments/:id` | Sí | — | — | Eliminar |

**Status values:** `PENDING` · `CONFIRMED` · `CANCELLED` · `COMPLETED`
Rate limit POST: 5 req / hora por IP

---

## Modelos de datos

### User
```
id (UUID) · email (unique) · name · password (bcrypt) · createdAt · updatedAt
```

### Treatment
```
id (UUID) · name · slug (unique) · description? · longDescription? · price (Float)
category · imageUrl? · active (default: true) · createdAt · updatedAt
```

### BlogPost
```
id (UUID) · title · slug (unique) · excerpt? · content · imageUrl?
published (default: false) · publishedAt? · createdAt · updatedAt
```

### Appointment
```
id (UUID) · patientName · patientPhone · patientEmail? · treatmentId? (FK)
treatmentName · notes? · status (enum) · scheduledAt? · createdAt · updatedAt
```

### RefreshToken
```
id (UUID) · token (unique) · userId (FK) · expiresAt · createdAt
```

---

## Variables de entorno del backend

```env
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/medical_office
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://yasminmedrano.com
NODE_ENV=production
```

---

## Seguridad

- **Helmet.js** — headers de seguridad HTTP
- **CORS** — origen estricto en producción
- **bcrypt** (10 rounds) — hashing de contraseñas
- **Rate limiting** — en login y creación de citas
- **JWT cortos** — access tokens de 15 minutos
- **Validación** — todos los inputs validados antes de procesar
