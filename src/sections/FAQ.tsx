import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { P, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getFaqs } from '../lib/db'
import { faqsEstaticos } from '../data/config'
import type { FaqItem } from '../data/config'

function FAQItem({ faq, idx }: { faq: FaqItem; idx: number }) {
  const [open, setOpen] = useState(false)
  const btnId   = `faq-btn-${idx}`
  const panelId = `faq-panel-${idx}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.4, delay: idx * 0.05 }}
    >
      <button
        id={btnId}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 20px',
          background: open ? '#F5F3FF' : '#fff',
          border: `1px solid ${open ? '#DDD6FE' : '#E5E7EB'}`,
          borderRadius: open ? '14px 14px 0 0' : '14px',
          cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '14px', color: '#111827', paddingRight: '16px', lineHeight: 1.4 }}>{faq.q}</span>
        <span
          aria-hidden="true"
          style={{
            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: open ? Y : '#F3F4F6', color: open ? '#111' : P,
            fontWeight: 900, fontSize: '18px', lineHeight: 1, transition: 'all 0.2s ease',
          }}>
          {open ? '−' : '+'}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={btnId}
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '14px 20px 18px', background: '#F5F3FF', border: '1px solid #DDD6FE', borderTop: 'none', borderRadius: '0 0 14px 14px', fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  const isMobile = useIsMobile()
  const [faqs, setFaqs] = useState<FaqItem[]>(faqsEstaticos)

  useEffect(() => {
    getFaqs().then(setFaqs)
  }, [])

  return (
    <section style={{ background: '#fff', padding: isMobile ? '60px 20px' : '100px 24px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '36px' : '56px' }}
        >
          <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Preguntas Frecuentes</p>
          <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px' }}>
            Resolvemos tus <span style={{ color: P }}>dudas</span>
          </h2>
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {faqs.map((f, i) => <FAQItem key={f._id ?? f.q} faq={f} idx={i} />)}
        </div>
      </div>
    </section>
  )
}
