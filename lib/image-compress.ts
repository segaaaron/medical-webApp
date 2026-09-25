"use client"

import { startLoading } from "./global-loading"

const MAX_SIDE = 2000
const QUALITY = 0.82
/** Por encima de esto no se re-codifica (memoria); decide el límite del servidor. */
const MAX_PIXELS = 50_000_000

async function encode(bitmap: ImageBitmap, width: number, height: number, type: string): Promise<Blob | null> {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.drawImage(bitmap, 0, 0, width, height)
    return canvas.convertToBlob({ type, quality: QUALITY })
  }
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  ctx.drawImage(bitmap, 0, 0, width, height)
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY))
}

/**
 * Reduce una foto antes de subirla: máx. 2000 px por lado y WebP (~0.82).
 * Una foto de móvil de 8–10 MB pasa a unos cientos de KB, así guardar no tarda
 * minutos con una conexión lenta. Safari no codifica WebP (toBlob cae a PNG):
 * ahí una foto JPEG se re-codifica en JPEG (otros formatos pueden tener
 * transparencia y se dejan tal cual). Ante cualquier
 * duda devuelve el original: GIF (animación), formatos que el navegador no
 * decodifica, imágenes enormes o si el resultado no es más pequeño.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file
  if (typeof createImageBitmap !== "function") return file

  const stop = startLoading("Optimizando imagen…")
  let bitmap: ImageBitmap | null = null
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
    const { width, height } = bitmap
    if (width * height > MAX_PIXELS) return file

    const scale = Math.min(1, MAX_SIDE / Math.max(width, height))
    const w = Math.max(1, Math.round(width * scale))
    const h = Math.max(1, Math.round(height * scale))
    let blob = await encode(bitmap, w, h, "image/webp")
    if (blob?.type !== "image/webp" && file.type === "image/jpeg") blob = await encode(bitmap, w, h, "image/jpeg")
    if (!blob || (blob.type !== "image/webp" && blob.type !== "image/jpeg") || blob.size >= file.size) return file

    const ext = blob.type === "image/webp" ? ".webp" : ".jpg"
    const name = file.name.replace(/\.[^.]*$/, "") + ext
    return new File([blob], name, { type: blob.type, lastModified: Date.now() })
  } catch {
    return file
  } finally {
    bitmap?.close()
    stop()
  }
}
