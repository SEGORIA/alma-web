/* Banco de ideas colaborativo por cliente.
   Colección top-level `ideas`. Tanto el equipo (desde el admin) como el
   cliente (desde su portal) pueden proponer y votar; una idea aprobada se
   puede convertir en un item de la parrilla del cliente. */

export type IdeaEstado = 'propuesta' | 'aprobada' | 'descartada' | 'convertida'

export const IDEA_ESTADOS: { value: IdeaEstado; label: string; color: string }[] = [
  { value: 'propuesta',  label: 'Propuesta',  color: '#2563EB' },
  { value: 'aprobada',   label: 'Aprobada',   color: '#16A34A' },
  { value: 'descartada', label: 'Descartada', color: '#9CA3AF' },
  { value: 'convertida', label: 'En parrilla', color: '#7C3AED' },
]

export type Idea = {
  _id?:          string
  clienteId:     string
  titulo:        string
  descripcion?:  string
  pilar?:        string           // reutiliza PILARES_CONTENIDO
  autorTipo:     'equipo' | 'cliente'
  autorNombre?:  string
  votos_equipo?: number
  votos_cliente?: number
  estado:        IdeaEstado
  parrillaItemId?: string         // se llena al convertir a parrilla
  createdAt?:    unknown
  updatedAt?:    unknown
}
