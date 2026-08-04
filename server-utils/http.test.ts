import { describe, it, expect } from 'vitest'
import { escapeHtml, isRateLimited, getClientIp } from './http'

describe('escapeHtml', () => {
  it('escapa las 5 entidades HTML peligrosas', () => {
    expect(escapeHtml(`<script>alert('xss')&"pwned"</script>`))
      .toBe('&lt;script&gt;alert(&#39;xss&#39;)&amp;&quot;pwned&quot;&lt;/script&gt;')
  })

  it('convierte null/undefined en cadena vacía', () => {
    expect(escapeHtml(null)).toBe('')
    expect(escapeHtml(undefined)).toBe('')
  })

  it('convierte valores no-string a texto', () => {
    expect(escapeHtml(42)).toBe('42')
  })

  it('deja intacto el texto sin caracteres especiales', () => {
    expect(escapeHtml('Hola Mundo')).toBe('Hola Mundo')
  })
})

describe('getClientIp', () => {
  it('usa la primera IP de x-forwarded-for', () => {
    const req = { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }, socket: {} }
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  it('recurre a socket.remoteAddress si no hay x-forwarded-for', () => {
    const req = { headers: {}, socket: { remoteAddress: '9.9.9.9' } }
    expect(getClientIp(req)).toBe('9.9.9.9')
  })

  it('devuelve "unknown" si no hay ninguna fuente de IP', () => {
    expect(getClientIp({ headers: {}, socket: {} })).toBe('unknown')
  })
})

describe('isRateLimited', () => {
  it('permite hasta 5 peticiones por minuto y bloquea la 6ª', () => {
    const ip = `test-ip-${Math.random()}`
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited(ip)).toBe(false)
    }
    expect(isRateLimited(ip)).toBe(true)
  })

  it('trata IPs distintas de forma independiente', () => {
    const ipA = `test-ip-a-${Math.random()}`
    const ipB = `test-ip-b-${Math.random()}`
    for (let i = 0; i < 5; i++) isRateLimited(ipA)
    expect(isRateLimited(ipA)).toBe(true)
    expect(isRateLimited(ipB)).toBe(false)
  })
})
