# Backend Spec — Invitaciones de Reseña (links únicos por paciente)
**yasminmedrano.com · v1.0 · 2026-06-12**

---

## Contexto

Evolución del sistema de reseñas. **Se elimina el formulario público abierto.** Ahora toda reseña nace de una **invitación** que crea la doctora desde el dashboard:

1. La doctora ingresa los datos del paciente (nombre, apellido, email, teléfono) y pulsa **"Crear link"**.
2. El backend genera un **token único e impredecible** y devuelve una URL del tipo `https://yasminmedrano.com/resenas/r/<token>`.
3. La doctora envía esa URL al paciente (WhatsApp / email).
4. El paciente abre el link y solo completa: **calificación (estrellas)**, **tratamiento** (select + opción "Otros") y **comentario**. El nombre/apellido ya los puso la doctora — el paciente no los ve ni edita.
5. Al enviar, el link **muere de inmediato** (un solo uso). Si nadie lo usa, **caduca a los 7 días**.

Identidad garantizada: el nombre que aparece en la web es exactamente el que la doctora registró.

---

## 1. Cambios en la tabla `reviews`

La tabla `reviews` ya existe (ver `backend-spec-reviews.md`). Agregar columnas:

```sql
ALTER TABLE reviews
  ADD COLUMN patient_lastname VARCHAR(100),       -- apellido, ya lo manda el frontend
  ADD COLUMN invite_id        UUID REFERENCES review_invites(id);  -- de qué invitación nació
```

> `email` y `phone` del paciente **NO** se guardan en `reviews` — viven en `review_invites` (son datos de contacto, no de la reseña pública).

---

## 2. Tabla nueva: `review_invites`

```sql
CREATE TABLE review_invites (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  token            VARCHAR(64)  NOT NULL UNIQUE,        -- CSPRNG, base64url
  patient_name     VARCHAR(100) NOT NULL,
  patient_lastname VARCHAR(100) NOT NULL,
  email            VARCHAR(150),
  phone            VARCHAR(20),
  status           VARCHAR(20)  NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending','used','expired','revoked')),
  review_id        UUID         REFERENCES reviews(id), -- se setea al usarse
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  expires_at       TIMESTAMPTZ  NOT NULL,               -- created_at + 7 días
  used_at          TIMESTAMPTZ
);

CREATE INDEX idx_invites_token  ON review_invites(token);
CREATE INDEX idx_invites_status ON review_invites(status);
CREATE INDEX idx_invites_created ON review_invites(created_at DESC);
```

### Estados (máquina de estados)
| Estado | Significado | Transición |
|--------|-------------|------------|
| `pending` | Creada, sin usar, dentro de los 7 días | inicial |
| `used` | El paciente ya envió su reseña | terminal |
| `expired` | Pasaron 7 días sin usarse | terminal |
| `revoked` | La doctora la canceló manualmente | terminal |

**Regla de caducidad:** en cualquier lectura, si `status='pending'` **y** `now() > expires_at` → tratar como `expired` (idealmente actualizar la fila, o calcularlo al vuelo + un cron diario que marque las vencidas).

---

## 3. Token — generación y seguridad

- **Generar con CSPRNG**, nunca con `Math.random()` ni UUID secuencial:
  ```javascript
  const token = crypto.randomBytes(32).toString("base64url"); // ~43 chars, impredecible
  ```
- Se guarda **tal cual** en la columna `token` (permite que la doctora vuelva a copiar el link desde el dashboard mientras esté `pending`). El riesgo es bajo: un token solo habilita **una** reseña atada a un paciente.
- **Rate-limit** en el endpoint de validación (`GET .../validate/:token`) para evitar fuerza bruta/enumeración: máx ~20 intentos por IP por minuto → 429.
- Respuesta de validación **nunca** revela `email` ni `phone`.

---

## 4. Endpoints

### 4.1 `POST /api/reviews/invites` — Admin (auth requerida)

La doctora crea la invitación.

**Request body:**
```json
{
  "patient_name": "María José",
  "patient_lastname": "Rivera",
  "email": "maria@email.com",
  "phone": "+59170000000"
}
```

**Validaciones:**
1. `patient_name`: requerido, 2–100 chars
2. `patient_lastname`: requerido, 2–100 chars
3. `email`: opcional, formato email válido si presente, max 150
4. `phone`: opcional, max 20

**Lógica:**
1. Generar `token` CSPRNG único.
2. `expires_at = now() + interval '7 days'`.
3. Insertar fila `status='pending'`.

**Response 201:**
```json
{
  "id": "uuid",
  "token": "Xy9...base64url",
  "patient_name": "María José",
  "patient_lastname": "Rivera",
  "status": "pending",
  "expires_at": "2026-06-19T10:00:00Z"
}
```

> El frontend arma la URL final: `${SITE_URL}/resenas/r/${token}`. El backend **no** necesita conocer el dominio público.

---

### 4.2 `GET /api/reviews/invites` — Admin (auth requerida)

Lista de invitaciones para el dashboard.

**Query params opcionales:** `?status=pending|used|expired|revoked`

**Response 200:**
```json
{
  "invites": [
    {
      "id": "uuid",
      "token": "Xy9...",            // para re-copiar el link si sigue pending
      "patient_name": "María José",
      "patient_lastname": "Rivera",
      "email": "maria@email.com",
      "phone": "+59170000000",
      "status": "pending",
      "created_at": "2026-06-12T10:00:00Z",
      "expires_at": "2026-06-19T10:00:00Z",
      "used_at": null,
      "review_id": null
    }
  ]
}
```

