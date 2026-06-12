# Backend Spec — Sistema de Reseñas
**yasminmedrano.com · v1.0 · 2026-06-12**

---

## Contexto

El frontend ya está construido. Esta spec define exactamente qué necesita el backend para que todo funcione. Sin desviaciones — el frontend depende de estos contratos.

---

## 1. Tabla DB

```sql
CREATE TABLE reviews (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name VARCHAR(100) NOT NULL,
  treatment    VARCHAR(150),
  body         TEXT         NOT NULL
                            CHECK (char_length(body) >= 20 AND char_length(body) <= 800),
  rating       SMALLINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  status       VARCHAR(20)  NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'approved', 'deleted')),
  ip_hash      VARCHAR(64),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  approved_at  TIMESTAMPTZ,
  deleted_at   TIMESTAMPTZ
);

CREATE INDEX idx_reviews_status    ON reviews(status);
CREATE INDEX idx_reviews_created   ON reviews(created_at DESC);
CREATE INDEX idx_reviews_status_at ON reviews(status, approved_at DESC);
```

**Notas:**
- `ip_hash`: SHA-256 del IP del request (NUNCA guardar IP raw — privacidad). Usado para detección de spam, nunca expuesto al frontend.
- `deleted_at` + `status='deleted'`: soft delete. Nunca borrar físicamente.
- `approved_at`: se setea cuando la doctora aprueba, `null` mientras pendiente.

---

## 2. Endpoints

Todos bajo el prefijo existente del backend. El frontend usa `backendFetch` que ya apunta al backend correcto.

### 2.1 `POST /api/reviews` — Público

Paciente envía reseña. **No requiere auth.**

**Request body:**
```json
{
  "patient_name": "María José",
  "treatment": "Botox",
  "body": "Excelente atención, resultados naturales.",
  "rating": 5
}
```

**Validaciones server-side (en este orden):**
1. `patient_name`: requerido, string, 1–100 chars
2. `body`: requerido, string, 20–800 chars
3. `rating`: requerido, integer, 1–5
4. `treatment`: opcional, string o null, max 150 chars si presente

**Anti-spam:**
- Rate limit: máx 2 requests por IP por ventana de 24h → 429
- Hashear IP con SHA-256 antes de guardar

**Response 201:**
```json
{ "id": "uuid", "status": "pending" }
```

**Response 422 (validación):**
```json
{
  "error": "VALIDATION_ERROR",
  "fields": {
    "body": "Mínimo 20 caracteres",
    "rating": "Requerido"
  }
}
```

**Response 429 (rate limit):**
```json
{ "error": "RATE_LIMITED" }
```

---

### 2.2 `GET /api/reviews/public` — Público

Frontend lo llama para mostrar reseñas en homepage. **No requiere auth.**

El frontend usa: `backendFetch("/reviews/public", { revalidate: 300 })`

**Response 200:**
```json
{
  "reviews": [
    {
      "id": "uuid",
      "patient_name": "María José",
      "treatment": "Botox",
      "body": "Excelente atención...",
      "rating": 5,
      "approved_at": "2026-06-01T14:30:00Z"
    }
  ],
  "aggregate": {
    "avg_rating": 4.9,
    "total_count": 12
  }
}
```

**Reglas:**
- Solo devolver `status = 'approved'`
- Ordenar por `approved_at DESC`
- Máximo 20 resultados (el frontend muestra 6, pero tener margen)
- `aggregate.avg_rating`: ROUND(AVG(rating), 1) de todas las aprobadas
- `aggregate.total_count`: COUNT de todas las aprobadas
- **NUNCA** incluir `ip_hash`, `deleted_at`, o cualquier dato interno

---

### 2.3 `GET /api/reviews` — Admin (auth requerida)

Dashboard de la doctora. **Requiere JWT/session válida.**

**Query params opcionales:**
- `?status=pending` → solo pendientes
- `?status=approved` → solo aprobadas
- `?status=deleted` → solo eliminadas
- Sin param → todas (excepto deleted, que requiere param explícito)

**Response 200:**
```json
{
  "reviews": [
    {
      "id": "uuid",
      "patient_name": "María José",
      "treatment": "Botox",
      "body": "Excelente atención...",
      "rating": 5,
      "status": "pending",
      "created_at": "2026-06-12T10:00:00Z",
      "approved_at": null,
      "deleted_at": null
    }
  ]
}
```

**Notas:**
- NO incluir `ip_hash` en respuesta al dashboard (interno, solo para logs)
- Ordenar: pendientes primero (`created_at DESC`), aprobadas por `approved_at DESC`

---

### 2.4 `PATCH /api/reviews/:id/approve` — Admin (auth requerida)

Doctora aprueba una reseña pendiente.

**Request body:** vacío / `{}`

**Lógica:**
1. Verificar que review existe y `status = 'pending'`
2. Actualizar: `status = 'approved'`, `approved_at = NOW()`

**Response 200:**
```json
{ "id": "uuid", "status": "approved", "approved_at": "2026-06-12T15:00:00Z" }
```

**Response 404:** review no existe o no está en pending
```json
{ "error": "NOT_FOUND" }
```

---

### 2.5 `DELETE /api/reviews/:id` — Admin (auth requerida)

