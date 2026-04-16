export const WHATSAPP_NUMBER = "59178751894"
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`
export const WHATSAPP_TREATMENT_URL = (treatmentName: string) =>
  `${WHATSAPP_URL}?text=Hola%2C%20me%20interesa%20el%20tratamiento%20de%20${encodeURIComponent(treatmentName)}`
