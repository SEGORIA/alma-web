import {
  collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
  query, orderBy, where, serverTimestamp, arrayUnion, increment, deleteField,
} from 'firebase/firestore'
import { db, firebaseReady } from './firebase'
import { articulos as staticArticulos } from '../data/articulos'
import { proyectosEstaticos } from '../data/portafolio'
import { planesEstaticos, extrasEstaticos, categoriasEstaticas } from '../data/precios'
import {
  seccionesDefault, clientesEstaticos, testimoniosEstaticos, faqsEstaticos,
  contactoDefault, heroStatsDefault, heroSubtituloDefault,
  principiosDefault, leadMagnetDefault, emisorDefault, redColoresDefault,
} from '../data/config'
import { pasosEstaticos, equipoEstatico } from '../data/contenido'
import type { Articulo } from '../data/articulos'
import type { Proyecto } from '../data/portafolio'
import type { Plan, Extra, ServicioCategoria } from '../data/precios'
import type { SiteConfig, SeccionesConfig, Testimonio, FaqItem, ContactoInfo, HeroStat, ManifiestoItem, LeadMagnetConfig, EmisorInfo } from '../data/config'
import type { PasoItem, EquipoMember } from '../data/contenido'
import type { KitArchivo, Lead } from '../data/leads'
import type { Brief, BriefFormConfig } from '../data/briefs'
import { DEFAULT_BRIEF_CONFIG } from '../data/briefs'
import type { Cliente, Entregable, ParrillaItem, Solicitud } from '../data/clientes'
import type { Tarea } from '../data/tareas'
import type { Curso, Recurso } from '../data/academia'
import { RECURSOS_SEED_HACKS_IG } from '../data/academia'
import type { Idea } from '../data/ideas'



/* ── Helpers ─────────────────────────────────────────────── */

/** Elimina recursivamente los valores `undefined` de un objeto antes de enviarlo
 *  a Firestore (que rechaza `undefined` pero acepta `null` o campo ausente).
 *  También aplana arrays anidados directamente dentro de otro array: Firestore
 *  rechaza esa forma con "invalid-argument: invalid nested entity", y ningún
 *  campo de nuestro modelo está diseñado como array-de-arrays (puede aparecer
 *  por datos legacy corruptos), así que aplanar es seguro y no pierde datos. */
export function stripUndefined(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    const cleaned = obj.map(stripUndefined)
    return cleaned.some(Array.isArray) ? cleaned.flat(Infinity) : cleaned
  }
  if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (v !== undefined) out[k] = stripUndefined(v)
    }
    return out
  }
  return obj
}

/** Registra errores de Firestore que de otro modo quedarían completamente
 *  silenciados detrás de un fallback (array vacío, datos estáticos, null…).
 *  Sin esto, un problema real de permisos o configuración se ve exactamente
 *  igual que "no hay datos todavía", lo que hace muy difícil diagnosticarlo. */
function logFirestoreError(context: string, err: unknown): void {
  console.error(`[db] ${context}:`, err)
}

/** Factory para colecciones "simples" (sin fallback a datos estáticos ni
 *  merge/dedup especial): getAll ordenado + create + update + delete, todos
 *  con el mismo guard `firebaseReady` y el mismo try/catch que ya usaban
 *  Cotizaciones, Cuentas de Cobro, Movimientos, Leads y Tareas por separado. */
function makeCrud<T extends { _id?: string }>(
  collectionName: string,
  orderField: string,
  orderDir: 'asc' | 'desc' = 'desc',
) {
  const col = () => collection(db!, collectionName)
  return {
    col,
    async getAll(): Promise<T[]> {
      if (!firebaseReady || !db) return []
      try {
        const snap = await getDocs(query(col(), orderBy(orderField, orderDir)))
        return snap.docs.map(d => ({ ...(d.data() as T), _id: d.id }))
      } catch (err) { logFirestoreError(`makeCrud(${collectionName}).getAll`, err); return [] }
    },
    async create(data: Omit<T, '_id'>, extraFields: Record<string, unknown> = {}): Promise<string> {
      if (!db) throw new Error('DB not ready')
      const ref = await addDoc(col(), { ...data, ...extraFields })
      return ref.id
    },
    async update(id: string, data: Partial<T>): Promise<void> {
      if (!firebaseReady || !db) return
      await updateDoc(doc(db!, collectionName, id), { ...data, updatedAt: serverTimestamp() })
    },
    async remove(id: string): Promise<void> {
      if (!firebaseReady || !db) return
      await deleteDoc(doc(db!, collectionName, id))
    },
  }
}

