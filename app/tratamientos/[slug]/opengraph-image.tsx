import { ImageResponse } from "next/og"
import { backendFetch } from "@/lib/backend-client"

export const runtime = "edge"
export const alt = "Tratamientos — Dra. Yasmin Loreley Medrano Avila"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function Image({ params }: Props) {
  const { slug } = await params

  let name = "Tratamiento"
  let tag: string | null = null
  try {
    const { data } = await backendFetch<{ name?: string; tag?: string | null; slug?: string }[]>("/treatments?active=true")
    const found = Array.isArray(data) ? data.find((t) => t.slug === slug) : null
    if (found?.name) name = found.name
    if (found?.tag) tag = found.tag
  } catch {
    // fallback to generic name
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          backgroundColor: "#1F1346",
          padding: 80,
          position: "relative",
        }}
      >
        {/* Decorative circle */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            backgroundColor: "#2d1f6b",
            display: "flex",
          }}
        />

        {/* Tag pill */}
        {tag && (
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#1F1346",
              backgroundColor: "#ffcd35",
              borderRadius: 9999,
              padding: "6px 20px",
              marginBottom: 20,
              letterSpacing: 2,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {tag}
          </div>
        )}

        {/* Label */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#8c85ff",
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 16,
            display: "flex",
          }}
        >
          Tratamiento · Médica Estética Anti Envejecimiento
        </div>

        {/* Treatment name */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.15,
            maxWidth: 900,
            display: "flex",
          }}
        >
          {name}
        </div>

        {/* Doctor credit */}
        <div
          style={{
            fontSize: 20,
            fontWeight: 400,
            color: "#ffcd35",
            marginTop: 24,
            display: "flex",
          }}
        >
          Dra. Yasmin Loreley Medrano Avila
        </div>
      </div>
    ),
    { ...size }
  )
}
