import { Component, type ReactNode } from 'react'
import { P, Y } from '../tokens'

interface Props  { children: ReactNode }
interface State  { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? 'Error desconocido' }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#F9FAFB', padding: '24px', textAlign: 'center',
      }}>
        <span style={{ fontSize: '56px', marginBottom: '20px', display: 'block' }}>⚠️</span>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', marginBottom: '10px' }}>
          Algo salió mal
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px', maxWidth: '400px', lineHeight: 1.65 }}>
          Ocurrió un error inesperado. Intenta recargar la página.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: P, color: '#fff',
              padding: '12px 24px', borderRadius: '10px',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none',
            }}
          >
            Recargar página
          </button>
          <button
            onClick={() => { this.setState({ hasError: false, message: '' }) }}
            style={{
              background: '#fff', color: '#374151',
              padding: '12px 24px', borderRadius: '10px',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              border: '1.5px solid #E5E7EB',
            }}
          >
            Intentar de nuevo
          </button>
        </div>
        {import.meta.env.DEV && (
          <pre style={{
            marginTop: '24px', padding: '12px 16px', borderRadius: '8px',
            background: '#FEF2F2', color: '#EF4444',
            fontSize: '11px', maxWidth: '600px', textAlign: 'left',
            overflow: 'auto', border: '1px solid #FCA5A5',
          }}>
            {this.state.message}
          </pre>
        )}
        <a
          href="/"
          style={{
            marginTop: '20px', color: Y, fontSize: '13px', fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          ← Volver al inicio
        </a>
      </div>
    )
  }
}
