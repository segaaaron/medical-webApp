# Frontend Plan — Invitaciones de Reseña + Formulario Elite
**yasminmedrano.com · v1.0 · 2026-06-12**

Depende de: `docs/backend-spec-review-invites.md`

---

## Resumen

Tres frentes de trabajo en frontend:

1. **Dashboard** — la doctora crea invitaciones, copia el link y ve el estado de cada una.
2. **Página pública nueva** `/resenas/r/[token]` — el paciente abre su link y deja la reseña (formulario **elite**).
3. **Retiro del form abierto** — se elimina/redirige `/resenas/nueva` y se limpia el `ReviewForm` viejo.

---

## 1. Rutas y archivos

```
app/
├── dashboard/resenas/
│   └── page.tsx                         # + sección "Invitaciones" (crear + listar)
├── resenas/
│   ├── nueva/page.tsx                   # ❌ retirar → redirect a home o aviso
│   └── r/[token]/page.tsx               # ✅ NUEVO — RSC: valida token, renderiza form o error
├── api/reviews/
│   ├── route.ts                         # quitar POST público (solo queda GET admin)
│   └── invites/
│       ├── route.ts                     # POST (crear) + GET (listar) — admin
│       ├── [id]/route.ts                # DELETE (revocar) — admin
│       └── [token]/
│           ├── validate/route.ts        # GET — público (proxy a backend validate)
│           └── submit/route.ts          # POST — público (proxy a backend submit)
components/
├── dashboard/
│   └── InviteManager.tsx                # ✅ form crear-invitación + tabla de invitaciones
└── sections/
    ├── ReviewForm.tsx                   # ❌ retirar (form abierto)
    └── InviteReviewForm.tsx             # ✅ NUEVO — el formulario elite del paciente
```

---

## 2. API proxy (Next.js → backend)

Todos via `backendFetch`. Los admin con `{ auth: true }` + `checkCsrfOrigin` + `checkWriteRateLimit`. Los públicos sin auth.

| Ruta Next.js | Método | Auth | Proxy a backend |
|--------------|--------|------|-----------------|
| `/api/reviews/invites` | POST | admin | `POST /reviews/invites` |
| `/api/reviews/invites` | GET | admin | `GET /reviews/invites` |
| `/api/reviews/invites/[id]` | DELETE | admin | `DELETE /reviews/invites/:id` |
| `/api/reviews/invites/[token]/validate` | GET | público | `GET /reviews/invites/validate/:token` |
| `/api/reviews/invites/[token]/submit` | POST | público | `POST /reviews/invites/:token/submit` |

Patrón idéntico al de `app/api/reviews/route.ts` ya existente (sesión `COOKIE_NAME`, `proxyError`, validación de `isValidId` para `[id]`). Para `[token]` validar formato base64url (`/^[A-Za-z0-9_-]{20,64}$/`) antes de proxyear.

---

## 3. Dashboard — `InviteManager`

Se inserta en `/dashboard/resenas`, arriba de la lista de reseñas (reemplaza el actual `ShareUrlCard`, que ya no aplica).

### 3.1 Crear invitación
Card con form (estilo dashboard existente, inputs `INPUT_CLS`):
- Nombre *  ·  Apellido *
- Email  ·  Teléfono
- Botón **"Crear link"** (gold)

Al crear (`POST /api/reviews/invites`):
- Construye `url = ${window.location.origin}/resenas/r/${token}`
- Muestra la URL en un campo readonly + botón **Copiar** + botón **WhatsApp** (`https://wa.me/?text=...`)
- Refresca la tabla de invitaciones

### 3.2 Tabla de invitaciones
Lista (`GET /api/reviews/invites`), cada fila:
- Paciente: **Nombre Apellido**
- Badge de estado: `Pendiente` (ámbar) · `Usada` (verde) · `Expirada` (gris) · `Revocada` (rojo)
- Fecha creación · Fecha de caducidad (cuenta regresiva "expira en 5 días")
- Acciones: **Copiar link** (solo si `pending`) · **Revocar** (solo si `pending`)

