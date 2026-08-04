import { useState, useEffect, useRef } from 'react'
import { P } from '../../tokens'

/* ══════════════════════════════════════════════════════════════
   Sistema de feedback del panel admin — reemplaza alert()/confirm()
   nativos por toasts y modal de confirmación con el estilo de Alma.

   Uso (desde cualquier página admin, sin hooks):
     import { toast, confirmar } from '../../components/admin/Feedback'
     toast.ok('Guardado correctamente')
     toast.err('No se pudo guardar: ' + err)
     if (!(await confirmar('¿Eliminar este artículo?'))) return

   <FeedbackHost/> se monta una sola vez dentro de AdminLayout.
══════════════════════════════════════════════════════════════ */

type ToastKind = 'ok' | 'err' | 'info'
type ToastItem = { id: number; kind: ToastKind; msg: string; leaving?: boolean }

export type ConfirmOpts = {
  titulo?:   string
  mensaje:   string
  /** Texto del botón de acción. Default: "Confirmar" */
  accion?:   string
  /** Botón de acción en rojo (acciones destructivas). Default: true */
  peligro?:  boolean
}

/* ── Registro singleton (lo conecta FeedbackHost al montarse) ── */
let _push:    ((kind: ToastKind, msg: string) => void) | null = null
let _confirm: ((opts: ConfirmOpts) => Promise<boolean>) | null = null

// El registro singleton vive junto a su Host a propósito: separarlo obligaría a
// tocar el import de ~20 páginas admin por una regla que solo afecta al HMR en
// desarrollo.
// eslint-disable-next-line react-refresh/only-export-components
export const toast = {
  ok:   (msg: string) => { if (_push) _push('ok', msg);   else window.alert(msg) },
  err:  (msg: string) => { if (_push) _push('err', msg);  else window.alert(msg) },
  info: (msg: string) => { if (_push) _push('info', msg); else window.alert(msg) },
}

// eslint-disable-next-line react-refresh/only-export-components -- ver nota en `toast`
export function confirmar(opts: string | ConfirmOpts): Promise<boolean> {
  const o = typeof opts === 'string' ? { mensaje: opts } : opts
  return _confirm ? _confirm(o) : Promise.resolve(window.confirm(o.mensaje))
}

/* ── Estilos por tipo de toast ── */
const TOAST_META: Record<ToastKind, { icon: string; accent: string; bg: string }> = {
  ok:   { icon: '✓', accent: '#4ADE80', bg: 'rgba(74,222,128,0.12)'  },
  err:  { icon: '✕', accent: '#F87171', bg: 'rgba(248,113,113,0.12)' },
  info: { icon: 'ℹ', accent: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
}

/* ── Host: toasts apilados + modal de confirmación ── */
export function FeedbackHost() {
  const [toasts, setToasts]   = useState<ToastItem[]>([])
  const [confirm, setConfirm] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null)
  const idRef = useRef(0)

  useEffect(() => {
    _push = (kind, msg) => {
      const id = ++idRef.current
      setToasts(t => [...t.slice(-3), { id, kind, msg }])
      // marcar salida → quitar (la animación dura 200ms)
      setTimeout(() => setToasts(t => t.map(x => x.id === id ? { ...x, leaving: true } : x)), 3800)
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
    }
    _confirm = opts => new Promise<boolean>(resolve => setConfirm({ ...opts, resolve }))
    return () => { _push = null; _confirm = null }
  }, [])

  const close = (v: boolean) => {
    confirm?.resolve(v)
    setConfirm(null)
  }

  return (
    <>
      <style>{`
        @keyframes fbToastIn  { from { opacity:0; transform:translateY(10px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes fbToastOut { from { opacity:1 } to { opacity:0; transform:translateY(6px) } }
        @keyframes fbModalIn  { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }
        @keyframes fbOverlayIn{ from { opacity:0 } to { opacity:1 } }
      `}</style>

      {/* ── Toasts (abajo a la derecha) ── */}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
          display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: 'min(380px, calc(100vw - 40px))',
        }}>
          {toasts.map(t => {
            const m = TOAST_META[t.kind]
            return (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                background: '#15101F', border: '1px solid rgba(255,255,255,0.10)',
                borderLeft: `3px solid ${m.accent}`,
                borderRadius: '12px', padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                animation: t.leaving ? 'fbToastOut 0.2s ease forwards' : 'fbToastIn 0.25s ease',
              }}>
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                  background: m.bg, color: m.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 900, marginTop: '1px',
                }}>{m.icon}</span>
                <p style={{ margin: 0, fontSize: '13px', color: '#E5E1F0', lineHeight: 1.45, fontWeight: 500, wordBreak: 'break-word' }}>
                  {t.msg}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal de confirmación ── */}
      {confirm && (
        <div
          onClick={() => close(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(8,4,18,0.62)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            animation: 'fbOverlayIn 0.15s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '18px', padding: '26px 26px 22px',
              width: '100%', maxWidth: '400px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
              animation: 'fbModalIn 0.18s ease',
            }}
          >
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px', marginBottom: '14px',
              background: confirm.peligro !== false ? 'rgba(239,68,68,0.10)' : `${P}12`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            }}>
              {confirm.peligro !== false ? '🗑️' : '❓'}
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#111827' }}>
              {confirm.titulo ?? (confirm.peligro !== false ? '¿Eliminar?' : 'Confirmar')}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: '#6B7280', lineHeight: 1.55 }}>
              {confirm.mensaje}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => close(false)}
                autoFocus
                style={{
                  padding: '9px 18px', borderRadius: '10px',
                  border: '1px solid #E5E7EB', background: '#fff', color: '#374151',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => close(true)}
                style={{
                  padding: '9px 18px', borderRadius: '10px', border: 'none',
                  background: confirm.peligro !== false ? '#DC2626' : P,
                  color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                }}
              >
                {confirm.accion ?? (confirm.peligro !== false ? 'Eliminar' : 'Confirmar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
