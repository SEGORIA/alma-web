import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

/**
 * Sube un archivo de imagen a Firebase Storage.
 * Devuelve la URL pública de descarga.
 * @param file   Archivo a subir (image/*)
 * @param folder 'blog' | 'portafolio'
 * @param onProgress Callback con porcentaje 0-100
 */
export async function uploadImage(
  file: File,
  folder: 'blog' | 'portafolio',
  onProgress?: (pct: number) => void,
): Promise<string> {
  if (!storage) throw new Error('Firebase Storage no está configurado')

  const ext      = file.name.split('.').pop() ?? 'jpg'
  const filename = `${folder}/${Date.now()}.${ext}`
  const fileRef  = ref(storage, filename)

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(fileRef, file)
    task.on(
      'state_changed',
      snap => onProgress?.((snap.bytesTransferred / snap.totalBytes) * 100),
      reject,
      async () => resolve(await getDownloadURL(task.snapshot.ref)),
    )
  })
}
