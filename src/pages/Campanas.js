import { useEffect, useState } from 'react';
import api from '../utils/api';

const VINO = '#8B1A1A';

const SEGMENTOS = [
  { value: 'todos',     label: 'Todos los clientes' },
  { value: 'vip',       label: 'Solo VIP' },
  { value: 'inactivos', label: 'Solo inactivos' },
  { value: 'frecuente', label: 'Frecuentes' },
  { value: 'nuevo',     label: 'Nuevos' },
];

const LOCALES = [
  { value: 'todos',  label: '👥 Todos los locales', color: '#555' },
  { value: 'mujer',  label: '👗 Solo Mujer',         color: '#E1306C' },
  { value: 'hombre', label: '👔 Solo Hombre',        color: '#1877F2' },
];

const PLANTILLAS = [
  { label: 'Post-compra', msg: 'Gracias por tu compra 💖 te va a encantar cómo te queda. Cualquier consulta, estamos acá.' },
  { label: 'Cross-sell',  msg: 'Te guardé algo que combina perfecto con lo que llevaste 👀 ¿Querés que te lo cuente?' },
  { label: 'Reactivación',msg: 'Hace tiempo que no venís... ¿Te muestro lo nuevo? Tenemos piezas que te van a enamorar 🌟' },
  { label: 'VIP',         msg: 'Acceso anticipado solo para vos ✨ Nueva colección disponible antes que salga al público.' },
  { label: 'Lanzamiento', msg: '¡Ya llegó! La nueva colección está disponible. Piezas únicas, exclusivas para nuestra comunidad 🖤' },
];

// Badge visual según local
function LocalBadge({ local }) {
  if (!local || local === 'todos') return <span style={badgeStyle('#555')}>👥 Todos</span>;
  if (local === 'mujer')  return <span style={badgeStyle('#E1306C')}>👗 Mujer</span>;
  if (local === 'hombre') return <span style={badgeStyle('#1877F2')}>👔 Hombre</span>;
  return null;
}
function badgeStyle(color) {
  return { display:'inline-block', padding:'2px 10px', borderRadius:20,
           background: color + '18', color, fontSize:11, fontWeight:700, border:`1px solid ${color}40` };
}

