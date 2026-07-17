/* Endpoint de administración de alumnos de la Academia.
   Todas las acciones exigen un token de admin válido (verifyAdmin).
   Usa Firebase Admin SDK para gestionar cuentas y Gmail SMTP para correos. */

import nodemailer from 'nodemailer'
import { setCors } from '../server-utils/http'
import { adminReady, adminAuth, adminDb, verifyAdmin } from '../server-utils/admin'

/* ── Tipos ligeros ─────────────────────────────────────────── */
interface CursoLean { titulo: string; totalLecciones: number }

/* ── Correo (Gmail SMTP, mismo patrón que los otros endpoints) ── */
async function enviarCorreo(opts: {
  to: string; subject: string; html: string
  attachmentBase64?: string; attachmentName?: string
}): Promise<{ ok: boolean; error?: string; skipped?: boolean }> {
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  if (!gmailPass) return { ok: false, skipped: true, error: 'GMAIL_APP_PASSWORD no configurada' }
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user: 'alma.directivo@gmail.com', pass: gmailPass },
    })
    await transporter.sendMail({
      from: '"Alma Academia" <alma.directivo@gmail.com>',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      attachments: opts.attachmentBase64 && opts.attachmentName
        ? [{ filename: opts.attachmentName, content: opts.attachmentBase64, encoding: 'base64' }]
        : undefined,
    })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

function correoBase(titulo: string, cuerpoHtml: string): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0b0b16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 16px;">
  <div style="background:linear-gradient(135deg,#3B0764,#6B21A8,#9333EA);border-radius:20px 20px 0 0;padding:28px;text-align:center;">
    <p style="margin:0 0 6px;color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">ALMA ACADEMIA</p>
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:900;">${titulo}</h1>
  </div>
  <div style="background:#fff;border-radius:0 0 20px 20px;padding:26px;border:1px solid #E5E7EB;border-top:none;color:#374151;font-size:15px;line-height:1.7;">
    ${cuerpoHtml}
    <p style="margin:24px 0 0;font-size:12px;color:#9CA3AF;border-top:1px solid #F3F4F6;padding-top:16px;">
      Alma Academia · edu.almaagenciacreativa.com
    </p>
  </div>
