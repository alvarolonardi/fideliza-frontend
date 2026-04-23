import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Badge({ nivel, segmento }) {
  const v = nivel || segmento;
  return <span className={`badge badge-${v}`}>{v}</span>;
}

function ModalCompra({ cliente, onClose, onSuccess }) {
  const [monto, setMonto] = useState('');
  const [desc, setDesc]   = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(`/clientes/${cliente.id}/compra`, { monto: parseFloat(monto), descripcion: desc });
      setMsg(`✓ Compra registrada. +${data.puntosGanados} puntos. Nivel: ${data.nivel}`);
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    } catch (err) {
      setMsg('Error al registrar compra');
    } finally { setLoading(false); }
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}}>
      <div className="card" style={{width:'100%',maxWidth:420,padding:28}}>
        <div className="flex-between mb16">
          <h3 style={{fontSize:15}}>Registrar compra — {cliente.nombre}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        {msg && <div className="alert alert-success">{msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Monto ($)</label>
            <input type="number" min="1" value={monto} onChange={e=>setMonto(e.target.value)} required placeholder="8500" />
          </div>
          <div className="form-group">
            <label>Descripción (opcional)</label>
            <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Vestido lino verano" />
          </div>
          <div className="flex gap8" style={{justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner"/> : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [filtros,  setFiltros]  = useState({ segmento: '', nivel: '', q: '' });
  const [modalCliente, setModalCliente] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (filtros.segmento) params.segmento = filtros.segmento;
    if (filtros.nivel)    params.nivel    = filtros.nivel;
    if (filtros.q)        params.q        = filtros.q;
    const { data } = await api.get('/clientes', { params });
    setClientes(data.clientes);
    setTotal(data.total);
    setLoading(false);
  }, [filtros]);

  useEffect(() => { cargar(); }, [cargar]);

  const eliminarCliente = async (c) => {
    const confirmar = window.confirm('¿Seguro que querés eliminar a ' + c.nombre + '? Esta acción no se puede deshacer.');
    if (!confirmar) return;
    try {
      await api.delete(`/clientes/${c.id}`);
      cargar();
    } catch (err) {
      alert("Error al eliminar el cliente");
    }
  };

  const enviarMensaje = async (c, tipo) => {
    await api.post(`/clientes/${c.id}/mensaje`, { tipo });
    alert(`Mensaje "${tipo}" enviado a ${c.nombre} ✓`);
  };

  return (
    <div className="page-content">
      <div className="topbar">
        <h1>Clientes <span className="text-muted text-sm">({total})</span></h1>
      </div>

      <div style={{padding:'20px 0'}}>
        {/* Filtros */}
        <div className="card mb24" style={{padding:'14px 16px'}}>
          <div className="flex gap12" style={{flexWrap:'wrap'}}>
            <input placeholder="🔍 Buscar nombre o teléfono..." value={filtros.q}
              onChange={e=>setFiltros({...filtros,q:e.target.value})}
              style={{flex:1,minWidth:200}} />
            <select value={filtros.segmento} onChange={e=>setFiltros({...filtros,segmento:e.target.value})} style={{width:160}}>
              <option value="">Todos los segmentos</option>
              <option value="nuevo">Nuevo</option>
              <option value="frecuente">Frecuente</option>
              <option value="vip">VIP</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <select value={filtros.nivel} onChange={e=>setFiltros({...filtros,nivel:e.target.value})} style={{width:150}}>
              <option value="">Todos los niveles</option>
              <option value="bronce">Bronce</option>
              <option value="plata">Plata</option>
              <option value="oro">Oro</option>
              <option value="vip">VIP</option>
            </select>
          </div>
        </div>

        <div className="card">
          <div className="table-wrap">
            {loading ? <div style={{padding:32,textAlign:'center'}}><span className="spinner"/></div> : (
              <table>
                <thead><tr>
                  <th>Cliente</th><th>Teléfono</th><th>Nivel</th><th>Segmento</th>
                  <th>Puntos</th><th>Total gastado</th><th>Última compra</th><th>Acciones</th>
                </tr></thead>
                <tbody>
                  {clientes.map(c => (
                    <tr key={c.id} style={{cursor:'pointer'}} onClick={()=>navigate(`/clientes/${c.id}`)}>
                      <td style={{fontWeight:500}}>{c.nombre}{c.es_vip && <span style={{marginLeft:6,color:'#c9a84c'}}>★</span>}</td>
                      <td className="text-muted">{c.telefono}</td>
                      <td><Badge nivel={c.nivel}/></td>
                      <td><Badge segmento={c.segmento}/></td>
                      <td style={{fontWeight:500}}>{Number(c.puntos).toLocaleString('es-AR')}</td>
                      <td>${Number(c.total_gastado||0).toLocaleString('es-AR')}</td>
                      <td className="text-muted text-sm">
                        {c.ultima_compra ? new Date(c.ultima_compra).toLocaleDateString('es-AR') : '—'}
                      </td>
                      <td onClick={e=>e.stopPropagation()}>
                        <div className="flex gap8">
                          <button className="btn btn-ghost btn-sm" onClick={()=>setModalCliente(c)}>+ Compra</button>
                          <button className="btn btn-ghost btn-sm" onClick={()=>enviarMensaje(c,'post_compra')} title="Enviar mensaje">💬</button>
                          <button className="btn btn-ghost btn-sm" onClick={()=>eliminarCliente(c)} title="Eliminar cliente" style={{color:'#c0392b'}}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {clientes.length === 0 && (
                    <tr><td colSpan={8} style={{textAlign:'center',color:'#9e9c97',padding:32}}>No hay clientes con esos filtros</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {modalCliente && (
        <ModalCompra cliente={modalCliente} onClose={()=>setModalCliente(null)} onSuccess={cargar} />
      )}
    </div>
  );
}
