/* Utilidades compartidas por los endpoints de api/*.ts.
   El prefijo "_" hace que Vercel NO trate este archivo como una ruta —
   es solo código compartido, no un endpoint público. */

/* ── CORS ──────────────────────────────────────────────────────
   Antes los 3 endpoints aceptaban peticiones desde CUALQUIER sitio
   (Access-Control-Allow-Origin: '*'). Esto permite que otro sitio web
   incruste un formulario que dispare estos endpoints desde el navegador
   de un visitante cualquiera. Solo permitimos los dominios reales de Alma. */
const ALLOWED_ORIGINS = new Set([
  'https://www.almaagenciacreativa.com',
  'https://almaagenciacreativa.com',
  'https://brief.almaagenciacreativa.com',
])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setCors(req: any, res: any): void {
  const origin = req.headers?.origin as string | undefined
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Vary', 'Origin')
}

/* ── Escapar HTML ──────────────────────────────────────────────
   Los templates de email insertan campos que escribe el usuario
   (nombre, marca, descripción…) directo en el HTML. Sin escapar, ese
   texto puede incluir etiquetas/enlaces falsos que se rendericen en el
   correo que abre el equipo de Alma. */
export function escapeHtml(value: unknown): string {
  const str = value == null ? '' : String(value)
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/* ── Rate limit (best-effort) ────────────────────────────────────
   Limite simple por IP, guardado en memoria del proceso serverless.
   No requiere cuentas ni servicios nuevos, pero NO es una garantía
   absoluta: cada instancia "fría" de Vercel empieza con el contador
   en cero, y un atacante con muchas IPs distintas podría esquivarlo.
   Alcanza para frenar loops accidentales o abuso casual; si en el
   futuro se necesita algo más estricto, se puede sumar un servicio
   externo (ej. Upstash Redis) sin cambiar el resto del código. */
const hits = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 5

export function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter(t => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > MAX_REQUESTS_PER_WINDOW
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getClientIp(req: any): string {
  const fwd = req.headers?.['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim()
  return req.socket?.remoteAddress ?? 'unknown'
}
