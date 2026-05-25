import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { P, Y } from '../tokens'

export default function NotFoundPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${P} 0%, #9333EA 60%, #C026D3 100%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <Helmet>
        <title>404 — Página no encontrada | Alma Agencia Creativa</title>
      </Helmet>

      {/* Decoración de fondo */}
      <div style={{
        position: 'absolute', top: '-120px', right: '-120px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', left: '-80px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
      }} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '48px' }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            padding: '6px 16px', borderRadius: '12px',
            display: 'inline-flex', alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <img src="/alma-logo.png" alt="Alma" style={{ height: '40px', width: 'auto' }} />
          </div>
        </Link>
      </motion.div>

      {/* 404 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p style={{
          fontSize: 'clamp(100px, 20vw, 180px)', fontWeight: 900,
          color: 'rgba(255,255,255,0.12)', lineHeight: 1,
          letterSpacing: '-8px', marginBottom: '-24px',
          userSelect: 'none',
        }}>
          404
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>🔍</span>
        <h1 style={{
          fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900,
          color: '#fff', letterSpacing: '-1px', marginBottom: '14px', lineHeight: 1.2,
        }}>
          Página no encontrada
        </h1>
        <p style={{
          fontSize: '16px', color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.7, maxWidth: '420px', margin: '0 auto 36px',
        }}>
          La URL que buscas no existe o fue movida.
          Prueba con uno de estos destinos.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#fff', color: P,
              padding: '13px 28px', borderRadius: '12px',
              fontWeight: 700, fontSize: '15px', textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'
            }}
          >
            ← Volver al inicio
          </Link>
          <Link
            to="/blog"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: Y, color: '#111',
              padding: '13px 28px', borderRadius: '12px',
              fontWeight: 700, fontSize: '15px', textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(250,204,21,0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(250,204,21,0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(250,204,21,0.3)'
            }}
          >
            Ver el blog →
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
