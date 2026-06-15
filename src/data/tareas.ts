// ── Tipos ─────────────────────────────────────────────────────

export type TareaEstado     = 'pendiente' | 'en_curso' | 'hecho'
export type TareaFrecuencia = 'diaria' | 'semanal' | 'mensual' | 'unica'
export type TareaPrioridad  = 'alta' | 'media' | 'baja'

export type Tarea = {
  _id?:               string
  titulo:             string
  descripcion?:       string
  responsableId:      string   // EquipoMember._id
  responsableNombre:  string   // desnormalizado para mostrar sin join
  frecuencia:         TareaFrecuencia
  prioridad:          TareaPrioridad
  estado:             TareaEstado
  fechaLimite?:       string   // 'YYYY-MM-DD'
  createdAt?:         unknown
  updatedAt?:         unknown
}

// ── Catálogos ───────────────────────────────────────────────────

export const TAREA_ESTADOS: { value: TareaEstado; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_curso',  label: 'En curso' },
  { value: 'hecho',     label: 'Hecho' },
]

export const TAREA_FRECUENCIAS: { value: TareaFrecuencia; label: string }[] = [
  { value: 'diaria',  label: 'Diaria' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'unica',   label: 'Única' },
]

export const TAREA_PRIORIDADES: { value: TareaPrioridad; label: string }[] = [
  { value: 'alta',  label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja',  label: 'Baja' },
]
