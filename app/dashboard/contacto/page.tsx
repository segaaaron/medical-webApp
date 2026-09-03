"use client"
import { guardedFetch } from "@/lib/client-fetch"

import { useEffect, useState } from "react"
import { MessageCircle, Phone, Instagram, Facebook, MapPin, Clock } from "lucide-react"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { SaveBar } from "@/components/dashboard/SaveBar"
import { EditorCard } from "@/components/dashboard/EditorCard"
import { FormField } from "@/components/ui/FormField"
import { useToast } from "@/components/dashboard/Toast"
import type { ContactData } from "@/types/content"
import { LoadingState } from "@/components/dashboard/ui/LoadingState"

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[var(--vintage-gold)] focus:ring-1 focus:ring-[var(--vintage-gold)] transition-colors"

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
  latitude: "-17.386471",
  longitude: "-66.152366",
  mapsUrl: "https://www.google.com/maps?q=-17.386471,-66.152366",
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
    latitude: raw.latitude != null ? String(raw.latitude) : DEFAULTS.latitude,
    longitude: raw.longitude != null ? String(raw.longitude) : DEFAULTS.longitude,
    mapsUrl: raw.mapsUrl ?? DEFAULTS.mapsUrl,
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
    latitude: form.latitude.trim() ? Number(form.latitude) : null,
    longitude: form.longitude.trim() ? Number(form.longitude) : null,
    mapsUrl: form.mapsUrl.trim() || null,
  }
}

export default function ContactoDashboardPage() {
  const showToast = useToast()
  const [form, setForm] = useState<ContactData>(DEFAULTS)
  // Copia de lo último persistido: comparar contra ella es lo que da el estado
  // "tienes cambios sin guardar" sin depender de una librería de formularios.
  const [savedForm, setSavedForm] = useState<ContactData>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/contact")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          const next = fromBackend(data)
          setForm(next)
          setSavedForm(next)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function set(key: keyof ContactData, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(savedForm)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await guardedFetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toBackend(form)),
      })
      if (!res.ok) throw new Error()
      setSavedForm(form)
      setSaved(true)
      showToast("success", "¡Cambios guardados exitosamente!")
    } catch {
      showToast("error", "No se pudo guardar. Intenta de nuevo.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <>
      <PageHeader
        title="Información de Contacto"
        description="Edita los datos de contacto que se muestran en la página /contacto."
      />

      <div className="flex flex-col gap-6">
        {/* WhatsApp */}
        <EditorCard title="WhatsApp" icon={MessageCircle} hint="Número y enlace de WhatsApp">
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
        <EditorCard title="Teléfono" icon={Phone} hint="Número de teléfono">
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
        <EditorCard title="Instagram" icon={Instagram} hint="Perfil de Instagram">
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
        <EditorCard title="Facebook" icon={Facebook} hint="Página de Facebook">
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
        <EditorCard title="Horario de Atención" icon={Clock} hint="Horarios que se muestran en la página de contacto">
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
        <EditorCard title="Ubicación" icon={MapPin} hint="Texto de ubicación del consultorio">
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
          <p className="text-xs text-gray-400 mt-4 mb-2">
            Pin exacto del consultorio (se envía al paciente al confirmar su cita).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Latitud" htmlFor="latitude">
              <input
                id="latitude"
                className={INPUT_CLS}
                value={form.latitude}
                onChange={(e) => set("latitude", e.target.value)}
                placeholder="-17.386471"
              />
            </FormField>
            <FormField label="Longitud" htmlFor="longitude">
              <input
                id="longitude"
                className={INPUT_CLS}
                value={form.longitude}
                onChange={(e) => set("longitude", e.target.value)}
                placeholder="-66.152366"
              />
            </FormField>
          </div>
          <FormField label="Enlace de Google Maps" htmlFor="mapsUrl">
            <input
              id="mapsUrl"
              className={INPUT_CLS}
              value={form.mapsUrl}
              onChange={(e) => set("mapsUrl", e.target.value)}
              placeholder="https://www.google.com/maps?q=-17.386471,-66.152366"
            />
          </FormField>
        </EditorCard>

        <SaveBar
          dirty={dirty}
          saving={saving}
          saved={saved}
          onSave={handleSave}
          onReset={() => setForm(savedForm)}
        />
      </div>
    </>
  )
}
