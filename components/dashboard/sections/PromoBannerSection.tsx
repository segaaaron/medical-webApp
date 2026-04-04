"use client"
import { FormField } from "@/components/ui/FormField"
import { INPUT, type SectionProps } from "./types"

export function PromoBannerSection({ data, setData }: SectionProps) {
  return (
    <>
      <FormField label="Texto del banner" htmlFor="banner-text">
        <input
          id="banner-text"
          className={INPUT}
          value={data.promoBanner.text}
          onChange={(e) =>
            setData({ ...data, promoBanner: { ...data.promoBanner, text: e.target.value } })
          }
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Texto del CTA" htmlFor="banner-cta-label">
          <input
            id="banner-cta-label"
            className={INPUT}
            value={data.promoBanner.ctaLabel}
            onChange={(e) =>
              setData({ ...data, promoBanner: { ...data.promoBanner, ctaLabel: e.target.value } })
            }
          />
        </FormField>
        <FormField label="Href del CTA" htmlFor="banner-cta-href">
          <input
            id="banner-cta-href"
            className={INPUT}
            value={data.promoBanner.ctaHref}
            onChange={(e) =>
              setData({ ...data, promoBanner: { ...data.promoBanner, ctaHref: e.target.value } })
            }
          />
        </FormField>
      </div>
    </>
  )
}
