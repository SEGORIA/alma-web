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
  personalidad?:  string
  valores_marca?: string
  colores_marca?: string
  // 05 Propuesta de valor
  clientes_potenciales?: string
  problema_resuelve?:    string
  propuesta_valor?:      string
  beneficios?:           string
  // 06 Experiencia emocional
  experiencia_emocional?: string
  emociones?:             string
  // 07 Competencia y referencias
  competidores?: string
  referencias?:  string
  // 08 Inicio del servicio
  fecha_inicio?: string
  // 09 Archivos
  archivos?:      string
  link_archivos?: string
  // 10 Cierre
  notas_adicionales?: string
  // Admin interno
  notas_admin?:   string
  custom_fields?: Record<string, string>
  // Meta
  estado:     'nuevo' | 'revisado' | 'en_proceso' | 'archivado'
  createdAt?: unknown
  updatedAt?: unknown
}

// ── Estados ────────────────────────────────────────────────────

export const BRIEF_ESTADOS: {
  value: Brief['estado']
  label: string
  color: string
  bg:    string
}[] = [
  { value: 'nuevo',      label: 'Nuevo',      color: '#6B21A8', bg: 'rgba(107,33,168,0.10)'  },
  { value: 'revisado',   label: 'Revisado',   color: '#D97706', bg: 'rgba(217,119,6,0.10)'   },
  { value: 'en_proceso', label: 'En proceso', color: '#2563EB', bg: 'rgba(37,99,235,0.10)'   },
  { value: 'archivado',  label: 'Archivado',  color: '#6B7280', bg: 'rgba(107,114,128,0.10)' },
]

// ── Tipos del constructor de formulario ────────────────────────

export type BriefFieldType =
  | 'text' | 'email' | 'tel' | 'date'
  | 'textarea' | 'select' | 'pills' | 'color-pills' | 'file'

export type BriefFieldDef = {
  key:          string
  label:        string
  sectionKey:   string
  type:         BriefFieldType
  required?:    boolean
  active:       boolean
  custom?:      boolean
  placeholder?: string
}

export type BriefSectionDef = {
  key:    string
  num:    string
  title:  string
  active: boolean
}

export type BriefFormConfig = {
  sections:   BriefSectionDef[]
  fields:     BriefFieldDef[]
  updatedAt?: unknown
}

// ── Secciones por defecto ──────────────────────────────────────

export const DEFAULT_BRIEF_SECTIONS: BriefSectionDef[] = [
  { key: 's1',  num: '01', title: 'Datos Personales',          active: true },
  { key: 's2',  num: '02', title: 'Información de la Marca',   active: true },
  { key: 's3',  num: '03', title: 'Accesos y Credenciales',    active: true },
  { key: 's4',  num: '04', title: 'ADN de Marca',              active: true },
  { key: 's5',  num: '05', title: 'Propuesta de Valor',        active: true },
  { key: 's6',  num: '06', title: 'Experiencia Emocional',     active: true },
  { key: 's7',  num: '07', title: 'Competencia y Referencias', active: true },
  { key: 's8',  num: '08', title: 'Inicio del Servicio',       active: true },
  { key: 's9',  num: '09', title: 'Archivos de Referencia',    active: true },
  { key: 's10', num: '10', title: 'Para Nosotros',             active: true },
]

// ── Campos por defecto ─────────────────────────────────────────

export const DEFAULT_BRIEF_FIELDS: BriefFieldDef[] = [
  { key: 'email_direccion',         label: 'Correo electrónico',            sectionKey: 's1',  type: 'email',       required: true, active: true },
  { key: 'nombre',                  label: 'Nombre completo',               sectionKey: 's1',  type: 'text',        required: true, active: true },
  { key: 'documento',               label: 'Documento de identidad',        sectionKey: 's1',  type: 'text',        active: true },
  { key: 'telefono',                label: 'Teléfono / Celular',            sectionKey: 's1',  type: 'tel',         active: true },
  { key: 'email',                   label: 'Correo de la empresa',          sectionKey: 's1',  type: 'email',       required: true, active: true },
  { key: 'marca',                   label: 'Nombre de la marca',            sectionKey: 's2',  type: 'text',        required: true, active: true },
  { key: 'nacimiento_marca',        label: '¿Cuándo nació la marca?',       sectionKey: 's2',  type: 'text',        active: true },
  { key: 'tiene_logo',              label: '¿Tienes logo?',                 sectionKey: 's2',  type: 'select',      active: true },
  { key: 'slogan',                  label: 'Slogan',                        sectionKey: 's2',  type: 'text',        active: true },
  { key: 'presencia_redes',         label: 'Presencia en redes sociales',   sectionKey: 's2',  type: 'textarea',    active: true },
  { key: 'credenciales_redes',      label: 'Credenciales de redes',         sectionKey: 's3',  type: 'textarea',    active: true },
  { key: 'credenciales_plataformas',label: 'Credenciales de plataformas',   sectionKey: 's3',  type: 'textarea',    active: true },
  { key: 'personalidad',            label: 'Personalidad de la marca',      sectionKey: 's4',  type: 'pills',       active: true },
  { key: 'valores_marca',           label: 'Valores de la marca',           sectionKey: 's4',  type: 'textarea',    active: true },
  { key: 'colores_marca',           label: 'Colores de la marca',           sectionKey: 's4',  type: 'color-pills', active: true },
  { key: 'clientes_potenciales',    label: 'Clientes potenciales',          sectionKey: 's5',  type: 'textarea',    active: true },
  { key: 'problema_resuelve',       label: 'Problema que resuelves',        sectionKey: 's5',  type: 'textarea',    active: true },
  { key: 'propuesta_valor',         label: 'Propuesta de valor',            sectionKey: 's5',  type: 'textarea',    active: true },
  { key: 'beneficios',              label: 'Beneficios que ofreces',        sectionKey: 's5',  type: 'textarea',    active: true },
  { key: 'experiencia_emocional',   label: 'Experiencia emocional',         sectionKey: 's6',  type: 'textarea',    active: true },
  { key: 'emociones',               label: 'Emociones a transmitir',        sectionKey: 's6',  type: 'pills',       active: true },
  { key: 'competidores',            label: 'Competidores',                  sectionKey: 's7',  type: 'textarea',    active: true },
  { key: 'referencias',             label: 'Referencias',                   sectionKey: 's7',  type: 'textarea',    active: true },
  { key: 'fecha_inicio',            label: 'Fecha de inicio del servicio',  sectionKey: 's8',  type: 'date',        active: true },
  { key: 'archivos',                label: 'Archivos de referencia',        sectionKey: 's9',  type: 'file',        active: true },
  { key: 'link_archivos',           label: 'Enlace a archivos externos',    sectionKey: 's9',  type: 'text',        active: true },
  { key: 'notas_adicionales',       label: '¿Algo que quieras agregar?',    sectionKey: 's10', type: 'textarea',    active: true },
]

export const DEFAULT_BRIEF_CONFIG: BriefFormConfig = {
  sections: DEFAULT_BRIEF_SECTIONS,
  fields:   DEFAULT_BRIEF_FIELDS,
}
