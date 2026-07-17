/* Cliente del endpoint /api/academia-admin.
   Adjunta el token del admin autenticado en cada llamada. */
import { auth } from './firebase'

export type AlumnoInscripcion = {
  cursoId:      string
  cursoTitulo:  string
  completadas:  number
  total:        number
  progreso:     number
  certificado:  boolean
}

export type Alumno = {
  uid:           string
  nombre:        string
  email:         string
  telefono:      string
  notas:         string
  disabled:      boolean
  emailVerified: boolean
  creado:        string | null
  ultimoAcceso:  string | null
  inscripciones: AlumnoInscripcion[]
}

async function call<T = unknown>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  if (!auth?.currentUser) throw new Error('Sesión no válida. Vuelve a iniciar sesión.')
  const token = await auth.currentUser.getIdToken()
  const res = await fetch('/api/academia-admin', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body:    JSON.stringify({ action, ...params }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error || `Error ${res.status}`)
  return data as T
}

export const listarAlumnos = () => call<{ alumnos: Alumno[] }>('list').then(d => d.alumnos)

export const crearAlumno = (nombre: string, email: string, password: string) =>
  call<{ uid: string }>('create', { nombre, email, password })

export const actualizarAlumno = (uid: string, patch: { nombre?: string; email?: string; telefono?: string; notas?: string }) =>
  call('update', { uid, ...patch })

export const asignarPassword = (uid: string, password: string) =>
  call('set-password', { uid, password })

export const enviarReset = (email: string) =>
  call('send-reset', { email })

export const bloquearAlumno = (uid: string, disabled: boolean) =>
  call('disable', { uid, disabled })

export const eliminarAlumno = (uid: string) =>
  call('delete', { uid })

export const registrarCertificado = (uid: string, cursoId: string, numero?: string) =>
  call('certificate', { uid, cursoId, numero })

export const enviarCorreoAlumno = (
  email: string, subject: string, mensaje: string, pdfBase64?: string, pdfNombre?: string,
) => call('email', { email, subject, mensaje, pdfBase64, pdfNombre })