</div></body></html>`
}

/* ── Handler ──────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  setCors(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' })

  if (!adminReady()) {
    return res.status(503).json({ error: 'FIREBASE_SERVICE_ACCOUNT no configurada en el servidor.' })
  }

  // — Verificación de admin —
  const adminUid = await verifyAdmin(req)
  if (!adminUid) return res.status(403).json({ error: 'No autorizado.' })

  const body = req.body ?? {}
  const action = body.action as string

  try {
    const auth = await adminAuth()
    const db   = await adminDb()

    switch (action) {
      /* ── Listar alumnos con su progreso ── */
      case 'list': {
        const [estSnap, cursosSnap] = await Promise.all([
          db.collection('estudiantes').get(),
          db.collection('cursos').get(),
        ])
        const cursos = new Map<string, CursoLean>()
        cursosSnap.forEach(d => {
          const c = d.data() as { titulo?: string; modulos?: { lecciones?: unknown[] }[] }
          const total = (c.modulos ?? []).reduce((n, m) => n + (m.lecciones?.length ?? 0), 0)
          cursos.set(d.id, { titulo: c.titulo ?? 'Curso', totalLecciones: total })
        })

        const alumnos = await Promise.all(estSnap.docs.map(async d => {
          const uid = d.id
          const perfil = d.data() as { nombre?: string; email?: string; telefono?: string; notas?: string }
          const [inscSnap, authUser] = await Promise.all([
            db.collection('estudiantes').doc(uid).collection('inscripciones').get(),
            auth.getUser(uid).catch(() => null),
          ])
          const inscripciones = inscSnap.docs.map(i => {
            const data = i.data() as { cursoId?: string; leccionesCompletadas?: string[]; completadoEn?: unknown; certificado?: unknown }
            const cursoId = data.cursoId ?? i.id
            const info = cursos.get(cursoId)
            const hechas = (data.leccionesCompletadas ?? []).length
            const total = info?.totalLecciones ?? 0
            return {
              cursoId,
              cursoTitulo: info?.titulo ?? 'Curso',
              completadas: hechas,
              total,
              progreso: total > 0 ? Math.round((hechas / total) * 100) : 0,
              certificado: !!data.certificado,
            }
          })
          return {
            uid,
            nombre: perfil.nombre ?? authUser?.displayName ?? '',
            email: perfil.email ?? authUser?.email ?? '',
            telefono: perfil.telefono ?? '',
            notas: perfil.notas ?? '',
            disabled: authUser?.disabled ?? false,
            emailVerified: authUser?.emailVerified ?? false,
            creado: authUser?.metadata.creationTime ?? null,
            ultimoAcceso: authUser?.metadata.lastSignInTime ?? null,
            inscripciones,
          }
        }))

        return res.status(200).json({ ok: true, alumnos })
      }

      /* ── Crear alumno ── */
      case 'create': {
        const { nombre, email, password } = body
        if (!nombre || !email || !password || String(password).length < 6) {
          return res.status(400).json({ error: 'Nombre, email y contraseña (mín. 6) son obligatorios.' })
        }
        const user = await auth.createUser({ email: String(email).trim(), password: String(password), displayName: String(nombre).trim() })
        await db.collection('estudiantes').doc(user.uid).set({
          nombre: String(nombre).trim(),
          email: String(email).trim(),
          createdAt: new Date().toISOString(),
        }, { merge: true })
        return res.status(200).json({ ok: true, uid: user.uid })
      }

      /* ── Editar perfil / email ── */
      case 'update': {
        const { uid, nombre, email, telefono, notas } = body
        if (!uid) return res.status(400).json({ error: 'Falta uid.' })
        const authPatch: { email?: string; displayName?: string } = {}
        if (email)  authPatch.email = String(email).trim()
        if (nombre) authPatch.displayName = String(nombre).trim()
        if (Object.keys(authPatch).length) await auth.updateUser(uid, authPatch)
        const perfilPatch: Record<string, string> = {}
        if (nombre !== undefined)   perfilPatch.nombre = String(nombre).trim()
        if (email !== undefined)    perfilPatch.email = String(email).trim()
        if (telefono !== undefined) perfilPatch.telefono = String(telefono).trim()
        if (notas !== undefined)    perfilPatch.notas = String(notas).trim()
        if (Object.keys(perfilPatch).length) await db.collection('estudiantes').doc(uid).set(perfilPatch, { merge: true })
        return res.status(200).json({ ok: true })
      }

      /* ── Asignar contraseña ── */
      case 'set-password': {
        const { uid, password } = body
        if (!uid || !password || String(password).length < 6) {
          return res.status(400).json({ error: 'Contraseña mín. 6 caracteres.' })
        }
        await auth.updateUser(uid, { password: String(password) })
        return res.status(200).json({ ok: true })
      }

      /* ── Enviar enlace de restablecimiento por correo ── */
      case 'send-reset': {
        const { email } = body
        if (!email) return res.status(400).json({ error: 'Falta email.' })
        const link = await auth.generatePasswordResetLink(String(email).trim())
        const mail = await enviarCorreo({
          to: String(email).trim(),
          subject: 'Restablece tu contraseña · Alma Academia',
          html: correoBase('Restablece tu contraseña', `
            <p>Recibimos una solicitud para restablecer tu contraseña en Alma Academia.</p>
            <p style="text-align:center;margin:24px 0;">
              <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#6B21A8,#9333EA);color:#fff;padding:12px 26px;border-radius:12px;text-decoration:none;font-weight:700;">Crear nueva contraseña</a>
            </p>
            <p style="font-size:13px;color:#6B7280;">Si no lo solicitaste, ignora este correo.</p>`),
        })
        return res.status(200).json({ ok: true, correo: mail.ok ? 'sent' : 'pending', link, correoError: mail.error })
      }

      /* ── Bloquear / desbloquear ── */
      case 'disable': {
        const { uid, disabled } = body
        if (!uid) return res.status(400).json({ error: 'Falta uid.' })
        await auth.updateUser(uid, { disabled: !!disabled })
        return res.status(200).json({ ok: true })
      }

      /* ── Eliminar alumno (cuenta + datos) ── */
      case 'delete': {
        const { uid } = body
        if (!uid) return res.status(400).json({ error: 'Falta uid.' })
        // Borrar inscripciones (subcolección) antes del doc
        const insc = await db.collection('estudiantes').doc(uid).collection('inscripciones').get()
        await Promise.all(insc.docs.map(i => i.ref.delete()))
        await db.collection('estudiantes').doc(uid).delete()
        await auth.deleteUser(uid).catch(() => { /* cuenta ya inexistente */ })
        return res.status(200).json({ ok: true })
      }

      /* ── Registrar certificado emitido ── */
      case 'certificate': {
        const { uid, cursoId, numero } = body
        if (!uid || !cursoId) return res.status(400).json({ error: 'Falta uid o cursoId.' })
        await db.collection('estudiantes').doc(uid).collection('inscripciones').doc(cursoId).set({
          certificado: { numero: numero ?? `ALMA-${Date.now().toString(36).toUpperCase()}`, emitidoEn: new Date().toISOString() },
        }, { merge: true })
        return res.status(200).json({ ok: true })
      }

      /* ── Enviar correo (opcionalmente con PDF adjunto) ── */
      case 'email': {
        const { email, subject, mensaje, pdfBase64, pdfNombre } = body
        if (!email || !subject) return res.status(400).json({ error: 'Falta email o asunto.' })
        const mail = await enviarCorreo({
          to: String(email).trim(),
          subject: String(subject),
          html: correoBase(String(subject), `<div style="white-space:pre-wrap;">${String(mensaje ?? '')}</div>`),
          attachmentBase64: pdfBase64,
          attachmentName: pdfNombre,
        })
        if (!mail.ok && !mail.skipped) return res.status(500).json({ error: mail.error })
        return res.status(200).json({ ok: mail.ok, skipped: mail.skipped, error: mail.error })
      }

      default:
        return res.status(400).json({ error: `Acción desconocida: ${action}` })
    }
  } catch (err) {
    console.error('[academia-admin] Error:', err)
    return res.status(500).json({ error: String(err) })
  }
}
