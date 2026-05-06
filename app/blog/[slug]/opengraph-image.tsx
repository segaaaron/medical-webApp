import { ImageResponse } from "next/og"
import { backendFetch } from "@/lib/backend-client"

export const runtime = "edge"
export const alt = "Blog — Dra. Yasmin Loreley Medrano Avila"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function Image({ params }: Props) {
  const { slug } = await params

  let title = "Blog"
  try {
    const { data } = await backendFetch<{ title?: string }>(`/blog/${slug}`)
    if (data?.title) title = data.title
  } catch {
    // fallback to generic title
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

        {/* Label */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#ffcd35",
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 20,
            display: "flex",
          }}
        >
          Blog · Dra. Yasmin Loreley Medrano Avila
        </div>

        {/* Post title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.15,
            maxWidth: 900,
            display: "flex",
          }}
        >
          {title}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: 60,
            height: 4,
            backgroundColor: "#ffcd35",
            borderRadius: 9999,
            marginTop: 32,
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  )
}
