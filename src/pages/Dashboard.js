import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';

const COLORS = { bronce:'#c87941', plata:'#888', oro:'#c9a84c', vip:'#1a1a1a' };
const SEG_COLORS = { nuevo:'#3b8bd4', frecuente:'#1a7a4a', vip:'#c9a84c', inactivo:'#c0392b' };

function fmt(n) { return Number(n||0).toLocaleString('es-AR', {style:'currency',currency:'ARS',maximumFractionDigits:0}); }
function num(n) { return Number(n||0).toLocaleString('es-AR'); }

export default function Dashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => { setData(r.data); setLoading(false); });
  }, []);

  if (loading) return <div className="page-content"><div className="spinner"/></div>;
  if (!data)   return null;

  const { totales, segmentos, niveles, ventasRecientes, mensajesHoy } = data;

  const nivData = niveles.map(n => ({ name: n.nivel.charAt(0).toUpperCase()+n.nivel.slice(1), value: parseInt(n.cantidad), fill: COLORS[n.nivel] }));
  const segData = segmentos.map(s => ({ name: s.segmento.charAt(0).toUpperCase()+s.segmento.slice(1), value: parseInt(s.cantidad), fill: SEG_COLORS[s.segmento] }));

  return (
    <div className="page-content">
      <div className="topbar" style={{marginBottom:0}}>
        <h1>Dashboard</h1>
        <span className="text-muted text-sm">{new Date().toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})}</span>
      </div>

      <div style={{padding:'28px 0'}}>
        {/* KPIs */}
        <div className="kpi-grid mb24">
          <div className="kpi-card">
            <div className="kpi-label">Total clientes</div>
            <div className="kpi-value">{num(totales.total_clientes)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Activos</div>
            <div className="kpi-value" style={{color:'#1a7a4a'}}>{num(totales.activos)}</div>
            <div className="kpi-sub">{num(totales.inactivos)} inactivos</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Ventas totales</div>
            <div className="kpi-value" style={{fontSize:20}}>{fmt(totales.ventas_totales)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Ticket promedio</div>
            <div className="kpi-value" style={{fontSize:20}}>{fmt(totales.ticket_promedio)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Clientes VIP</div>
            <div className="kpi-value" style={{color:'#c9a84c'}}>{num(totales.vip)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Mensajes hoy</div>
            <div className="kpi-value">{num(mensajesHoy?.total || 0)}</div>
            <div className="kpi-sub">{num(mensajesHoy?.simulados || 0)} simulados</div>
          </div>
        </div>

        <div className="grid2 mb24">
          {/* Niveles */}
          <div className="card">
            <div className="card-title">Distribución por nivel</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={nivData} barSize={36}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12}} />
                <YAxis hide />
                <Tooltip formatter={(v) => [v, 'Clientes']} />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {nivData.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Segmentos */}
          <div className="card">
            <div className="card-title">Segmentos</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={segData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name,value})=>`${name}: ${value}`} labelLine={false}>
                  {segData.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ventas recientes */}
        <div className="card">
          <div className="card-title">Compras recientes</div>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Cliente</th><th>Descripción</th><th>Monto</th><th>Fecha</th>
              </tr></thead>
              <tbody>
                {ventasRecientes.map((v,i) => (
                  <tr key={i}>
                    <td>{v.nombre}</td>
                    <td className="text-muted">{v.descripcion || '—'}</td>
                    <td style={{fontWeight:600}}>{fmt(v.monto)}</td>
                    <td className="text-muted text-sm">{new Date(v.creado_en).toLocaleDateString('es-AR')}</td>
                  </tr>
                ))}
                {ventasRecientes.length === 0 && (
                  <tr><td colSpan={4} style={{textAlign:'center',color:'#9e9c97',padding:24}}>Sin compras registradas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
