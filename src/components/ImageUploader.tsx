import { useState, useRef, useCallback } from 'react'
import { uploadImage, storageReady } from '../lib/storage'

interface Props {
  currentUrl?: string
  onUploaded: (url: string) => void
  label?: string
  height?: number
}

type Tab = 'url' | 'upload'

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
  const inputRef = useRef<HTMLInputElement>(null)

  /* ── URL tab ──────────────────────────────────────────────── */
  const handleUrlSave = () => {
    const v = urlInput.trim()
    if (!v) { onUploaded(''); return }
    if (!v.startsWith('http')) { setError('Escribe una URL válida que empiece con http…'); return }
    setError(null)
    onUploaded(v)
  }

  /* ── Upload tab ───────────────────────────────────────────── */
  const doUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes (PNG, JPG, WebP…)')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('La imagen no puede pesar más de 8 MB')
      return
    }
    setError(null)
    setUploading(true)
    setProgress(0)
    try {
      const url = await uploadImage(file, pct => setProgress(pct))
      onUploaded(url)
      setUrlInput(url)
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }, [onUploaded])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) doUpload(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) doUpload(file)
  }

  /* ── Estilos compartidos ──────────────────────────────────── */
  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '8px', fontSize: '13px', fontWeight: 600,
    border: 'none', cursor: 'pointer', borderRadius: '8px',
    background: active ? '#6B21A8' : 'transparent',
    color: active ? '#fff' : '#6B7280',
    transition: 'all 0.15s ease',
  })

  return (
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
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
                  PNG, JPG, WebP · Máx. 8 MB
                </p>
              </>
            )}
          </div>
        ) : (
          /* Cloudinary no configurado → instrucciones */
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
                <code style={{ background: '#E0F2FE', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>VITE_CLOUDINARY_CLOUD_NAME</code><br />
                <code style={{ background: '#E0F2FE', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>VITE_CLOUDINARY_UPLOAD_PRESET</code>
              </li>
            </ol>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
              Mientras tanto usa la pestaña <strong>Pegar URL</strong> — sube la imagen a Imgur y copia el enlace.
            </p>
          </div>
        )
      )}

      {error && (
        <p style={{ fontSize: '12px', color: '#EF4444', margin: 0 }}>⚠️ {error}</p>
      )}
    </div>
  )
}
