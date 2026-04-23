import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

const VINO   = '#8B1A1A';
const VINO_H = '#6e1414';

const REDES = [
  { id: 'ig_mujer',  label: 'Mujer',  icon: 'ig', url: 'https://www.instagram.com/casasierra.woman', color: '#E1306C' },
  { id: 'fb_mujer',  label: 'Mujer',  icon: 'fb', url: 'https://www.facebook.com/casasierrawoman',  color: '#1877F2' },
  { id: 'ig_hombre', label: 'Hombre', icon: 'ig', url: 'https://www.instagram.com/casa_sierra',     color: '#E1306C' },
  { id: 'fb_hombre', label: 'Hombre', icon: 'fb', url: 'https://www.facebook.com/casasierra',       color: '#1877F2' },
  { id: 'tienda',    label: 'Tienda', icon: 'shop',url: 'https://www.casasierrashop.com',            color: VINO     },
];

function IgIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}
function FbIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
function ShopIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
}

function RedBtn({ red }) {
  return (
    <a href={red.url} target="_blank" rel="noopener noreferrer"
       style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'6px 12px',
                border:`1.5px solid ${red.color}`, borderRadius:20, color:red.color,
                fontSize:12, fontWeight:500, textDecoration:'none', background:'#fff',
                whiteSpace:'nowrap' }}
       onMouseEnter={e=>{ e.currentTarget.style.background=red.color; e.currentTarget.style.color='#fff'; }}
       onMouseLeave={e=>{ e.currentTarget.style.background='#fff'; e.currentTarget.style.color=red.color; }}>
      {red.icon==='ig'   && <IgIcon />}
      {red.icon==='fb'   && <FbIcon />}
      {red.icon==='shop' && <ShopIcon />}
      {red.label}
    </a>
  );
}