Doctora elimina una reseña. **Soft delete.**

**Lógica:**
1. Verificar que review existe y `status != 'deleted'`
2. Actualizar: `status = 'deleted'`, `deleted_at = NOW()`

**Response 200:**
```json
{ "id": "uuid", "status": "deleted" }
```

**Response 404:** review no existe o ya está deleted
```json
{ "error": "NOT_FOUND" }
```

---

### 2.6 `GET /api/reviews/stats` — Admin (auth requerida)

Header stats del dashboard.

**Response 200:**
```json
{
  "pending_count": 3,
  "approved_count": 12,
  "deleted_count": 1,
  "avg_rating": 4.9
}
```

---

## 3. Cómo el Frontend Consume la API

### Homepage (`app/page.tsx`)

```typescript
// Fetch en el Server Component de homepage
const reviewsResult = await backendFetch<{
  reviews: PublicReview[]
  aggregate: { avg_rating: number; total_count: number }
}>("/reviews/public", { revalidate: 300 })

// Pasar a TestimonialsSection
<TestimonialsSection
  reviews={reviewsResult.data?.reviews ?? []}
  aggregate={reviewsResult.data?.aggregate}
/>
```

Si el fetch falla o devuelve vacío, `TestimonialsSection` usa fallback interno con reviews hardcodeadas — el sitio nunca queda roto.

### Formulario paciente (`/resenas/nueva`)

```typescript
// Client Component — ReviewForm.tsx
const res = await fetch("/api/reviews", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    patient_name: "...",
    treatment: "Botox" | "Otro texto" | null,
    body: "...",
    rating: 5
  })
})
```

**Importante sobre `treatment`:**
- Si el usuario seleccionó un tratamiento de la lista → se envía el nombre tal cual (`"Botox"`)
- Si seleccionó "Otro" y escribió texto → se envía ese texto custom (`"Peeling profundo"`)
- Si no seleccionó nada → se envía `null`
- El backend acepta cualquiera de los tres casos

### Dashboard admin

```typescript
// Listar con filtro
GET /api/reviews?status=pending     // tab Pendientes
GET /api/reviews?status=approved    // tab Publicadas
GET /api/reviews?status=deleted     // tab Eliminadas

// Aprobar
PATCH /api/reviews/:id/approve

// Eliminar
DELETE /api/reviews/:id

// Stats header
GET /api/reviews/stats
```

---

## 4. Schema.org — JSON-LD Dinámico

El frontend construye el JSON-LD con los datos de `GET /api/reviews/public`. Backend no hace nada extra — solo devolver los datos en el formato correcto y el frontend lo transforma.

**Lo que el frontend genera con esos datos:**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Medicina Estética — Dra. Yasmin Medrano Avila",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "12",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "María José" },
      "reviewRating": { "@type": "Rating", "ratingValue": "5" },
      "reviewBody": "Excelente atención...",
      "datePublished": "2026-06-01"
    }
  ]
}
```

**Requisito para que Google muestre rich snippets:** mínimo 1 review con `approved_at` válido. El campo `approved_at` es crítico — no puede ser null en reviews aprobadas.

---

## 5. Anti-spam — Implementación

```javascript
// Rate limit simple — opción A: en memoria (solo para 1 instancia)
const ipRequests = new Map() // ip_hash -> { count, resetAt }

function checkRateLimit(ipHash) {
  const now = Date.now()
  const entry = ipRequests.get(ipHash)
  
  if (!entry || now > entry.resetAt) {
    ipRequests.set(ipHash, { count: 1, resetAt: now + 86_400_000 })
    return true // permitido
  }
  
  if (entry.count >= 2) return false // bloqueado
  
  entry.count++
  return true
}

// Opción B: tabla DB (para múltiples instancias / producción)
// CREATE TABLE rate_limits (
//   ip_hash VARCHAR(64) PRIMARY KEY,
//   count   SMALLINT NOT NULL DEFAULT 1,
//   reset_at TIMESTAMPTZ NOT NULL
// );
```

**Recomendación:** usar tabla DB si hay más de 1 instancia del backend.

---

## 6. Checklist de Entrega

- [ ] Migración SQL aplicada en producción
- [ ] `POST /api/reviews` — validaciones + rate limit + honeypot ignorado (el frontend ya filtra, el backend simplemente ignora campo `website` si llega)
- [ ] `GET /api/reviews/public` — solo aprobadas, con aggregate
- [ ] `GET /api/reviews` — admin auth, filtro por status
- [ ] `PATCH /api/reviews/:id/approve` — admin auth, setea approved_at
- [ ] `DELETE /api/reviews/:id` — admin auth, soft delete
- [ ] `GET /api/reviews/stats` — admin auth
- [ ] ip_hash = SHA-256, nunca IP raw
- [ ] `approved_at` siempre seteado al aprobar (crítico para SEO)
- [ ] Tests: happy path + validación + rate limit + auth guard en endpoints admin

---

## 7. Lo que NO hace el Backend

- NO enviar notificaciones (eso es v2)
- NO generar QR codes
- NO editar reviews (la doctora no puede editar, por diseño)
- NO restaurar reviews eliminadas (eso es v2)
- NO exponer ip_hash al dashboard

---

*Preguntas → Miguel / frontend team antes de implementar.*
