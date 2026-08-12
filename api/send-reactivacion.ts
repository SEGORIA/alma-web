import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { setCors, escapeHtml, isRateLimited, getClientIp } from '../server-utils/http.js'

interface ReactivacionBody {
  nombre_contacto:      string
  cargo:                string
  nombre_negocio:       string
  whatsapp:             string
  email:                string
  ubicacion:            string
  sector:               string
  productos_servicios:  string
  tiempo_funcionando:   string
  canales_venta:        string[]
  canales_venta_otro?:  string
  afectaciones_relato:  string
  afectaciones_tipo:    string[]
  afectaciones_otro?:   string
  apoyos:               string[]
  apoyo_otro?:          string
  ayuda_ideal:          string
  herramientas:         string[]
  herramientas_otro?:   string
  actividad_redes:      string
  urgencia:             string
  autoriza:             boolean
}

const URGENCIA_INFO: Record<string, { label: string; icono: string; color: string; bg: string }> = {
  urgente:       { label: 'URGENTE — activar ventas lo antes posible', icono: '🔴', color: '#DC2626', bg: '#FEE2E2' },
  prioritario:   { label: 'PRIORITARIO — muchas dificultades',          icono: '🟠', color: '#D97706', bg: '#FEF3C7' },
  puede_esperar: { label: 'Puede esperar unos días',                    icono: '🟢', color: '#059669', bg: '#D1FAE5' },
}

const ACTIVIDAD_LABEL: Record<string, string> = {
  muy_activo:    'Muy activo',
  algo_activo:   'Algo activo',
  poco_activo:   'Poco activo',
  no_publicando: 'Actualmente no está publicando',
}

function listaOTexto(items: string[] | undefined, otro: string | undefined): string {
  if (!items || items.length === 0) return 'No indicó'
  const base = items.map(i => escapeHtml(i)).join(' · ')
  return otro ? `${base} <em>(${escapeHtml(otro)})</em>` : base
}

/* ── Helper: fila de tabla ────────────────────────────────────── */
function row(label: string, valueHtml: string, highlight = false): string {
  const bg = highlight ? '#F5F3FF' : '#F9FAFB'
  return `
    <tr>
      <td style="padding:10px 14px;background:${bg};font-size:11px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;white-space:nowrap;border-top:1px solid #E5E7EB;">${label}</td>
      <td style="padding:10px 14px;background:${bg};font-size:13px;color:#374151;border-top:1px solid #E5E7EB;white-space:pre-wrap;">${valueHtml}</td>
    </tr>`
}

