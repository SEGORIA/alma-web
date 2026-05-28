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
        reject(new Error(`Error ${xhr.status} al subir la imagen`))
      }
    }

    xhr.onerror = () => reject(new Error('Error de red al subir la imagen'))

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)
    xhr.send(formData)
  })
}
