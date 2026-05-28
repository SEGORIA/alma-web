/**
 * Subida de imágenes usando Firebase Storage.
 * Usa el mismo proyecto Firebase ya configurado — no requiere servicios externos.
 */
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage, firebaseReady } from './firebase'

export const storageReady = firebaseReady && !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET

/**
 * Sube un archivo a Firebase Storage y devuelve la URL pública (HTTPS).
 * @param file       Archivo de imagen a subir
 * @param onProgress Callback con porcentaje 0–100
 * @param folder     Carpeta destino (por defecto: 'equipo')
 */
export function uploadImage(
  file: File,
  onProgress?: (pct: number) => void,
  folder = 'equipo',
): Promise<string> {
  if (!storage) {
    return Promise.reject(new Error('Firebase Storage no configurado'))
  }

  const ext      = file.name.split('.').pop() ?? 'jpg'
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const storageRef = ref(storage, filename)
  const task       = uploadBytesResumable(storageRef, file)

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      snapshot => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.(pct)
      },
      error => reject(new Error(error.message)),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve(url)
      },
    )
  })
}