/* ── Template: email al admin ─────────────────────────────────── */
function buildAdminEmail(p: ReactivacionBody): string {
  const urg = URGENCIA_INFO[p.urgencia] ?? URGENCIA_INFO.prioritario
  const waLink = `https://wa.me/${p.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hola ${p.nombre_contacto}, te escribe el equipo de Alma Agencia Creativa. Recibimos la información de ${p.nombre_negocio} en el brief de reactivación del comercio. ¿Podemos ayudarte?`
  )}`

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F4FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:680px;margin:0 auto;padding:32px 16px;">

  <!-- Header con badge de urgencia -->
  <div style="background:linear-gradient(135deg,#3B0764,#6B21A8,#9333EA);border-radius:20px 20px 0 0;padding:28px 28px 20px;">
    <p style="margin:0 0 8px;color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">ALMA · REACTIVACIÓN DEL COMERCIO</p>
    <h1 style="margin:0 0 10px;color:#fff;font-size:22px;font-weight:900;">${escapeHtml(p.nombre_negocio)}</h1>
    <span style="display:inline-block;padding:6px 14px;border-radius:999px;background:${urg.bg};color:${urg.color};font-size:12px;font-weight:800;">
      ${urg.icono} ${escapeHtml(urg.label)}
    </span>
  </div>

  <!-- Body -->
  <div style="background:#fff;border-radius:0 0 20px 20px;padding:28px;border:1px solid #E5E7EB;border-top:none;">

    <!-- Quick actions -->
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px;">
      <a href="${waLink}" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#25D366;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;">💬 WhatsApp</a>
      <a href="mailto:${escapeHtml(p.email)}" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#6B21A8;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;">✉️ Responder email</a>
      <a href="https://www.almaagenciacreativa.com/admin/reactivacion" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#F3F4F6;color:#374151;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;">📊 Ver en Admin</a>
    </div>

    <h3 style="font-size:12px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Contacto</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:10px;overflow:hidden;">
      ${row('Persona a cargo', `${escapeHtml(p.nombre_contacto)} — ${escapeHtml(p.cargo)}`, true)}
      ${row('WhatsApp', escapeHtml(p.whatsapp))}
      ${row('Correo', escapeHtml(p.email), true)}
      ${row('Zona', escapeHtml(p.ubicacion))}
    </table>

    <h3 style="font-size:12px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;padding-top:16px;border-top:2px solid #F5F3FF;">El negocio</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:10px;overflow:hidden;">
      ${row('Sector', escapeHtml(p.sector), true)}
      ${row('Productos / servicios', escapeHtml(p.productos_servicios))}
      ${row('Tiempo funcionando', escapeHtml(p.tiempo_funcionando), true)}
      ${row('Dónde comercializaba', listaOTexto(p.canales_venta, p.canales_venta_otro))}
    </table>

    <h3 style="font-size:12px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;padding-top:16px;border-top:2px solid #F5F3FF;">Qué está pasando</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:10px;overflow:hidden;">
      ${row('Relato', escapeHtml(p.afectaciones_relato), true)}
      ${row('Afectaciones', listaOTexto(p.afectaciones_tipo, p.afectaciones_otro))}
    </table>

    <h3 style="font-size:12px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;padding-top:16px;border-top:2px solid #F5F3FF;">Cómo podemos ayudar</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:10px;overflow:hidden;">
      ${row('Apoyos que le interesan', listaOTexto(p.apoyos, p.apoyo_otro), true)}
      ${row('👉 Ayuda ideal (en sus palabras)', `<strong>${escapeHtml(p.ayuda_ideal)}</strong>`)}
    </table>

    <h3 style="font-size:12px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;padding-top:16px;border-top:2px solid #F5F3FF;">Capacidad digital actual</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:10px;overflow:hidden;">
      ${row('Herramientas', listaOTexto(p.herramientas, p.herramientas_otro), true)}
      ${row('Actividad en redes', escapeHtml(ACTIVIDAD_LABEL[p.actividad_redes] ?? p.actividad_redes))}
    </table>

    <p style="margin:20px 0 0;font-size:12px;color:#9CA3AF;border-top:1px solid #F3F4F6;padding-top:20px;">
      Recibido en almaagenciacreativa.com/reactivacion · Guardado en Firestore (solicitudes_reactivacion).<br>
      Alma Agencia Creativa · Manizales, Colombia
    </p>
  </div>
</div>
</body>
</html>`
}

