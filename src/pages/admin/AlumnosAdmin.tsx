import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'
import { ADM } from '../../lib/adminTheme'
import { toast, confirmar } from '../../components/admin/Feedback'
import { ListSkeleton } from '../../components/admin/Loading'
import {
  listarAlumnos, crearAlumno, actualizarAlumno, asignarPassword, enviarReset,
  bloquearAlumno, eliminarAlumno, registrarCertificado, enviarCorreoAlumno,
  type Alumno,
} from '../../lib/academiaAdmin'
import { descargarCertificado, certificadoBase64 } from '../../lib/certificado'

const { BK, DIM, BDR, MUT, WHT, C1, GRN, AMB, ROSE, INPUT_BG } = ADM

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '9px',
  border: `1.5px solid ${BDR}`, fontSize: '14px', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit', background: INPUT_BG, color: WHT,
}
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 700, color: MUT, marginBottom: '5px' }

function fechaLegible(): string {
  return new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}
function nuevoNumero(): string {
  return `ALMA-${Date.now().toString(36).toUpperCase()}`
}

/* ── Modal genérico ──────────────────────────────────────── */
function Modal({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9990, background: 'rgba(8,4,18,0.62)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: DIM, borderRadius: '18px', padding: '24px', width: '100%', maxWidth: '460px', border: `1px solid ${BDR}`, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 18px', fontSize: '17px', fontWeight: 800, color: WHT }}>{titulo}</h3>
        {children}
      </div>
    </div>
  )
}

type ModalState =
  | { tipo: 'nuevo' }
  | { tipo: 'editar'; alumno: Alumno }
  | { tipo: 'password'; alumno: Alumno }
  | { tipo: 'correo'; alumno: Alumno }
  | null

