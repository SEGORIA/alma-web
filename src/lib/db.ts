import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db, firebaseReady } from './firebase'
import { articulos as staticArticulos } from '../data/articulos'
import { proyectosEstaticos } from '../data/portafolio'
import type { Articulo } from '../data/articulos'
import type { Proyecto } from '../data/portafolio'

/* ── Helpers ─────────────────────────────────────────────── */
function articulosCol() { return collection(db!, 'articulos') }
function portafolioCol() { return collection(db!, 'portafolio') }

/* ══ ARTÍCULOS ══════════════════════════════════════════════ */

export async function getArticulos(): Promise<Articulo[]> {
  if (!firebaseReady || !db) return staticArticulos
  try {
    const snap = await getDocs(query(articulosCol(), orderBy('orden', 'asc')))
    if (snap.empty) return staticArticulos
    return snap.docs.map(d => ({ ...(d.data() as Articulo), _id: d.id }))
  } catch {
    return staticArticulos
  }
}

export async function getArticulo(slug: string): Promise<Articulo | null> {
  if (!firebaseReady || !db) return staticArticulos.find(a => a.slug === slug) ?? null
  try {
    const snap = await getDocs(articulosCol())
    const found = snap.docs.find(d => d.data().slug === slug)
    if (found) return { ...(found.data() as Articulo), _id: found.id }
    return staticArticulos.find(a => a.slug === slug) ?? null
  } catch {
    return staticArticulos.find(a => a.slug === slug) ?? null
  }
}

export async function createArticulo(data: Omit<Articulo, '_id'>): Promise<string> {
  const ref = await addDoc(articulosCol(), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateArticulo(id: string, data: Partial<Articulo>) {
  await updateDoc(doc(db!, 'articulos', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteArticulo(id: string) {
  await deleteDoc(doc(db!, 'articulos', id))
}

export async function seedArticulos() {
  for (let i = 0; i < staticArticulos.length; i++) {
    await addDoc(articulosCol(), { ...staticArticulos[i], orden: i, createdAt: serverTimestamp() })
  }
}

/* ══ PORTAFOLIO ═════════════════════════════════════════════ */

export async function getProyectos(): Promise<Proyecto[]> {
  if (!firebaseReady || !db) return proyectosEstaticos
  try {
    const snap = await getDocs(query(portafolioCol(), orderBy('orden', 'asc')))
    if (snap.empty) return proyectosEstaticos
    return snap.docs.map(d => ({ ...(d.data() as Proyecto), _id: d.id }))
  } catch {
    return proyectosEstaticos
  }
}

export async function createProyecto(data: Omit<Proyecto, '_id'>): Promise<string> {
  const ref = await addDoc(portafolioCol(), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateProyecto(id: string, data: Partial<Proyecto>) {
  await updateDoc(doc(db!, 'portafolio', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteProyecto(id: string) {
  await deleteDoc(doc(db!, 'portafolio', id))
}

export async function seedPortafolio() {
  for (let i = 0; i < proyectosEstaticos.length; i++) {
    await addDoc(portafolioCol(), { ...proyectosEstaticos[i], orden: i, createdAt: serverTimestamp() })
  }
}
