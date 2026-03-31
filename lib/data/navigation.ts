import { Instagram, Facebook } from "lucide-react"
import type { NavLink, FooterGroup, SocialLink } from "@/types"

export const navLinks: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Tratamientos", href: "/tratamientos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Blog", href: "/blog" },
  { label: "Contacto", href: "/contacto" },
]

export const footerGroups: FooterGroup[] = [
  {
    title: "Tratamientos Faciales",
    links: [
      { label: "Toxina Botulínica (Botox)", href: "/tratamientos" },
      { label: "Rellenos con Ácido Hialurónico", href: "/tratamientos" },
      { label: "Rejuvenecimiento Facial", href: "/tratamientos" },
      { label: "Tratamiento de Manchas", href: "/tratamientos" },
    ],
  },
  {
    title: "Tratamientos Corporales",
    links: [
      { label: "Reducción de Medidas", href: "/tratamientos" },
      { label: "Eliminación de Celulitis", href: "/tratamientos" },
      { label: "Depilación Láser", href: "/tratamientos" },
      { label: "Tratamiento de Estrías", href: "/tratamientos" },
    ],
  },
  {
    title: "Consultorio",
    links: [
      { label: "Nosotros", href: "/nosotros" },
      { label: "Blog", href: "/blog" },
      { label: "Contacto", href: "/contacto" },
      { label: "Agenda tu Cita", href: "https://wa.me/59178751894" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Política de Privacidad", href: "#" },
      { label: "Política de Reembolso", href: "#" },
      { label: "Términos y Condiciones", href: "#" },
    ],
  },
]

export const socialLinks: SocialLink[] = [
  { icon: Facebook, href: "https://www.facebook.com/DraMedranoMedesteticAntiaging", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/dra_yasmin.medrano", label: "Instagram" },
]
