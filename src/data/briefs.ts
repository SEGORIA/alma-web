// ── Tipos ─────────────────────────────────────────────────────

export type Brief = {
  _id?: string
  // 01 Datos personales
  email_direccion: string
  nombre:          string
  documento?:      string
  telefono?:       string
  email:           string
  // 02 Información de marca
  marca:             string
  nacimiento_marca?: string
  tiene_logo?:       string
  slogan?:           string
  presencia_redes?:  string
  // 03 Credenciales
  credenciales_redes?:       string
  credenciales_plataformas?: string
  // 04 ADN de marca
  personalidad?:       string
  valores_marca?:      string
  colores_marca?:      string
  // 05 Propuesta de valor
  clientes_potenciales?: string
  problema_resuelve?:    string
  propuesta_valor?:      string
  beneficios?:           string
  // 06 Experiencia emocional
  experiencia_emocional?:  string
  emociones?:              string
  // 07 Competencia y referencias
  competidores?: string
  referencias?:  string
  // 08 Inicio del servicio
  fecha_inicio?: string
  // 09 Archivos
  archivos?:     string
  link_archivos?: string
  // 10 Cierre
  notas_adicionales?: string
  // Meta
  estado:     'nuevo' | 'revisado' | 'en_proceso' | 'archivado'
  createdAt?: unknown
  updatedAt?: unknown
}

// ── Constantes de estado ───────────────────────────────────────

export const BRIEF_ESTADOS: {
  value: Brief['estado']
  label: string
  color: string
  bg:    string
}[] = [
  { value: 'nuevo',      label: 'Nuevo',      color: '#6B21A8', bg: 'rgba(107,33,168,0.10)'   },
  { value: 'revisado',   label: 'Revisado',   color: '#D97706', bg: 'rgba(217,119,6,0.10)'    },
  { value: 'en_proceso', label: 'En proceso', color: '#2563EB', bg: 'rgba(37,99,235,0.10)'    },
  { value: 'archivado',  label: 'Archivado',  color: '#6B7280', bg: 'rgba(107,114,128,0.10)'  },
]
