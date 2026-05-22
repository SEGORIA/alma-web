import { initializeApp, getApps } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

// Solo inicializa Firebase si están configuradas las variables de entorno.
// Sin ellas el sitio público sigue funcionando con datos estáticos.
export const firebaseReady = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
)

let _auth: Auth | null = null
let _db:   Firestore | null = null

if (firebaseReady) {
  const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  }
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  _auth = getAuth(app)
  _db   = getFirestore(app)
}

export const auth = _auth
export const db   = _db
