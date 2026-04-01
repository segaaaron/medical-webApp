import type { Metadata } from "next"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session"
import { Sidebar } from "@/components/dashboard/Sidebar"

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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar — fixed width */}
      <div className="w-56 shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
