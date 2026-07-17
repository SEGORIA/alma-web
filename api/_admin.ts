/* Helper compartido de Firebase Admin SDK para los endpoints de api/*.
   El prefijo "_" hace que Vercel NO lo trate como una ruta pública.

   Requiere la variable de entorno FIREBASE_SERVICE_ACCOUNT con el JSON
   completo de la cuenta de servicio (Firebase Console → Configuración del
   proyecto → Cuentas de servicio → Generar nueva clave privada). */

import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

let _app: App | null = null

export function adminReady(): boolean {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT
}

function getApp(): App {
  if (_app) return _app
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT no configurada')
  const svc = JSON.parse(raw)
  // Si el private_key quedó con "\n" escapados (según cómo se pegue en Vercel),
  // convertirlos a saltos de línea reales.
  if (typeof svc.private_key === 'string') {
    svc.private_key = svc.private_key.replace(/\\n/g, '\n')
  }
  _app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(svc) })
  return _app
}

export function adminAuth() { return getAuth(getApp()) }
export function adminDb()   { return getFirestore(getApp()) }

/** Verifica que la petición venga de un admin autenticado: token de Firebase
 *  válido en el header Authorization + presencia en la colección `admins`.
 *  Devuelve el uid del admin, o null si no pasa la verificación. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function verifyAdmin(req: any): Promise<string | null> {
  try {
    const authz = req.headers?.authorization as string | undefined
    const token = authz && authz.startsWith('Bearer ') ? authz.slice(7) : null
    if (!token) return null
    const decoded = await adminAuth().verifyIdToken(token)
    const snap = await adminDb().collection('admins').doc(decoded.uid).get()
    return snap.exists ? decoded.uid : null
  } catch {
    return null
  }
}
