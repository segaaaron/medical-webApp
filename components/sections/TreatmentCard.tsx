import { ArrowRight } from "lucide-react"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"
import { displayNameFor } from "@/lib/seo/treatment-names"
import { TrackedLink } from "@/components/analytics/TrackedLink"
import { TAG_LABELS, TAG_COLORS, DEFAULT_TAG_COLOR } from "@/lib/treatment-tags"

/**
 * Tarjeta de tratamiento para las tiras de «relacionados».
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POR QUÉ UN COMPONENTE NUEVO Y NO `PosterCard`
 *
 * `components/sections/TreatmentsGrid.tsx` ya tiene una tarjeta de tratamiento
 * (`PosterCard`), pero no está exportada y está hecha para el catálogo: efecto
 * de inclinación con el ratón, botón de WhatsApp propio y altura de póster.
 * Puesta al pie de una ficha o de un artículo, competiría con el contenido
 * principal en vez de acompañarlo.
 *
 * Esta es deliberadamente la hermana visual de `components/blog/BlogCard.tsx`
 * en su variante `grid`: misma superficie, mismo borde, mismo radio, misma
 * altura de imagen y el mismo gesto de la flecha al pasar por encima. Así las
 * tres tiras de relacionados —artículos del tratamiento, otros tratamientos y
 * tratamientos que menciona el artículo— se leen como una sola familia, que es
 * lo que hace que la navegación entre secciones se sienta continua.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * ES UN COMPONENTE DE SERVIDOR
 *
 * No lleva `"use client"`. Lo único que necesita JavaScript es el `onClick`
 * que avisa a Umami, y eso vive aislado en `TrackedLink`. El nombre, el
 * recorte de la descripción y la tabla de etiquetas se resuelven en el
 * servidor, así que no viajan al navegador — importa sobre todo en las páginas
 * del blog, donde ningún otro componente los usa.
 *
 * `ImageWithFallback` sí es de cliente (gestiona el fallo de carga), pero eso
 * ya lo era antes y no cambia con esto.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * ACCESIBILIDAD
 *
 * El enlace envuelve toda la tarjeta, así que el área de toque es la tarjeta
 * entera, muy por encima del mínimo. La imagen es decorativa respecto al
 * enlace —el nombre del tratamiento ya está en el texto— pero lleva `alt`
 * descriptivo porque también se indexa en búsqueda de imágenes.
 */

export interface TreatmentCardData {
  id: string
  slug: string
  name: string
  description: string
  tag: string
  imageUrl: string
}

interface TreatmentCardProps {
  treatment: TreatmentCardData
  /** Para distinguir en Umami desde qué sección se llegó. */
  source: string
}

/** Texto plano de la descripción del panel, recortado sin partir palabras. */
function resumen(html: string, limite = 120): string {
  const plano = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (plano.length <= limite) return plano
  const corte = plano.slice(0, limite)
  const ultimoEspacio = corte.lastIndexOf(" ")
  return `${corte.slice(0, ultimoEspacio > 0 ? ultimoEspacio : limite)}…`
}

export function TreatmentCard({ treatment, source }: TreatmentCardProps) {
  const nombre = displayNameFor(treatment)
  const texto = resumen(treatment.description)
  const etiqueta = TAG_LABELS[treatment.tag]
  const colorEtiqueta = TAG_COLORS[treatment.tag] ?? DEFAULT_TAG_COLOR

  return (
    <TrackedLink
      href={`/tratamientos/${treatment.slug}`}
      seguimiento={{ tipo: "tratamiento", id: treatment.id, nombre: treatment.name }}
      source={source}
      className="group flex flex-col overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-md"
      style={{
        backgroundColor: "#FFFDF8",
        border: "1px solid rgba(184,151,59,0.12)",
      }}
    >
      <div className="relative h-44 w-full flex-shrink-0 overflow-hidden">
        <ImageWithFallback
          src={treatment.imageUrl}
          // `alt` vacío a propósito: la imagen va DENTRO del enlace, y el
          // título del destino está dos líneas más abajo en ese mismo enlace.
          // Con texto alternativo, un lector de pantalla anuncia el nombre dos
          // veces seguidas. Aquí la imagen es decorativa respecto al enlace; su
          // versión con `alt` descriptivo vive en la página del propio
          // destino, que es la que indexa la búsqueda de imágenes.
          alt=""
          variant="light"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        {etiqueta && (
          <div className="mb-3">
            <span
              className="rounded-full px-2 py-0.5 text-xs"
              style={{ backgroundColor: "rgba(184,151,59,0.1)", color: colorEtiqueta }}
            >
              {etiqueta}
            </span>
          </div>
        )}

        <h3
          className="mb-3 font-heading text-lg font-bold leading-tight transition-opacity group-hover:opacity-80"
          style={{ color: "var(--primary-darkest)" }}
        >
          {nombre}
        </h3>

        {texto && (
          <p
            className="mb-5 flex-1 text-sm leading-relaxed"
            style={{ color: "var(--prem-muted)" }}
          >
            {texto}
          </p>
        )}

        <span
          className="mt-auto inline-flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3"
          style={{ color: "var(--vintage-gold)" }}
        >
          Ver tratamiento
          <ArrowRight size={16} aria-hidden="true" />
        </span>
      </div>
    </TrackedLink>
  )
}