/* ══ ADMINS (allowlist) ═════════════════════════════════════
   `RequireAuth` (App.tsx) valida que el usuario autenticado con Firebase Auth
   exista además en esta colección (doc id = uid) antes de dejarlo entrar a
   /admin/*. Necesario porque Academia va a permitir auto-registro público de
   estudiantes en el MISMO proyecto de Firebase Auth — sin este chequeo,
   cualquier estudiante registrado podría loguearse en /admin/login y entrar. */
const _adminCache = new Map<string, Promise<boolean>>()

export function isAdmin(uid: string): Promise<boolean> {
  if (!firebaseReady || !db) return Promise.resolve(false)
  if (!_adminCache.has(uid)) {
    _adminCache.set(uid, getDoc(doc(db!, 'admins', uid)).then(s => s.exists()).catch(err => {
      logFirestoreError('isAdmin', err)
      return false
    }))
  }
  return _adminCache.get(uid)!
}

function articulosCol()   { return collection(db!, 'articulos') }
function portafolioCol()  { return collection(db!, 'portafolio') }
function planesCol()      { return collection(db!, 'precios_planes') }
function extrasCol()      { return collection(db!, 'precios_extras') }
function configDoc()      { return doc(db!, 'config', 'site') }
/** Datos del emisor (NIT, datos bancarios de ALMA). Van en `config_privado`,
 *  no en `config/site`: ese documento es de lectura pública porque lleva el
 *  contenido de la web, así que cualquiera podía leer la cuenta bancaria. */
function emisorDoc()      { return doc(db!, 'config_privado', 'emisor') }
function testimoniosCol() { return collection(db!, 'testimonios') }
function faqsCol()        { return collection(db!, 'faqs') }
function categoriasCol()  { return collection(db!, 'categorias') }
function pasosCol()       { return collection(db!, 'proceso') }
function equipoCol()      { return collection(db!, 'equipo') }
function kitCol()         { return collection(db!, 'kit_archivos') }
function leadsCol()       { return collection(db!, 'leads') }
function briefsCol()      { return collection(db!, 'briefs') }
function briefConfigDoc() { return doc(db!, 'brief_config', 'v1') }

/* ══ ARTÍCULOS ══════════════════════════════════════════════ */

export async function getArticulos(): Promise<Articulo[]> {
  if (!firebaseReady || !db) return staticArticulos
  try {
    const snap = await getDocs(query(articulosCol(), orderBy('orden', 'asc')))
    if (snap.empty) return staticArticulos
    return snap.docs.map(d => ({ ...(d.data() as Articulo), _id: d.id }))
  } catch (err) {
    logFirestoreError('getArticulos', err)
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
  } catch (err) {
    logFirestoreError('getArticulo', err)
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
  } catch (err) {
    logFirestoreError('getProyectos', err)
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
  } catch (err) {
    logFirestoreError('getPlanes', err)
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
  } catch (err) {
    logFirestoreError('getExtras', err)
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
  } catch (err) {
    logFirestoreError('getCategorias', err)
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
    principios:     principiosDefault,
    leadMagnet:     leadMagnetDefault,
    redColores:     redColoresDefault,
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
          principios:     data.principios    ?? principiosDefault,
          leadMagnet:     data.leadMagnet    ?? leadMagnetDefault,
          // `emisor` a propósito no se expone aquí: es privado (ver emisorDoc).
          redColores:     { ...redColoresDefault, ...(data.redColores ?? {}) },
        }
      })
      .catch(err => {
        logFirestoreError('getConfig', err)
        return fallback
      })
  }
  return _configPromise
}

export async function getPrincipios(): Promise<ManifiestoItem[]> {
  const cfg = await getConfig()
  return cfg.principios ?? principiosDefault
}

export async function updatePrincipios(principios: ManifiestoItem[]) {
  invalidateConfigCache()
  await updateConfig({ principios })
}

export async function getLeadMagnetConfig(): Promise<LeadMagnetConfig> {
  const cfg = await getConfig()
  return cfg.leadMagnet ?? leadMagnetDefault
}

export async function updateLeadMagnetConfig(leadMagnet: LeadMagnetConfig) {
  invalidateConfigCache()
  await updateConfig({ leadMagnet })
}

export async function getRedColores(): Promise<Record<string, string>> {
  const cfg = await getConfig()
  return { ...redColoresDefault, ...(cfg.redColores ?? {}) }
}

