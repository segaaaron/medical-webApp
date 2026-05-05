"use client"
import { guardedFetch } from "@/lib/client-fetch"

import { useEffect, useState } from "react"
import { Check, MessageCircle, Phone, Instagram, Facebook, MapPin, Clock } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import { useToast } from "@/components/dashboard/Toast"
import type { ContactData } from "@/types/content"

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#b5496a] focus:ring-1 focus:ring-[#b5496a] transition-colors"

const DEFAULTS: ContactData = {
  whatsappNumber: "+591 78751894",
  whatsappUrl: "https://wa.me/59178751894",
  phone: "+591 78751894",
  instagram: "@dra_yasmin.medrano",
  instagramUrl: "https://www.instagram.com/dra_yasmin.medrano",
  facebook: "DraMedranoMedesteticAntiaging",
  facebookUrl: "https://www.facebook.com/DraMedranoMedesteticAntiaging",
  scheduleWeekdays: "9:00 AM – 7:00 PM",
  scheduleSaturday: "9:00 AM – 2:00 PM",
  scheduleSunday: "Cerrado",
  location: "Bolivia — Consulta vía WhatsApp para confirmar dirección exacta del consultorio.",
}

// Maps backend field names → local ContactData
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromBackend(raw: any): ContactData {
  return {
    whatsappNumber: raw.whatsappNumber ?? DEFAULTS.whatsappNumber,
    whatsappUrl: raw.whatsappUrl ?? DEFAULTS.whatsappUrl,
    phone: raw.phone ?? DEFAULTS.phone,
    instagram: raw.instagramUsername ?? DEFAULTS.instagram,
    instagramUrl: raw.instagramUrl ?? DEFAULTS.instagramUrl,
    facebook: raw.facebookName ?? DEFAULTS.facebook,
    facebookUrl: raw.facebookUrl ?? DEFAULTS.facebookUrl,
    scheduleWeekdays: raw.mondayFridayHours ?? DEFAULTS.scheduleWeekdays,
    scheduleSaturday: raw.saturdayHours ?? DEFAULTS.scheduleSaturday,
    scheduleSunday: raw.sundayStatus ?? DEFAULTS.scheduleSunday,
    location: raw.locationDescription ?? DEFAULTS.location,
  }
}

// Maps local ContactData → backend payload
function toBackend(form: ContactData) {
  return {
    whatsappNumber: form.whatsappNumber,
    whatsappUrl: form.whatsappUrl,
    phone: form.phone,
    instagramUsername: form.instagram,
    instagramUrl: form.instagramUrl,
    facebookName: form.facebook,
    facebookUrl: form.facebookUrl,
    mondayFridayHours: form.scheduleWeekdays,
    saturdayHours: form.scheduleSaturday,
    sundayStatus: form.scheduleSunday,
    locationDescription: form.location,
  }
}

