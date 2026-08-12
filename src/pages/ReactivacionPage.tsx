import { useState, useEffect, type ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'
import { P, Y } from '../tokens'
import {
  CANALES_VENTA, AFECTACIONES_TIPO, APOYOS_ALMA, HERRAMIENTAS_DIGITALES,
  ACTIVIDAD_REDES_OPCIONES, URGENCIA_OPCIONES,
  type CanalVenta, type AfectacionTipo, type ApoyoAlma, type HerramientaDigital,
  type ActividadRedes, type Urgencia,
} from '../data/reactivacion'
import { createSolicitudReactivacion, getContactoInfo } from '../lib/db'
import { contactoDefault } from '../data/config'
import { trackLeadSubmit } from '../lib/analytics'
import WhatsAppIcon from '../components/WhatsAppIcon'

const PASOS = ['Contacto', 'Tu negocio', 'Qué pasa', 'Cómo ayudar', 'Confirmar']

/* ── Kit de UI propio de esta página ─────────────────────────────────────
   No se reutiliza el uiKit de Red de Ayuda a propósito: esta página es un
   brief temporal, pensado para poder borrarse por completo sin arrastrar
   dependencias de otras funcionalidades. */

const MAX_W = 480

function normalizarWhatsapp(input: string): string {
  const digitos = input.replace(/\D/g, '')
  if (digitos.length === 10 && digitos.startsWith('3')) return `57${digitos}`
  return digitos
}

function waLink(whatsapp: string, texto: string): string {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(texto)}`
}

function TopBar({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 12px' }}>
      <div style={{ width: '32px' }}>
        {onBack && (
          <button
            onClick={onBack} aria-label="Volver"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '22px', color: '#111827', lineHeight: 1 }}
          >←</button>
        )}
      </div>
      <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0, textAlign: 'center', flex: 1 }}>{title}</h1>
      <div style={{ width: '32px' }} />
    </div>
  )
}

function Stepper({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '4px 20px 20px', gap: '6px' }}>
      {labels.map((label, i) => {
        const n = i + 1
        const activo = n <= step
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < labels.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 800,
                background: activo ? P : '#E5E7EB', color: activo ? '#fff' : '#9CA3AF',
              }}>{n}</div>
              <span style={{ fontSize: '10px', fontWeight: 600, color: activo ? P : '#9CA3AF', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < labels.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: n < step ? P : '#E5E7EB', margin: '0 6px 16px' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid #EDE9F5', boxShadow: '0 2px 14px rgba(107,33,168,0.06)', ...style }}>
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>{children}</label>
}

const fieldBase: React.CSSProperties = {
  width: '100%', padding: '13px 14px', borderRadius: '12px',
  border: '1.5px solid #E5E7EB', fontSize: '15px', color: '#111827',
  background: '#fff', boxSizing: 'border-box',
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...fieldBase, ...props.style }} />
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...fieldBase, resize: 'vertical', minHeight: '84px', ...props.style }} />
}

type BtnProps = { children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean }

function PrimaryButton({ children, onClick, type = 'button', disabled }: BtnProps) {
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      style={{
        display: 'block', width: '100%', textAlign: 'center',
        background: disabled ? '#FDE68A' : Y, color: '#1F1400',
        fontWeight: 800, fontSize: '15px', padding: '15px', borderRadius: '14px',
        border: 'none', cursor: disabled ? 'default' : 'pointer',
        boxShadow: disabled ? 'none' : '0 6px 18px rgba(250,204,21,0.35)',
      }}
    >{children}</button>
  )
}

function OutlineButton({ children, onClick, type = 'button' }: BtnProps) {
  return (
    <button
      type={type} onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'center',
        background: '#fff', color: P, fontWeight: 700, fontSize: '15px',
        padding: '14px', borderRadius: '14px', border: `1.5px solid ${P}`, cursor: 'pointer',
      }}
    >{children}</button>
  )
}

type FormState = {
  nombre_contacto: string
  cargo: string
  nombre_negocio: string
  whatsapp: string
  email: string
  ubicacion: string
  sector: string
  productos_servicios: string
  tiempo_funcionando: string
  canales_venta: CanalVenta[]
  canales_venta_otro: string
  afectaciones_relato: string
  afectaciones_tipo: AfectacionTipo[]
  afectaciones_otro: string
  apoyos: ApoyoAlma[]
  apoyo_otro: string
  ayuda_ideal: string
  herramientas: HerramientaDigital[]
  herramientas_otro: string
  actividad_redes: ActividadRedes | ''
  urgencia: Urgencia | ''
  autoriza: boolean
}

const vacio: FormState = {
  nombre_contacto: '', cargo: '', nombre_negocio: '', whatsapp: '', email: '', ubicacion: '',
  sector: '', productos_servicios: '', tiempo_funcionando: '', canales_venta: [], canales_venta_otro: '',
  afectaciones_relato: '', afectaciones_tipo: [], afectaciones_otro: '',
  apoyos: [], apoyo_otro: '', ayuda_ideal: '',
  herramientas: [], herramientas_otro: '', actividad_redes: '', urgencia: '',
  autoriza: false,
}

/* ── Chips de selección múltiple ─────────────────────────────────────── */
function ChipMultiSelect<T extends string>({ opciones, valor, onToggle }: {
  opciones: readonly T[]; valor: T[]; onToggle: (op: T) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {opciones.map(op => {
        const activo = valor.includes(op)
        return (
          <button
            key={op} type="button" onClick={() => onToggle(op)}
            style={{
              padding: '9px 14px', borderRadius: '999px',
              border: `1.5px solid ${activo ? P : '#E5E7EB'}`,
              background: activo ? P : '#fff',
              color: activo ? '#fff' : '#374151',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s ease', textAlign: 'left',
            }}
          >
            {activo ? '✓ ' : ''}{op}
          </button>
        )
      })}
    </div>
  )
}

/* ── Tarjetas de selección única (urgencia) ──────────────────────────── */
function UrgenciaSelector({ valor, onChange }: { valor: Urgencia | ''; onChange: (v: Urgencia) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {URGENCIA_OPCIONES.map(o => {
        const activo = valor === o.value
        return (
          <button
            key={o.value} type="button" onClick={() => onChange(o.value)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left',
              padding: '14px 16px', borderRadius: '14px', cursor: 'pointer',
              border: `1.5px solid ${activo ? o.color : '#E5E7EB'}`,
              background: activo ? o.bg : '#fff',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '20px', flexShrink: 0 }}>{o.icono}</span>
            <span style={{ fontSize: '13.5px', fontWeight: activo ? 700 : 500, color: activo ? '#111827' : '#4B5563', lineHeight: 1.4 }}>
              {o.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ── Selector de una sola opción, en fila ─────────────────────────────── */
function PillSelect<T extends string>({ opciones, valor, onChange }: {
  opciones: { value: T; label: string }[]; valor: T | ''; onChange: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {opciones.map(o => {
        const activo = valor === o.value
        return (
          <button
            key={o.value} type="button" onClick={() => onChange(o.value)}
            style={{
              padding: '12px 14px', borderRadius: '12px', textAlign: 'left',
              border: `1.5px solid ${activo ? P : '#E5E7EB'}`,
              background: activo ? `${P}0D` : '#fff',
              color: activo ? P : '#374151',
              fontWeight: activo ? 700 : 500, fontSize: '13.5px', cursor: 'pointer',
            }}
          >
            {activo ? '● ' : '○ '}{o.label}
          </button>
        )
      })}
    </div>
  )
}

function SeccionTitulo({ children }: { children: string }) {
  return <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: 0 }}>{children}</h2>
}

/* ── Página principal ─────────────────────────────────────────────────── */
export default function ReactivacionPage() {
  const [paso, setPaso] = useState(0) // 0 = portada, 1-5 = pasos, 6 = enviado
  const [form, setForm] = useState<FormState>(vacio)
  const [sitioWeb, setSitioWeb] = useState('') // honeypot anti-spam
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [phone, setPhone] = useState(contactoDefault.whatsapp)

  useEffect(() => {
    getContactoInfo().then(c => setPhone(c.whatsapp)).catch(() => {})
  }, [])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  // Actualización funcional: si dos chips se marcan en la misma tanda de React
  // (batching), cada toggle debe partir del estado más reciente, no del que
  // capturó el render — si no, el segundo clic pisa el efecto del primero.
  type ArrKey = 'canales_venta' | 'afectaciones_tipo' | 'apoyos' | 'herramientas'
  function toggleChip(key: ArrKey, op: string) {
    setForm(f => {
      const arr = f[key] as string[]
      const next = arr.includes(op) ? arr.filter(v => v !== op) : [...arr, op]
      return { ...f, [key]: next }
    })
  }

  const whatsappNormalizado = normalizarWhatsapp(form.whatsapp)
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())

  const paso1Valido = form.nombre_contacto.trim() && form.cargo.trim() && form.nombre_negocio.trim()
    && whatsappNormalizado.length >= 10 && emailValido && form.ubicacion.trim()
  const paso2Valido = form.sector.trim() && form.productos_servicios.trim()
    && form.tiempo_funcionando.trim() && form.canales_venta.length > 0
  const paso3Valido = form.afectaciones_relato.trim().length > 0
  const paso4Valido = form.apoyos.length > 0 && form.ayuda_ideal.trim().length > 0
  const paso5Valido = form.actividad_redes !== '' && form.urgencia !== '' && form.autoriza

  function abrirWhatsappDirecto() {
    const texto = `Hola, mi negocio ${form.nombre_negocio.trim() || ''} se vio afectado por el sismo en Manizales y necesitamos ayuda con marketing digital.`
    window.open(waLink(phone, texto), '_blank')
  }

  async function enviar() {
    if (!paso5Valido) return
    if (sitioWeb) { setPaso(6); return } // honeypot: fingir éxito sin escribir nada
    setEnviando(true)
    setError('')
    try {
      await createSolicitudReactivacion({
        nombre_contacto: form.nombre_contacto.trim(),
        cargo: form.cargo.trim(),
        nombre_negocio: form.nombre_negocio.trim(),
        whatsapp: whatsappNormalizado,
        email: form.email.trim(),
        ubicacion: form.ubicacion.trim(),
        sector: form.sector.trim(),
        productos_servicios: form.productos_servicios.trim(),
        tiempo_funcionando: form.tiempo_funcionando.trim(),
        canales_venta: form.canales_venta,
        canales_venta_otro: form.canales_venta.includes('Otros') ? form.canales_venta_otro.trim() || undefined : undefined,
        afectaciones_relato: form.afectaciones_relato.trim(),
        afectaciones_tipo: form.afectaciones_tipo,
        afectaciones_otro: form.afectaciones_tipo.includes('Otra') ? form.afectaciones_otro.trim() || undefined : undefined,
        apoyos: form.apoyos,
        apoyo_otro: form.apoyos.includes('Otro') ? form.apoyo_otro.trim() || undefined : undefined,
        ayuda_ideal: form.ayuda_ideal.trim(),
        herramientas: form.herramientas,
        herramientas_otro: form.herramientas.includes('Otra') ? form.herramientas_otro.trim() || undefined : undefined,
        actividad_redes: form.actividad_redes as ActividadRedes,
        urgencia: form.urgencia as Urgencia,
        autoriza: form.autoriza,
      })
      trackLeadSubmit('reactivacion')
      setPaso(6)
      // Notificación por correo — best-effort, no bloquea la confirmación
      fetch('/api/send-reactivacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          whatsapp: whatsappNormalizado,
          urgencia: form.urgencia,
        }),
      }).catch(() => {})
    } catch (err) {
      console.error('[ReactivacionPage] enviar:', err)
      setError('No pudimos enviar tu solicitud. Verifica tu conexión e intenta de nuevo, o escríbenos directo por WhatsApp.')
    } finally {
      setEnviando(false)
    }
  }

  /* ── Portada ─────────────────────────────────────────────────────── */
  if (paso === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
        <Helmet><title>Reactivación del comercio | Alma Agencia Creativa</title></Helmet>
        <div style={{
          background: `linear-gradient(160deg, #3B0764 0%, ${P} 55%, #9333EA 100%)`,
          padding: 'clamp(40px,8vw,64px) 24px clamp(48px,9vw,72px)',
          textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 18px', color: 'rgba(255,255,255,0.65)', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
            ALMA AGENCIA CREATIVA · MANIZALES
          </p>
          <h1 style={{
            margin: '0 0 14px', color: '#fff', fontWeight: 900, letterSpacing: '-0.5px',
            fontSize: 'clamp(24px,6vw,34px)', lineHeight: 1.2, maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto',
          }}>
            Ponemos el alma para reactivar el comercio
          </h1>
          <p style={{ margin: '0 auto 24px', color: Y, fontWeight: 700, fontSize: 'clamp(14px,3vw,17px)', maxWidth: '480px' }}>
            Conectemos tu negocio con nuevas oportunidades.
          </p>
          <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.88)', fontSize: '14.5px', lineHeight: 1.7 }}>
              Si tu negocio se vio afectado y hoy necesitas encontrar nuevas formas de comunicar, promocionar o vender tus productos o servicios, queremos escucharte.
            </p>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.88)', fontSize: '14.5px', lineHeight: 1.7 }}>
              Desde Alma Agencia Creativa ponemos nuestro conocimiento y herramientas digitales al servicio de la reactivación de los emprendimientos de nuestra ciudad.
            </p>
            <p style={{ margin: 0, color: '#fff', fontSize: '14.5px', lineHeight: 1.7, fontWeight: 700 }}>
              Cuéntanos qué está pasando y cómo podemos ayudarte.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: MAX_W, margin: '-28px auto 0', padding: '0 20px 48px', position: 'relative' }}>
          <Card style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 12px 32px rgba(59,7,100,0.18)' }}>
            <PrimaryButton onClick={() => setPaso(1)}>📝 Cuéntanos tu situación</PrimaryButton>
            <button
              onClick={abrirWhatsappDirecto}
              type="button"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '13px', borderRadius: '14px',
                background: 'rgba(37,211,102,0.1)', border: '1.5px solid rgba(37,211,102,0.3)',
                color: '#15803D', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer',
              }}
            >
              <WhatsAppIcon size={16} fill="#15803D" />
              ¿Es urgente? Escríbenos directo
            </button>
          </Card>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF', marginTop: '16px' }}>
            Toma unos 3 minutos · Tus datos solo los ve el equipo de Alma
          </p>
        </div>
      </div>
    )
  }

  /* ── Pantalla de éxito ──────────────────────────────────────────── */
  if (paso === 6) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
        <Helmet><title>¡Recibimos tu solicitud! | Alma Agencia Creativa</title></Helmet>
        <div style={{ maxWidth: MAX_W, margin: '0 auto', padding: '80px 28px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: '56px' }}>💜</div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#111827', margin: '18px 0 10px' }}>
            ¡Gracias por contarnos, {form.nombre_contacto.split(' ')[0] || ''}!
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, maxWidth: '340px', margin: '0 auto 28px' }}>
            Recibimos la información de <strong>{form.nombre_negocio}</strong>. Nuestro equipo la va a revisar
            y te va a contactar por WhatsApp o correo para ver cómo acompañarte.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <PrimaryButton onClick={abrirWhatsappDirecto}>💬 Hablar ahora por WhatsApp</PrimaryButton>
            <OutlineButton onClick={() => { setForm(vacio); setPaso(0) }}>Volver al inicio</OutlineButton>
          </div>
        </div>
      </div>
    )
  }

  /* ── Formulario por pasos ──────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Helmet><title>Cuéntanos tu situación | Alma Agencia Creativa</title></Helmet>
      <div style={{ maxWidth: MAX_W, margin: '0 auto' }}>
        <TopBar
          title="Reactivación del comercio"
          onBack={() => setPaso(p => p - 1)}
        />
        <Stepper step={paso} labels={PASOS} />

        <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* honeypot: invisible para personas, visible para bots */}
          <input
            type="text" value={sitioWeb} onChange={e => setSitioWeb(e.target.value)}
            name="sitio_web" autoComplete="off" tabIndex={-1} aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
          />

          {paso === 1 && (
            <>
              <SeccionTitulo>Datos de contacto</SeccionTitulo>
              <div><FieldLabel>Nombre completo de la persona a cargo</FieldLabel>
                <TextInput value={form.nombre_contacto} onChange={e => set('nombre_contacto', e.target.value)} placeholder="Tu nombre completo" /></div>
              <div><FieldLabel>Cargo o rol dentro de la empresa</FieldLabel>
                <TextInput value={form.cargo} onChange={e => set('cargo', e.target.value)} placeholder="Ej: Propietario, Gerente…" /></div>
              <div><FieldLabel>Nombre de la marca o negocio</FieldLabel>
                <TextInput value={form.nombre_negocio} onChange={e => set('nombre_negocio', e.target.value)} placeholder="Nombre de tu negocio" /></div>
              <div><FieldLabel>Número de WhatsApp</FieldLabel>
                <TextInput value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="Ej: 312 345 6789" inputMode="tel" /></div>
              <div><FieldLabel>Correo electrónico</FieldLabel>
                <TextInput type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tu@correo.com" /></div>
              <div><FieldLabel>Ciudad / barrio o zona donde opera el negocio</FieldLabel>
                <TextInput value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)} placeholder="Ej: Manizales, La Enea" /></div>
              <PrimaryButton disabled={!paso1Valido} onClick={() => paso1Valido && setPaso(2)}>Continuar</PrimaryButton>
            </>
          )}

          {paso === 2 && (
            <>
              <SeccionTitulo>Información del negocio</SeccionTitulo>
              <div><FieldLabel>Sector o actividad económica</FieldLabel>
                <TextInput value={form.sector} onChange={e => set('sector', e.target.value)} placeholder="Ej: Restaurante, ropa, ferretería…" /></div>
              <div><FieldLabel>¿Qué productos o servicios ofrece?</FieldLabel>
                <TextArea value={form.productos_servicios} onChange={e => set('productos_servicios', e.target.value)} placeholder="Cuéntanos brevemente" /></div>
              <div><FieldLabel>¿Cuánto tiempo lleva funcionando el negocio?</FieldLabel>
                <TextInput value={form.tiempo_funcionando} onChange={e => set('tiempo_funcionando', e.target.value)} placeholder="Ej: 3 años" /></div>
              <div>
                <FieldLabel>¿Dónde comercializaba principalmente?</FieldLabel>
                <ChipMultiSelect opciones={CANALES_VENTA} valor={form.canales_venta} onToggle={op => toggleChip('canales_venta', op)} />
                {form.canales_venta.includes('Otros') && (
                  <div style={{ marginTop: '8px' }}>
                    <TextInput value={form.canales_venta_otro} onChange={e => set('canales_venta_otro', e.target.value)} placeholder="¿Dónde más?" />
                  </div>
                )}
              </div>
              <PrimaryButton disabled={!paso2Valido} onClick={() => paso2Valido && setPaso(3)}>Continuar</PrimaryButton>
            </>
          )}

          {paso === 3 && (
            <>
              <SeccionTitulo>¿Qué está pasando?</SeccionTitulo>
              <div><FieldLabel>Cuéntanos brevemente qué afectaciones o dificultades está atravesando tu negocio a raíz de la situación actual</FieldLabel>
                <TextArea value={form.afectaciones_relato} onChange={e => set('afectaciones_relato', e.target.value)} placeholder="Cuéntanos con tus palabras" style={{ minHeight: '110px' }} /></div>
              <div>
                <FieldLabel>Marca lo que aplique (opcional)</FieldLabel>
                <ChipMultiSelect opciones={AFECTACIONES_TIPO} valor={form.afectaciones_tipo} onToggle={op => toggleChip('afectaciones_tipo', op)} />
                {form.afectaciones_tipo.includes('Otra') && (
                  <div style={{ marginTop: '8px' }}>
                    <TextInput value={form.afectaciones_otro} onChange={e => set('afectaciones_otro', e.target.value)} placeholder="Cuéntanos cuál" />
                  </div>
                )}
              </div>
              <PrimaryButton disabled={!paso3Valido} onClick={() => paso3Valido && setPaso(4)}>Continuar</PrimaryButton>
            </>
          )}

          {paso === 4 && (
            <>
              <SeccionTitulo>¿Cómo podemos ayudarte desde Alma?</SeccionTitulo>
              <div>
                <FieldLabel>Selecciona los apoyos que consideras que podrían ser útiles para tu negocio</FieldLabel>
                <ChipMultiSelect opciones={APOYOS_ALMA} valor={form.apoyos} onToggle={op => toggleChip('apoyos', op)} />
                {form.apoyos.includes('Otro') && (
                  <div style={{ marginTop: '8px' }}>
                    <TextInput value={form.apoyo_otro} onChange={e => set('apoyo_otro', e.target.value)} placeholder="Cuéntanos cuál" />
                  </div>
                )}
              </div>
              <div><FieldLabel>Si pudieras recibir una ayuda concreta para que tu negocio vuelva a vender, ¿cuál sería?</FieldLabel>
                <TextArea value={form.ayuda_ideal} onChange={e => set('ayuda_ideal', e.target.value)} placeholder="La respuesta que más nos interesa" style={{ minHeight: '110px' }} /></div>
              <PrimaryButton disabled={!paso4Valido} onClick={() => paso4Valido && setPaso(5)}>Continuar</PrimaryButton>
            </>
          )}

          {paso === 5 && (
            <>
              <SeccionTitulo>Capacidad digital actual</SeccionTitulo>
              <div>
                <FieldLabel>¿Con cuáles de estas herramientas cuenta actualmente tu negocio?</FieldLabel>
                <ChipMultiSelect opciones={HERRAMIENTAS_DIGITALES} valor={form.herramientas} onToggle={op => toggleChip('herramientas', op)} />
                {form.herramientas.includes('Otra') && (
                  <div style={{ marginTop: '8px' }}>
                    <TextInput value={form.herramientas_otro} onChange={e => set('herramientas_otro', e.target.value)} placeholder="¿Cuál otra?" />
                  </div>
                )}
              </div>
              <div><FieldLabel>¿Qué tan activo está actualmente tu negocio en redes sociales?</FieldLabel>
                <PillSelect opciones={ACTIVIDAD_REDES_OPCIONES} valor={form.actividad_redes} onChange={v => set('actividad_redes', v)} /></div>

              <SeccionTitulo>Nivel de urgencia</SeccionTitulo>
              <div><FieldLabel>¿Qué tan urgente consideras que es recibir este acompañamiento?</FieldLabel>
                <UrgenciaSelector valor={form.urgencia} onChange={v => set('urgencia', v)} /></div>

              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '12.5px', color: '#6B7280', lineHeight: 1.5 }}>
                <input type="checkbox" checked={form.autoriza} onChange={e => set('autoriza', e.target.checked)} style={{ marginTop: '3px' }} />
                Autorizo a Alma Agencia Creativa a utilizar los datos suministrados en este formulario exclusivamente para
                contactarme y evaluar las posibilidades de acompañamiento dentro de esta iniciativa de apoyo a
                emprendimientos afectados.
              </label>

              {error && <p style={{ color: '#DC2626', fontSize: '13px', margin: 0 }}>{error}</p>}

              <PrimaryButton disabled={!paso5Valido || enviando} onClick={enviar}>
                {enviando ? 'Enviando…' : 'Enviar solicitud de apoyo'}
              </PrimaryButton>
              <OutlineButton onClick={() => setPaso(4)}>Atrás</OutlineButton>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
