"use client"

import Link from "next/link"
import { trackTreatmentClick, trackBlogClick } from "@/lib/analytics"

/**
 * Qué se registra al pulsar. El tipo discrimina: no se puede pasar una función
 * de callback desde un componente de servidor —React no sabe serializarla—,
 * así que lo que cruza la frontera son datos, y este componente decide qué
 * evento disparar con ellos.
 */
export type Seguimiento =
  | { tipo: "tratamiento"; id: string; nombre: string }
  | { tipo: "articulo"; slug: string; titulo: string }

interface Props {
  href: string
  seguimiento: Seguimiento
  /** Desde qué sección se llegó, para distinguirlo en el informe de Umami. */
  source?: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

/**
 * Enlace interno que registra el clic en Umami.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * PARA QUÉ EXISTE
 *
 * Es la frontera cliente mínima de las tarjetas. Lo único que necesita
 * JavaScript en una tarjeta de tratamiento o de artículo es el `onClick` que
 * avisa a la analítica; el nombre, la descripción, la etiqueta, la fecha y
 * toda la maquetación son contenido estático que el servidor puede resolver.
 *
 * Sin esto, marcar la tarjeta entera como `"use client"` arrastraba al
 * navegador módulos que nada más usa en esa página —el vocabulario de nombres
 * de tratamiento, la tabla de etiquetas, el formateo de fechas— y convertía en
 * cliente un árbol que es puro texto.
 *
 * `children` llega ya renderizado: React lo serializa en la carga RSC y este
 * componente solo lo coloca dentro del enlace. Es el mismo patrón que
 * `TrackWhatsAppLink`, que ya se usaba así en el proyecto; aquí se cubren los
 * dos destinos internos con un solo archivo en vez de uno por evento.
 */
export function TrackedLink({
  href,
  seguimiento,
  source,
  className,
  style,
  children,
}: Props) {
  function registrar() {
    if (seguimiento.tipo === "tratamiento") {
      trackTreatmentClick({ id: seguimiento.id, name: seguimiento.nombre })
      return
    }
    trackBlogClick({ slug: seguimiento.slug, title: seguimiento.titulo })
  }

  return (
    <Link
      href={href}
      onClick={registrar}
      {...(source ? { "data-source": source } : {})}
      className={className}
      style={style}
    >
      {children}
    </Link>
  )
}
