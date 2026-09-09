/**
 * HTML apto para inyectarse en la página, y la única forma de obtenerlo.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * EL PROBLEMA QUE RESUELVE
 *
 * La limpieza del HTML del panel se hacía DENTRO de componentes de cliente
 * (`SectionHeader`, `FAQSection`). Eso tiene dos costes:
 *
 * 1. `isomorphic-dompurify` viajaba al navegador en todas las páginas públicas
 *    —9 KB comprimidos— para limpiar un texto que el servidor ya tenía en la
 *    mano y podía haber limpiado él.
 * 2. Más grave: significa que el HTML SIN limpiar sale del servidor y llega al
 *    navegador. Solo es inofensivo mientras el sanitizador se ejecute; cualquier
 *    componente que renderice ese mismo campo sin llamarlo queda expuesto.
 *
 * Ahora se limpia en la frontera: en los módulos de datos, en el servidor,
 * donde el contenido del panel entra por primera vez.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POR QUÉ UN TIPO Y NO UNA CONVENCIÓN
 *
 * `SafeHtml` es un `string` con una marca que solo pueden poner las funciones
 * de este archivo. Un componente que declara `subtitle: SafeHtml` NO compila si
 * alguien le pasa un `string` cualquiera. La regla deja de depender de que
 * quien escriba la próxima página se acuerde: la comprueba el compilador, que
 * es lo que ya corre en cada `push`.
 */
declare const marcaSafeHtml: unique symbol

export type SafeHtml = string & { readonly [marcaSafeHtml]: true }

/**
 * Marca como apto un fragmento escrito a mano EN EL CÓDIGO.
 *
 * No limpia nada, y no hace falta: el riesgo que cubre el sanitizador es el
 * contenido que llega de fuera, no el que escribe quien programa. La función
 * existe para que esos literales —un `<span>` dorado en un subtítulo— pasen el
 * tipo sin abrir un agujero por el que colar contenido del panel sin limpiar.
 *
 * Nunca se le pasa una variable con datos de usuario, del panel o de una URL.
 */
export function trustedHtml(literal: string): SafeHtml {
  return literal as SafeHtml
}
