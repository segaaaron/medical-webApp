import { cache } from "react"
import type { NavLink } from "@/types"
import { fromService } from "./service"
import { parseNavLinks } from "./parse/site-main"
import { NAV_LINKS_FALLBACK } from "./fallback/site-main"

/** Enlaces del menú principal (`/site-content/main`). */
export const getNavLinks = cache(async (): Promise<NavLink[]> => {
  const r = await fromService("/site-content/main", parseNavLinks, NAV_LINKS_FALLBACK, { revalidate: 60 })
  return r.data
})