/* ── Template: email de confirmación al negocio ───────────────── */
function buildLeadEmail(p: ReactivacionBody): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F4FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <div style="background:linear-gradient(135deg,#3B0764,#6B21A8,#9333EA);border-radius:20px 20px 0 0;padding:32px 28px;text-align:center;">
      <p style="margin:0 0 8px;color:rgba(255,255,255,0.7);font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">ALMA AGENCIA CREATIVA</p>
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:900;letter-spacing:-0.5px;">💜 Recibimos tu solicitud</h1>
      <p style="margin:10px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">Hola ${escapeHtml(p.nombre_contacto)}, gracias por confiar en nosotros</p>
    </div>

    <div style="background:#fff;border-radius:0 0 20px 20px;padding:28px;border:1px solid #E5E7EB;border-top:none;">
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
        Recibimos la información de <strong>${escapeHtml(p.nombre_negocio)}</strong>. Sabemos que este es un momento
        difícil, y queremos que sepas que no estás solo: nuestro equipo va a revisar tu caso y se va a poner en
        contacto contigo por WhatsApp o correo muy pronto para ver cómo podemos acompañarte.
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Si necesitas hablar con nosotros de una vez, no esperes a que te escribamos:
      </p>

      <a href="https://wa.me/573188006436?text=${encodeURIComponent(`Hola, soy ${p.nombre_contacto} de ${p.nombre_negocio}. Ya envié el formulario de reactivación del comercio.`)}"
        style="display:inline-block;background:linear-gradient(135deg,#6B21A8,#9333EA);color:#fff;
               padding:12px 24px;border-radius:12px;text-decoration:none;
               font-weight:700;font-size:14px;">
        💬 Hablar con Alma ahora
      </a>

      <p style="margin:28px 0 0;font-size:12px;color:#9CA3AF;border-top:1px solid #F3F4F6;padding-top:20px;">
        Recibiste este correo porque enviaste el formulario de reactivación del comercio en
        <a href="https://www.almaagenciacreativa.com/reactivacion" style="color:#6B21A8;">almaagenciacreativa.com</a>.<br>
        © Alma Agencia Creativa · Manizales, Colombia
      </p>
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
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' })

  if (isRateLimited(getClientIp(req))) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.' })
  }

  const p = req.body as ReactivacionBody

  if (!p?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) || !p?.nombre_negocio || !p?.whatsapp) {
    return res.status(400).json({ error: 'Campos requeridos faltantes' })
  }

  const apiKey     = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL ?? 'alma.directivo@gmail.com'

  if (!apiKey) {
    console.warn('[send-reactivacion] RESEND_API_KEY no configurada — email no enviado')
    return res.status(200).json({ ok: true, skipped: true, reason: 'no_api_key' })
  }

  const resendClient = new Resend(apiKey)

  console.log(`[send-reactivacion] Nueva solicitud: ${p.nombre_negocio} (${p.urgencia}) | admin: ${adminEmail}`)

  try {
    // ── 1. Notificación al admin (siempre funciona — va al correo de la cuenta Resend) ──
    const urg = URGENCIA_INFO[p.urgencia] ?? URGENCIA_INFO.prioritario
    const adminResult = await resendClient.emails.send({
      from:    'Alma Reactivación <onboarding@resend.dev>',
      to:      adminEmail,
      subject: `${urg.icono} ${p.nombre_negocio} — Reactivación del comercio`,
      html:    buildAdminEmail(p),
    })

    const adminErr = adminResult.error ? JSON.stringify(adminResult.error) : undefined
    const adminOk  = !adminErr

    if (adminErr) console.error('[send-reactivacion] Error admin email:', adminErr)
    else          console.log('[send-reactivacion] Admin notificado ✓')

    // ── 2. Confirmación al negocio ──
    let leadOk  = false
    let leadErr: string | undefined

    const gmailPass    = process.env.GMAIL_APP_PASSWORD
    const resendDomain = process.env.RESEND_FROM_DOMAIN

    if (gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: 'alma.directivo@gmail.com', pass: gmailPass },
        })
        await transporter.sendMail({
          from:    '"Alma Agencia Creativa" <alma.directivo@gmail.com>',
          to:      p.email,
          subject: 'Recibimos tu solicitud — Alma Agencia Creativa',
          html:    buildLeadEmail(p),
        })
        leadOk = true
        console.log(`[send-reactivacion] Email Gmail enviado a ${p.email} ✓`)
      } catch (gmailErr) {
        leadErr = String(gmailErr)
        console.error('[send-reactivacion] Error Gmail:', leadErr)
      }
    } else if (resendDomain) {
      const leadResult = await resendClient.emails.send({
        from:    `Alma Agencia Creativa <${resendDomain}>`,
        to:      p.email,
        subject: 'Recibimos tu solicitud — Alma Agencia Creativa',
        html:    buildLeadEmail(p),
      })
      leadErr = leadResult.error ? JSON.stringify(leadResult.error) : undefined
      leadOk  = !leadErr
      if (leadErr) console.error('[send-reactivacion] Error Resend lead:', leadErr)
      else         console.log(`[send-reactivacion] Email Resend enviado a ${p.email} ✓`)
    } else {
      leadErr = 'no_sender_configured'
      console.log('[send-reactivacion] Email al negocio omitido — configura GMAIL_APP_PASSWORD o RESEND_FROM_DOMAIN')
    }

    return res.status(200).json({
      ok:         adminOk,
      lead:       leadOk  ? 'sent' : 'pending',
      admin:      adminOk ? 'sent' : 'failed',
      adminError: adminErr,
      leadError:  leadOk  ? undefined : leadErr,
    })
  } catch (err) {
    console.error('[send-reactivacion] Error inesperado:', err)
    return res.status(500).json({ error: String(err) })
  }
}
