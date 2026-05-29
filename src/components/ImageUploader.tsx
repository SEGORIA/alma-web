import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { uploadImage, storageReady } from '../lib/storage'

interface Props {
  currentUrl?: string
  onUploaded: (url: string) => void
  label?: string
  height?: number
}

type Tab = 'url' | 'upload'

/* ── Constantes del recortador ─────────────────────────────── */
const CROP_D  = 260   // diámetro del círculo de recorte en pantalla (px)
const OUT_PX  = 500   // tamaño de la imagen de salida (px)

/* ══ CropModal ═══════════════════════════════════════════════ */
function CropModal({
  src,
  onConfirm,
  onCancel,
}: {
  src: string
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}) {
  const [zoom,    setZoom]    = useState(1)
  const [pos,     setPos]     = useState({ x: 0, y: 0 })
  const [drag,    setDrag]    = useState(false)
  const [dStart,  setDStart]  = useState({ x: 0, y: 0 })
  const [natSize, setNatSize] = useState({ w: 1, h: 1 })
  const [minZoom, setMinZoom] = useState(1)
  const [loading, setLoading] = useState(false)
  const pinchStartRef = useRef<number | null>(null)
  const zoomRef       = useRef(zoom)
  zoomRef.current     = zoom

  /* ── Carga de imagen ─── */
  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const mz  = Math.max(CROP_D / img.naturalWidth, CROP_D / img.naturalHeight)
    const sw  = img.naturalWidth  * mz
    const sh  = img.naturalHeight * mz
    setMinZoom(mz)
    setZoom(mz)
    setNatSize({ w: img.naturalWidth, h: img.naturalHeight })
    setPos({ x: -(sw - CROP_D) / 2, y: -(sh - CROP_D) / 2 })
  }

  /* ── Clamp posición ─── */
  const clamp = useCallback((p: { x: number; y: number }, z: number) => ({
    x: Math.min(0, Math.max(CROP_D - natSize.w * z, p.x)),
    y: Math.min(0, Math.max(CROP_D - natSize.h * z, p.y)),
  }), [natSize])

  /* ── Mouse ─── */
  const onMouseDown = (e: React.MouseEvent) => {
    setDrag(true)
    setDStart({ x: e.clientX - pos.x, y: e.clientY - pos.y })
    e.preventDefault()
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag) return
    setPos(clamp({ x: e.clientX - dStart.x, y: e.clientY - dStart.y }, zoom))
  }
  const onMouseUp = () => setDrag(false)

  /* ── Touch (arrastre + pellizco para zoom) ─── */
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Inicio de pellizco: guardamos la distancia inicial
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchStartRef.current = Math.sqrt(dx * dx + dy * dy)
      setDrag(false)
    } else {
      pinchStartRef.current = null
      const t = e.touches[0]
      setDrag(true)
      setDStart({ x: t.clientX - pos.x, y: t.clientY - pos.y })
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 2 && pinchStartRef.current !== null) {
      // Pellizco → zoom
      const dx   = e.touches[0].clientX - e.touches[1].clientX
      const dy   = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const ratio    = dist / pinchStartRef.current
      const newZoom  = Math.min(Math.max(zoomRef.current * ratio, minZoom), minZoom * 3)
      pinchStartRef.current = dist
      setZoom(newZoom)
      setPos(p => clamp(p, newZoom))
    } else if (drag && e.touches.length === 1) {
      const t = e.touches[0]
      setPos(clamp({ x: t.clientX - dStart.x, y: t.clientY - dStart.y }, zoom))
    }
  }

  const onTouchEnd = () => {
    setDrag(false)
    pinchStartRef.current = null
  }

  /* ── Zoom ─── */
  const onZoomChange = (z: number) => {
    setZoom(z)
    setPos(p => clamp(p, z))
  }

  /* ── Confirmar recorte ─── */
  const handleConfirm = () => {
    setLoading(true)
    const canvas  = document.createElement('canvas')
    canvas.width  = OUT_PX
    canvas.height = OUT_PX
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const cropX  = -pos.x  / zoom
      const cropY  = -pos.y  / zoom
      const cropSz = CROP_D  / zoom
      // Recorte circular suavizado
      ctx.beginPath()
      ctx.arc(OUT_PX / 2, OUT_PX / 2, OUT_PX / 2, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(img, cropX, cropY, cropSz, cropSz, 0, 0, OUT_PX, OUT_PX)
      canvas.toBlob(blob => {
        if (blob) onConfirm(blob)
        setLoading(false)
      }, 'image/png', 0.95)
    }
    img.src = src
  }

  /* Porcentaje de zoom para mostrar (0–100) */
  const zoomPct = minZoom > 0
    ? Math.round(((zoom - minZoom) / (minZoom * 2)) * 100)
    : 0

  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#111827',
        borderRadius: '24px',
        padding: '28px 24px',
        width: '100%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', gap: '20px',
        boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)',
      }}>
        {/* Título */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(107,33,168,0.2)', borderRadius: '20px',
            padding: '4px 14px', marginBottom: '10px',
          }}>
            <span style={{ fontSize: '14px' }}>✂️</span>
            <span style={{ color: '#A855F7', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>
              RECORTAR FOTO
            </span>
          </div>
          <h3 style={{ color: '#fff', fontSize: '17px', fontWeight: 800, margin: '0 0 4px' }}>
            Ajusta tu foto de perfil
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
            Arrastra · Pellizca para zoom en móvil · Usa el slider en escritorio
          </p>
        </div>

        {/* Área de recorte */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          {/* Contenedor con sombra tipo "spotlight" */}
          <div style={{ position: 'relative' }}>
            <div
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={{
                width: CROP_D, height: CROP_D,
                borderRadius: '50%',
                overflow: 'hidden',
                cursor: drag ? 'grabbing' : 'grab',
                userSelect: 'none',
                touchAction: 'none',
                position: 'relative',
                background: '#000',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.6), 0 0 0 2px #7C3AED, 0 0 0 5px rgba(124,58,237,0.25)',
              }}
            >
              <img
                src={src}
                onLoad={onLoad}
                draggable={false}
                alt="recorte"
                style={{
                  position: 'absolute',
                  width: `${natSize.w * zoom}px`,
                  height: `${natSize.h * zoom}px`,
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  transition: drag ? 'none' : 'width 0.05s, height 0.05s',
                }}
              />
              {/* Overlay de guía — líneas cruzadas sutiles */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                borderRadius: '50%', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '33%', left: 0, right: 0,
                  height: '1px', background: 'rgba(255,255,255,0.12)',
                }} />
                <div style={{
                  position: 'absolute',
                  top: '66%', left: 0, right: 0,
                  height: '1px', background: 'rgba(255,255,255,0.12)',
                }} />
                <div style={{
                  position: 'absolute',
                  left: '33%', top: 0, bottom: 0,
                  width: '1px', background: 'rgba(255,255,255,0.12)',
                }} />
                <div style={{
                  position: 'absolute',
                  left: '66%', top: 0, bottom: 0,
                  width: '1px', background: 'rgba(255,255,255,0.12)',
                }} />
              </div>
            </div>
          </div>

          {/* Mini-preview circular de cómo quedará */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)',
              background: '#000', flexShrink: 0,
              position: 'relative',
            }}>
              <img
                src={src}
                draggable={false}
                alt="preview"
                style={{
                  position: 'absolute',
                  width: `${(natSize.w * zoom) * (42 / CROP_D)}px`,
                  height: `${(natSize.h * zoom) * (42 / CROP_D)}px`,
                  left: `${pos.x * (42 / CROP_D)}px`,
                  top: `${pos.y * (42 / CROP_D)}px`,
                  pointerEvents: 'none',
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.4 }}>
              Vista previa<br />circular
            </p>
          </div>
        </div>

        {/* Zoom slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>ZOOM</span>
            <span style={{ fontSize: '12px', color: '#A855F7', fontWeight: 700 }}>{zoomPct}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => onZoomChange(Math.max(minZoom, zoom - minZoom * 0.1))}
              style={{
                width: '28px', height: '28px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.6)', fontSize: '16px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, lineHeight: 1,
              }}
            >−</button>
            <input
              type="range"
              min={minZoom}
              max={minZoom * 3}
              step={0.001}
              value={zoom}
              onChange={e => onZoomChange(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: '#7C3AED', cursor: 'pointer', height: '4px' }}
            />
            <button
              onClick={() => onZoomChange(Math.min(minZoom * 3, zoom + minZoom * 0.1))}
              style={{
                width: '28px', height: '28px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.6)', fontSize: '16px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, lineHeight: 1,
              }}
            >+</button>
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1, padding: '13px', borderRadius: '14px',
              border: '1.5px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              flex: 2, padding: '13px', borderRadius: '14px',
              border: 'none',
              background: loading
                ? 'rgba(107,33,168,0.4)'
                : 'linear-gradient(135deg,#6B21A8,#9333EA)',
              color: '#fff',
              fontWeight: 700, fontSize: '14px',
              cursor: loading ? 'wait' : 'pointer',
              transition: 'opacity 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {loading
              ? <><span style={{ fontSize: '16px', animation: 'spin 1s linear infinite' }}>⏳</span> Procesando…</>
              : '✓ Usar esta foto'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ══ ImageUploader ═══════════════════════════════════════════ */
export default function ImageUploader({
  currentUrl,
  onUploaded,
  label,
  height = 200,
}: Props) {
  const [tab,       setTab]       = useState<Tab>('url')
  const [urlInput,  setUrlInput]  = useState(currentUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [error,     setError]     = useState<string | null>(null)
  const [dragging,  setDragging]  = useState(false)
  const [cropSrc,   setCropSrc]   = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* ── URL tab ──────────────────────────────────────────────── */
  const handleUrlSave = () => {
    const v = urlInput.trim()
    if (!v) { onUploaded(''); return }
    if (!v.startsWith('http')) { setError('Escribe una URL válida que empiece con http…'); return }
    setError(null)
    onUploaded(v)
  }

  /* ── Subida real a Cloudinary ────────────────────────────── */
  const doUpload = async (file: File | Blob) => {
    const f = file instanceof Blob && !(file instanceof File)
      ? new File([file], 'foto-perfil.jpg', { type: 'image/jpeg' })
      : file as File

    setError(null)
    setUploading(true)
    setProgress(0)
    try {
      const url = await uploadImage(f, pct => setProgress(pct))
      onUploaded(url)
      setUrlInput(url)
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  /* ── Selección de archivo → abrir recortador ─────────────── */
  const openCrop = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes (PNG, JPG, WebP…)')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('La imagen no puede pesar más de 8 MB')
      return
    }
    setError(null)
    const url = URL.createObjectURL(file)
    setCropSrc(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) openCrop(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) openCrop(file)
  }

  /* ── Confirmar/cancelar recorte ──────────────────────────── */
  const handleCropConfirm = (blob: Blob) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    doUpload(blob)
  }

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  /* ── Estilos ─────────────────────────────────────────────── */
  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '8px', fontSize: '13px', fontWeight: 600,
    border: 'none', cursor: 'pointer', borderRadius: '8px',
    background: active ? '#6B21A8' : 'transparent',
    color: active ? '#fff' : '#6B7280',
    transition: 'all 0.15s ease',
  })

  return (
    <>
      {/* Modal de recorte */}
      {cropSrc && (
        <CropModal
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {label && (
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{label}</label>
        )}

        {/* Vista previa actual */}
        {currentUrl && (
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
            <img
              src={currentUrl}
              alt="preview"
              style={{ width: '100%', height: `${height}px`, objectFit: 'cover', display: 'block' }}
            />
            <button
              onClick={() => { onUploaded(''); setUrlInput('') }}
              title="Quitar imagen"
              style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none',
                width: '28px', height: '28px', borderRadius: '50%',
                cursor: 'pointer', fontSize: '16px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', padding: '4px',
          background: '#F3F4F6', borderRadius: '10px',
        }}>
          <button style={tabBtn(tab === 'url')}    onClick={() => { setTab('url');    setError(null) }}>🔗 Pegar URL</button>
          <button style={tabBtn(tab === 'upload')} onClick={() => { setTab('upload'); setError(null) }}>⬆️ Subir archivo</button>
        </div>

        {/* ── Tab URL ─────────────────────────────────────────── */}
        {tab === 'url' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
              Sube la imagen a <strong>Imgur</strong>, <strong>Google Fotos</strong> u otro servicio y pega el enlace directo aquí.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUrlSave()}
                placeholder="https://i.imgur.com/ejemplo.jpg"
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: '8px',
                  border: '1.5px solid #E5E7EB', fontSize: '13px',
                  outline: 'none', fontFamily: 'monospace',
                }}
              />
              <button
                onClick={handleUrlSave}
                style={{
                  padding: '9px 16px', borderRadius: '8px',
                  background: '#6B21A8', color: '#fff', border: 'none',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                ✓ Usar
              </button>
            </div>
          </div>
        )}

        {/* ── Tab Subir ───────────────────────────────────────── */}
        {tab === 'upload' && (
          storageReady ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && inputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? '#6B21A8' : '#D1D5DB'}`,
                borderRadius: '12px', padding: '24px 16px', textAlign: 'center',
                cursor: uploading ? 'not-allowed' : 'pointer',
                background: dragging ? 'rgba(107,33,168,0.04)' : '#F9FAFB',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                ref={inputRef} type="file" accept="image/*"
                onChange={handleFileChange} style={{ display: 'none' }}
              />
              {uploading ? (
                <div>
                  <div style={{
                    width: '100%', height: '6px', background: '#E5E7EB',
                    borderRadius: '3px', marginBottom: '10px', overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${progress}%`, height: '100%',
                      background: 'linear-gradient(90deg, #6B21A8, #9333EA)',
                      borderRadius: '3px', transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                    Subiendo… {Math.round(progress)}%
                  </p>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>🖼️</span>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 4px' }}>
                    Haz clic o arrastra una imagen aquí
                  </p>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 6px' }}>
                    PNG, JPG, WebP · Máx. 8 MB
                  </p>
                  <p style={{ fontSize: '12px', color: '#6B21A8', fontWeight: 600, margin: 0 }}>
                    ✂️ Podrás recortar la foto antes de subirla
                  </p>
                </>
              )}
            </div>
          ) : (
            <div style={{
              background: '#F0F9FF', border: '1px solid #BAE6FD',
              borderRadius: '12px', padding: '16px',
            }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0369A1', marginBottom: '8px' }}>
                ⚙️ Configura Cloudinary para subir archivos directo
              </p>
              <ol style={{ fontSize: '12px', color: '#374151', lineHeight: 1.8, paddingLeft: '16px', margin: '0 0 10px' }}>
                <li>Crea cuenta gratis en <strong>cloudinary.com</strong> (sin tarjeta)</li>
                <li>En el dashboard copia tu <strong>Cloud name</strong></li>
                <li>Settings → Upload → Add upload preset → Unsigned → guarda el nombre</li>
                <li>En Vercel agrega las variables:<br />
                  <code style={{ background: '#E0F2FE', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>VITE_CLOUDINARY_CLOUD_NAME</code><br />
                  <code style={{ background: '#E0F2FE', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>VITE_CLOUDINARY_UPLOAD_PRESET</code>
                </li>
              </ol>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                Mientras tanto usa la pestaña <strong>Pegar URL</strong>.
              </p>
            </div>
          )
        )}

        {error && (
          <p style={{ fontSize: '12px', color: '#EF4444', margin: 0 }}>⚠️ {error}</p>
        )}
      </div>
    </>
  )
}
