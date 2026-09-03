import { backendFetch } from "@/lib/backend-client"

/**
 * Ubicación del consultorio para los datos estructurados.
 *
 * Las coordenadas vivían escritas a mano en `app/layout.tsx` y `app/page.tsx`,
 * mientras que la página de contacto ya las leía del panel. Resultado: la
 * doctora corrigió el punto en Dashboard → Contacto y el mapa de la página se
 * movió, pero el `geo` que ve Google siguió apuntando 90 metros más allá,
 * sobre otra calle.
 *
 * El panel manda. Si el backend no responde, se devuelve `null` y quien llame
 * decide: mejor omitir el `geo` que declarar un punto que ya no es cierto.
 */

export interface ConsultorioLocation {
  latitude: number
  longitude: number
  /** Enlace al punto en Google Maps, derivado de las mismas coordenadas. */
  mapsUrl: string
}

function parseCoord(raw: unknown): number | null {
  const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN
  return Number.isFinite(n) ? n : null
}

export async function getConsultorioLocation(): Promise<ConsultorioLocation | null> {
  const { data, error } = await backendFetch<unknown>("/contact", { revalidate: 300 })
  if (error || !data || typeof data !== "object") return null

  const raw = data as Record<string, unknown>
  const latitude = parseCoord(raw.latitude)
  const longitude = parseCoord(raw.longitude)
  if (latitude === null || longitude === null) return null

  // Rango válido: descarta un valor mal pegado en el panel antes de publicarlo
  // como la ubicación del consultorio.
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null

  // El enlace se deriva de las coordenadas en vez de leer `mapsUrl` del panel:
  // ese campo se quedó apuntando al punto antiguo cuando se corrigieron las
  // coordenadas, y dos fuentes para el mismo dato acaban contradiciéndose.
  return {
    latitude,
    longitude,
    mapsUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
  }
}
