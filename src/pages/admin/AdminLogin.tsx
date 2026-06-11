import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { P } from '../../tokens'

export default function AdminLogin() {
  const { login }              = useAuth()
  const navigate               = useNavigate()
  const [email,    setEmail]   = useState('')
  const [password, setPassword]= useState('')
  const [showPwd,  setShowPwd] = useState(false)
  const [error,    setError]   = useState('')
  const [loading,  setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch {
      setError('Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0D0220 0%, #1A0535 55%, #0A0118 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '24px',
        padding: '48px 40px', width: '100%', maxWidth: '420px',
        boxShadow: '0 24px 80px rgba(107,33,168,0.25)',
        border: '1px solid rgba(107,33,168,0.12)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex',
            background: P, padding: '8px 18px', borderRadius: '12px',
            marginBottom: '20px',
          }}>
            <img src="/alma-logo.png" alt="Alma" style={{ height: '44px', width: 'auto' }} />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
            Panel de administración
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            Accede con tu cuenta de Alma
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@alma.com"
              required
              style={{
                width: '100%', padding: '11px 14px', borderRadius: '10px',
                border: `1.5px solid ${error ? '#EF4444' : '#E5E7EB'}`,
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = P)}
              onBlur={e => (e.currentTarget.style.borderColor = error ? '#EF4444' : '#E5E7EB')}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '11px 42px 11px 14px', borderRadius: '10px',
                  border: `1.5px solid ${error ? '#EF4444' : '#E5E7EB'}`,
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = P)}
                onBlur={e => (e.currentTarget.style.borderColor = error ? '#EF4444' : '#E5E7EB')}
              />
              <button
                type="button"
                onClick={() => setShowPwd(s => !s)}
                aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '15px', padding: '4px', lineHeight: 1, opacity: 0.55,
                }}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <p style={{
              fontSize: '13px', color: '#EF4444', fontWeight: 600,
              padding: '10px 14px', background: '#FEF2F2',
              borderRadius: '8px', margin: 0,
            }}>
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              background: loading ? '#9CA3AF' : P,
              color: '#fff', border: 'none',
              padding: '13px', borderRadius: '12px',
              fontWeight: 700, fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#581C87' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = P }}
          >
            {loading ? 'Ingresando...' : 'Ingresar al panel'}
          </button>
        </form>
      </div>
    </div>
  )
}
