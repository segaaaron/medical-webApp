"use client"
import { useState, type FormEvent } from "react"

interface UseEmailFormReturn {
  email: string
  setEmail: (value: string) => void
  submitted: boolean
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
}

export function useEmailForm(): UseEmailFormReturn {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim()) return
    // TODO: integrate with email service (Mailchimp, ConvertKit, etc.)
    setSubmitted(true)
  }

  return { email, setEmail, submitted, handleSubmit }
}
