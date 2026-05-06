import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Dra. Yasmin Loreley Medrano Avila — Médica Estética Anti Envejecimiento"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1F1346",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            backgroundColor: "#2d1f6b",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            backgroundColor: "#2d1f6b",
            display: "flex",
          }}
        />

        {/* Accent line */}
        <div
          style={{
            width: 80,
            height: 5,
            backgroundColor: "#ffcd35",
            borderRadius: 9999,
            marginBottom: 32,
            display: "flex",
          }}
        />

        {/* Doctor name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 20,
            display: "flex",
          }}
        >
          Dra. Yasmin Loreley Medrano Avila
        </div>

        {/* Specialty */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: "#ffcd35",
            textAlign: "center",
            letterSpacing: 2,
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          Médica Estética Anti Envejecimiento
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            width: 80,
            height: 5,
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