export default function ContactoDashboardPage() {
  const showToast = useToast()
  const [form, setForm] = useState<ContactData>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/contact")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setForm(fromBackend(data))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function set(key: keyof ContactData, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await guardedFetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toBackend(form)),
      })
      if (!res.ok) throw new Error()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      showToast("success", "¡Cambios guardados exitosamente!")
    } catch {
      showToast("error", "No se pudo guardar. Intenta de nuevo.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-gray-400 text-sm" role="status">Cargando...</p>

  return (
    <>
      <PageHeader
        title="Información de Contacto"
        description="Edita los datos de contacto que se muestran en la página /contacto."
        saving={saving}
        saved={saved}
        onSave={handleSave}
      />

      <div className="flex flex-col gap-6">
        {/* WhatsApp */}
        <EditorCard title="WhatsApp">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={16} className="text-green-600" />
            <span className="text-sm text-gray-500">Número y enlace de WhatsApp</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Número visible" htmlFor="wa-number">
              <input
                id="wa-number"
                className={INPUT_CLS}
                value={form.whatsappNumber}
                onChange={(e) => set("whatsappNumber", e.target.value)}
                placeholder="+591 78751894"
              />
            </FormField>
            <FormField label="URL de WhatsApp (wa.me/...)" htmlFor="wa-url">
              <input
                id="wa-url"
                className={INPUT_CLS}
                value={form.whatsappUrl}
                onChange={(e) => set("whatsappUrl", e.target.value)}
                placeholder="https://wa.me/59178751894"
              />
            </FormField>
          </div>
        </EditorCard>

        {/* Teléfono */}
        <EditorCard title="Teléfono">
          <div className="flex items-center gap-2 mb-4">
            <Phone size={16} className="text-yellow-600" />
            <span className="text-sm text-gray-500">Número de teléfono</span>
          </div>
          <FormField label="Teléfono" htmlFor="phone">
            <input
              id="phone"
              className={INPUT_CLS}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+591 78751894"
            />
          </FormField>
        </EditorCard>

        {/* Instagram */}
        <EditorCard title="Instagram">
          <div className="flex items-center gap-2 mb-4">
            <Instagram size={16} className="text-pink-500" />
            <span className="text-sm text-gray-500">Perfil de Instagram</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Usuario (@...)" htmlFor="ig-handle">
              <input
                id="ig-handle"
                className={INPUT_CLS}
                value={form.instagram}
                onChange={(e) => set("instagram", e.target.value)}
                placeholder="@dra_yasmin.medrano"
              />
            </FormField>
            <FormField label="URL del perfil" htmlFor="ig-url">
              <input
                id="ig-url"
                className={INPUT_CLS}
                value={form.instagramUrl}
                onChange={(e) => set("instagramUrl", e.target.value)}
                placeholder="https://www.instagram.com/dra_yasmin.medrano"
              />
            </FormField>
          </div>
        </EditorCard>

        {/* Facebook */}
        <EditorCard title="Facebook">
          <div className="flex items-center gap-2 mb-4">
            <Facebook size={16} className="text-blue-600" />
            <span className="text-sm text-gray-500">Página de Facebook</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nombre de la página" htmlFor="fb-name">
              <input
                id="fb-name"
                className={INPUT_CLS}
                value={form.facebook}
                onChange={(e) => set("facebook", e.target.value)}
                placeholder="DraMedranoMedesteticAntiaging"
              />
            </FormField>
            <FormField label="URL de la página" htmlFor="fb-url">
              <input
                id="fb-url"
                className={INPUT_CLS}
                value={form.facebookUrl}
                onChange={(e) => set("facebookUrl", e.target.value)}
                placeholder="https://www.facebook.com/DraMedranoMedesteticAntiaging"
              />
            </FormField>
          </div>
        </EditorCard>

        {/* Horarios */}
        <EditorCard title="Horario de Atención">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-amber-600" />
            <span className="text-sm text-gray-500">Horarios que se muestran en la página de contacto</span>
          </div>
          <div className="flex flex-col gap-4">
            <FormField label="Lunes – Viernes" htmlFor="sched-weekdays">
              <input
                id="sched-weekdays"
                className={INPUT_CLS}
                value={form.scheduleWeekdays}
                onChange={(e) => set("scheduleWeekdays", e.target.value)}
                placeholder="9:00 AM – 7:00 PM"
              />
            </FormField>
            <FormField label="Sábado" htmlFor="sched-saturday">
              <input
                id="sched-saturday"
                className={INPUT_CLS}
                value={form.scheduleSaturday}
                onChange={(e) => set("scheduleSaturday", e.target.value)}
                placeholder="9:00 AM – 2:00 PM"
              />
            </FormField>
            <FormField label="Domingo" htmlFor="sched-sunday">
              <input
                id="sched-sunday"
                className={INPUT_CLS}
                value={form.scheduleSunday}
                onChange={(e) => set("scheduleSunday", e.target.value)}
                placeholder="Cerrado"
              />
            </FormField>
          </div>
        </EditorCard>

        {/* Ubicación */}
        <EditorCard title="Ubicación">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-rose-500" />
            <span className="text-sm text-gray-500">Texto de ubicación del consultorio</span>
          </div>
          <FormField label="Descripción de ubicación" htmlFor="location">
            <textarea
              id="location"
              className={INPUT_CLS}
              rows={3}
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Bolivia — Consulta vía WhatsApp para confirmar dirección exacta del consultorio."
            />
          </FormField>
        </EditorCard>

        {/* Save button bottom */}
        <div className="flex justify-end pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: "#b5496a" }}
          >
            <Check size={15} />
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </>
  )
}
