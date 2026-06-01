import nodemailer from 'nodemailer'

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbw5ta5-0VXxIvavzKNLxnpCp0rDx8NyvtTAn45cWySqZM6H21ziERvvABuRlFsi5k92/exec'

interface BriefPayload {
  email_direccion:           string
  nombre:                    string
  documento?:                string
  telefono?:                 string
  email:                     string
  marca:                     string
  nacimiento_marca?:         string
  tiene_logo?:               string
  slogan?:                   string
  presencia_redes?:          string
  credenciales_redes?:       string
  credenciales_plataformas?: string
  personalidad?:             string
  valores_marca?:            string
  colores_marca?:            string
  clientes_potenciales?:     string
  problema_resuelve?:        string
  propuesta_valor?:          string
  beneficios?:               string
  experiencia_emocional?:    string
  emociones?:                string
  competidores?:             string
  referencias?:              string
  fecha_inicio?:             string
  archivos?:                 string
  link_archivos?:            string
  notas_adicionales?:        string
}

/* ── Helper: row HTML ─────────────────────────────────────────── */
function row(label: string, value?: string, highlight = false): string {
  const val = value && value !== '—' ? value : '<span style="color:#9CA3AF;font-style:italic;">No proporcionado</span>'
  const bg  = highlight ? '#F5F3FF' : '#F9FAFB'
  return `
    <tr>
      <td style="padding:10px 14px;background:${bg};font-size:11px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;white-space:nowrap;border-top:1px solid #E5E7EB;">${label}</td>
      <td style="padding:10px 14px;background:${bg};font-size:13px;color:#374151;border-top:1px solid #E5E7EB;white-space:pre-wrap;">${val}</td>
    </tr>`
}

/* ── Admin email HTML ─────────────────────────────────────────── */
function buildAdminEmail(p: BriefPayload): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F4FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:680px;margin:0 auto;padding:32px 16px;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#3B0764,#6B21A8,#9333EA);border-radius:20px 20px 0 0;padding:32px 28px;">
    <p style="margin:0 0 8px;color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">ALMA AGENCIA CREATIVA</p>
    <h1 style="margin:0 0 6px;color:#fff;font-size:24px;font-weight:900;">Nuevo Briefing recibido</h1>
    <p style="margin:0;color:rgba(255,255,255,0.75);font-size:14px;">de <strong>${p.nombre}</strong> — <em>${p.marca}</em></p>
  </div>

  <!-- Body -->
  <div style="background:#fff;border-radius:0 0 20px 20px;padding:28px;border:1px solid #E5E7EB;border-top:none;">

    <!-- Quick actions -->
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px;">
      <a href="mailto:${p.email}" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#6B21A8;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;">Responder email</a>
      ${p.telefono && p.telefono !== '—' ? `<a href="https://wa.me/${p.telefono.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${p.nombre}, recibimos tu briefing para ${p.marca}. Nos pondremos en contacto pronto.`)}" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#25D366;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;">WhatsApp</a>` : ''}
      <a href="https://www.almaagenciacreativa.com/admin/brief" style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:#F3F4F6;color:#374151;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;">Ver en Admin</a>
    </div>

    <!-- Datos -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:10px;overflow:hidden;">
      ${row('Nombre',       p.nombre,         true)}
      ${row('Email',        p.email_direccion)}
      ${row('Email empresa',p.email,          true)}
      ${row('Telefono',     p.telefono)}
      ${row('Documento',    p.documento,      true)}
      ${row('Marca',        p.marca)}
      ${row('Nacimiento',   p.nacimiento_marca, true)}
      ${row('Logo',         p.tiene_logo)}
      ${row('Slogan',       p.slogan,         true)}
      ${row('Inicio',       p.fecha_inicio)}
    </table>

    <h3 style="font-size:12px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;padding-top:16px;border-top:2px solid #F5F3FF;">ADN de Marca</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:10px;overflow:hidden;">
      ${row('Personalidad', p.personalidad,  true)}
      ${row('Valores',      p.valores_marca)}
      ${row('Colores',      p.colores_marca, true)}
    </table>

    <h3 style="font-size:12px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;padding-top:16px;border-top:2px solid #F5F3FF;">Propuesta de Valor</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:10px;overflow:hidden;">
      ${row('Clientes potenciales', p.clientes_potenciales, true)}
      ${row('Problema que resuelve',p.problema_resuelve)}
      ${row('Propuesta de valor',   p.propuesta_valor,     true)}
      ${row('Beneficios',           p.beneficios)}
    </table>

    <h3 style="font-size:12px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;padding-top:16px;border-top:2px solid #F5F3FF;">Experiencia Emocional</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:10px;overflow:hidden;">
      ${row('Experiencia emocional',  p.experiencia_emocional, true)}
      ${row('Emociones a transmitir', p.emociones)}
    </table>

    <h3 style="font-size:12px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;padding-top:16px;border-top:2px solid #F5F3FF;">Competencia y Referencias</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:10px;overflow:hidden;">
      ${row('Competidores', p.competidores, true)}
      ${row('Referencias',  p.referencias)}
    </table>

    <h3 style="font-size:12px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;padding-top:16px;border-top:2px solid #F5F3FF;">Presencia Digital y Accesos</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:10px;overflow:hidden;">
      ${row('Presencia en redes',       p.presencia_redes,          true)}
      ${row('Credenciales redes',       p.credenciales_redes)}
      ${row('Credenciales plataformas', p.credenciales_plataformas, true)}
    </table>

    <h3 style="font-size:12px;font-weight:700;color:#6B21A8;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;padding-top:16px;border-top:2px solid #F5F3FF;">Archivos y Cierre</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:10px;overflow:hidden;">
      ${row('Archivos adjuntos', p.archivos,           true)}
      ${row('Link archivos',     p.link_archivos)}
      ${row('Notas adicionales', p.notas_adicionales,  true)}
    </table>

    <p style="margin:20px 0 0;font-size:12px;color:#9CA3AF;border-top:1px solid #F3F4F6;padding-top:20px;">
      Briefing recibido en brief.almaagenciacreativa.com · Guardado en Firestore y Google Sheets.<br>
      Alma Agencia Creativa · Manizales, Colombia
    </p>
  </div>
</div>
</body>
</html>`
}

