"use client"
import { FormField } from "@/components/ui/FormField"
import { INPUT, type SectionProps } from "./types"

export function FreeResourcesFormSection({ data, setData }: SectionProps) {
  function update(field: string, value: string) {
    setData({ ...data, freeResourcesForm: { ...data.freeResourcesForm, [field]: value } })
  }

  return (
    <>
      <FormField label="Titulo del formulario" htmlFor="frf-heading">
        <input id="frf-heading" className={INPUT} value={data.freeResourcesForm.heading} onChange={(e) => update("heading", e.target.value)} />
      </FormField>
      <FormField label="Descripcion" htmlFor="frf-desc">
        <input id="frf-desc" className={INPUT} value={data.freeResourcesForm.description} onChange={(e) => update("description", e.target.value)} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Placeholder del email" htmlFor="frf-placeholder">
          <input id="frf-placeholder" className={INPUT} value={data.freeResourcesForm.placeholder} onChange={(e) => update("placeholder", e.target.value)} />
        </FormField>
        <FormField label="Texto del boton" htmlFor="frf-btn">
          <input id="frf-btn" className={INPUT} value={data.freeResourcesForm.buttonLabel} onChange={(e) => update("buttonLabel", e.target.value)} />
        </FormField>
      </div>
      <FormField label="Texto de privacidad" htmlFor="frf-privacy">
        <input id="frf-privacy" className={INPUT} value={data.freeResourcesForm.privacyText} onChange={(e) => update("privacyText", e.target.value)} />
      </FormField>
      <FormField label="Titulo de exito" htmlFor="frf-success-h">
        <input id="frf-success-h" className={INPUT} value={data.freeResourcesForm.successHeading} onChange={(e) => update("successHeading", e.target.value)} />
      </FormField>
      <FormField label="Mensaje de exito" htmlFor="frf-success-msg" hint="Usa {email} para insertar el correo">
        <input id="frf-success-msg" className={INPUT} value={data.freeResourcesForm.successMessage} onChange={(e) => update("successMessage", e.target.value)} />
      </FormField>
    </>
  )
}
