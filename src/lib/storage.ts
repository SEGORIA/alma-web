/**
 * Subida de imágenes via Cloudinary (plan gratuito, sin tarjeta).
 * Requiere dos variables de entorno en Vercel:
 *   VITE_CLOUDINARY_CLOUD_NAME    → nombre de tu cloud en Cloudinary
 *   VITE_CLOUDINARY_UPLOAD_PRESET → nombre del preset sin firma (unsigned)
 *
 * Cloudinary free tier: 25 GB almacenamiento · 25 GB ancho de banda / mes.
 */

export const storageReady = !!(
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME &&
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
)

/**
 * Sube un archivo arbitrario (PDF, DOCX, ZIP…) a Cloudinary como recurso "raw"
 * y devuelve la URL segura (HTTPS).
 */
export function uploadFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const preset    = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !preset) {
    return Promise.reject(new Error('Cloudinary no configurado'))
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', preset)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress?.((e.loaded / e.total) * 100)
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText) as { secure_url: string }
        resolve(data.secure_url)
      } else {
        try {
          const err = JSON.parse(xhr.responseText) as { error?: { message?: string } }
          reject(new Error(err?.error?.message ?? `Error ${xhr.status} al subir el archivo`))
        } catch {
          reject(new Error(`Error ${xhr.status} al subir el archivo`))
        }
      }
    }

    xhr.onerror = () => reject(new Error('Error de red al subir el archivo'))

    // Endpoint "raw" para documentos (no imagen)
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`)
    xhr.send(formData)
  })
}

/**
 * Sube un audio (nota de voz del brief) y devuelve la URL segura.
 *
 * Cloudinary trata el audio dentro del tipo de recurso "video" — no existe un
 * endpoint /audio/upload: usar "raw" lo guardaría como archivo suelto y se
 * perdería la reproducción en streaming.
 */
export function uploadAudio(
  file: Blob,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const preset    = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !preset) {
    return Promise.reject(new Error('Cloudinary no configurado'))
  }

  const formData = new FormData()
  // El Blob del MediaRecorder no trae nombre; Cloudinary necesita uno.
  formData.append('file', file, `nota-de-voz-${Date.now()}.webm`)
  formData.append('upload_preset', preset)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress?.((e.loaded / e.total) * 100)
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText) as { secure_url: string }
        resolve(data.secure_url)
      } else {
        try {
          const err = JSON.parse(xhr.responseText) as { error?: { message?: string } }
          reject(new Error(err?.error?.message ?? `Error ${xhr.status} al subir el audio`))
        } catch {
          reject(new Error(`Error ${xhr.status} al subir el audio`))
        }
      }
    }

    xhr.onerror = () => reject(new Error('Error de red al subir el audio'))

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`)
    xhr.send(formData)
  })
}

/**
 * Sube un archivo a Cloudinary y devuelve la URL segura (HTTPS).
 * @param file       Archivo de imagen a subir
 * @param onProgress Callback con porcentaje 0-100
 */
export function uploadImage(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const preset    = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !preset) {
    return Promise.reject(new Error('Cloudinary no configurado'))
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', preset)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress?.((e.loaded / e.total) * 100)
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText) as { secure_url: string }
        resolve(data.secure_url)
      } else {
        try {
          const err = JSON.parse(xhr.responseText) as { error?: { message?: string } }
          reject(new Error(err?.error?.message ?? `Error ${xhr.status} al subir la imagen`))
        } catch {
          reject(new Error(`Error ${xhr.status} al subir la imagen`))
        }
      }
    }

    xhr.onerror = () => reject(new Error('Error de red al subir la imagen'))

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)
    xhr.send(formData)
  })
}
