import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { setCors, escapeHtml, isRateLimited, getClientIp } from '../server-utils/http'

interface KitArchivoLean {
  nombre:       string
  url:          string
  tipo:         string
  descripcion?: string
}

interface Body {
  email:     string
  telefono?: string
  archivos:  KitArchivoLean[]
}

/* ── Iconos por tipo de archivo ───────────────────────────────── */
function iconoTipo(tipo: string): string {
  const t = tipo.toLowerCase()
  if (t === 'pdf')               return '📄'
  if (t === 'docx' || t === 'doc') return '📝'
  if (t === 'xlsx' || t === 'xls') return '📊'
  if (t === 'zip' || t === 'rar')  return '🗜️'
  if (t === 'pptx')              return '📊'
  return '📁'
}

/* ── Template: email al lead ──────────────────────────────────── */
function buildLeadEmail(email: string, archivos: KitArchivoLean[]): string {
  const archivosList = archivos.length > 0
    ? archivos.map(a => `
        <a href="${a.url}" target="_blank" style="
          display:flex; align-items:center; gap:12px;
          padding:14px 16px; border-radius:12px;
          background:#fff; border:1.5px solid #E5E7EB;
          text-decoration:none; color:#111827; margin-bottom:8px;
          font-family: -apple-system, sans-serif;
        ">
          <span style="font-size:22px;">${iconoTipo(a.tipo)}</span>
          <div style="flex:1;">
            <p style="margin:0; font-weight:700; font-size:14px; color:#111827;">${escapeHtml(a.nombre)}</p>
            ${a.descripcion ? `<p style="margin:4px 0 0; font-size:12px; color:#6B7280;">${escapeHtml(a.descripcion)}</p>` : ''}
          </div>
          <span style="font-size:20px; color:#6B21A8;">↓</span>
        </a>`).join('')
    : '<p style="color:#6B7280; font-size:14px;">Los archivos del kit estarán disponibles muy pronto.</p>'

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0; padding:0; background:#F5F4FF; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px; margin:0 auto; padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#3B0764,#6B21A8,#9333EA); border-radius:20px 20px 0 0; padding:32px 28px; text-align:center;">
      <p style="margin:0 0 8px; color:rgba(255,255,255,0.7); font-size:12px; font-weight:700; letter-spacing:2px; text-transform:uppercase;">ALMA AGENCIA CREATIVA</p>
      <h1 style="margin:0; color:#fff; font-size:26px; font-weight:900; letter-spacing:-0.5px;">🎁 Tu kit está listo</h1>
      <p style="margin:10px 0 0; color:rgba(255,255,255,0.75); font-size:14px;">Hola ${escapeHtml(email)}, aquí están tus recursos</p>
    </div>

    <!-- Body -->
    <div style="background:#fff; border-radius:0 0 20px 20px; padding:28px; border:1px solid #E5E7EB; border-top:none;">

      <p style="color:#374151; font-size:15px; line-height:1.7; margin:0 0 20px;">
        Gracias por descargar nuestro kit gratuito. Haz clic en cada archivo para descargarlo directamente:
      </p>

      <!-- Archivos -->
      <div style="margin-bottom:24px;">
        ${archivosList}
      </div>

      <!-- Separador -->
      <div style="border-top:1px solid #F3F4F6; margin:20px 0;"></div>

      <!-- CTA WhatsApp -->
      <p style="color:#374151; font-size:14px; line-height:1.6; margin:0 0 16px;">
        ¿Tienes preguntas o quieres que te ayudemos a implementar estas herramientas en tu marca? Escríbenos:
      </p>
      <a href="https://wa.me/573188006436?text=Hola%2C%20descargué%20el%20kit%20gratuito%20y%20tengo%20preguntas"
        style="display:inline-block; background:linear-gradient(135deg,#6B21A8,#9333EA); color:#fff;
               padding:12px 24px; border-radius:12px; text-decoration:none;
               font-weight:700; font-size:14px;">
        💬 Hablar con Alma
      </a>

      <!-- Footer -->
      <p style="margin:28px 0 0; font-size:12px; color:#9CA3AF; border-top:1px solid #F3F4F6; padding-top:20px;">
        Recibiste este email porque solicitaste el kit gratuito en <a href="https://alma-web-xi.vercel.app" style="color:#6B21A8;">almaagenciacreativa.com</a>.<br>
        © Alma Agencia Creativa · Manizales, Colombia
      </p>
    </div>
  </div>
</body>
</html>`
}

/* ── Template: notificación al admin ─────────────────────────── */
function buildAdminEmail(email: string, telefono: string | undefined, archivos: KitArchivoLean[]): string {
  const waLink = telefono
    ? `https://wa.me/${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, vi que descargaste el kit gratuito de Alma. ¿Podemos ayudarte con tu marca?`)}`
    : `https://wa.me/?text=${encodeURIComponent(`Nuevo lead: ${email}`)}`

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0; padding:0; background:#F5F4FF; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:500px; margin:0 auto; padding:32px 16px;">
    <div style="background:#fff; border-radius:16px; border:2px solid #6B21A8; padding:24px; box-shadow:0 4px 20px rgba(107,33,168,0.12);">

      <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
        <span style="font-size:32px;">🎯</span>
        <div>
          <h2 style="margin:0; font-size:18px; font-weight:900; color:#111827;">Nuevo Lead del Kit</h2>
          <p style="margin:2px 0 0; font-size:13px; color:#6B7280;">Acaba de pedir el kit gratuito</p>
        </div>
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        <tr>
          <td style="padding:10px 14px; background:#F5F3FF; border-radius:8px 8px 0 0; font-size:12px; font-weight:700; color:#6B21A8; text-transform:uppercase; letter-spacing:0.5px;">Email</td>
          <td style="padding:10px 14px; background:#F5F3FF; border-radius:8px 8px 0 0; font-size:14px; font-weight:700; color:#111827;">${escapeHtml(email)}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px; font-size:12px; font-weight:700; color:#6B21A8; text-transform:uppercase; letter-spacing:0.5px; border-top:1px solid #E5E7EB;">Teléfono / WA</td>
          <td style="padding:10px 14px; font-size:14px; font-weight:700; color:#111827; border-top:1px solid #E5E7EB;">${telefono ? escapeHtml(telefono) : 'No proporcionado'}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px; background:#F9FAFB; border-radius:0 0 8px 8px; font-size:12px; font-weight:700; color:#6B21A8; text-transform:uppercase; letter-spacing:0.5px; border-top:1px solid #E5E7EB;">Kit enviado</td>
          <td style="padding:10px 14px; background:#F9FAFB; border-radius:0 0 8px 8px; font-size:14px; color:#374151; border-top:1px solid #E5E7EB;">${archivos.length > 0 ? escapeHtml(archivos.map(a => a.nombre).join(', ')) : 'Sin archivos'}</td>
        </tr>
      </table>

      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        ${telefono ? `
        <a href="${waLink}" style="display:inline-flex; align-items:center; gap:6px; padding:10px 18px; background:#25D366; color:#fff; border-radius:10px; text-decoration:none; font-weight:700; font-size:13px;">
          💬 WhatsApp
        </a>` : ''}
        <a href="mailto:${escapeHtml(email)}" style="display:inline-flex; align-items:center; gap:6px; padding:10px 18px; background:#6B21A8; color:#fff; border-radius:10px; text-decoration:none; font-weight:700; font-size:13px;">
          ✉️ Responder email
        </a>
        <a href="https://alma-web-xi.vercel.app/admin/leads" style="display:inline-flex; align-items:center; gap:6px; padding:10px 18px; background:#F3F4F6; color:#374151; border-radius:10px; text-decoration:none; font-weight:700; font-size:13px;">
          📊 Ver en Admin
        </a>
      </div>

    </div>
  </div>
</body>
</html>`
}

/* ── Handler ──────────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  setCors(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (isRateLimited(getClientIp(req))) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.' })
  }

  const { email, telefono, archivos = [] } = req.body as Body

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido' })
  }

  const apiKey    = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL ?? 'alma.directivo@gmail.com'

  if (!apiKey) {
    console.warn('RESEND_API_KEY no configurada — email no enviado')
    return res.status(200).json({ ok: true, skipped: true, reason: 'no_api_key' })
  }

  // Crear cliente Resend con la clave ya verificada
  const resendClient = new Resend(apiKey)

  console.log(`[send-kit] Nuevo lead: ${email} | admin: ${adminEmail}`)

  try {
    // ── 1. Notificación al admin (siempre funciona — va al correo de la cuenta Resend) ──
    const adminResult = await resendClient.emails.send({
      from:    'Alma Leads <onboarding@resend.dev>',
      to:      adminEmail,
      subject: `🎯 Nuevo lead: ${email}`,
      html:    buildAdminEmail(email, telefono, archivos),
    })

    const adminErr = adminResult.error ? JSON.stringify(adminResult.error) : undefined
    const adminOk  = !adminErr

    if (adminErr) console.error('[send-kit] Error admin email:', adminErr)
    else          console.log('[send-kit] Admin notificado ✓')

    // ── 2. Email al lead ──────────────────────────────────────────────────────
    // Se envía vía Gmail SMTP (alma.directivo@gmail.com) si GMAIL_APP_PASSWORD está configurado.
    // Alternativa: via Resend si RESEND_FROM_DOMAIN apunta a un dominio verificado.
    let leadOk  = false
    let leadErr: string | undefined

    const gmailPass   = process.env.GMAIL_APP_PASSWORD
    const resendDomain = process.env.RESEND_FROM_DOMAIN

    if (gmailPass) {
      // ── Gmail SMTP — funciona sin verificar dominio ──
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: 'alma.directivo@gmail.com', pass: gmailPass },
        })
        await transporter.sendMail({
          from:    '"Alma Agencia Creativa" <alma.directivo@gmail.com>',
          to:      email,
          subject: '🎁 Tu kit gratuito de Alma está listo para descargar',
          html:    buildLeadEmail(email, archivos),
        })
        leadOk = true
        console.log(`[send-kit] Email Gmail enviado al lead ${email} ✓`)
      } catch (gmailErr) {
        leadErr = String(gmailErr)
        console.error('[send-kit] Error Gmail:', leadErr)
      }

    } else if (resendDomain) {
      // ── Resend con dominio verificado ──
      const leadResult = await resendClient.emails.send({
        from:    `Alma Agencia Creativa <${resendDomain}>`,
        to:      email,
        subject: '🎁 Tu kit gratuito de Alma está listo para descargar',
        html:    buildLeadEmail(email, archivos),
      })
      leadErr = leadResult.error ? JSON.stringify(leadResult.error) : undefined
      leadOk  = !leadErr
      if (leadErr) console.error('[send-kit] Error Resend lead:', leadErr)
      else         console.log(`[send-kit] Email Resend enviado al lead ${email} ✓`)

    } else {
      leadErr = 'no_sender_configured'
      console.log('[send-kit] Email al lead omitido — configura GMAIL_APP_PASSWORD o RESEND_FROM_DOMAIN')
    }

    return res.status(200).json({
      // ok=true si el admin fue notificado (el lead ve archivos en pantalla)
      ok:         adminOk,
      lead:       leadOk  ? 'sent' : 'pending',
      admin:      adminOk ? 'sent' : 'failed',
      adminError: adminErr,
      leadError:  leadOk  ? undefined : leadErr,
    })
  } catch (err) {
    console.error('[send-kit] Error inesperado:', err)
    return res.status(500).json({ error: String(err) })
  }
}