Filtros por estado (igual patrón que los filtros de reseñas).

---

## 4. Página pública `/resenas/r/[token]` (RSC)

```tsx
export const metadata = { robots: { index: false, follow: false } }  // nunca indexar

export default async function InviteReviewPage({ params }) {
  const { token } = await params
  const res = await backendFetch(`/reviews/invites/validate/${token}`)  // sin auth
  // res.data = { valid, patient_name, patient_lastname } | { valid:false, reason }

  if (!res.data?.valid) return <InviteErrorState reason={res.data?.reason} />

  const treatments = await backendFetch("/treatments?active=true", { revalidate: 300 })
  return <InviteReviewForm token={token}
            patientName={res.data.patient_name}
            patientLastname={res.data.patient_lastname}
            treatments={treatments} />
}
```

### Estados de error (`InviteErrorState`)
Pantalla full-screen branded (logo + mensaje cálido):
- `used` → "Esta reseña ya fue enviada. ¡Gracias!" ✅
- `expired` → "Este enlace expiró. Pídele uno nuevo a la Dra. Medrano."
- `revoked` / `not_found` → "Enlace no válido."

---

## 5. ⭐ EL FORMULARIO ELITE — `InviteReviewForm`

Lo que el paciente ve. Objetivo: que se sienta **premium, cálido y exclusivo** — "te invitaron personalmente". Solo 3 campos: estrellas, tratamiento, comentario.

### 5.1 Layout — split inmersivo (desktop) / stacked (mobile)

```
┌───────────────────────────────┬──────────────────────────────┐
│  PANEL IZQUIERDO (brand)       │  PANEL DERECHO (form)        │
│                                │                              │
│  [logo_dra_yasmin_cursiva]     │   ✦ Calificación             │
│                                │   ★ ★ ★ ★ ★  (grandes)       │
│  Foto draMedrano2.jpeg         │                              │
│  con overlay gradiente         │   Tratamiento recibido       │
│  burgundy→transparent          │   [ select premium ▾ ]       │
│                                │     └ "Otros" → input         │
│  "Hola, María José ✦"          │                              │
│  Tu opinión vale oro.          │   Tu experiencia             │
│  Cuéntanos cómo te fue.        │   [ textarea grande ]        │
│                                │   240 caracteres restantes    │
│  ★★★★★ 5.0                     │                              │
│  + de [N] pacientes            │   [  ENVIAR MI RESEÑA  ✦ ]   │
└───────────────────────────────┴──────────────────────────────┘
```

- Fondo: `--prem-dark` (oklch 13%) con gradiente sutil burgundy + textura grain.
- Panel izquierdo solo desktop (`lg:`). En mobile: header compacto con logo + saludo, luego el form.
- Card del form: superficie `--prem-dark-surf` con borde gold sutil `1px solid rgba(184,151,59,.25)`, glow suave, `border-radius` 2px (estética editorial del proyecto).

### 5.2 Saludo personalizado
- `"Hola, {patient_name} ✦"` en **Playfair Display** (`--font-heading`), grande, color `--prem-dark-fg`, acento gold en el símbolo.
- Eyebrow en **JetBrains Mono** (`.prem-eyebrow`): `INVITACIÓN PERSONAL · DRA. YASMIN MEDRANO`.
- El nombre NO es editable — es un saludo, no un input.

### 5.3 Star picker (estrella protagonista)
- Reutilizar/mejorar el `StarPicker` existente: estrellas **size 40–44**, gap generoso.
- Hover/selección: `fill` gold con **spring scale 1.15** + glow `drop-shadow`.
- Touch targets 44px (a11y), `role="radiogroup"`.
- Debajo, microcopy dinámico según rating: 1–2 "Lamentamos que…", 3 "Gracias por tu honestidad", 4 "¡Nos alegra!", 5 "¡Excelente! ✨".

### 5.4 Select de tratamiento + "Otros"
- Select premium dark (mismo estilo que `ReviewForm` actual) con la lista de `treatments`.
- Última opción **"Otros"** → al elegirla, `AnimatePresence` revela un input ("¿Cuál tratamiento?") con animación de altura.
- Opcional (no bloquea el envío).

