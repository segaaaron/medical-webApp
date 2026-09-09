import Image from "next/image"
import Link from "next/link"

/**
 * Firma médica al pie del artículo.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POR QUÉ EXISTE
 *
 * El contenido de este blog es YMYL («Your Money or Your Life»): habla de
 * procedimientos que se hacen sobre el cuerpo de una persona. Google somete
 * esas páginas a un listón más alto y suprime las que no muestran quién
 * responde de lo que dicen —autor identificado, credenciales verificables y
 * fecha de revisión.
 *
 * El `BlogPosting` del artículo ya declaraba `author` y `reviewedBy` apuntando
 * a la ficha de la doctora, pero eso solo lo lee un buscador. Un paciente que
 * llega desde Instagram no ve el JSON-LD: ve un texto sin firma. Esta caja dice
 * en la página lo mismo que el schema afirma en el código, que es la única
 * forma de que la señal cuente para los dos.
 *
 * Sin número de matrícula, por la misma razón que en el schema del sitio: el
 * HTML es público y un número expuesto facilita la suplantación. La titulación
 * es información pública y no sirve para hacerse pasar por nadie.
 */

interface AuthorBoxProps {
  /** Nombre tal y como firma el artículo. */
  name: string
  /** Fecha de publicación en ISO. */
  publishedAt: string
  /** Última revisión en ISO. Se muestra solo si es posterior a la publicación. */
  updatedAt?: string | null
  /** Perfiles sociales del panel, ya normalizados. */
  perfiles?: string[]
  /**
   * Encabezado de la caja. La ficha de un tratamiento la escribe la doctora
   * igual que un artículo, pero decir «escrito por» sobre la descripción de un
   * procedimiento suena raro: ahí se usa «revisado por».
   */
  eyebrow?: string
  /** Etiqueta de la fecha de publicación. */
  publishedLabel?: string
}

const RETRATO = "/images/DraMedrano.jpeg"

/**
 * Fecha legible, o `null` si el panel no mandó una válida.
 *
 * `new Date("").toLocaleDateString()` devuelve «Invalid Date», y `new
 * Date(null)` devuelve el 31 de diciembre de 1969. Cualquiera de las dos,
 * impresa bajo la firma de la doctora en una página de salud, hace más daño
 * que no poner fecha.
 */
function formatearFecha(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" })
}

/** Etiqueta legible para un perfil social, deducida del dominio. */
function nombreDeRed(url: string): string {
  const host = url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
  if (host.includes("instagram")) return "Instagram"
  if (host.includes("facebook")) return "Facebook"
  if (host.includes("tiktok")) return "TikTok"
  return host
}

export function AuthorBox({
  name,
  publishedAt,
  updatedAt,
  perfiles = [],
  eyebrow = "ESCRITO Y REVISADO POR",
  publishedLabel = "Publicado el",
}: AuthorBoxProps) {
  // Solo se anuncia revisión cuando la hubo de verdad. Una fecha de revisión
  // igual a la de publicación no informa de nada y, repetida en cada artículo,
  // deja de ser creíble — el mismo error que un `lastmod` que miente.
  const publicado = formatearFecha(publishedAt)
  const revisado =
    updatedAt &&
    formatearFecha(updatedAt) &&
    publicado &&
    new Date(updatedAt).getTime() > new Date(publishedAt).getTime()
      ? formatearFecha(updatedAt)
      : null

  return (
    <aside
      className="mt-12 pt-8 border-t"
      style={{ borderColor: "rgba(184,151,59,0.3)" }}
      aria-label="Sobre la autora"
    >
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <Image
          src={RETRATO}
          alt={`Retrato de ${name}`}
          width={88}
          height={88}
          className="rounded-full object-cover flex-shrink-0"
          style={{ border: "2px solid var(--vintage-gold)" }}
        />

        <div className="flex flex-col gap-2">
          <p
            className="text-xs font-semibold"
            style={{ color: "var(--vintage-gold)", letterSpacing: "0.12em" }}
          >
            {eyebrow}
          </p>

          <p className="text-lg font-semibold" style={{ color: "var(--primary-darkest)" }}>
            <Link href="/nosotros" className="hover:opacity-80 transition-opacity">
              {name}
            </Link>
          </p>

          <p className="text-sm" style={{ color: "var(--primary-darkest)", opacity: 0.85 }}>
            Médica cirujana con especialidad en medicina estética. Más de 10 años de
            ejercicio en Cochabamba y más de 5.000 pacientes atendidos en toxina
            botulínica, ácido hialurónico, rellenos y bioestimulación.
          </p>

          {publicado && (
            <p className="text-sm" style={{ color: "var(--primary-darkest)", opacity: 0.7 }}>
              {publishedLabel} {publicado}
              {revisado ? ` · Revisado médicamente el ${revisado}` : ""}
            </p>
          )}

          {perfiles.length > 0 && (
            <ul className="flex flex-wrap gap-4 mt-1">
              {perfiles.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="text-sm underline underline-offset-4 hover:opacity-80 transition-opacity"
                    style={{ color: "var(--vintage-gold)" }}
                  >
                    {nombreDeRed(url)}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs mt-2" style={{ color: "var(--primary-darkest)", opacity: 0.6 }}>
            Esta información es general y no sustituye una consulta médica presencial.
            Los resultados de cualquier procedimiento varían según cada paciente, y
            solo una valoración individual determina si es candidata.
          </p>
        </div>
      </div>
    </aside>
  )
}