export async function updateRedColores(redColores: Record<string, string>) {
  invalidateConfigCache()
  await updateConfig({ redColores })
}

export async function getContactoInfo(): Promise<ContactoInfo> {
  const cfg = await getConfig()
  return cfg.contactoInfo ?? contactoDefault
}

/** Lee los datos del emisor del documento privado. Mientras no se haya migrado
 *  puede seguir habiendo una copia dentro de `config/site`; se usa como
 *  respaldo para no perder los datos entre el despliegue y la migración. */
export async function getEmisorInfo(): Promise<EmisorInfo> {
  if (!firebaseReady || !db) return emisorDefault
  try {
    const snap = await getDoc(emisorDoc())
    if (snap.exists()) return { ...emisorDefault, ...(snap.data() as Partial<EmisorInfo>) }
  } catch (err) { logFirestoreError('getEmisorInfo', err) }
  return { ...emisorDefault, ...(await getEmisorLegacy() ?? {}) }
}

/** Copia heredada del emisor dentro de `config/site` (documento público). */
async function getEmisorLegacy(): Promise<Partial<EmisorInfo> | null> {
  if (!firebaseReady || !db) return null
  try {
    const snap = await getDoc(configDoc())
    if (!snap.exists()) return null
    return (snap.data() as { emisor?: Partial<EmisorInfo> }).emisor ?? null
  } catch (err) { logFirestoreError('getEmisorLegacy', err); return null }
}

export async function updateEmisorInfo(emisor: EmisorInfo) {
  if (!firebaseReady || !db) return
  await setDoc(emisorDoc(), emisor)
  await borrarEmisorLegacy()
}

/** Borra la copia del emisor del documento público, si quedaba alguna. */
async function borrarEmisorLegacy(): Promise<void> {
  if (!firebaseReady || !db) return
  try {
    await updateDoc(configDoc(), { emisor: deleteField() })
    invalidateConfigCache()
  } catch (err) { logFirestoreError('borrarEmisorLegacy', err) }
}

/** Migración de un solo uso: mueve el emisor de `config/site` (público) a
 *  `config_privado/emisor`. Es idempotente — si no queda copia heredada no
 *  hace nada. La llama CuentasCobroAdmin al cargar, que es la única página
 *  que usa estos datos y siempre corre con sesión de admin. */
export async function migrarEmisorAPrivado(): Promise<boolean> {
  if (!firebaseReady || !db) return false
  const legacy = await getEmisorLegacy()
  if (!legacy) return false
  const snap = await getDoc(emisorDoc()).catch(() => null)
  if (!snap?.exists()) await setDoc(emisorDoc(), { ...emisorDefault, ...legacy })
  await borrarEmisorLegacy()
  return true
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
  } catch (err) {
    logFirestoreError('getTestimonios', err)
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
  } catch (err) {
    logFirestoreError('getFaqs', err)
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
    const all = snap.docs.map(d => ({ ...(d.data() as PasoItem), _id: d.id }))
    // Deduplicar por campo `n` — conservar el primero encontrado (orden asc)
    const seen = new Set<string>()
    return all.filter(p => {
      if (seen.has(p.n)) return false
      seen.add(p.n)
      return true
    })
  } catch (err) {
    logFirestoreError('getPasos', err)
    return pasosEstaticos
  }
}

/** Elimina documentos duplicados en la colección `proceso` (mismo campo `n`).
 *  Conserva el primero por fecha de creación y borra el resto. */
export async function cleanDuplicatePasos(): Promise<number> {
  if (!firebaseReady || !db) return 0
  const snap = await getDocs(query(pasosCol(), orderBy('orden', 'asc')))
  const byN = new Map<string, string[]>()
  snap.docs.forEach(d => {
    const n = (d.data() as PasoItem).n
    if (!byN.has(n)) byN.set(n, [])
    byN.get(n)!.push(d.id)
  })
  let deleted = 0
  for (const ids of byN.values()) {
    for (const id of ids.slice(1)) {   // conserva el primero, borra el resto
      await deleteDoc(doc(db!, 'proceso', id))
      deleted++
    }
  }
  return deleted
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
    const all = snap.docs.map(d => ({ ...(d.data() as EquipoMember), _id: d.id }))
    // Deduplicar por `nombre` — conservar el primero (orden asc)
    const seen = new Set<string>()
    return all.filter(m => {
      if (seen.has(m.nombre)) return false
      seen.add(m.nombre)
      return true
    })
  } catch (err) {
    logFirestoreError('getEquipo', err)
    return equipoEstatico
  }
}

