/**
 * Límites de longitud del cuerpo de una reseña.
 * Fuente única de verdad: los usa el formulario (cliente) y la API (servidor).
 */
export const MIN_REVIEW_BODY = 20;
export const MAX_REVIEW_BODY = 300;
/** Punto dulce: a partir de aquí la reseña se percibe como más útil. */
export const SWEET_REVIEW_BODY = 150;