export default function Campanas() {
  const [campanas, setCampanas] = useState([]);
  const [form, setForm]         = useState({ nombre: '', mensaje: '', segmento: 'todos', local: 'todos' });
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState({ texto: '', tipo: 'success' });
  const [filtroLocal, setFiltroLocal] = useState('todos');

  useEffect(() => {
    api.get('/campanas').then(r => setCampanas(r.data));
  }, []);

  const flash = (texto, tipo = 'success') => {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg({ texto: '', tipo: 'success' }), 4000);
  };

  const crearCampana = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/campanas', form);
      setCampanas([data, ...campanas]);
      setForm({ nombre: '', mensaje: '', segmento: 'todos', local: 'todos' });
      flash('Campaña creada ✓');
    } catch (err) {
      flash(err.response?.data?.error || 'Error al crear campaña', 'error');
    } finally {
      setLoading(false);
    }
  };

  const enviarCampana = async (campana) => {
    const destino = campana.local === 'todos' ? 'todos los locales'
                  : campana.local === 'mujer' ? 'Local Mujer' : 'Local Hombre';
    if (!window.confirm(`¿Enviar "${campana.nombre}" a ${destino}? No se puede deshacer.`)) return;
    try {
      const { data } = await api.post(`/campanas/${campana.id}/enviar`);
      flash(`✓ Campaña enviada a ${data.enviados} clientes`);
      api.get('/campanas').then(r => setCampanas(r.data));
    } catch (err) {
      flash(err.response?.data?.error || 'Error al enviar', 'error');
    }
  };

  // Filtrar lista de campañas según filtro activo
  const campanasFiltradas = filtroLocal === 'todos'
    ? campanas
    : campanas.filter(c => c.local === filtroLocal || (!c.local && filtroLocal === 'mujer'));

  return (
    <div className="page-content">
      <div className="topbar"><h1>Campañas</h1></div>

      <div style={{ padding: '20px 0' }}>
        {msg.texto && (
          <div className={`alert alert-${msg.tipo === 'error' ? 'error' : 'success'} mb16`}>
            {msg.texto}
          </div>
        )}

        <div className="grid2">
          {/* ── Crear campaña ── */}
          <div className="card">
            <div className="card-title">Nueva campaña</div>

            {/* Plantillas rápidas */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: '#9e9c97', marginBottom: 8 }}>Plantillas rápidas:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PLANTILLAS.map(p => (
                  <button key={p.label} className="btn btn-ghost btn-sm"
                    onClick={() => setForm({ ...form, mensaje: p.msg, nombre: form.nombre || p.label })}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={crearCampana}>
              <div className="form-group">
                <label>Nombre de la campaña</label>
                <input required placeholder="Lanzamiento primavera 2025"
                  value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
              </div>

              {/* ── Selector de local ── */}
              <div className="form-group">
                <label>¿A qué local va dirigida?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 4 }}>
                  {LOCALES.map(l => {
                    const activo = form.local === l.value;
                    return (
                      <button key={l.value} type="button"
                        onClick={() => setForm({ ...form, local: l.value })}
                        style={{
                          padding: '10px 6px', border: `2px solid ${activo ? l.color : '#e2e0db'}`,
                          borderRadius: 10, background: activo ? l.color + '15' : '#fff',
                          cursor: 'pointer', fontSize: 11, fontWeight: 700,
                          color: activo ? l.color : '#9e9c97', outline: 'none',
                          transition: 'all .15s', textAlign: 'center', lineHeight: 1.4,
                        }}>
                        {l.label}
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: 11, color: '#9e9c97', marginTop: 6 }}>
                  El mensaje se envía desde el número de WhatsApp de ese local
                </p>
              </div>

              <div className="form-group">
                <label>Segmento de clientes</label>
                <select value={form.segmento} onChange={e => setForm({ ...form, segmento: e.target.value })}>
                  {SEGMENTOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Mensaje WhatsApp</label>
                <textarea required rows={5} placeholder="Escribí el mensaje..."
                  value={form.mensaje} onChange={e => setForm({ ...form, mensaje: e.target.value })} />
                <p style={{ fontSize: 11, color: '#9e9c97', marginTop: 4 }}>{form.mensaje.length} caracteres</p>
              </div>

              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', background: VINO }}
                disabled={loading}>
                {loading ? <span className="spinner" /> : 'Guardar campaña'}
              </button>
            </form>
          </div>

          {/* ── Lista de campañas ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="card-title" style={{ marginBottom: 0 }}>Campañas guardadas</div>
              {/* Filtro rápido */}
              <div style={{ display: 'flex', gap: 6 }}>
                {LOCALES.map(l => (
                  <button key={l.value} type="button"
                    onClick={() => setFiltroLocal(l.value)}
                    style={{
                      padding: '4px 10px', borderRadius: 20, border: `1.5px solid ${filtroLocal === l.value ? l.color : '#e2e0db'}`,
                      background: filtroLocal === l.value ? l.color + '18' : '#fff',
                      color: filtroLocal === l.value ? l.color : '#9e9c97',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer', outline: 'none',
                    }}>
                    {l.label.split(' ').slice(-1)[0]}
                  </button>
                ))}
              </div>
            </div>

            {campanasFiltradas.length === 0 && (
              <p style={{ color: '#9e9c97' }}>Sin campañas{filtroLocal !== 'todos' ? ` para ${filtroLocal}` : ''}</p>
            )}

            {campanasFiltradas.map(c => (
              <div key={c.id} className="card mb16">
                <div className="flex-between" style={{ marginBottom: 8 }}>
                  <strong style={{ fontSize: 14 }}>{c.nombre}</strong>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <LocalBadge local={c.local} />
                    <span className={`badge ${c.estado === 'enviada' ? 'badge-frecuente' : 'badge-plata'}`}>
                      {c.estado}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: '#5a5856', fontStyle: 'italic', marginBottom: 10 }}>
                  "{c.mensaje}"
                </p>
                <div className="flex-between">
                  <div style={{ fontSize: 12, color: '#9e9c97' }}>
                    Segmento: <strong>{c.segmento}</strong>
                    {c.total_enviados > 0 && <> · {c.total_enviados} enviados</>}
                  </div>
                  {c.estado === 'borrador' && (
                    <button className="btn btn-gold btn-sm" onClick={() => enviarCampana(c)}>
                      Enviar ahora →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
