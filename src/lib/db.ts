import {
  collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db, firebaseReady } from './firebase'
import { articulos as staticArticulos } from '../data/articulos'
import { proyectosEstaticos } from '../data/portafolio'
import { planesEstaticos, extrasEstaticos, categoriasEstaticas } from '../data/precios'
import {
  seccionesDefault, clientesEstaticos, testimoniosEstaticos, faqsEstaticos,
  contactoDefault, heroStatsDefault, heroSubtituloDefault,
} from '../data/config'
import { pasosEstaticos, equipoEstatico } from '../data/contenido'
import type { Articulo } from '../data/articulos'
import type { Proyecto } from '../data/portafolio'
import type { Plan, Extra, ServicioCategoria } from '../data/precios'
import type { SiteConfig, SeccionesConfig, Testimonio, FaqItem, ContactoInfo, HeroStat } from '../data/config'
import type { PasoItem, EquipoMember } from '../data/contenido'

/* ── Helpers ─────────────────────────────────────────────── */
function articulosCol()   { return collection(db!, 'articulos') }
function portafolioCol()  { return collection(db!, 'portafolio') }
function planesCol()      { return collection(db!, 'precios_planes') }
function extrasCol()      { return collection(db!, 'precios_extras') }
function configDoc()      { return doc(db!, 'config', 'site') }
function testimoniosCol() { return collection(db!, 'testimonios') }
function faqsCol()        { return collection(db!, 'faqs') }
function categoriasCol()  { return collection(db!, 'categorias') }
function pasosCol()       { return collection(db!, 'proceso') }
function equipoCol()      { return collection(db!, 'equipo') }

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

/* ══ PRECIOS — PLANES ═══════════════════════════════════════ */

export async function getPlanes(): Promise<Plan[]> {
  if (!firebaseReady || !db) return planesEstaticos
  try {
    const snap = await getDocs(query(planesCol(), orderBy('orden', 'asc')))
    const fromDB = snap.docs.map(d => ({ ...(d.data() as Plan), _id: d.id }))
    // Merge: DB overrides static, but static adds plans for categories not yet in DB
    const dbTabIds = new Set(fromDB.map(p => p.tabId))
    const missingStatic = planesEstaticos.filter(p => !dbTabIds.has(p.tabId))
    const merged = [...fromDB, ...missingStatic].sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99))
    return merged.length > 0 ? merged : planesEstaticos
  } catch {
    return planesEstaticos
  }
}

