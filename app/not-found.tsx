import Link from "next/link"
import type { Metadata } from "next"

/**
 * Página 404 propia.
 *
 * Antes se servía la de Next por defecto: «404: This page could not be found»,
 * en inglés, sin la marca y —lo importante— sin un solo enlace. Una página así
 * es un callejón sin salida: la paciente que llega desde un enlace roto o un
 * resultado antiguo de Google se va del sitio, y el rastreador tampoco
 * encuentra por dónde seguir.
 *
 * Con enlaces a las secciones principales, un 404 deja de ser una pérdida.
 */
export const metadata: Metadata = {
  title: "Página no encontrada",
  description:
    "La página que buscas no existe o cambió de dirección. Consulta los tratamientos de la Dra. Yasmin Medrano Avila en Cochabamba.",
  // El 404 nunca debe indexarse, pero sí seguirse: sus enlaces ayudan al
  // rastreador a volver al contenido que sí existe.
  robots: { index: false, follow: true },
}

const DESTINOS = [
  { href: "/tratamientos", label: "Ver tratamientos" },
  { href: "/nosotros", label: "Sobre la doctora" },
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contacto" },
]

export default function NotFound() {
  return (
    <main
      className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24 text-center"
      style={{ backgroundColor: "var(--prem-dark)" }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--vintage-gold)",
        }}
      >
        Error 404
      </p>

      <h1
        className="mt-5 text-3xl md:text-5xl font-bold leading-tight"
        style={{ fontFamily: "var(--font-heading)", color: "var(--prem-dark-fg)" }}
      >
        Esta página no existe
      </h1>

      <p
        className="mt-5 max-w-md text-base"
        style={{ color: "var(--prem-dark-muted)" }}
      >
        Puede que el enlace haya cambiado de dirección. Desde aquí puedes seguir
        a cualquiera de estas secciones.
      </p>

      <nav aria-label="Secciones principales" className="mt-10">
        <ul className="flex flex-wrap justify-center gap-3">
          {DESTINOS.map((d) => (
            <li key={d.href}>
              <Link
                href={d.href}
                className="inline-flex items-center px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{
                  border: "1px solid var(--vintage-gold)",
                  color: "var(--vintage-gold)",
                  borderRadius: "2px",
                }}
              >
                {d.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Link
        href="/"
        className="mt-8 text-sm underline underline-offset-4"
        style={{ color: "var(--prem-dark-muted)" }}
      >
        Volver al inicio
      </Link>
    </main>
  )
}
