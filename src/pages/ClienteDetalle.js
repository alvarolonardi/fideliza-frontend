import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const MENSAJES_RAPIDOS = [
  { tipo: 'post_compra',  label: 'Post-compra',   ico: '💖' },
  { tipo: 'cross_sell',   label: 'Cross-sell',    ico: '👀' },
  { tipo: 'reactivacion', label: 'Reactivación',  ico: '🌟' },
  { tipo: 'vip',          label: 'VIP exclusivo', ico: '✨' },
  { tipo: 'personal_shopper', label: 'Personal shopper', ico: '👗' },
];

export default function ClienteDetalle() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [tab, setTab]         = useState('compras');
  const [compraForm, setCompraForm] = useState({ monto:'', desc:'' });
  const [msgEnviado, setMsgEnviado] = useState('');
  const [loading, setLoading]       = useState(true);
  const [canjeForm, setCanjeForm]   = useState('');
  const [canjeMsg, setCanjeMsg]     = useState('');
  const [canjeError, setCanjeError] = useState('');

  const cargar = async () => {
    setLoading(true);
    const { data } = await api.get(`/clientes/${id}`);
    setCliente(data);
    setLoading(false);
  };
  useEffect(() => { cargar(); }, [id]);

  const registrarCompra = async (e) => {
    e.preventDefault();
    await api.post(`/clientes/${id}/compra`, { monto: parseFloat(compraForm.monto), descripcion: compraForm.desc });
    setCompraForm({ monto:'', desc:'' });
    cargar();
  };

  const enviarMensaje = async (tipo) => {
    const { data } = await api.post(`/clientes/${id}/mensaje`, { tipo });
    setMsgEnviado(`Mensaje "${tipo}" enviado ✓ — Estado: ${data.estado}`);
    setTimeout(() => setMsgEnviado(''), 3000);
    cargar();
  };

  const canjearPuntos = async () => {
    const puntos = parseInt(canjeForm);
    if (!puntos || puntos < 500) {
      setCanjeError('El mínimo para canjear es 500 puntos.');
      return;
    }
    if (puntos % 500 !== 0) {
      setCanjeError('Solo podés canjear múltiplos de 500 puntos (500, 1000, 1500...).');
      return;
    }
    if (puntos > cliente.puntos) {
      setCanjeError(`El cliente solo tiene ${cliente.puntos} puntos disponibles.`);
      return;
    }
    try {
      const credito = puntos * 100;
      await api.post(`/clientes/${id}/canje-puntos`, { puntos });
      setCanjeMsg(`✓ Canje realizado: ${puntos} puntos → $${credito.toLocaleString('es-AR')} en crédito`);
      setCanjeForm('');
      setCanjeError('');
      setTimeout(() => setCanjeMsg(''), 4000);
      cargar();
    } catch (err) {
      setCanjeError(err.response?.data?.error || 'Error al procesar el canje.');
    }
  };

  const toggleVip = async () => {
    await api.put(`/clientes/${id}`, { ...cliente, es_vip: !cliente.es_vip });
    cargar();
  };

  if (loading) return <div className="page-content"><span className="spinner"/></div>;
  if (!cliente) return null;

  return (
    <div className="page-content">
      <div className="topbar">
        <div className="flex gap12">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/clientes')}>← Volver</button>
          <h1>{cliente.nombre}</h1>
          {cliente.es_vip && <span style={{color:'#c9a84c',fontSize:18}}>★ VIP</span>}
        </div>
        <button className="btn btn-sm" style={{background: cliente.es_vip ? '#c0392b' : '#c9a84c', color:'#fff', border:'none'}}
          onClick={toggleVip}>
          {cliente.es_vip ? 'Quitar VIP' : '★ Marcar VIP'}
        </button>
      </div>

      <div style={{padding:'20px 0'}}>
        {msgEnviado && <div className="alert alert-success mb16">{msgEnviado}</div>}

        <div className="grid2 mb24">
          {/* Info cliente */}
          <div className="card">
            <div className="card-title">Datos del cliente</div>
            <table style={{fontSize:13}}>
              <tbody>
                {[
                  ['Teléfono', cliente.telefono],
                  ['Email', cliente.email || '—'],
                  ['Nivel', <span className={`badge badge-${cliente.nivel}`}>{cliente.nivel}</span>],
                  ['Segmento', <span className={`badge badge-${cliente.segmento}`}>{cliente.segmento}</span>],
                  ['Puntos', <strong>{Number(cliente.puntos).toLocaleString('es-AR')}</strong>],
                  ['Total gastado', `$${Number(cliente.total_gastado||0).toLocaleString('es-AR')}`],
                  ['Última compra', cliente.ultima_compra ? new Date(cliente.ultima_compra).toLocaleDateString('es-AR') : '—'],
                  ['Miembro desde', new Date(cliente.creado_en).toLocaleDateString('es-AR')],
                  ['Cumpleaños', cliente.fecha_nacimiento ? new Date(cliente.fecha_nacimiento + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long' }) : '—'],
                  ['Local', cliente.local === 'hombre' ? '👔 Casa Sierra Hombre' : '👗 Casa Sierra Mujer'],
                  ['Origen QR', cliente.qr_origen || 'directo'],
                ].map(([k,v]) => (
                  <tr key={k}>
                    <td style={{color:'#9e9c97',paddingBottom:10,paddingRight:16,width:130}}>{k}</td>
                    <td style={{paddingBottom:10}}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Registrar compra */}
          <div className="card">
            <div className="card-title">Registrar compra</div>
            <form onSubmit={registrarCompra}>
              <div className="form-group">
                <label>Monto ($)</label>
                <input type="number" min="1" required placeholder="8500"
                  value={compraForm.monto} onChange={e=>setCompraForm({...compraForm,monto:e.target.value})} />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <input placeholder="Vestido lino verano"
                  value={compraForm.desc} onChange={e=>setCompraForm({...compraForm,desc:e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center'}}>
                Registrar compra
              </button>
            </form>
          </div>
        </div>

        {/* Canje de puntos */}
        <div className="card mb24">
          <div className="card-title">Canjear puntos</div>
          <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:10}}>
            <div style={{fontSize:13,color:'#5a5856'}}>
              Puntos disponibles: <strong style={{color:'#c9a84c',fontSize:16}}>{Number(cliente.puntos).toLocaleString('es-AR')}</strong>
              <span style={{color:'#9e9c97',marginLeft:8}}>(= ${Number(cliente.puntos * 100).toLocaleString('es-AR')} en crédito)</span>
            </div>
          </div>
          {canjeMsg && <div className="alert alert-success mb16">{canjeMsg}</div>}
          {canjeError && <div style={{padding:'10px 14px',background:'#fdecea',color:'#c0392b',borderRadius:8,fontSize:13,marginBottom:12}}>{canjeError}</div>}
          <div style={{display:'flex',gap:10,alignItems:'flex-end',flexWrap:'wrap'}}>
            <div className="form-group" style={{marginBottom:0,flex:1,minWidth:180}}>
              <label>Puntos a canjear (mínimo 500, múltiplos de 500)</label>
              <input
                type="number"
                min="500"
                step="500"
                placeholder="500"
                value={canjeForm}
                onChange={e => { setCanjeForm(e.target.value); setCanjeError(''); }}
              />
            </div>
            {canjeForm && parseInt(canjeForm) >= 500 && (
              <div style={{fontSize:13,color:'#1a7a4a',fontWeight:600,paddingBottom:6}}>
                = ${Number(parseInt(canjeForm) * 100).toLocaleString('es-AR')} en crédito
              </div>
            )}
            <button
              className="btn btn-primary"
              style={{background:'#c9a84c',marginBottom:0}}
              onClick={canjearPuntos}
              disabled={!canjeForm || parseInt(canjeForm) < 500}
            >
              Aplicar canje
            </button>
          </div>
          <p style={{fontSize:11,color:'#9e9c97',marginTop:10}}>
            1 punto = $100 · Mínimo 500 puntos · El cliente debe mostrar el mensaje de WhatsApp
          </p>
        </div>

        {/* Mensajes rápidos */}
        <div className="card mb24">
          <div className="card-title">Enviar mensaje WhatsApp</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
            {MENSAJES_RAPIDOS.map(m => (
              <button key={m.tipo} className="btn btn-ghost" onClick={()=>enviarMensaje(m.tipo)}>
                {m.ico} {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs historial */}
        <div className="card">
          <div className="flex gap8 mb16" style={{borderBottom:'1px solid #e2e0db',paddingBottom:12}}>
            {['compras','mensajes'].map(t => (
              <button key={t} onClick={()=>setTab(t)}
                className={`btn btn-sm ${tab===t ? 'btn-primary' : 'btn-ghost'}`}
                style={{textTransform:'capitalize'}}>
                {t === 'compras' ? `Compras (${cliente.compras?.length||0})` : `Mensajes (${cliente.mensajes?.length||0})`}
              </button>
            ))}
          </div>

          {tab === 'compras' && (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Descripción</th><th>Monto</th><th>Puntos</th><th>Origen</th><th>Fecha</th></tr></thead>
                <tbody>
                  {(cliente.compras||[]).map(c => (
                    <tr key={c.id}>
                      <td>{c.descripcion || '—'}</td>
                      <td style={{fontWeight:600}}>${Number(c.monto).toLocaleString('es-AR')}</td>
                      <td style={{color:'#c9a84c'}}>+{c.puntos_ganados}</td>
                      <td><span className="badge badge-plata">{c.origen}</span></td>
                      <td className="text-muted text-sm">{new Date(c.creado_en).toLocaleDateString('es-AR')}</td>
                    </tr>
                  ))}
                  {(!cliente.compras?.length) && <tr><td colSpan={5} style={{textAlign:'center',color:'#9e9c97',padding:20}}>Sin compras</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'mensajes' && (
            <div>
              {(cliente.mensajes||[]).map(m => (
                <div key={m.id} style={{padding:'12px 0',borderBottom:'1px solid #f1efeb'}}>
                  <div className="flex-between mb16" style={{marginBottom:4}}>
                    <span className={`badge badge-${m.estado === 'enviado' ? 'frecuente' : m.estado === 'simulado' ? 'plata' : 'inactivo'}`}>{m.tipo}</span>
                    <span className="text-muted text-sm">{new Date(m.creado_en).toLocaleString('es-AR')}</span>
                  </div>
                  <p style={{fontSize:13,color:'#5a5856',fontStyle:'italic'}}>"{m.mensaje}"</p>
                </div>
              ))}
              {(!cliente.mensajes?.length) && <p style={{textAlign:'center',color:'#9e9c97',padding:20}}>Sin mensajes</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
