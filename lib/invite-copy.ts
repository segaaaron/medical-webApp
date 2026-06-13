/**
 * Copy mostrado al paciente cuando un link de invitación de reseña ya no es válido.
 * Compartido por la página pública (resenas/r/[token]) y el formulario (InviteReviewForm).
 */
export const INVITE_REASON_COPY: Record<string, { title: string; message: string }> = {
  used: {
    title: "Esta reseña ya fue enviada.",
    message: "¡Gracias por compartir tu experiencia con la Dra. Medrano!",
  },
  expired: {
    title: "Este enlace expiró.",
    message: "Pídele uno nuevo a la Dra. Medrano para dejar tu reseña.",
  },
  revoked: {
    title: "Enlace no válido.",
    message: "Este enlace ya no está disponible. Contacta a la Dra. Medrano.",
  },
  not_found: {
    title: "Enlace no válido.",
    message: "No pudimos encontrar esta invitación. Verifica el enlace que recibiste.",
  },
}
