/**
 * Indicador de carga del panel.
 *
 * El mismo `<p>Cargando...</p>` estaba copiado en ocho pantallas del panel,
 * con variaciones: unas declaraban `aria-live` y otras no, y una decía
 * «Cargando articulo...» sin tilde. Un lector de pantalla anunciaba la espera
 * en unas pantallas y en otras no.
 *
 * Aquí vive el único.
 */
export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <p
      className="text-sm text-gray-400"
      role="status"
      aria-live="polite"
    >
      {label}
    </p>
  )
}