// ─── Selector de local ──────────────────────────────────────
function LocalSelector({ value, onChange }) {
  const opciones = [
    { val: 'mujer',  emoji: '👗', label: 'Local Mujer',  desc: 'Casa Sierra Woman' },
    { val: 'hombre', emoji: '👔', label: 'Local Hombre', desc: 'Casa Sierra'       },
  ];
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={styles.label}>¿A QUÉ LOCAL PERTENECÉS?</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
        {opciones.map(op => {
          const activo = value === op.val;
          return (
            <button
              key={op.val}
              type="button"
              onClick={() => onChange(op.val)}
              style={{
                padding: '14px 10px',
                border: `2px solid ${activo ? VINO : '#e8d5d5'}`,
                borderRadius: 12,
                background: activo ? '#fdf0f0' : '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all .15s',
                outline: 'none',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{op.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: activo ? VINO : '#1a1a1a' }}>
                {op.label}
              </div>
              <div style={{ fontSize: 11, color: '#9e9c97', marginTop: 2 }}>{op.desc}</div>
              {activo && (
                <div style={{ marginTop: 6, fontSize: 11, color: VINO, fontWeight: 700 }}>✓ Seleccionado</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Registro() {
  const [params] = useSearchParams();
  const origen   = params.get('origen') || 'qr';

  const [form, setForm]     = useState({ nombre: '', telefono: '', email: '', local: '', fecha_nacimiento: '' });
  const [estado, setEstado] = useState('idle');
  const [msg, setMsg]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.local) {
      setEstado('error');
      setMsg('Por favor seleccioná a qué local pertenecés.');
      return;
    }
    setEstado('loading');
    try {
      const { data } = await axios.post(`${API}/clientes/registro`, { ...form, qr_origen: origen });
      setEstado('ok');
      setMsg(data.nuevo
        ? (form.local === 'hombre'
            ? '¡Bienvenido! 🎉 Ya sos parte de nuestra comunidad. Vas a recibir un mensaje por WhatsApp.'
            : '¡Bienvenida! 🎉 Ya sos parte de nuestra comunidad. Vas a recibir un mensaje por WhatsApp.')
        : '¡Ya estabas registrado/a! 🎊 Seguís acumulando puntos con cada compra.'
      );
    } catch (err) {
      setEstado('error');
      setMsg(err.response?.data?.error || 'Ocurrió un error. Intentá de nuevo.');
    }
  };

  if (estado === 'ok') {
    return (
      <div style={styles.bg}>
        <div style={styles.card}>
          <img src="/logo-casa-sierra.png" alt="Casa Sierra" style={styles.logoImg} />
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: VINO }}>¡Listo!</h2>
          <p style={{ color: '#5a5856', lineHeight: 1.6, textAlign: 'center' }}>{msg}</p>
          <div style={{ marginTop: 28, padding: 16, background: '#fdf5f5', borderRadius: 10, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#5a5856', marginBottom: 12 }}>👇 Tocá el botón para activar tus notificaciones de WhatsApp</p>
            <a
              href="https://wa.me/5493446613006?text=Hola%2C%20me%20acabo%20de%20registrar%20en%20Casa%20Sierra%20%F0%9F%91%8B"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: '#25D366',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 25,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 12,
              }}
            >
              💬 Activar WhatsApp
            </a>
            <p style={{ fontSize: 11, color: '#9e9c97' }}>Ya podés cerrar esta ventana luego</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img src="/logo-casa-sierra.png" alt="Casa Sierra" style={styles.logoImg} />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f0e8e8', margin: '0 0 20px' }} />

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, textAlign: 'center', color: '#1a1a1a' }}>
          Sumá puntos
        </h2>
        <p style={{ color: '#9e9c97', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
          Registrate y empezá a disfrutar beneficios exclusivos
        </p>

        {/* Redes sociales */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          {REDES.map(r => <RedBtn key={r.id} red={r} />)}
        </div>

        {/* Error */}
        {estado === 'error' && (
          <div style={{ background: '#fdecea', border: '1px solid #f5b8b0', color: '#c0392b',
                        padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Selector de local */}
          <LocalSelector value={form.local} onChange={val => setForm({ ...form, local: val })} />

          <div style={{ marginBottom: 14 }}>
            <label style={styles.label}>TU NOMBRE</label>
            <input style={styles.input} required placeholder="Valentina García"
              value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={styles.label}>WHATSAPP (CON CÓDIGO DE ÁREA)</label>
            <input style={styles.input} required placeholder="+54 9 3446 377495" type="tel"
              value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={styles.label}>EMAIL (OPCIONAL)</label>
            <input style={styles.input} placeholder="tu@email.com" type="email"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          {/* Campo cumpleaños */}
          <div style={{ marginBottom: 20, padding: 14, background: '#fdf5f5', borderRadius: 12, border: '1.5px dashed #e8d5d5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>🎂</span>
              <label style={{ ...styles.label, marginBottom: 0, color: VINO }}>
                ¿CUÁNDO ES TU CUMPLEAÑOS? (OPCIONAL)
              </label>
            </div>
            <p style={{ fontSize: 12, color: '#9e9c97', marginBottom: 8 }}>
              Completalo y recibí un regalo especial ese día 🎁
            </p>
            <input
              style={{ ...styles.input, background: '#fff' }}
              type="date"
              value={form.fecha_nacimiento}
              onChange={e => setForm({ ...form, fecha_nacimiento: e.target.value })}
            />
          </div>

          <button type="submit" disabled={estado === 'loading'}
            style={{ ...styles.btn, background: estado === 'loading' ? '#aaa' : VINO }}
            onMouseEnter={e => { if (estado !== 'loading') e.currentTarget.style.background = VINO_H; }}
            onMouseLeave={e => { if (estado !== 'loading') e.currentTarget.style.background = VINO; }}>
            {estado === 'loading'
              ? <span style={{ display:'inline-block', width:18, height:18, border:'2px solid rgba(255,255,255,.3)',
                               borderTopColor:'#fff', borderRadius:'50%', animation:'spin .6s linear infinite' }} />
              : 'Registrarme y sumar puntos →'}
          </button>
        </form>

        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
          {[['⭐','Puntos por compra'],['🎁','Recompensas'],['✨','Beneficios VIP']].map(([ico, t]) => (
            <div key={t} style={{ padding: 10, background: '#fdf5f5', borderRadius: 8 }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{ico}</div>
              <div style={{ fontSize: 11, color: '#9e9c97' }}>{t}</div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 16, fontSize: 11, color: '#9e9c97', textAlign: 'center' }}>
          Al registrarte aceptás recibir mensajes de la marca por WhatsApp.
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  bg: { minHeight:'100vh', background:'linear-gradient(135deg,#f5e8e8 0%,#fdf0f0 100%)',
        display:'flex', alignItems:'center', justifyContent:'center', padding:16 },
  card: { background:'#fff', borderRadius:20, padding:'32px 28px', width:'100%', maxWidth:400,
          boxShadow:'0 4px 24px rgba(139,26,26,.10)' },
  logoImg: { maxWidth:180, height:'auto' },
  label: { display:'block', fontSize:11, fontWeight:700, color:'#5a5856', marginBottom:6, letterSpacing:.6 },
  input: { width:'100%', padding:'11px 14px', border:'1.5px solid #e8d5d5', borderRadius:10,
           fontSize:15, outline:'none', boxSizing:'border-box' },
  btn: { width:'100%', padding:'14px', color:'#fff', border:'none', borderRadius:12,
         fontSize:15, fontWeight:700, cursor:'pointer', display:'flex',
         alignItems:'center', justifyContent:'center', gap:8, transition:'background .18s' },
};
