import { Youtube, Instagram, Linkedin, Twitter } from "lucide-react"
import type { NavLink, FooterGroup, SocialLink } from "@/types"

export const navLinks: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Acerca de nosotros", href: "#acerca" },
  { label: "Tratamientos", href: "#tratamientos" },
  { label: "Blog", href: "#blog" },
]

export const footerGroups: FooterGroup[] = [
  {
    title: "Courses",
    links: [
      { label: "Mono Course", href: "#course" },
      { label: "Academy", href: "#" },
      { label: "Portfolio Reviews", href: "#" },
      { label: "Website & SEO Reviews", href: "#" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Lightroom Presets", href: "#presets" },
      { label: "Free Starter Kit", href: "#free" },
      { label: "Free PDF Guides", href: "#free" },
      { label: "Free Articles", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About James", href: "#about" },
      { label: "PhotoBlog", href: "#", external: true },
      { label: "James Nader Portfolio", href: "#", external: true },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Refund Policy", href: "#" },
      { label: "Terms & Conditions", href: "#" },
    ],
  },
]

export const socialLinks: SocialLink[] = [
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Twitter, href: "#", label: "Twitter" },
]
