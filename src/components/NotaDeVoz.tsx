import { useEffect, useRef, useState } from 'react'
import { uploadAudio, storageReady } from '../lib/storage'

/* ══════════════════════════════════════════════════════════════
   Nota de voz del brief: graba desde el navegador, transcribe en
   vivo y sube el audio a Cloudinary.

   La transcripción usa la Web Speech API del propio navegador — no
   hay servicio externo, llave ni costo. A cambio no está en todos
   lados (hoy: Chrome y Edge en Android/escritorio, Safari en iOS;
   Firefox no la trae). Por eso el audio se graba y se guarda SIEMPRE,
   y la transcripción es un extra: si no hay soporte se avisa y el
   equipo escucha la grabación desde el admin.
══════════════════════════════════════════════════════════════ */

/* La Web Speech API no está en los tipos de TS (es de borrador), así
   que se declara la superficie mínima que se usa aquí. */
type SpeechResultEvent = {
  resultIndex: number
  results: {
    length: number
    [i: number]: { isFinal: boolean; 0: { transcript: string } }
  }
}
type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((e: SpeechResultEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

const fmtDur = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export type NotaDeVozValue = {
  url:           string
  transcripcion: string
  duracion:      number
}

export default function NotaDeVoz({ value, onChange, accent = '#6E2DFF' }: {
  value?:   NotaDeVozValue | null
  onChange: (v: NotaDeVozValue | null) => void
  accent?:  string
}) {
  const [grabando,  setGrabando]  = useState(false)
  const [subiendo,  setSubiendo]  = useState(false)
  const [progreso,  setProgreso]  = useState(0)
  const [segundos,  setSegundos]  = useState(0)
  const [texto,     setTexto]     = useState('')
  const [parcial,   setParcial]   = useState('')
  const [error,     setError]     = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef   = useRef<Blob[]>([])
  const speechRef   = useRef<SpeechRecognitionLike | null>(null)
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const textoRef    = useRef('')

  const soportaTranscripcion = typeof window !== 'undefined' && !!getSpeechRecognition()

  // Al desmontar: cortar grabación, reconocimiento y cronómetro para no
  // dejar el micrófono abierto si el usuario navega a otra parte.
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
    try { speechRef.current?.stop() } catch { /* ya estaba detenido */ }
    recorderRef.current?.stream.getTracks().forEach(t => t.stop())
  }, [])

  async function iniciar() {
    setError(null)
    if (!storageReady) { setError('La subida de archivos no está configurada.'); return }

    // getUserMedia solo existe en contexto seguro (HTTPS o localhost). Abrir el
    // dev server por IP de red — http://192.168.x.x:5173 — lo deja undefined.
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(window.isSecureContext
        ? 'Este navegador no permite grabar audio. Prueba con Chrome o Safari.'
        : 'Para grabar audio la página debe abrirse por HTTPS (o localhost).')
      return
    }

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      const name = err instanceof Error ? err.name : ''
      if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setError('No se detectó ningún micrófono conectado.')
      } else if (name === 'NotReadableError') {
        setError('El micrófono está siendo usado por otra aplicación. Ciérrala e intenta de nuevo.')
      } else if (name === 'NotAllowedError') {
        // Chrome lanza NotAllowedError tanto si el usuario negó el permiso como si
        // una cabecera Permissions-Policy bloquea el micrófono para todo el sitio.
        // El segundo caso es invisible en la configuración del navegador (aparece
        // como "permitido") y sin esta pista es muy difícil de diagnosticar.
        const bloqueadoPorPolitica =
          typeof document !== 'undefined' &&
          (document as unknown as { featurePolicy?: { allowsFeature: (f: string) => boolean } })
            .featurePolicy?.allowsFeature('microphone') === false
        setError(bloqueadoPorPolitica
          ? 'El sitio tiene el micrófono bloqueado por su política de permisos (Permissions-Policy). No es un problema de tu navegador — avísale al equipo de Alma.'
          : 'Permiso de micrófono denegado. Ábrelo en el candado 🔒 de la barra de direcciones y recarga.')
      } else {
        setError('No se pudo acceder al micrófono.')
      }
      return
    }

    chunksRef.current = []
    textoRef.current  = ''
    setTexto(''); setParcial(''); setSegundos(0)

    const rec = new MediaRecorder(stream)
    recorderRef.current = rec
    rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    rec.onstop = () => {
      stream.getTracks().forEach(t => t.stop())
      void subir(new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' }))
    }
    rec.start()

    // Transcripción en vivo (si el navegador la trae)
    const Ctor = getSpeechRecognition()
    if (Ctor) {
      const sr = new Ctor()
      sr.lang = 'es-CO'
      sr.continuous = true
      sr.interimResults = true
      sr.onresult = e => {
        let interim = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i]
          if (r.isFinal) textoRef.current += r[0].transcript
          else interim += r[0].transcript
        }
        setTexto(textoRef.current)
        setParcial(interim)
      }
      // 'no-speech' y 'aborted' son normales (silencios, corte manual): no son fallas.
      sr.onerror = ev => {
        if (ev.error !== 'no-speech' && ev.error !== 'aborted') {
          setError('La transcripción automática falló, pero el audio sí se está grabando.')
        }
      }
      // Chrome corta el reconocimiento solo tras un silencio largo; se reanuda
      // mientras la grabación siga activa.
      sr.onend = () => { if (recorderRef.current?.state === 'recording') { try { sr.start() } catch { /* carrera al reiniciar */ } } }
      speechRef.current = sr
      try { sr.start() } catch { /* ya iniciado */ }
    }

    timerRef.current = setInterval(() => setSegundos(s => s + 1), 1000)
    setGrabando(true)
  }

  function detener() {
    setGrabando(false)
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    try { speechRef.current?.stop() } catch { /* ya detenido */ }
    speechRef.current = null
    setParcial('')
    recorderRef.current?.stop()
  }

  async function subir(blob: Blob) {
    setSubiendo(true); setProgreso(0)
    try {
      const url = await uploadAudio(blob, setProgreso)
      onChange({ url, transcripcion: textoRef.current.trim(), duracion: segundos })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el audio.')
    } finally {
      setSubiendo(false)
    }
  }

  function borrar() {
    onChange(null)
    textoRef.current = ''
    setTexto(''); setParcial(''); setSegundos(0); setError(null)
  }

  const cajaStyle: React.CSSProperties = {
    background: 'rgba(42,42,51,0.6)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '18px',
    backdropFilter: 'blur(8px)',
  }

  /* ── Ya hay una nota grabada ── */
  if (value) {
    return (
      <div style={cajaStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: value.transcripcion ? '14px' : 0 }}>
          <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>
            🎙️ Nota de voz grabada
          </span>
          <span style={{ fontSize: '12px', color: '#A0A0B0' }}>{fmtDur(value.duracion)}</span>
          <button
            type="button" onClick={borrar}
            style={{
              marginLeft: 'auto', background: 'none', border: '1px solid rgba(255,255,255,0.14)',
              color: '#A0A0B0', borderRadius: '100px', padding: '5px 14px',
              fontSize: '11px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Grabar otra
          </button>
        </div>
        <audio src={value.url} controls style={{ width: '100%', marginBottom: value.transcripcion ? '12px' : 0 }} />
        {value.transcripcion && (
          <div>
            <p style={{ margin: '0 0 6px', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A0A0B0' }}>
              Transcripción
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {value.transcripcion}
            </p>
          </div>
        )}
      </div>
    )
  }

  /* ── Grabando / subiendo / inactivo ── */
  return (
    <div style={cajaStyle}>
      {subiendo ? (
        <div>
          <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#fff' }}>
            Subiendo la nota de voz… {Math.round(progreso)}%
          </p>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progreso}%`, background: accent, transition: 'width 0.2s' }} />
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={grabando ? detener : iniciar}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '9px',
                background: grabando ? 'rgba(255,77,141,0.16)' : 'rgba(110,45,255,0.18)',
                border: `1px solid ${grabando ? '#FF4D8D' : accent}`,
                borderRadius: '100px', padding: '11px 22px',
                fontSize: '13px', color: '#fff', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
              }}
            >
              {grabando ? '⏹ Detener' : '🎙️ Grabar nota de voz'}
            </button>
            {grabando && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#FF4D8D' }}>
                <span style={{
                  width: '9px', height: '9px', borderRadius: '50%', background: '#FF4D8D',
                  animation: 'nvPulse 1.1s ease-in-out infinite',
                }} />
                {fmtDur(segundos)}
              </span>
            )}
          </div>

          <style>{'@keyframes nvPulse { 0%,100% { opacity:1 } 50% { opacity:0.25 } }'}</style>

          {grabando && (texto || parcial) && (
            <p style={{ margin: '14px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
              {texto}
              <span style={{ color: '#A0A0B0' }}>{parcial}</span>
            </p>
          )}

          {!grabando && (
            <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#A0A0B0', lineHeight: 1.6 }}>
              {soportaTranscripcion
                ? 'Cuéntanos con tus palabras qué quieres lograr. Se transcribe sola mientras hablas.'
                : 'Cuéntanos con tus palabras qué quieres lograr. Tu navegador no transcribe automáticamente, pero el equipo escuchará la grabación.'}
            </p>
          )}
        </>
      )}

      {error && (
        <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#FF4D8D', lineHeight: 1.5 }}>
          {error}
        </p>
      )}
    </div>
  )
}
