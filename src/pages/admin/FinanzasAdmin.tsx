import AdminLayout from './AdminLayout'

export default function FinanzasAdmin() {
  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <iframe
          src="/finanzas.html"
          title="Dashboard de Finanzas"
          style={{ flex: 1, width: '100%', border: 'none', display: 'block' }}
          allow="clipboard-write"
        />
      </div>
    </AdminLayout>
  )
}
