import type { Metadata } from "next"
import { Sidebar } from "@/components/dashboard/Sidebar"

export const metadata: Metadata = {
  title: "Dashboard | Dra. Yasmin Medrano Avila",
  robots: "noindex, nofollow",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
