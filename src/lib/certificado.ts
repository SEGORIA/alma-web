import { jsPDF } from 'jspdf'

export type CertificadoData = {
  nombre: string
  curso:  string
  fecha:  string   // legible, ej: "15 de julio de 2026"
  numero: string
}

/* Genera el certificado de finalización como PDF (A4 horizontal). */
export function generarCertificado(data: CertificadoData): jsPDF {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  const morado = '#6B21A8'
  const violeta = '#9333EA'
  const gris = '#6B7280'
  const tinta = '#1F2937'

  // Fondo
  doc.setFillColor('#FFFFFF')
  doc.rect(0, 0, W, H, 'F')

  // Marco doble
  doc.setDrawColor(morado)
  doc.setLineWidth(3)
  doc.rect(24, 24, W - 48, H - 48)
  doc.setDrawColor(violeta)
  doc.setLineWidth(0.8)
  doc.rect(34, 34, W - 68, H - 68)

  // Marca
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(morado)
  doc.text('ALMA · AGENCIA CREATIVA', W / 2, 92, { align: 'center' })

  // Título
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(34)
  doc.setTextColor(tinta)
  doc.text('Certificado de finalización', W / 2, 150, { align: 'center' })

  // Subtítulo
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(gris)
  doc.text('Se otorga el presente certificado a', W / 2, 195, { align: 'center' })

  // Nombre del alumno
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(30)
  doc.setTextColor(morado)
  doc.text(data.nombre, W / 2, 245, { align: 'center' })

  // Línea bajo el nombre
  doc.setDrawColor('#E5E7EB')
  doc.setLineWidth(0.8)
  doc.line(W / 2 - 200, 258, W / 2 + 200, 258)

  // Por completar el curso
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(gris)
  doc.text('por completar satisfactoriamente el curso', W / 2, 296, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(19)
  doc.setTextColor(tinta)
  doc.text(data.curso, W / 2, 326, { align: 'center' })

  // Pie: fecha y número
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(gris)
  doc.text(`Fecha: ${data.fecha}`, 80, H - 70)
  doc.text(`Certificado N.º ${data.numero}`, W - 80, H - 70, { align: 'right' })

  // Firma
  doc.setDrawColor('#9CA3AF')
  doc.setLineWidth(0.6)
  doc.line(W / 2 - 90, H - 95, W / 2 + 90, H - 95)
  doc.setFontSize(11)
  doc.setTextColor(tinta)
  doc.text('Alma Agencia Creativa', W / 2, H - 78, { align: 'center' })

  return doc
}

/** Descarga el certificado como archivo PDF. */
export function descargarCertificado(data: CertificadoData) {
  const doc = generarCertificado(data)
  const slug = data.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  doc.save(`certificado-${slug || 'alumno'}.pdf`)
}

/** Devuelve el certificado como base64 (sin el prefijo data:) para adjuntar en correo. */
export function certificadoBase64(data: CertificadoData): string {
  const doc = generarCertificado(data)
  const dataUri = doc.output('datauristring')
  return dataUri.split(',')[1] ?? ''
}