/* ── Plain text fallback ──────────────────────────────────────── */
function buildPlainText(p: BriefPayload): string {
  return `NUEVO BRIEFING — ${p.nombre} / ${p.marca}

Email: ${p.email_direccion}
Teléfono: ${p.telefono ?? '—'}
Marca: ${p.marca}
Propuesta de valor: ${p.propuesta_valor ?? '—'}
Clientes: ${p.clientes_potenciales ?? '—'}

Ver completo en: https://www.almaagenciacreativa.com/admin/brief
`
}

/* ── Google Sheets sync ───────────────────────────────────────── */
async function syncToSheets(p: BriefPayload): Promise<void> {
  const body = JSON.stringify(p)
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method:  'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body).toString(),
      },
      body,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      redirect: 'follow' as any,
    })
    console.log(`[send-brief] Sheets sync status: ${res.status}`)
  } catch (err) {
    console.warn('[send-brief] Sheets sync warning:', err)
  }
}

/* ── Handler ──────────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' })

  const p = req.body as BriefPayload

  if (!p?.email_direccion || !p?.nombre || !p?.marca) {
    return res.status(400).json({ error: 'Campos requeridos faltantes' })
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? 'alma.directivo@gmail.com'
  const gmailPass  = process.env.GMAIL_APP_PASSWORD

  // ── Sheets sync (no bloquea el email) ──
  syncToSheets(p).catch(() => {/* silencioso */})

  // ── Email ──
  if (!gmailPass) {
    console.warn('[send-brief] GMAIL_APP_PASSWORD no configurada')
    return res.status(200).json({ ok: true, skipped: true, reason: 'no_gmail_password' })
  }

  try {
    const transporter = nodemailer.createTransport({
      host:   'smtp.gmail.com',
      port:   465,
      secure: true,
      auth:   { user: 'alma.directivo@gmail.com', pass: gmailPass },
    })

    await transporter.sendMail({
      from:      '"Alma Agencia Creativa" <alma.directivo@gmail.com>',
      to:        adminEmail,
      subject:   `Nuevo briefing: ${p.nombre} — ${p.marca}`,
      text:      buildPlainText(p),
      html:      buildAdminEmail(p),
      replyTo:   p.email,
      headers: {
        'X-Mailer':   'Alma-Briefing/2.0',
        'Precedence': 'bulk',
      },
    })

    console.log(`[send-brief] Email enviado a ${adminEmail} — ${p.nombre} / ${p.marca}`)
    return res.status(200).json({ ok: true, email: adminEmail })

  } catch (err) {
    console.error('[send-brief] Error Gmail:', err)
    return res.status(500).json({ error: String(err) })
  }
}
