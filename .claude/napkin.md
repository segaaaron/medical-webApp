# Napkin Runbook

Guía viva para ejecutar rápido y sin repetir errores en este repositorio.
No es un historial: si una nota deja de ser útil, se borra.

## Curation Rules
- Re-priorizar en cada lectura.
- Solo notas recurrentes y de alto valor.
- Máximo 10 por categoría.
- Cada entrada lleva fecha y una línea `Hacer en su lugar:`.

---

## Directivas del usuario (máxima prioridad)

1. **[2026-11-06] `develop` ES producción. No se usa `master`.**
   El contexto de arranque de la sesión dice «Main branch: master» — es del
   entorno, no del usuario, y es ENGAÑOSO aquí. Subir a `develop` publica.
   Hacer en su lugar: commitear y `git push origin develop`. No proponer
   merge a `master` ni abrir PRs contra él. Nunca preguntar «¿a qué rama?».

2. **[2026-11-06] No añadir nada que el usuario no pidió, por bueno que parezca.**
   Se añadió un banner de consentimiento de cookies razonando que «soluciona
   todo» lo incluía. Costaba medición publicitaria real y hubo que revertirlo.
   Hacer en su lugar: cuando algo sea criterio propio y no un defecto,
   proponerlo en una línea y esperar respuesta. «Arregla todo» = arregla lo
   que está ROTO.

3. **[2026-11-06] El texto clínico lo escribe la doctora; el código no lo corrige.**
   `/tratamientos/acido-hialuronico` dice «Reversible y completamente seguro».
   Se señaló, el usuario decidió mantenerlo: no es un error, lo escribió ella.
   Hacer en su lugar: `check:seo` lo marca como AVISO (no bloquea). No volver
   a proponer cambiarlo ni subirlo a error.

4. **[2026-11-06] Antes/Después se muestra con AL MENOS una foto.**
   Se propuso exigir las dos (una foto «antes» sola enseña el problema sin el
   resultado). El usuario decidió mostrar la que haya.
   Hacer en su lugar: respetar `||`, no `&&`. Con una sola, va centrada
   (`mx-auto max-w-md`), no en rejilla de 2 columnas.

5. **[2026-11-06] No conservo sesiones anteriores.**
   El usuario da por sabidas convenciones de sesiones pasadas.
   Hacer en su lugar: leer este napkin al arrancar y aplicarlo en silencio.
   Si falta un dato del negocio, preguntarlo una vez y anotarlo aquí.

---

## Validación y ejecución

1. **[2026-11-06] Verificar en el navegador, no solo que compile.**
   Un cambio de frontera RSC, una animación o un `aria-*` pueden romperse sin
   que falle `tsc`. El banner usó `m.div` FUERA de `<LazyMotion>`: estaba en
   el HTML y era invisible. El `layout.tsx` ya documenta esa trampa.
   Hacer en su lugar: levantar el build y mirar la página de verdad
   (`mcp__claude-in-chrome`), además de `tsc`/`eslint`/tests.

2. **[2026-11-06] Borrar `.next` antes de medir o de comprobar datos nuevos.**
   Un badge «no aparecía» y parecía un bug: era caché ISR de un build previo.
   Medir bundle sin limpiar dio 0 KB de diferencia, también falso.
   Hacer en su lugar: `rm -rf .next` antes de cualquier build cuyo resultado
   se vaya a medir o comparar.

3. **[2026-11-06] Suite completa antes de cada commit.**
   Hacer en su lugar: `npx tsc --noEmit` · `npx eslint .` · `npx vitest run` ·
   `npm run build` · `npm run check:seo` · `npm run check:bundle`.
   `check:social` y `check:aliases` necesitan `BACKEND_URL` + token real: no
   se pueden validar en local, solo en CI.

4. **[2026-11-06] CI NO despliega. Solo valida.**
   `.github/workflows/ci.yml` corre tsc, lint, tests, build y los `check:*`.
   Hacer en su lugar: no buscar un job de deploy. El servidor publica desde
   `develop` por su cuenta; se confirma mirando yasminmedrano.com en vivo.