/** Elimina miembros duplicados en la colección `equipo` (mismo `nombre`).
 *  Conserva el primero por orden y borra el resto. */
export async function cleanDuplicateEquipo(): Promise<number> {
  if (!firebaseReady || !db) return 0
  const snap = await getDocs(query(equipoCol(), orderBy('orden', 'asc')))
  const byNombre = new Map<string, string[]>()
  snap.docs.forEach(d => {
    const nombre = (d.data() as EquipoMember).nombre
    if (!byNombre.has(nombre)) byNombre.set(nombre, [])
    byNombre.get(nombre)!.push(d.id)
  })
  let deleted = 0
  for (const ids of byNombre.values()) {
    for (const id of ids.slice(1)) {
      await deleteDoc(doc(db!, 'equipo', id))
      deleted++
    }
  }
  return deleted
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

/* ══ KIT ARCHIVOS ═══════════════════════════════════════════ */

export async function getKitArchivos(): Promise<KitArchivo[]> {
  if (!firebaseReady || !db) return []
  try {
    const snap = await getDocs(query(kitCol(), orderBy('orden', 'asc')))
    return snap.docs.map(d => ({ ...(d.data() as KitArchivo), _id: d.id }))
  } catch (err) {
    logFirestoreError('getKitArchivos', err)
    return []
  }
}

export async function createKitArchivo(data: Omit<KitArchivo, '_id'>): Promise<string> {
  const snap = await getDocs(kitCol())
  const clean = stripUndefined(data) as Omit<KitArchivo, '_id'>
  const ref  = await addDoc(kitCol(), { ...clean, orden: snap.size, createdAt: serverTimestamp() })
  return ref.id
}

export async function deleteKitArchivo(id: string) {
  await deleteDoc(doc(db!, 'kit_archivos', id))
}

export async function updateKitArchivoOrden(id: string, orden: number) {
  await updateDoc(doc(db!, 'kit_archivos', id), { orden })
}

/* ══ LEADS ══════════════════════════════════════════════════ */

export async function saveLead(email: string, telefono?: string): Promise<void> {
  if (!firebaseReady || !db) return
  try {
    await addDoc(leadsCol(), {
      email:     email.trim().toLowerCase(),
      ...(telefono ? { telefono: telefono.trim() } : {}),
      fuente:    'kit',
      estado:    'nuevo',
      createdAt: serverTimestamp(),
    })
  } catch (err) {
    logFirestoreError('saveLead', err) // no bloquear al usuario, pero sí queda registrado
  }
}

const leadsCrud = makeCrud<Lead>('leads', 'createdAt', 'desc')

export const getLeads = leadsCrud.getAll

export function updateLeadEstado(id: string, estado: Lead['estado']) {
  return leadsCrud.update(id, { estado } as Partial<Lead>)
}

export const deleteLead = leadsCrud.remove

/* ══ BRIEFS ═════════════════════════════════════════════════ */

export async function saveBrief(data: Omit<Brief, '_id'>): Promise<string> {
  const ref = await addDoc(briefsCol(), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function getBriefs(): Promise<Brief[]> {
  if (!firebaseReady || !db) return []
  try {
    const snap = await getDocs(query(briefsCol(), orderBy('createdAt', 'desc')))
    return snap.docs.map(d => ({ ...(d.data() as Brief), _id: d.id }))
  } catch (err) {
    logFirestoreError('getBriefs', err)
    return []
  }
}

export async function updateBriefEstado(id: string, estado: Brief['estado']) {
  await updateDoc(doc(db!, 'briefs', id), { estado, updatedAt: serverTimestamp() })
}

export async function deleteBrief(id: string) {
  await deleteDoc(doc(db!, 'briefs', id))
}

export async function updateBrief(id: string, data: Partial<Brief>): Promise<void> {
  if (!firebaseReady || !db) return
  await updateDoc(doc(db!, 'briefs', id), { ...data, updatedAt: serverTimestamp() })
}

export async function getBriefFormConfig(): Promise<BriefFormConfig> {
  if (!firebaseReady || !db) return DEFAULT_BRIEF_CONFIG
  try {
    const snap = await getDoc(briefConfigDoc())
    if (!snap.exists()) return DEFAULT_BRIEF_CONFIG
    const data = snap.data() as BriefFormConfig
    // Merge with defaults so new fields added later are always present
    const existingKeys = new Set(data.fields.map(f => f.key))
    const mergedFields = [
      ...data.fields,
      ...DEFAULT_BRIEF_CONFIG.fields.filter(f => !existingKeys.has(f.key)),
    ]
    return { ...data, fields: mergedFields }
  } catch (err) {
    logFirestoreError('getBriefFormConfig', err)
    return DEFAULT_BRIEF_CONFIG
  }
}

export async function saveBriefFormConfig(config: BriefFormConfig): Promise<void> {
  if (!firebaseReady || !db) return
  await setDoc(briefConfigDoc(), { ...config, updatedAt: serverTimestamp() })
}

/* ══ CLOUDINARY — LOGOS ═════════════════════════════════════ */

/**
 * Sube el logo de un cliente a Cloudinary (unsigned upload) y devuelve la URL segura.
 * Requiere VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en .env.
 * El preset debe ser "unsigned" en Cloudinary Dashboard → Settings → Upload.
 */
export async function uploadClienteLogo(file: File, _slug: string): Promise<string> {
  const cloud  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  if (!cloud || !preset) {
    throw new Error('Configura VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en tus variables de entorno.')
  }
  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', preset)
  body.append('folder', 'alma/logos')
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body })
  const data = await res.json() as { secure_url?: string; error?: { message: string } }
  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message ?? 'Error subiendo imagen a Cloudinary')
  }
  return data.secure_url
}

