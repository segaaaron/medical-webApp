/**
 * Datos locales del consultorio para los datos estructurados.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POR QUÉ EXISTE ESTE ARCHIVO
 *
 * La dirección, el teléfono y el horario estaban escritos tres veces —layout,
 * home y contacto— y ya habían empezado a divergir: `/contacto` declaraba un
 * `MedicalBusiness` anónimo, sin `@id`, con un `sameAs` distinto al del resto.
 * Para Google eso no es «la misma ficha repetida», son entidades distintas que
 * se contradicen, y el factor NAP (nombre, dirección, teléfono) del ranking
 * local exige justo lo contrario: el mismo dato, idéntico, en todas partes.
 *
 * Aquí vive una sola vez. Teléfono, horario, coordenadas y redes vienen del
 * panel (lib/content/contact.ts); lo que ningún panel edita —dirección, zona
 * de servicio, idiomas— vive en estas constantes.
 */

/** Dirección postal completa. `streetAddress` es obligatorio para el 3-pack. */
export const ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "Calle Paccieri #772, entre 16 de Julio y Antezana",
  addressLocality: "Cochabamba",
  addressRegion: "Cochabamba",
  addressCountry: "BO",
} as const

export type OpeningHoursSpec = {
  "@type": "OpeningHoursSpecification"
  dayOfWeek: readonly string[]
  opens: string
  closes: string
}

/** «9:00 AM», «19:00», «8:30 pm» → «HH:MM». */
function to24h(h: string, m: string | undefined, ampm: string | undefined): string {
  let hour = Number(h)
  const suf = ampm?.toLowerCase().replace(/[^ap]/g, "")
  if (suf === "p" && hour < 12) hour += 12
  if (suf === "a" && hour === 12) hour = 0
  return `${String(hour).padStart(2, "0")}:${m ?? "00"}`
}

/**
 * Franja «apertura – cierre» a partir del texto libre del panel
 * («9:00 AM – 7:00 PM - A Coordinar»). Sin dos horas reconocibles («Cerrado»)
 * devuelve null y ese día no se declara: mejor callar que publicar un horario
 * inventado.
 */
export function parseHoursRange(text: string): { opens: string; closes: string } | null {
  const times = [...text.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?)?/gi)]
    .filter((t) => Number(t[1]) <= 24)
  if (times.length < 2) return null
  const [o, c] = times
  return { opens: to24h(o[1], o[2], o[3]), closes: to24h(c[1], c[2], c[3]) }
}

/** Horario del schema a partir de los tres campos de Dashboard → Contacto. */
export function openingHoursFrom(schedule: {
  weekdays: string
  saturday: string
  sunday: string
}): OpeningHoursSpec[] {
  const days: [string, readonly string[]][] = [
    [schedule.weekdays, ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]],
    [schedule.saturday, ["Saturday"]],
    [schedule.sunday, ["Sunday"]],
  ]
  return days.flatMap(([text, dayOfWeek]) => {
    const range = parseHoursRange(text)
    return range ? [{ "@type": "OpeningHoursSpecification" as const, dayOfWeek, ...range }] : []
  })
}

/** Teléfono del panel («+591 78751894») en E.164. Vacío si no hay dígitos. */
export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 8 ? `+${digits}` : ""
}

/**
 * Zona de servicio declarada.
 *
 * El consultorio está en Cercado, pero la gente que busca «bótox cerca de mí»
 * escribe desde Quillacollo, Sacaba o Tiquipaya —el área metropolitana de
 * Cochabamba— y desde Santa Cruz o La Paz cuando busca a una especialista
 * concreta. `areaServed` es cómo se le dice a Google (y a los motores de
 * respuestas, que enumeran cobertura al recomendar) hasta dónde llega el
 * servicio, sin fingir sedes que no existen.
 *
 * No se inventan direcciones por municipio: eso sí es spam local y acarrea
 * suspensión de la ficha.
 */
export const AREA_SERVED = [
  { "@type": "City", name: "Cochabamba", containedInPlace: { "@type": "Country", name: "Bolivia" } },
  { "@type": "City", name: "Quillacollo" },
  { "@type": "City", name: "Sacaba" },
  { "@type": "City", name: "Tiquipaya" },
  { "@type": "City", name: "Colcapirhua" },
  { "@type": "City", name: "Vinto" },
  { "@type": "AdministrativeArea", name: "Departamento de Cochabamba" },
  { "@type": "Country", name: "Bolivia" },
] as const

/** Idiomas en que se atiende. Bolivia es oficialmente plurilingüe. */
export const LANGUAGES = ["es-BO", "es"] as const

/**
 * Teléfono a partir del enlace de WhatsApp del panel.
 *
 * El número del consultorio existe en un solo sitio editable —el enlace de
 * WhatsApp de Dashboard → Contacto—. Derivarlo
 * evita el problema clásico: cambiar el WhatsApp en el panel y que la página
 * siga mostrando el número viejo en el enlace de llamada.
 *
 * @param whatsappUrl Enlace tipo `https://wa.me/59178751894`.
 * @returns Teléfono en E.164, listo para un `href="tel:"`; "" sin número.
 */
export function phoneFromWhatsApp(whatsappUrl: string | null | undefined): string {
  const digits = (whatsappUrl ?? "").match(/(?:wa\.me|phone=)\/?(\d{8,15})/)?.[1]
  return digits ? `+${digits}` : ""
}

/** El mismo teléfono con separación legible, para mostrarlo en pantalla. */
export function formatPhone(e164: string): string {
  const m = e164.match(/^\+(\d{3})(\d{4})(\d{4})$/)
  return m ? `+${m[1]} ${m[2]} ${m[3]}` : e164
}

interface Coords {
  latitude: number
  longitude: number
  mapsUrl: string
}

/**
 * Bloques `geo`, `hasMap` y `serviceArea` derivados de las coordenadas del
 * panel. Sin coordenadas se devuelve un objeto vacío: declarar un punto que ya
 * no es cierto es peor que no declarar ninguno.
 *
 * @param radiusKm Radio de cobertura. 25 km cubre el área metropolitana de
 *                 Cochabamba (Quillacollo, Sacaba, Tiquipaya, Colcapirhua).
 */
export function geoFields(ubicacion: Coords | null, radiusKm = 25) {
  if (!ubicacion) return {}
  return {
    geo: {
      "@type": "GeoCoordinates",
      latitude: ubicacion.latitude,
      longitude: ubicacion.longitude,
    },
    hasMap: ubicacion.mapsUrl,
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: ubicacion.latitude,
        longitude: ubicacion.longitude,
      },
      geoRadius: String(radiusKm * 1000),
    },
  }
}
