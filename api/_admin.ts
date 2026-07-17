/* Helper compartido de Firebase Admin SDK para los endpoints de api/*.
   El prefijo "_" hace que Vercel NO lo trate como una ruta pública.

   Los módulos de firebase-admin se cargan de forma PEREZOSA (dynamic import):
   importarlos en el nivel superior hacía que la función serverless fallara al
   arrancar (FUNCTION_INVOCATION_FAILED) por el peso de su árbol de dependencias.
   Así el módulo carga siempre, y las peticiones rechazadas antes de necesitar
   Admin SDK (p. ej. sin token) ni siquiera lo importan.

   Requiere la variable FIREBASE_SERVICE_ACCOUNT con el JSON completo de la
   cuenta de servicio (Firebase → Configuración → Cuentas de servicio). */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _app: any = null

export function adminReady(): boolean {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT
}

async function getApp() {
  if (_app) return _app
  const { cert, getApps, initializeApp } = await import('firebase-admin/app')
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT no configurada')
  const svc = JSON.parse(raw)
  if (typeof svc.private_key === 'string') {
    svc.private_key = svc.private_key.replace(/\\n/g, '\n')
  }
  _app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(svc) })
  return _app
}

export async function adminAuth() {
  const { getAuth } = await import('firebase-admin/auth')
  return getAuth(await getApp())
}

export async function adminDb() {
  const { getFirestore } = await import('firebase-admin/firestore')
  return getFirestore(await getApp())
}

/** Verifica que la petición venga de un admin: token de Firebase válido en el
 *  header Authorization + presencia en la colección `admins`.
 *  - Sin token → devuelve null (el handler responde 403).
 *  - Token inválido → devuelve null (403).
 *  - Fallo al inicializar Admin SDK → lanza (el handler responde 500 con detalle). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function verifyAdmin(req: any): Promise<string | null> {
  const authz = req.headers?.authorization as string | undefined
  const token = authz && authz.startsWith('Bearer ') ? authz.slice(7) : null
  if (!token) return null

  const auth = await adminAuth()          // puede lanzar si Admin SDK falla → 500
  let uid: string
  try {
    const decoded = await auth.verifyIdToken(token)
    uid = decoded.uid
  } catch {
    return null                            // token inválido/expirado → 403
  }
  const db = await adminDb()
  const snap = await db.collection('admins').doc(uid).get()
  return snap.exists ? uid : null
}
