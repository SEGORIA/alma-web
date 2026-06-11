import { db } from './firebase'
import { collection, getCountFromServer, getDocs, query, where } from 'firebase/firestore'
import type { Cliente } from '../data/clientes'

/* ── Conteos de pendientes para los badges del sidebar admin ──
   Cacheado a nivel de módulo (60s) para no repetir lecturas en
   cada navegación entre páginas del panel. */

export type Pendientes = {
  leadsNuevos:     number
  briefsNuevos:    number
  solicitudesPend: number
}

let cache: { t: number; data: Pendientes } | null = null

export async function getPendientes(): Promise<Pendientes> {
  if (!db) return { leadsNuevos: 0, briefsNuevos: 0, solicitudesPend: 0 }
  if (cache && Date.now() - cache.t < 60_000) return cache.data

  const [leadsSnap, briefsSnap, clientesSnap] = await Promise.all([
    getCountFromServer(query(collection(db, 'leads'),  where('estado', '==', 'nuevo'))).catch(() => null),
    getCountFromServer(query(collection(db, 'briefs'), where('estado', '==', 'nuevo'))).catch(() => null),
    getDocs(collection(db, 'clientes')).catch(() => null),
  ])

  const data: Pendientes = {
    leadsNuevos:  leadsSnap?.data().count ?? 0,
    briefsNuevos: briefsSnap?.data().count ?? 0,
    solicitudesPend: clientesSnap
      ? clientesSnap.docs.reduce((sum, d) => {
          const c = d.data() as Cliente
          return sum + (c.solicitudes ?? []).filter(s => s.estado === 'pendiente').length
        }, 0)
      : 0,
  }
  cache = { t: Date.now(), data }
  return data
}

/** Invalida el cache (p. ej. tras responder una solicitud). */
export function invalidatePendientes() { cache = null }
