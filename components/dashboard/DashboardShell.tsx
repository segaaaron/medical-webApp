"use client"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Sidebar } from "./Sidebar"
import { ToastProvider } from "./Toast"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ToastProvider>
    <div className="bg-gray-50 min-h-screen">
      {/* Sidebar — always fixed */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-56 transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content — offset by sidebar width on desktop */}
      <div className="lg:ml-56 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 lg:hidden sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-gray-800">Dashboard</span>
        </header>

        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
    </ToastProvider>
  )
}
