import { useState, useRef, useCallback } from 'react'
import { uploadImage } from '../lib/storage'
import { firebaseReady } from '../lib/firebase'

type Folder = 'blog' | 'portafolio'

interface Props {
  currentUrl?: string
  folder: Folder
  onUploaded: (url: string) => void
  label?: string
  height?: number
}

export default function ImageUploader({
  currentUrl,
  folder,
  onUploaded,
  label = 'Imagen',
  height = 200,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [error,     setError]     = useState<string | null>(null)
  const [dragging,  setDragging]  = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const doUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes (PNG, JPG, WebP…)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede pesar más de 5 MB')
      return
    }
    setError(null)
    setUploading(true)
    setProgress(0)
    try {
      const url = await uploadImage(file, folder, pct => setProgress(pct))
      onUploaded(url)
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }, [folder, onUploaded])

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

  if (!firebaseReady) {
    return (
      <div style={{
        padding: '12px 16px', background: '#FEF3C7',
        borderRadius: '10px', fontSize: '13px', color: '#92400E',
        border: '1px solid #FDE68A',
      }}>
        ⚠️ Configura Firebase para poder subir imágenes. Mientras tanto el proyecto usará el color de fondo.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
            onClick={() => onUploaded('')}
            title="Quitar imagen"
            style={{
              position: 'absolute', top: '8px', right: '8px',
              background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
              width: '28px', height: '28px', borderRadius: '50%',
              cursor: 'pointer', fontSize: '16px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}
          >×</button>
        </div>
      )}

      {/* Zona de carga */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#6B21A8' : '#D1D5DB'}`,
          borderRadius: '12px',
          padding: '20px 16px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragging ? 'rgba(107,33,168,0.04)' : '#F9FAFB',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
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
            <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>
              {currentUrl ? '🔄' : '🖼️'}
            </span>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 4px' }}>
              {currentUrl
                ? 'Haz clic o arrastra para cambiar la imagen'
                : 'Haz clic o arrastra una imagen aquí'}
            </p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
              PNG, JPG, WebP · Máx. 5 MB
            </p>
          </>
        )}
      </div>

      {error && (
        <p style={{ fontSize: '12px', color: '#EF4444', margin: 0 }}>⚠️ {error}</p>
      )}
    </div>
  )
}