### 5.5 Comentario
- `textarea` grande (rows 5), `--primary-darkest` bg, focus ring gold.
- Contador de caracteres (mín 20, máx 800), se pone gold cuando quedan <50.
- Hint: "No incluyas información médica privada."

### 5.6 Botón enviar
- Full-width, gradiente gold (`--vintage-gold` → `--vintage-gold-dark`), uppercase, tracking amplio.
- **Shimmer** sutil en hover. Spinner + "Enviando…" en loading. Disabled hasta que rating>0 y body≥20.

### 5.7 Envío y feedback
- `POST /api/reviews/invites/{token}/submit` con `{ rating, treatment, body }`.
- **Éxito (201):** reemplazar el form con `SuccessState` elite — sello animado (círculo + check gold, ya existe) + "¡Gracias, {nombre}! 💛 La Dra. Medrano revisará tu reseña." + partículas gold sutiles. **Toast verde** "Reseña enviada" (componente Toast ya creado).
- **Error 409 (link muerto):** toast rojo + reemplazar por `InviteErrorState reason="used"`.
- **Error red/validación:** toast rojo, no se pierde lo escrito.

### 5.8 Animaciones (Framer Motion)
- Entrada escalonada (`stagger`) de cada bloque del form.
- Panel izquierdo: foto con `scale` lento (Ken Burns sutil), logo fade-in.
- Estrellas con spring. Botón shimmer. Respeto a `prefers-reduced-motion`.

### 5.9 Assets a usar
- `public/images/logo_dra_yasmin_cursiva.png` — header/panel.
- `public/images/draMedrano2.jpeg` (o 3/4) — panel izquierdo con overlay.
- `next/image` con `priority` solo en la imagen del panel; resto lazy.

---

## 6. Limpieza (retiro del form abierto)

- `app/resenas/nueva/page.tsx` → `redirect("/")` o página "El formulario abierto fue reemplazado por invitación".
- `components/sections/ReviewForm.tsx` → borrar (o dejar deprecado sin ruta que lo use).
- `app/api/reviews/route.ts` → quitar el handler `POST` (queda solo `GET` admin). El submit ahora vive en `/api/reviews/invites/[token]/submit`.
- `ShareUrlCard` del dashboard → reemplazado por `InviteManager`.

---

## 7. Orden de implementación sugerido (frontend)

1. **Proxies API** (`/api/reviews/invites/*`) — sin esto nada funciona.
2. **`InviteManager`** en dashboard — la doctora ya puede crear y copiar links (probar contra backend).
3. **`/resenas/r/[token]` + `InviteErrorState`** — validación y estados.
4. **`InviteReviewForm` elite** — el formulario estrella (mayor esfuerzo de UI).
5. **Limpieza** del form abierto.
6. **QA** — doble envío, expiración, revocado, mobile, a11y, Lighthouse.

> Depende 100% de que el backend exponga los endpoints de `backend-spec-review-invites.md`. Frontend puede avanzar 1–4 con datos mock mientras backend implementa.

---

## 8. Criterios de aceptación

- [ ] La doctora crea invitación con nombre/apellido/email/teléfono y obtiene un link copiable.
- [ ] El link abre un formulario elite que saluda al paciente por su nombre (no editable).
- [ ] El paciente solo completa estrellas + tratamiento (con "Otros") + comentario.
- [ ] Al enviar, el link deja de funcionar inmediatamente (reabrir → "ya fue enviada").
- [ ] A los 7 días sin usar, el link muestra "expiró".
- [ ] La doctora puede revocar un link pendiente.
- [ ] La reseña enviada entra como `pending` y la doctora la aprueba con el flujo actual.
- [ ] La web pinta Nombre + Apellido + comentario + estrellas + fecha (card ya existente).
- [ ] El form abierto `/resenas/nueva` ya no acepta envíos.
- [ ] El formulario público nunca se indexa (`robots: noindex`).
