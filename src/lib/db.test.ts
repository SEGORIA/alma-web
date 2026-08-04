import { describe, it, expect } from 'vitest'
import { stripUndefined, marcaToSlug } from './db'

describe('stripUndefined', () => {
  it('elimina claves con valor undefined en el nivel superior', () => {
    expect(stripUndefined({ a: 1, b: undefined, c: 'x' })).toEqual({ a: 1, c: 'x' })
  })

  it('elimina claves undefined en objetos anidados', () => {
    expect(stripUndefined({ a: { b: undefined, c: 2 } })).toEqual({ a: { c: 2 } })
  })

  it('conserva null (Firestore sí acepta null)', () => {
    expect(stripUndefined({ a: null, b: undefined })).toEqual({ a: null })
  })

  it('limpia undefined dentro de cada elemento de un array', () => {
    expect(stripUndefined([{ a: 1, b: undefined }, { a: 2 }])).toEqual([{ a: 1 }, { a: 2 }])
  })

  it('aplana un array-de-arrays anidado (dato legacy corrupto)', () => {
    expect(stripUndefined([[1, 2], [3]])).toEqual([1, 2, 3])
  })

  it('deja intactos valores primitivos', () => {
    expect(stripUndefined('texto')).toBe('texto')
    expect(stripUndefined(42)).toBe(42)
    expect(stripUndefined(null)).toBe(null)
  })
})

describe('marcaToSlug', () => {
  it('convierte a minúsculas y reemplaza espacios por guiones', () => {
    expect(marcaToSlug('Studio Alma')).toBe('studio-alma')
  })

  it('quita tildes y ñ', () => {
    expect(marcaToSlug('Diseño y Café Ñuñoa')).toBe('diseno-y-cafe-nunoa')
  })

  it('reemplaza caracteres no alfanuméricos por guiones y recorta los extremos', () => {
    expect(marcaToSlug('  Studio Álma Co.!! ')).toBe('studio-alma-co')
  })

  it('devuelve "cliente" para un valor vacío', () => {
    expect(marcaToSlug('')).toBe('cliente')
  })
})