**Notas:**
- Ordenar: `created_at DESC`.
- Para `status != 'pending'`, el `token` puede venir igual (ya no sirve) o `null` — indiferente para el frontend.

---

### 4.3 `DELETE /api/reviews/invites/:id` — Admin (auth requerida)

La doctora cancela una invitación que aún no se usó.

**Lógica:** si `status='pending'` → `status='revoked'`. Si ya está `used`/`expired` → 409 o 404.

**Response 200:**
```json
{ "id": "uuid", "status": "revoked" }
```

---

### 4.4 `GET /api/reviews/invites/validate/:token` — Público

El frontend lo llama al abrir `/resenas/r/<token>` para saber si mostrar el formulario.

**Response 200 (válido):**
```json
{
  "valid": true,
  "patient_name": "María José",
  "patient_lastname": "Rivera"
}
```

**Response 200 (inválido) — NO usar 404 para no filtrar existencia:**
```json
{ "valid": false, "reason": "used" }     // "used" | "expired" | "revoked" | "not_found"
```

**Reglas:**
- Solo devolver `patient_name` y `patient_lastname`. **Nunca** `email`/`phone`/`token`.
- Si `pending` pero `now() > expires_at` → `{ "valid": false, "reason": "expired" }`.

---

### 4.5 `POST /api/reviews/invites/:token/submit` — Público

El paciente envía su reseña. **Este es el único camino para crear una reseña.**

**Request body:**
```json
{
  "rating": 5,
  "treatment": "Botox",          // nombre del select, texto de "Otros", o null
  "body": "Excelente atención, resultados naturales."
}
```

**Validaciones (en orden):**
1. Token existe, `status='pending'`, no expirado → si no, 409 `{ "error": "INVITE_INVALID", "reason": "used|expired|revoked|not_found" }`
2. `rating`: requerido, entero 1–5
3. `body`: requerido, 20–800 chars
4. `treatment`: opcional, max 150

**Lógica (ATÓMICA — crítico para el "un solo uso"):**
```sql
-- 1. Reservar la invitación de forma atómica (evita doble envío en carrera)
UPDATE review_invites
   SET status='used', used_at=now()
 WHERE token=$1 AND status='pending' AND expires_at > now()
RETURNING id, patient_name, patient_lastname;
-- Si 0 filas → 409 INVITE_INVALID

-- 2. Crear la reseña heredando identidad de la invitación
INSERT INTO reviews (patient_name, patient_lastname, treatment, body, rating, status, invite_id)
VALUES ($name, $lastname, $treatment, $body, $rating, 'pending', $invite_id)
RETURNING id;

-- 3. Enlazar
UPDATE review_invites SET review_id=$reviewId WHERE id=$invite_id;
```

> La reseña nace en `status='pending'`: **la doctora sigue moderando/aprobando** antes de que salga en la web (flujo de aprobación ya existente, sin cambios). La invitación garantiza la *identidad*, no el contenido.

**Response 201:**
```json
{ "review_id": "uuid", "status": "pending" }
```

**Response 409 (link ya muerto):**
```json
{ "error": "INVITE_INVALID", "reason": "used" }
```

---

### 4.6 `GET /api/reviews/public` y demás — sin cambios

`GET /api/reviews/public`, `GET /api/reviews`, `PATCH .../approve`, `DELETE .../:id`, `GET .../stats` siguen igual que en `backend-spec-reviews.md`. Solo agregar `patient_lastname` al payload de `/public` y de `/reviews` (admin) para que la web y el dashboard pinten "Nombre Apellido".

`GET /api/reviews/public` — cada review debe incluir ahora:
```json
{ "id":"...", "patient_name":"María José", "patient_lastname":"Rivera",
  "treatment":"Botox", "body":"...", "rating":5, "approved_at":"..." }
```

---

## 5. Lo que se ELIMINA del backend

- **`POST /api/reviews` público (form abierto) se retira.** La única forma de crear reseñas es `POST /api/reviews/invites/:token/submit`. (Si se quiere, dejar el endpoint viejo respondiendo 410 Gone por compatibilidad.)
- El rate-limit por IP del form abierto ya no aplica (el control ahora es el token de un solo uso).

---

## 6. Checklist de entrega backend

- [ ] `ALTER TABLE reviews` — `patient_lastname`, `invite_id`
- [ ] `CREATE TABLE review_invites` + índices
- [ ] `POST /api/reviews/invites` (admin) — token CSPRNG, expires_at +7d
- [ ] `GET /api/reviews/invites` (admin) — lista con status
- [ ] `DELETE /api/reviews/invites/:id` (admin) — revoke
- [ ] `GET /api/reviews/invites/validate/:token` (público) — sin filtrar email/phone, rate-limited
- [ ] `POST /api/reviews/invites/:token/submit` (público) — UPDATE atómico un-solo-uso → crea review pending
- [ ] Caducidad 7 días aplicada en validación + submit (+ cron opcional)
- [ ] `patient_lastname` agregado a `/reviews/public` y `/reviews` (admin)
- [ ] `POST /api/reviews` abierto retirado (o 410 Gone)
- [ ] Tests: crear invite, validar, submit happy-path, doble-submit (debe fallar el 2º), expirado, revocado, token inexistente

---

## 7. Fuera de alcance (v2)

- Notificaciones automáticas al paciente (email/WhatsApp con el link) — por ahora la doctora copia y manda manual.
- Auto-aprobación de reseñas por invitación (hoy se mantiene moderación manual).
- Reenvío/regeneración de token sobre la misma invitación.

---

*Preguntas → Miguel / frontend team antes de implementar.*