export async function createPlan(data: Omit<Plan, '_id'>): Promise<string> {
  const ref = await addDoc(planesCol(), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updatePlan(id: string, data: Partial<Plan>) {
  await updateDoc(doc(db!, 'precios_planes', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deletePlan(id: string) {
  await deleteDoc(doc(db!, 'precios_planes', id))
}

/* ══ PRECIOS — EXTRAS ═══════════════════════════════════════ */

export async function getExtras(): Promise<Extra[]> {
  if (!firebaseReady || !db) return extrasEstaticos
  try {
    const snap = await getDocs(query(extrasCol(), orderBy('orden', 'asc')))
    if (snap.empty) return extrasEstaticos
    return snap.docs.map(d => ({ ...(d.data() as Extra), _id: d.id }))
  } catch {
    return extrasEstaticos
  }
}

export async function createExtra(data: Omit<Extra, '_id'>): Promise<string> {
  const ref = await addDoc(extrasCol(), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateExtra(id: string, data: Partial<Extra>) {
  await updateDoc(doc(db!, 'precios_extras', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteExtra(id: string) {
  await deleteDoc(doc(db!, 'precios_extras', id))
}

/* ══ PRECIOS — CATEGORÍAS ═══════════════════════════════════ */

export async function getCategorias(): Promise<ServicioCategoria[]> {
  if (!firebaseReady || !db) return categoriasEstaticas
  try {
    const snap = await getDocs(query(categoriasCol(), orderBy('orden', 'asc')))
    const fromDB = snap.docs.map(d => ({ ...(d.data() as ServicioCategoria), _id: d.id }))
    // Merge: DB overrides static, but static adds any missing categories
    const dbIds = new Set(fromDB.map(c => c.id))
    const missingStatic = categoriasEstaticas.filter(c => !dbIds.has(c.id))
    const merged = [...fromDB, ...missingStatic].sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99))
    return merged.length > 0 ? merged : categoriasEstaticas
  } catch {
    return categoriasEstaticas
  }
}

export async function createCategoria(data: Omit<ServicioCategoria, '_id'>): Promise<string> {
  const ref = await addDoc(categoriasCol(), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateCategoria(id: string, data: Partial<ServicioCategoria>) {
  await updateDoc(doc(db!, 'categorias', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteCategoria(id: string) {
  await deleteDoc(doc(db!, 'categorias', id))
}

export async function seedPrecios() {
  for (let i = 0; i < categoriasEstaticas.length; i++) {
    await addDoc(categoriasCol(), { ...categoriasEstaticas[i], orden: i, createdAt: serverTimestamp() })
  }
  for (let i = 0; i < planesEstaticos.length; i++) {
    await addDoc(planesCol(), { ...planesEstaticos[i], orden: i, createdAt: serverTimestamp() })
  }
  for (let i = 0; i < extrasEstaticos.length; i++) {
    await addDoc(extrasCol(), { ...extrasEstaticos[i], orden: i, createdAt: serverTimestamp() })
  }
}

/* ══ CONFIGURACIÓN DEL SITIO ════════════════════════════════ */

// Cache de módulo: la primera llamada hace el fetch; todas las demás
// esperan la misma promesa → 1 solo roundtrip Firestore por sesión.
let _configPromise: Promise<SiteConfig> | null = null

export function invalidateConfigCache() { _configPromise = null }

export async function getConfig(): Promise<SiteConfig> {
  const fallback: SiteConfig = {
    secciones:      seccionesDefault,
    clientes:       clientesEstaticos,
    contactoInfo:   contactoDefault,
    heroStats:      heroStatsDefault,
    heroSubtitulo:  heroSubtituloDefault,
  }
  if (!firebaseReady || !db) return fallback
  if (!_configPromise) {
    _configPromise = getDoc(configDoc())
      .then(snap => {
        if (!snap.exists()) return fallback
        const data = snap.data() as Partial<SiteConfig>
        return {
          secciones:      { ...seccionesDefault, ...(data.secciones ?? {}) } as SeccionesConfig,
          clientes:       data.clientes      ?? clientesEstaticos,
          contactoInfo:   data.contactoInfo  ?? contactoDefault,
          heroStats:      data.heroStats     ?? heroStatsDefault,
          heroSubtitulo:  data.heroSubtitulo ?? heroSubtituloDefault,
        }
      })
      .catch(() => fallback)
  }
  return _configPromise
}

export async function getContactoInfo(): Promise<ContactoInfo> {
  const cfg = await getConfig()
  return cfg.contactoInfo ?? contactoDefault
}

export async function getHeroContent(): Promise<{ stats: HeroStat[]; subtitulo: string }> {
  const cfg = await getConfig()
  return { stats: cfg.heroStats ?? heroStatsDefault, subtitulo: cfg.heroSubtitulo ?? heroSubtituloDefault }
}

export async function updateConfig(data: Partial<SiteConfig>) {
  await setDoc(configDoc(), data, { merge: true })
}

/* ══ TESTIMONIOS ════════════════════════════════════════════ */

export async function getTestimonios(): Promise<Testimonio[]> {
  if (!firebaseReady || !db) return testimoniosEstaticos
  try {
    const snap = await getDocs(query(testimoniosCol(), orderBy('orden', 'asc')))
    if (snap.empty) return testimoniosEstaticos
    return snap.docs.map(d => ({ ...(d.data() as Testimonio), _id: d.id }))
  } catch {
    return testimoniosEstaticos
  }
}

export async function createTestimonio(data: Omit<Testimonio, '_id'>): Promise<string> {
  const ref = await addDoc(testimoniosCol(), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateTestimonio(id: string, data: Partial<Testimonio>) {
  await updateDoc(doc(db!, 'testimonios', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteTestimonio(id: string) {
  await deleteDoc(doc(db!, 'testimonios', id))
}

/* ══ FAQ ════════════════════════════════════════════════════ */

export async function getFaqs(): Promise<FaqItem[]> {
  if (!firebaseReady || !db) return faqsEstaticos
  try {
    const snap = await getDocs(query(faqsCol(), orderBy('orden', 'asc')))
    if (snap.empty) return faqsEstaticos
    return snap.docs.map(d => ({ ...(d.data() as FaqItem), _id: d.id }))
  } catch {
    return faqsEstaticos
  }
}

export async function createFaq(data: Omit<FaqItem, '_id'>): Promise<string> {
  const ref = await addDoc(faqsCol(), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateFaq(id: string, data: Partial<FaqItem>) {
  await updateDoc(doc(db!, 'faqs', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteFaq(id: string) {
  await deleteDoc(doc(db!, 'faqs', id))
}

/* ══ PROCESO ════════════════════════════════════════════════ */

export async function getPasos(): Promise<PasoItem[]> {
  if (!firebaseReady || !db) return pasosEstaticos
  try {
    const snap = await getDocs(query(pasosCol(), orderBy('orden', 'asc')))
    if (snap.empty) return pasosEstaticos
    return snap.docs.map(d => ({ ...(d.data() as PasoItem), _id: d.id }))
  } catch {
    return pasosEstaticos
  }
}

export async function createPaso(data: Omit<PasoItem, '_id'>): Promise<string> {
  const ref = await addDoc(pasosCol(), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updatePaso(id: string, data: Partial<PasoItem>) {
  await updateDoc(doc(db!, 'proceso', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deletePaso(id: string) {
  await deleteDoc(doc(db!, 'proceso', id))
}

/* ══ EQUIPO ═════════════════════════════════════════════════ */

export async function getEquipo(): Promise<EquipoMember[]> {
  if (!firebaseReady || !db) return equipoEstatico
  try {
    const snap = await getDocs(query(equipoCol(), orderBy('orden', 'asc')))
    if (snap.empty) return equipoEstatico
    return snap.docs.map(d => ({ ...(d.data() as EquipoMember), _id: d.id }))
  } catch {
    return equipoEstatico
  }
}

export async function createEquipoMember(data: Omit<EquipoMember, '_id'>): Promise<string> {
  const ref = await addDoc(equipoCol(), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateEquipoMember(id: string, data: Partial<EquipoMember>) {
  await updateDoc(doc(db!, 'equipo', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteEquipoMember(id: string) {
  await deleteDoc(doc(db!, 'equipo', id))
}

/* ══ SEED COMPLETO ══════════════════════════════════════════ */

export async function seedConfig() {
  await setDoc(configDoc(), {
    secciones:     seccionesDefault,
    clientes:      clientesEstaticos,
    contactoInfo:  contactoDefault,
    heroStats:     heroStatsDefault,
    heroSubtitulo: heroSubtituloDefault,
  })
  for (let i = 0; i < testimoniosEstaticos.length; i++) {
    await addDoc(testimoniosCol(), { ...testimoniosEstaticos[i], orden: i, createdAt: serverTimestamp() })
  }
  for (let i = 0; i < faqsEstaticos.length; i++) {
    await addDoc(faqsCol(), { ...faqsEstaticos[i], orden: i, createdAt: serverTimestamp() })
  }
  for (let i = 0; i < pasosEstaticos.length; i++) {
    await addDoc(pasosCol(), { ...pasosEstaticos[i], orden: i, createdAt: serverTimestamp() })
  }
  for (let i = 0; i < equipoEstatico.length; i++) {
    await addDoc(equipoCol(), { ...equipoEstatico[i], orden: i, createdAt: serverTimestamp() })
  }
}