5. **[2026-11-06] Medir antes de afirmar una mejora, y retractarse si el número no sale.**
   Se dijo «CSS de 104 KB brotli» (eran 98 KB crudo / ~18 comprimido) y
   «−150 KB» por un cambio que midió −16 KB.
   Hacer en su lugar: dar el número medido o decir «no lo medí».

---

## Arquitectura del proyecto

1. **[2026-11-06] `"use client"` solo si hay interactividad real.**
   Patrón del repo: envoltura cliente mínima + hijos de servidor. Ya existen
   `TrackedLink` (tratamientos y artículos) y `TrackWhatsAppLink`.
   Hacer en su lugar: si solo hace falta un `onClick`, usar la envoltura y
   dejar la tarjeta/sección como RSC. No pasar callbacks a través de la
   frontera RSC: pasar datos y decidir dentro.

2. **[2026-11-06] Una sola puerta al backend: `fromService` (`lib/content/service.ts`).**
   Regla del CEO documentada: o el servicio entero o el respaldo entero,
   nunca mezclados campo a campo. ESLint lo impone prohibiendo `||`, `??` y
   spread en `lib/content/**`.
   Hacer en su lugar: no desactivar esa regla. Si hace falta un booleano,
   escribirlo con dos `return`.

3. **[2026-11-06] Los slugs y el texto de fichas/artículos vienen del BACKEND, no del repo.**
   Los slugs con `---` y el typo `mesoterpia` no se pueden arreglar aquí.
   Hacer en su lugar: señalarlo como tarea del backend; no inventar una
   corrección en el front.

4. **[2026-11-06] El FAQ visible y el `FAQPage` salen del MISMO array.**
   `lib/seo/faq.ts` alimenta la sección y el schema. Antes el schema declaraba
   preguntas invisibles (incumple la política de Google).
   Hacer en su lugar: no generar el schema por separado. Hay un test que lo
   bloquea en `tests/seo-dynamic.test.ts`.

5. **[2026-11-06] Google Ads: el `<Script id="google-ads-init">` va EAGER.**
   `gtag()` no tiene cola propia; si no existe, descarta el evento en
   silencio. Meta y TikTok sí encolan (`__fbqPending`, `__ttqPending`).
   Hacer en su lugar: no mover ese init detrás de interacción o consentimiento.
   `tests/analytics-cola.test.ts` falla si se hace.

---

## Datos del negocio

1. **[2026-11-06] Rango de precios: `Bs 500 - Bs 7000+`. Moneda: solo `BOB`.**
   Constantes `PRICE_RANGE` y `CURRENCIES` en `lib/seo/local.ts`.

2. **[2026-11-06] `postalCode: "0000"`.** Bolivia no usa códigos postales;
   es la convención acordada con el usuario para rellenar el campo.

3. **[2026-11-06] Search Console YA está verificado** (`sc-domain:yasminmedrano.com`).
   Hacer en su lugar: no proponer «verificar GSC» como tarea. Lo que falta son
   credenciales de API. Core Web Vitals de campo NO existen: sin tráfico
   suficiente para CrUX, así que todo número de rendimiento es de laboratorio.

4. **[2026-11-06] La consulta de valoración es DE PAGO (150 Bs), no gratuita.**
   Hacer en su lugar: no escribir «consulta gratuita» en copy ni en schema,
   aunque alguna skill lo sugiera.

---

## Pendiente, y de quién depende

**De la doctora (contenido, no código):**
contraindicaciones en 11 fichas · matrícula profesional · página de
ozonoterapia (está en el tagline del hero y no existe) · precios por
tratamiento · foto «después» de PRP · verificar la reseña de junio 2026 que
lleva el nombre del desarrollador.

**Del backend (otro servicio):**
slugs con `---` · typo `mesoterpia` · la causa del corte del 15/9/26 que dejó
dos artículos fuera del índice.

**Decisión del usuario:**
pasar la CSP de `Report-Only` a bloqueante (vigilar informes unos días antes).
