import type { Metadata } from "next"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

export const metadata: Metadata = {
  title: "Dashboard | Dra. Yasmin Medrano Avila",
  robots: "noindex, nofollow",
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const session = token ? await verifyToken(token) : null

  // No sidebar when user is not authenticated (login page)
  if (!session) {
    return <>{children}</>
  }

  return <DashboardShell>{children}</DashboardShell>
}