export default function AlumnosAdmin() {
  const isMobile = useIsMobile()
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [q, setQ]             = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [modal, setModal]     = useState<ModalState>(null)
  const [busy, setBusy]       = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setAlumnos(await listarAlumnos())
    } catch (e) {
      setError(String((e as Error).message))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const filtrados = alumnos.filter(a =>
    !q.trim() || a.nombre.toLowerCase().includes(q.toLowerCase()) || a.email.toLowerCase().includes(q.toLowerCase())
  )

  /* ── Acciones ── */
  const toggleBloqueo = async (a: Alumno) => {
    if (!(await confirmar({ mensaje: `¿${a.disabled ? 'Reactivar' : 'Bloquear'} la cuenta de ${a.nombre}?`, peligro: !a.disabled, accion: a.disabled ? 'Reactivar' : 'Bloquear' }))) return
    try { await bloquearAlumno(a.uid, !a.disabled); toast.ok(a.disabled ? 'Cuenta reactivada' : 'Cuenta bloqueada'); load() }
    catch (e) { toast.err(String((e as Error).message)) }
  }
  const eliminar = async (a: Alumno) => {
    if (!(await confirmar({ mensaje: `¿Eliminar a ${a.nombre}? Se borran su cuenta y su progreso. No se puede deshacer.`, accion: 'Eliminar' }))) return
    try { await eliminarAlumno(a.uid); toast.ok('Alumno eliminado'); load() }
    catch (e) { toast.err(String((e as Error).message)) }
  }
  const mandarReset = async (a: Alumno) => {
    try { await enviarReset(a.email); toast.ok(`Enlace de restablecimiento enviado a ${a.email}`) }
    catch (e) { toast.err(String((e as Error).message)) }
  }
  const certificar = async (a: Alumno, cursoId: string, cursoTitulo: string, enviar: boolean) => {
    const numero = nuevoNumero()
    const cert = { nombre: a.nombre, curso: cursoTitulo, fecha: fechaLegible(), numero }
    try {
      await registrarCertificado(a.uid, cursoId, numero)
      if (enviar) {
        await enviarCorreoAlumno(
          a.email,
          `Tu certificado del curso ${cursoTitulo}`,
          `¡Felicitaciones ${a.nombre}! Adjuntamos tu certificado de finalización del curso "${cursoTitulo}".`,
          certificadoBase64(cert),
          `certificado-${cursoTitulo}.pdf`,
        )
        toast.ok('Certificado emitido y enviado por correo')
      } else {
        descargarCertificado(cert)
        toast.ok('Certificado emitido y descargado')
      }
      load()
    } catch (e) { toast.err(String((e as Error).message)) }
  }

  return (
    <AdminLayout>
      <div style={{ background: BK, minHeight: '100vh', padding: isMobile ? '20px 16px' : '32px 36px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: `0.5px solid ${BDR}`, marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUT }}>ALMA · ACADEMIA</p>
            <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: WHT }}>👩‍🎓 Alumnos</h1>
          </div>
          <button onClick={() => setModal({ tipo: 'nuevo' })} style={{ background: C1, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            + Nuevo alumno
          </button>
        </div>

        {/* Búsqueda */}
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o correo…" style={{ ...inputStyle, marginBottom: '18px', maxWidth: '360px' }} />

        {loading ? (
          <ListSkeleton rows={4} />
        ) : error ? (
          <div style={{ background: `${ROSE}12`, border: `1px solid ${ROSE}40`, borderRadius: '14px', padding: '20px', color: ROSE }}>
            <p style={{ margin: '0 0 6px', fontWeight: 700 }}>No se pudo cargar la lista de alumnos</p>
            <p style={{ margin: 0, fontSize: '13px', color: MUT }}>{error}</p>
            <p style={{ margin: '10px 0 0', fontSize: '12px', color: MUT }}>
              Si dice "FIREBASE_SERVICE_ACCOUNT no configurada", falta pegar la llave de cuenta de servicio en Vercel.
            </p>
          </div>
        ) : filtrados.length === 0 ? (
          <div style={{ background: DIM, borderRadius: '16px', padding: '48px', textAlign: 'center', border: `1px solid ${BDR}` }}>
            <span style={{ fontSize: '46px', display: 'block', marginBottom: '14px' }}>👩‍🎓</span>
            <p style={{ fontSize: '16px', fontWeight: 700, color: WHT, marginBottom: '6px' }}>{q ? 'Sin resultados' : 'Aún no hay alumnos'}</p>
            <p style={{ fontSize: '14px', color: MUT }}>{q ? 'Prueba con otro término.' : 'Crea el primero o espera a que se registren en la Academia.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtrados.map(a => {
              const isOpen = expanded === a.uid
              return (
                <div key={a.uid} style={{ background: DIM, borderRadius: '14px', border: `1px solid ${BDR}`, overflow: 'hidden' }}>
                  {/* Fila principal */}
                  <div onClick={() => setExpanded(isOpen ? null : a.uid)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${C1}20`, color: C1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px', flexShrink: 0 }}>
                      {(a.nombre || a.email).charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14.5px', fontWeight: 700, color: WHT }}>{a.nombre || '(sin nombre)'}</span>
                        {a.disabled && <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', color: ROSE, background: `${ROSE}18` }}>Bloqueado</span>}
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: MUT }}>{a.email}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: '12px', color: MUT }}>{a.inscripciones.length} curso{a.inscripciones.length !== 1 ? 's' : ''}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: `${MUT}AA` }}>{a.ultimoAcceso ? `Últ. acceso ${new Date(a.ultimoAcceso).toLocaleDateString('es-CO')}` : 'Sin accesos'}</p>
                    </div>
                    <span style={{ color: MUT, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>›</span>
                  </div>

                  {/* Detalle expandido */}
                  {isOpen && (
                    <div style={{ padding: '0 20px 18px', borderTop: `1px solid ${BDR}` }}>
                      {/* Cursos */}
                      <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: MUT, margin: '16px 0 10px' }}>Aulas / progreso</p>
                      {a.inscripciones.length === 0 ? (
                        <p style={{ fontSize: '13px', color: MUT, margin: '0 0 12px' }}>No está inscrito a ningún curso.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                          {a.inscripciones.map(i => (
                            <div key={i.cursoId} style={{ background: BK, borderRadius: '10px', padding: '12px 14px', border: `1px solid ${BDR}` }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '13.5px', fontWeight: 700, color: WHT }}>{i.cursoTitulo}</span>
                                <span style={{ fontSize: '12px', color: i.progreso === 100 ? GRN : MUT, fontWeight: 700 }}>
                                  {i.progreso}% · {i.completadas}/{i.total}
                                  {i.certificado && <span style={{ marginLeft: '8px', color: AMB }}>🎓 certificado</span>}
                                </span>
                              </div>
                              <div style={{ height: '6px', background: `${MUT}22`, borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
                                <div style={{ width: `${i.progreso}%`, height: '100%', background: i.progreso === 100 ? GRN : C1, borderRadius: '3px' }} />
                              </div>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button onClick={() => certificar(a, i.cursoId, i.cursoTitulo, false)} style={miniBtn(C1)}>⬇️ Certificado</button>
                                <button onClick={() => certificar(a, i.cursoId, i.cursoTitulo, true)} style={miniBtn(C1)}>✉️ Enviar certificado</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Acciones del alumno */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => setModal({ tipo: 'editar', alumno: a })} style={miniBtn(C1)}>✏️ Editar</button>
                        <button onClick={() => setModal({ tipo: 'password', alumno: a })} style={miniBtn(C1)}>🔑 Contraseña</button>
                        <button onClick={() => mandarReset(a)} style={miniBtn(C1)}>🔁 Enviar reset</button>
                        <button onClick={() => setModal({ tipo: 'correo', alumno: a })} style={miniBtn(C1)}>✉️ Correo</button>
                        <button onClick={() => toggleBloqueo(a)} style={miniBtn(AMB)}>{a.disabled ? '✅ Reactivar' : '🚫 Bloquear'}</button>
                        <button onClick={() => eliminar(a)} style={miniBtn(ROSE)}>🗑️ Eliminar</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Modales ── */}
      {modal?.tipo === 'nuevo' && (
        <NuevoAlumnoModal busy={busy} setBusy={setBusy} onClose={() => setModal(null)} onDone={() => { setModal(null); load() }} />
      )}
      {modal?.tipo === 'editar' && (
        <EditarAlumnoModal alumno={modal.alumno} busy={busy} setBusy={setBusy} onClose={() => setModal(null)} onDone={() => { setModal(null); load() }} />
      )}
      {modal?.tipo === 'password' && (
        <PasswordModal alumno={modal.alumno} busy={busy} setBusy={setBusy} onClose={() => setModal(null)} />
      )}
      {modal?.tipo === 'correo' && (
        <CorreoModal alumno={modal.alumno} busy={busy} setBusy={setBusy} onClose={() => setModal(null)} />
      )}
    </AdminLayout>
  )
}

function miniBtn(color: string): React.CSSProperties {
  return {
    padding: '7px 12px', borderRadius: '8px', border: `1px solid ${color}40`,
    background: `${color}14`, color, fontSize: '12px', fontWeight: 700, cursor: 'pointer',
  }
}

/* ── Modal: nuevo alumno ── */
function NuevoAlumnoModal({ busy, setBusy, onClose, onDone }: { busy: boolean; setBusy: (b: boolean) => void; onClose: () => void; onDone: () => void }) {
  const [nombre, setNombre]     = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const guardar = async () => {
    if (!nombre.trim() || !email.trim() || password.length < 6) { toast.err('Nombre, correo y contraseña (mín. 6) obligatorios'); return }
    setBusy(true)
    try { await crearAlumno(nombre.trim(), email.trim(), password); toast.ok('Alumno creado'); onDone() }
    catch (e) { toast.err(String((e as Error).message)) }
    finally { setBusy(false) }
  }
  return (
    <Modal titulo="Nuevo alumno" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div><label style={labelStyle}>Nombre</label><input value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Correo</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Contraseña (mín. 6)</label><input value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} /></div>
        <ModalBotones onClose={onClose} onSave={guardar} busy={busy} label="Crear alumno" />
      </div>
    </Modal>
  )
}

/* ── Modal: editar ── */
function EditarAlumnoModal({ alumno, busy, setBusy, onClose, onDone }: { alumno: Alumno; busy: boolean; setBusy: (b: boolean) => void; onClose: () => void; onDone: () => void }) {
  const [nombre, setNombre]     = useState(alumno.nombre)
  const [email, setEmail]       = useState(alumno.email)
  const [telefono, setTelefono] = useState(alumno.telefono)
  const [notas, setNotas]       = useState(alumno.notas)
  const guardar = async () => {
    setBusy(true)
    try { await actualizarAlumno(alumno.uid, { nombre, email, telefono, notas }); toast.ok('Alumno actualizado'); onDone() }
    catch (e) { toast.err(String((e as Error).message)) }
    finally { setBusy(false) }
  }
  return (
    <Modal titulo={`Editar · ${alumno.nombre}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div><label style={labelStyle}>Nombre</label><input value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Correo</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Teléfono</label><input value={telefono} onChange={e => setTelefono(e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Notas internas</label><textarea rows={2} value={notas} onChange={e => setNotas(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} /></div>
        <ModalBotones onClose={onClose} onSave={guardar} busy={busy} label="Guardar" />
      </div>
    </Modal>
  )
}

/* ── Modal: contraseña ── */
function PasswordModal({ alumno, busy, setBusy, onClose }: { alumno: Alumno; busy: boolean; setBusy: (b: boolean) => void; onClose: () => void }) {
  const [password, setPassword] = useState('')
  const guardar = async () => {
    if (password.length < 6) { toast.err('Mínimo 6 caracteres'); return }
    setBusy(true)
    try { await asignarPassword(alumno.uid, password); toast.ok('Contraseña actualizada'); onClose() }
    catch (e) { toast.err(String((e as Error).message)) }
    finally { setBusy(false) }
  }
  return (
    <Modal titulo={`Contraseña · ${alumno.nombre}`} onClose={onClose}>
      <p style={{ fontSize: '13px', color: MUT, margin: '0 0 14px', lineHeight: 1.5 }}>
        Asigna una contraseña nueva directamente, o cierra y usa "Enviar reset" para que el alumno la elija por correo.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div><label style={labelStyle}>Nueva contraseña (mín. 6)</label><input value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} /></div>
        <ModalBotones onClose={onClose} onSave={guardar} busy={busy} label="Asignar contraseña" />
      </div>
    </Modal>
  )
}

/* ── Modal: correo ── */
function CorreoModal({ alumno, busy, setBusy, onClose }: { alumno: Alumno; busy: boolean; setBusy: (b: boolean) => void; onClose: () => void }) {
  const [asunto, setAsunto]   = useState('')
  const [mensaje, setMensaje] = useState('')
  const enviar = async () => {
    if (!asunto.trim() || !mensaje.trim()) { toast.err('Asunto y mensaje obligatorios'); return }
    setBusy(true)
    try {
      const r = await enviarCorreoAlumno(alumno.email, asunto.trim(), mensaje.trim()) as { skipped?: boolean }
      toast.ok(r?.skipped ? 'Correo omitido (falta GMAIL_APP_PASSWORD)' : `Correo enviado a ${alumno.email}`)
      onClose()
    } catch (e) { toast.err(String((e as Error).message)) }
    finally { setBusy(false) }
  }
  return (
    <Modal titulo={`Correo · ${alumno.nombre}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ fontSize: '12.5px', color: MUT, margin: 0 }}>Para: {alumno.email}</p>
        <div><label style={labelStyle}>Asunto</label><input value={asunto} onChange={e => setAsunto(e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Mensaje</label><textarea rows={5} value={mensaje} onChange={e => setMensaje(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} /></div>
        <ModalBotones onClose={onClose} onSave={enviar} busy={busy} label="Enviar correo" />
      </div>
    </Modal>
  )
}

function ModalBotones({ onClose, onSave, busy, label }: { onClose: () => void; onSave: () => void; busy: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
      <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: '10px', border: `1.5px solid ${BDR}`, background: 'transparent', color: WHT, fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
      <button onClick={onSave} disabled={busy} style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: busy ? MUT : C1, color: '#fff', fontWeight: 700, fontSize: '13px', cursor: busy ? 'not-allowed' : 'pointer' }}>{busy ? 'Un momento…' : label}</button>
    </div>
  )
}
