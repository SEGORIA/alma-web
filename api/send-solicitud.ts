import nodemailer from 'nodemailer'
import { setCors, escapeHtml, isRateLimited, getClientIp } from '../server-utils/http'

interface SolicitudPayload {
  nombre_cliente:  string
  marca:           string
  email_cliente:   string
  tipo:            string
  descripcion:     string
  material_ref?:   string
  token:           string
}

function buildHtml(p: SolicitudPayload): string {
  const adminUrl = `https://www.almaagenciacreativa.com/admin/clientes`
  const portalUrl = `https://almaagenciacreativa.com/cliente/${p.token}`

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F3FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">

  <div style="background:linear-gradient(135deg,#3B0764,#6B21A8,#9333EA);border-radius:20px 20px 0 0;padding:28px 28px;">
    <p style="margin:0 0 6px;color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">ALMA AGENCIA CREATIVA</p>
    <h1 style="margin:0 0 6px;color:#fff;font-size:22px;font-weight:900;">Nueva solicitud de cliente</h1>
    <p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px;">de <strong>${escapeHtml(p.nombre_cliente)}</strong> — <em>${escapeHtml(p.marca)}</em></p>
  </div>

  <div style="background:#fff;border-radius:0 0 20px 20px;padding:24px;border:1px solid #E5E7EB;border-top:none;">

    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;">
      <a href="mailto:${escapeHtml(p.email_cliente)}" style="display:inline-flex;align-items:center;padding:9px 16px;background:#6B21A8;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:12.5px;">Responder email</a>
      <a href="${adminUrl}" style="display:inline-flex;align-items:center;padding:9px 16px;background:#F3F4F6;color:#374151;border-radius:10px;text-decoration:none;font-weight:700;font-size:12.5px;">Ver en Admin</a>
      <a href="${portalUrl}" style="display:inline-flex;align-items:center;padding:9px 16px;background:#F3F4F6;color:#374151;border-radius:10px;text-decoration:none;font-weight:700;font-size:12.5px;">Portal del cliente</a>
    </div>

    <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;">
      <tr>
        <td style="padding:10px 14px;background:#F5F3FF;font-size:11px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;border-top:1px solid #E5E7EB;vertical-align:top;">Cliente</td>
        <td style="padding:10px 14px;background:#F5F3FF;font-size:13px;color:#374151;border-top:1px solid #E5E7EB;">${escapeHtml(p.nombre_cliente)}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;background:#fff;font-size:11px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;border-top:1px solid #E5E7EB;vertical-align:top;">Marca</td>
        <td style="padding:10px 14px;background:#fff;font-size:13px;color:#374151;border-top:1px solid #E5E7EB;">${escapeHtml(p.marca)}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;background:#F5F3FF;font-size:11px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;border-top:1px solid #E5E7EB;vertical-align:top;">Email</td>
        <td style="padding:10px 14px;background:#F5F3FF;font-size:13px;color:#374151;border-top:1px solid #E5E7EB;">${escapeHtml(p.email_cliente)}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;background:#fff;font-size:11px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;border-top:1px solid #E5E7EB;vertical-align:top;">Tipo</td>
        <td style="padding:10px 14px;background:#fff;font-size:13px;color:#374151;border-top:1px solid #E5E7EB;font-weight:700;">${escapeHtml(p.tipo)}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;background:#F5F3FF;font-size:11px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;border-top:1px solid #E5E7EB;vertical-align:top;">Descripción</td>
        <td style="padding:10px 14px;background:#F5F3FF;font-size:13px;color:#374151;border-top:1px solid #E5E7EB;white-space:pre-wrap;">${escapeHtml(p.descripcion)}</td>
      </tr>
      ${p.material_ref ? `
      <tr>
        <td style="padding:10px 14px;background:#fff;font-size:11px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;border-top:1px solid #E5E7EB;vertical-align:top;">Material ref.</td>
        <td style="padding:10px 14px;background:#fff;font-size:13px;color:#374151;border-top:1px solid #E5E7EB;">${escapeHtml(p.material_ref)}</td>
      </tr>` : ''}
    </table>

    <p style="margin:20px 0 0;font-size:11.5px;color:#9CA3AF;border-top:1px solid #F3F4F6;padding-top:16px;">
      Solicitud recibida desde el portal de clientes · Alma Agencia Creativa · Manizales, Colombia
    </p>
  </div>
</div>
</body>
</html>`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  setCors(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' })

  if (isRateLimited(getClientIp(req))) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.' })
  }

  const p = req.body as SolicitudPayload

  if (!p?.nombre_cliente || !p?.descripcion || !p?.token) {
    return res.status(400).json({ error: 'Campos requeridos faltantes' })
  }

  const adminEmail = process.env.ADMIN_EMAIL     ?? 'alma.directivo@gmail.com'
  const gmailPass  = process.env.GMAIL_APP_PASSWORD

  if (!gmailPass) {
    console.warn('[send-solicitud] GMAIL_APP_PASSWORD no configurada')
    return res.status(200).json({ ok: true, skipped: true })
  }

  try {
    const transporter = nodemailer.createTransport({
      host:   'smtp.gmail.com',
      port:   465,
      secure: true,
      auth:   { user: 'alma.directivo@gmail.com', pass: gmailPass },
    })

    await transporter.sendMail({
      from:    '"Alma Agencia Creativa" <alma.directivo@gmail.com>',
      to:      adminEmail,
      subject: `Solicitud de cliente: ${p.nombre_cliente} — ${p.marca} [${p.tipo}]`,
      html:    buildHtml(p),
      text:    `Nueva solicitud de ${p.nombre_cliente} (${p.marca})\nTipo: ${p.tipo}\n\n${p.descripcion}${p.material_ref ? `\n\nRef: ${p.material_ref}` : ''}`,
      replyTo: p.email_cliente,
      headers: { 'X-Mailer': 'Alma-Portal/1.0', 'Precedence': 'bulk' },
    })

    console.log(`[send-solicitud] Email enviado — ${p.nombre_cliente} / ${p.marca}`)
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[send-solicitud] Error:', err)
    return res.status(500).json({ error: String(err) })
  }
}
