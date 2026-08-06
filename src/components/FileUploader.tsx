import { useState, useRef } from 'react'
import { uploadFile, uploadImage, storageReady } from '../lib/storage'
import { P } from '../tokens'

interface Props {
  onUploaded: (url: string, nombre: string, tipo: string, tamano: number) => void
  accept?: string   // default: '.pdf,.docx,.doc,.xlsx,.zip'
  hint?: string      // texto bajo el ícono; por defecto describe accept
}

const ACCEPT_DEFAULT = '.pdf,.docx,.doc,.xlsx,.xls,.zip,.rar,.pptx,.mp4,.mov'
const HINT_DEFAULT = 'PDF, DOCX, XLSX, ZIP, PPTX… · Máx. 50 MB'

export default function FileUploader({ onUploaded, accept = ACCEPT_DEFAULT, hint = HINT_DEFAULT }: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [error,     setError]     = useState<string | null>(null)
  const [dragging,  setDragging]  = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const doUpload = async (file: File) => {
    setError(null)
    setUploading(true)
    setProgress(0)
    try {
      // Cloudinary separa imágenes (endpoint /image/upload) de todo lo demás
      // (/raw/upload). Subir una imagen por el endpoint "raw" a veces la deja
      // servida de forma que el navegador no la muestra en línea. El arrastre
      // (handleDrop) tampoco respeta el atributo `accept`, así que esta
      // detección por MIME real cubre también lo que igual se cuele ahí.
      const esImagen = file.type.startsWith('image/')
      const url  = esImagen
        ? await uploadImage(file, pct => setProgress(pct))
        : await uploadFile(file, pct => setProgress(pct))
      const tipo = file.name.split('.').pop()?.toLowerCase() ?? 'file'
      onUploaded(url, file.name, tipo, file.size)
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Error al subir el archivo')
    } finally {
      setUploading(false)
    }
  }

  const handleFile = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      setError('El archivo no puede pesar más de 50 MB')
      return
    }
    doUpload(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  if (!storageReady) {
    return (
      <div style={{
        background: '#FFFBEB', border: '1px solid #FCD34D',
        borderRadius: '12px', padding: '14px 16px',
      }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#92400E', margin: '0 0 4px' }}>
          ⚙️ Cloudinary necesario para subir archivos
        </p>
        <p style={{ fontSize: '12px', color: '#78350F', margin: 0 }}>
          Configura <code>VITE_CLOUDINARY_CLOUD_NAME</code> y <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> en las variables de entorno.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? P : '#D1D5DB'}`,
          borderRadius: '12px', padding: '20px 16px', textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragging ? `rgba(107,33,168,0.04)` : '#F9FAFB',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          ref={inputRef} type="file"
          accept={accept}
          onChange={handleChange}
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
                background: `linear-gradient(90deg, ${P}, #9333EA)`,
                borderRadius: '3px', transition: 'width 0.3s ease',
              }} />
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
              Subiendo… {Math.round(progress)}%
            </p>
          </div>
        ) : (
          <>
            <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>📁</span>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 4px' }}>
              Haz clic o arrastra un archivo aquí
            </p>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
              {hint}
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
