/**
 * Convert cropper canvas to a File for Multer multipart upload.
 * Optional target size scales the canvas before encoding.
 */
export function canvasToImageFile(
  canvas: HTMLCanvasElement,
  fileName: string,
  mimeType: string,
  options?: {
    quality?: number
    outputWidth?: number | null
    outputHeight?: number | null
  },
): Promise<File> {
  const quality = options?.quality ?? 0.92
  const source = scaleCanvas(
    canvas,
    options?.outputWidth ?? null,
    options?.outputHeight ?? null,
  )

  return new Promise((resolve, reject) => {
    source.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('برش تصویر ناموفق بود'))
          return
        }
        const base = fileName.replace(/\.[^.]+$/, '') || `image-${Date.now()}`
        const ext =
          mimeType === 'image/png'
            ? '.png'
            : mimeType === 'image/webp'
              ? '.webp'
              : '.jpg'
        resolve(new File([blob], `${base}${ext}`, { type: mimeType }))
      },
      mimeType,
      quality,
    )
  })
}

function scaleCanvas(
  canvas: HTMLCanvasElement,
  width: number | null,
  height: number | null,
): HTMLCanvasElement {
  if (!width && !height) return canvas
  const ratio = canvas.width / canvas.height
  const targetWidth = width ?? Math.round((height as number) * ratio)
  const targetHeight = height ?? Math.round((width as number) / ratio)
  if (targetWidth === canvas.width && targetHeight === canvas.height) {
    return canvas
  }
  const out = document.createElement('canvas')
  out.width = targetWidth
  out.height = targetHeight
  const ctx = out.getContext('2d')
  if (!ctx) return canvas
  ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight)
  return out
}
