"use client"

import { useEffect, useState } from "react"

export type UserRole = "ADMIN" | "RECEPTIONIST" | null

const ROLE_KEY = "dashboard_role"

export function useRole(): UserRole {
  const [role, setRole] = useState<UserRole>(null)

  useEffect(() => {
    const stored = localStorage.getItem(ROLE_KEY)
    if (stored === "ADMIN" || stored === "RECEPTIONIST") {
      setRole(stored)
    }
  }, [])

  return role
}

export function saveRole(role: string | undefined): void {
  if (role) {
    localStorage.setItem(ROLE_KEY, role)
  }
}

export function clearRole(): void {
  localStorage.removeItem(ROLE_KEY)
}