/* ══ CLIENTES ═══════════════════════════════════════════════ */

function clientesCol() { return collection(db!, 'clientes') }

/** Genera un slug legible desde el nombre de la marca.
 *  Ej: "Studio Álma Co." → "studio-alma-co" */
export function marcaToSlug(marca: string): string {
  return (marca ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // á→a, é→e, ü→u
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')     // todo lo demás → guion
    .replace(/^-+|-+$/g, '')          // quitar guiones extremos
    .slice(0, 50) || 'cliente'
}

function portalPayload(c: Partial<Cliente>): {
  nombre: string; marca: string; email: string; empresa: string | null
  telefono: string | null; servicios: string[]; estado: string
  entregables: Entregable[]; parrilla: ParrillaItem[]; solicitudes: Solicitud[]
  contrato_url: string | null; fecha_inicio: string | null
  valor_contrato: string | null; moneda: string | null
  logo_url: string | null; metricas_historico: import('../data/clientes').MetricaMes[]
  acomp_eventos: boolean; grabaciones_mes: number
  plan_mes: import('../data/clientes').PlanMes | null
  analisis_marca: import('../data/clientes').AnalisisMarca | null
  parrilla_htmls: import('../data/clientes').ParrillaHtml[]
  parrilla_meses: import('../data/clientes').ParrillaMes[]
  accesos: import('../data/clientes').AccesoItem[]
  brand_assets: import('../data/clientes').BrandAsset[]
  horarios_recomendados: string | null
} {
  return {
    nombre:              c.nombre              ?? '',
    marca:               c.marca               ?? '',
    email:               c.email               ?? '',
    empresa:             c.empresa             ?? null,
    telefono:            c.telefono            ?? null,
    servicios:           c.servicios           ?? [],
    estado:              c.estado              ?? 'activo',
    entregables:         c.entregables         ?? [],
    parrilla:            c.parrilla            ?? [],
    solicitudes:         c.solicitudes         ?? [],
    contrato_url:        c.contrato_url        ?? null,
    fecha_inicio:        c.fecha_inicio        ?? null,
    valor_contrato:      c.valor_contrato      ?? null,
    moneda:              c.moneda              ?? null,
    logo_url:            c.logo_url            ?? null,
    metricas_historico:  c.metricas_historico  ?? [],
    acomp_eventos:       c.acomp_eventos       ?? false,
    grabaciones_mes:     c.grabaciones_mes     ?? 0,
    plan_mes:            c.plan_mes            ?? null,
    analisis_marca:      c.analisis_marca      ?? null,
    parrilla_htmls:      c.parrilla_htmls      ?? [],
    parrilla_meses:      c.parrilla_meses      ?? [],
    accesos:             c.accesos             ?? [],
    brand_assets:        c.brand_assets        ?? [],
    horarios_recomendados: c.horarios_recomendados ?? null,
  }
}

export async function getClientes(): Promise<Cliente[]> {
  if (!firebaseReady || !db) return []
  try {
    const snap = await getDocs(query(clientesCol(), orderBy('createdAt', 'desc')))
    return snap.docs.map(d => ({ ...(d.data() as Cliente), _id: d.id }))
  } catch (err) { logFirestoreError('getClientes', err); return [] }
}

export async function getCliente(id: string): Promise<Cliente | null> {
  if (!firebaseReady || !db) return null
  try {
    const snap = await getDoc(doc(db!, 'clientes', id))
    if (!snap.exists()) return null
    return { ...(snap.data() as Cliente), _id: snap.id }
  } catch (err) { logFirestoreError('getCliente', err); return null }
}

/** Crea un cliente. Retorna { id, slug } donde slug es el access_token final. */
export async function saveCliente(
  data: Omit<Cliente, '_id'>
): Promise<{ id: string; slug: string }> {
  if (!db) throw new Error('DB not ready')

  // Slug legible desde la marca (ej: "Studio Alma" → "studio-alma")
  let slug = data.access_token || marcaToSlug(data.marca)

  // Si el slug ya existe en portales, añadir sufijo corto para unicidad
  const existing = await getDoc(doc(db!, 'portales', slug))
  if (existing.exists()) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`
  }

  const payload = stripUndefined({ ...data, access_token: slug }) as Omit<Cliente, '_id'> & { access_token: string }
  const ref     = await addDoc(clientesCol(), { ...payload, createdAt: serverTimestamp() })
  await setDoc(doc(db!, 'portales', slug), {
    ...portalPayload(payload),
    clienteId:  ref.id,
    updatedAt:  serverTimestamp(),
  })
  return { id: ref.id, slug }
}

export async function updateCliente(id: string, data: Partial<Cliente>): Promise<void> {
  if (!firebaseReady || !db) return
  const clean = stripUndefined(data) as Partial<Cliente>
  await updateDoc(doc(db!, 'clientes', id), { ...clean, updatedAt: serverTimestamp() })
  const token = clean.access_token
  if (token) {
    await setDoc(doc(db!, 'portales', token), {
      ...portalPayload(clean),
      clienteId: id,
      updatedAt:  serverTimestamp(),
    }, { merge: true })
  }
}

export async function deleteCliente(id: string): Promise<void> {
  if (!firebaseReady || !db) return
  const snap = await getDoc(doc(db!, 'clientes', id))
  if (snap.exists()) {
    const token = (snap.data() as Cliente).access_token
    if (token) await deleteDoc(doc(db!, 'portales', token))
  }
  await deleteDoc(doc(db!, 'clientes', id))
}

export async function getPortalByToken(
  token: string
): Promise<(Partial<Cliente> & { clienteId?: string }) | null> {
  if (!firebaseReady || !db) return null
  try {
    const snap = await getDoc(doc(db!, 'portales', token))
    if (!snap.exists()) return null
    return snap.data() as (Partial<Cliente> & { clienteId?: string })
  } catch (err) { logFirestoreError('getPortalByToken', err); return null }
}

export async function addSolicitudToPortal(
  token: string,
  clienteId: string,
  solicitud: Solicitud,
): Promise<void> {
  if (!firebaseReady || !db) return
  await Promise.all([
    updateDoc(doc(db!, 'portales',  token),     { solicitudes: arrayUnion(solicitud) }),
    updateDoc(doc(db!, 'clientes',  clienteId), { solicitudes: arrayUnion(solicitud), updatedAt: serverTimestamp() }),
  ])
}

export async function updateEntregableEnPortal(
  token: string,
  clienteId: string,
  entregableId: string,
  changes: Partial<Entregable>,
): Promise<void> {
  if (!firebaseReady || !db) return

  // 1. Actualizar portales/{token}
  const portalSnap = await getDoc(doc(db!, 'portales', token))
  if (portalSnap.exists()) {
    const entregables = ((portalSnap.data().entregables ?? []) as Entregable[]).map(e =>
      e.id === entregableId ? { ...e, ...changes } : e
    )
    await updateDoc(doc(db!, 'portales', token), { entregables })
  }

  // 2. Actualizar clientes/{clienteId}
  const clienteSnap = await getDoc(doc(db!, 'clientes', clienteId))
  if (clienteSnap.exists()) {
    const entregables = ((clienteSnap.data() as Cliente).entregables ?? []).map(e =>
      e.id === entregableId ? { ...e, ...changes } : e
    )
    await updateDoc(doc(db!, 'clientes', clienteId), { entregables, updatedAt: serverTimestamp() })
  }
}

export async function updateSolicitudEnCliente(
  clienteId: string,
  token: string,
  solicitudId: string,
  changes: Partial<Solicitud>,
): Promise<void> {
  if (!firebaseReady || !db) return
  const snap = await getDoc(doc(db!, 'clientes', clienteId))
  if (!snap.exists()) return
  const c          = snap.data() as Cliente
  const solicitudes = (c.solicitudes ?? []).map((s: Solicitud) =>
    s.id === solicitudId ? { ...s, ...changes } : s
  )
  await updateDoc(doc(db!, 'clientes', clienteId), { solicitudes, updatedAt: serverTimestamp() })
  if (token) await updateDoc(doc(db!, 'portales', token), { solicitudes })
}

/* ══ DOCUMENTOS LEGALES CONFIG ══════════════════════════════ */

const legalDocsDoc = () => doc(db!, 'config', 'legal_docs')

export type LegalDocUrl = { key: string; url: string }

export async function getLegalDocsUrls(): Promise<LegalDocUrl[]> {
  if (!firebaseReady || !db) return []
  try {
    const snap = await getDoc(legalDocsDoc())
    if (!snap.exists()) return []
    return (snap.data().urls ?? []) as LegalDocUrl[]
  } catch (err) { logFirestoreError('getLegalDocsUrls', err); return [] }
}

export async function saveLegalDocsUrls(urls: LegalDocUrl[]): Promise<void> {
  if (!firebaseReady || !db) return
  await setDoc(legalDocsDoc(), { urls, updatedAt: serverTimestamp() }, { merge: true })
}

/* ══ COTIZACIONES ═══════════════════════════════════════════ */

export interface CotizacionItem {
  id: string
  descripcion: string
  cantidad: number
  precioUnit: number
  subtotal: number
}

export interface Cotizacion {
  _id?: string
  numero: string
  clienteId: string
  clienteNombre: string
  clienteEmail?: string
  clienteEmpresa?: string
  clienteNit?: string
  fecha: string
  validaHasta: string
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida'
  items: CotizacionItem[]
  iva: boolean
  ivaPct: number
  subtotal: number
  total: number
  notas: string
}

/* ══ TAREAS ═════════════════════════════════════════════════ */

const tareasCrud = makeCrud<Tarea>('tareas', 'createdAt', 'desc')

export const getTareas = tareasCrud.getAll

export async function getTareasByResponsable(responsableId: string): Promise<Tarea[]> {
  if (!firebaseReady || !db) return []
  try {
    const snap = await getDocs(query(tareasCrud.col(), where('responsableId', '==', responsableId)))
    return snap.docs.map(d => ({ ...(d.data() as Tarea), _id: d.id }))
  } catch (err) {
    logFirestoreError('getTareasByResponsable', err)
    return []
  }
}

export function createTarea(data: Omit<Tarea, '_id'>): Promise<string> {
  return tareasCrud.create(data, { createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
}

export const updateTarea = tareasCrud.update
export const deleteTarea = tareasCrud.remove

const cotizacionesCrud = makeCrud<Cotizacion>('cotizaciones', 'creadoEn', 'desc')

export const getCotizaciones = cotizacionesCrud.getAll

export function saveCotizacion(data: Omit<Cotizacion, '_id'>): Promise<string> {
  return cotizacionesCrud.create(data, { creadoEn: serverTimestamp() })
}

export const updateCotizacion = cotizacionesCrud.update
export const deleteCotizacion = cotizacionesCrud.remove

/* ══ CUENTAS DE COBRO ═══════════════════════════════════════ */

export interface CuentaConcepto {
  id: string
  descripcion: string
  valor: number
}

export interface CuentaCobro {
  _id?: string
  numero: string
  clienteId: string
  clienteNombre: string
  clienteEmpresa?: string
  clienteNit?: string
  fecha: string
  vencimiento: string
  estado: 'pendiente' | 'enviada' | 'pagada' | 'vencida'
  conceptos: CuentaConcepto[]
  total: number
  datosBancarios: string
  notas: string
}

const cuentasCobroCrud = makeCrud<CuentaCobro>('cuentas_cobro', 'creadoEn', 'desc')

export const getCuentasCobro = cuentasCobroCrud.getAll

export function saveCuentaCobro(data: Omit<CuentaCobro, '_id'>): Promise<string> {
  return cuentasCobroCrud.create(data, { creadoEn: serverTimestamp() })
}

export const updateCuentaCobro = cuentasCobroCrud.update
export const deleteCuentaCobro = cuentasCobroCrud.remove

/* ══ FINANZAS — Movimientos (ingresos / gastos) ═════════════ */

export type MovimientoTipo = 'ingreso' | 'gasto_operativo' | 'gasto_personal'

export interface Movimiento {
  _id?:        string
  fecha:       string          // YYYY-MM-DD
  tipo:        MovimientoTipo
  categoria:   string
  descripcion: string
  monto:       number
  clienteId?:  string
}

const movimientosCrud = makeCrud<Movimiento>('finanzas_movimientos', 'fecha', 'desc')

export const getMovimientos = movimientosCrud.getAll

export function saveMovimiento(data: Omit<Movimiento, '_id'>): Promise<string> {
  return movimientosCrud.create(data, { creadoEn: serverTimestamp() })
}

export const deleteMovimiento = movimientosCrud.remove

/* ══ ACADEMIA — CURSOS ══════════════════════════════════════ */

const cursosCrud = makeCrud<Curso>('cursos', 'createdAt', 'desc')

export const getCursos = cursosCrud.getAll

export async function getCurso(id: string): Promise<Curso | null> {
  if (!firebaseReady || !db) return null
  try {
    const snap = await getDoc(doc(db!, 'cursos', id))
    if (!snap.exists()) return null
    return { ...(snap.data() as Curso), _id: snap.id }
  } catch (err) { logFirestoreError('getCurso', err); return null }
}

export function createCurso(data: Omit<Curso, '_id'>): Promise<string> {
  return cursosCrud.create(stripUndefined(data) as Omit<Curso, '_id'>, { createdAt: serverTimestamp() })
}

export function updateCurso(id: string, data: Partial<Curso>): Promise<void> {
  return cursosCrud.update(id, stripUndefined(data) as Partial<Curso>)
}

export const deleteCurso = cursosCrud.remove

/* ══ ACADEMIA — RECURSOS GRATIS ═════════════════════════════ */

const recursosCrud = makeCrud<Recurso>('recursos', 'orden', 'asc')

export const getRecursos = recursosCrud.getAll

export function createRecurso(data: Omit<Recurso, '_id'>): Promise<string> {
  return recursosCrud.create(stripUndefined(data) as Omit<Recurso, '_id'>, { createdAt: serverTimestamp() })
}

export function updateRecurso(id: string, data: Partial<Recurso>): Promise<void> {
  return recursosCrud.update(id, stripUndefined(data) as Partial<Recurso>)
}

export const deleteRecurso = recursosCrud.remove

/** Puebla la colección `recursos` con los 7 Hacks de Instagram que hoy viven
 *  hardcodeados en el sitio público (alma-edu) — pensada para un solo uso,
 *  desde el botón en /admin/academia, cuando la colección está vacía. */
export async function seedRecursosHacksIG(): Promise<void> {
  if (!db) throw new Error('DB not ready')
  for (const r of RECURSOS_SEED_HACKS_IG) {
    await recursosCrud.create(r, { createdAt: serverTimestamp() })
  }
}

/* ══ BANCO DE IDEAS ═════════════════════════════════════════ */

const ideasCrud = makeCrud<Idea>('ideas', 'createdAt', 'desc')

/** Ideas de un cliente. Se ordenan en cliente (sin orderBy en la query para
 *  no requerir índice compuesto), más recientes primero. */
export async function getIdeasByCliente(clienteId: string): Promise<Idea[]> {
  if (!firebaseReady || !db) return []
  try {
    const snap = await getDocs(query(ideasCrud.col(), where('clienteId', '==', clienteId)))
    const items = snap.docs.map(d => ({ ...(d.data() as Idea), _id: d.id }))
    return items.sort((a, b) => {
      const ta = (a.createdAt as { seconds?: number })?.seconds ?? 0
      const tb = (b.createdAt as { seconds?: number })?.seconds ?? 0
      return tb - ta
    })
  } catch (err) { logFirestoreError('getIdeasByCliente', err); return [] }
}

export function createIdea(data: Omit<Idea, '_id'>): Promise<string> {
  return ideasCrud.create(stripUndefined(data) as Omit<Idea, '_id'>, {
    votos_equipo: 0, votos_cliente: 0,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
}

export const updateIdea = ideasCrud.update
export const deleteIdea = ideasCrud.remove

export async function votarIdea(id: string, tipo: 'equipo' | 'cliente'): Promise<void> {
  if (!firebaseReady || !db) return
  const field = tipo === 'equipo' ? 'votos_equipo' : 'votos_cliente'
  await updateDoc(doc(db!, 'ideas', id), { [field]: increment(1), updatedAt: serverTimestamp() })
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
