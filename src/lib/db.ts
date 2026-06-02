import {
  collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, arrayUnion,
} from 'firebase/firestore'
import { db, firebaseReady } from './firebase'
import { articulos as staticArticulos } from '../data/articulos'
import { proyectosEstaticos } from '../data/portafolio'
import { planesEstaticos, extrasEstaticos, categoriasEstaticas } from '../data/precios'
import {
  seccionesDefault, clientesEstaticos, testimoniosEstaticos, faqsEstaticos,
  contactoDefault, heroStatsDefault, heroSubtituloDefault,
  principiosDefault, leadMagnetDefault,
} from '../data/config'
import { pasosEstaticos, equipoEstatico } from '../data/contenido'
import type { Articulo } from '../data/articulos'
import type { Proyecto } from '../data/portafolio'
import type { Plan, Extra, ServicioCategoria } from '../data/precios'
import type { SiteConfig, SeccionesConfig, Testimonio, FaqItem, ContactoInfo, HeroStat, ManifiestoItem, LeadMagnetConfig } from '../data/config'
import type { PasoItem, EquipoMember } from '../data/contenido'
import type { KitArchivo, Lead } from '../data/leads'
import type { Brief, BriefFormConfig } from '../data/briefs'
import { DEFAULT_BRIEF_CONFIG } from '../data/briefs'
import type { Cliente, Entregable, ParrillaItem, Solicitud } from '../data/clientes'



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
    principios:     principiosDefault,
    leadMagnet:     leadMagnetDefault,
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
        }
      })
      .catch(() => fallback)
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
    const all = snap.docs.map(d => ({ ...(d.data() as PasoItem), _id: d.id }))
    // Deduplicar por campo `n` — conservar el primero encontrado (orden asc)
    const seen = new Set<string>()
    return all.filter(p => {
      if (seen.has(p.n)) return false
      seen.add(p.n)
      return true
    })
  } catch {
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
  } catch {
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
  } catch {
    return []
  }
}

export async function createKitArchivo(data: Omit<KitArchivo, '_id'>): Promise<string> {
  const snap = await getDocs(kitCol())
  const ref  = await addDoc(kitCol(), { ...data, orden: snap.size, createdAt: serverTimestamp() })
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
  } catch { /* silencioso — no bloquear al usuario */ }
}

export async function getLeads(): Promise<Lead[]> {
  if (!firebaseReady || !db) return []
  try {
    const snap = await getDocs(query(leadsCol(), orderBy('createdAt', 'desc')))
    return snap.docs.map(d => ({ ...(d.data() as Lead), _id: d.id }))
  } catch {
    return []
  }
}

export async function updateLeadEstado(id: string, estado: Lead['estado']) {
  await updateDoc(doc(db!, 'leads', id), { estado, updatedAt: serverTimestamp() })
}

export async function deleteLead(id: string) {
  await deleteDoc(doc(db!, 'leads', id))
}

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
  } catch {
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
  } catch {
    return DEFAULT_BRIEF_CONFIG
  }
}

export async function saveBriefFormConfig(config: BriefFormConfig): Promise<void> {
  if (!firebaseReady || !db) return
  await setDoc(briefConfigDoc(), { ...config, updatedAt: serverTimestamp() })
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
} {
  return {
    nombre:       c.nombre       ?? '',
    marca:        c.marca        ?? '',
    email:        c.email        ?? '',
    empresa:      c.empresa      ?? null,
    telefono:     c.telefono     ?? null,
    servicios:    c.servicios    ?? [],
    estado:       c.estado       ?? 'activo',
    entregables:  c.entregables  ?? [],
    parrilla:     c.parrilla     ?? [],
    solicitudes:  c.solicitudes  ?? [],
    contrato_url: c.contrato_url ?? null,
    fecha_inicio: c.fecha_inicio ?? null,
  }
}

export async function getClientes(): Promise<Cliente[]> {
  if (!firebaseReady || !db) return []
  try {
    const snap = await getDocs(query(clientesCol(), orderBy('createdAt', 'desc')))
    return snap.docs.map(d => ({ ...(d.data() as Cliente), _id: d.id }))
  } catch { return [] }
}

export async function getCliente(id: string): Promise<Cliente | null> {
  if (!firebaseReady || !db) return null
  try {
    const snap = await getDoc(doc(db!, 'clientes', id))
    if (!snap.exists()) return null
    return { ...(snap.data() as Cliente), _id: snap.id }
  } catch { return null }
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

  const payload = { ...data, access_token: slug }
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
  await updateDoc(doc(db!, 'clientes', id), { ...data, updatedAt: serverTimestamp() })
  const token = data.access_token
  if (token) {
    await setDoc(doc(db!, 'portales', token), {
      ...portalPayload(data),
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
  } catch { return null }
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
