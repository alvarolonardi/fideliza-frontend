import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]   = useState({ email: 'admin@fideliza.com', password: 'admin123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/login`, {
        email:    form.email,
        password: form.password,
      });
      // Guardar token real del backend
      localStorage.setItem('token', data.token);
      login(data.admin);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
                  justifyContent:'center', background:'#1a1a1a' }}>
      <div style={{ background:'#fff', borderRadius:14, padding:'40px 36px',
                    width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontFamily:'Georgia,serif', fontSize:22, letterSpacing:3, textTransform:'uppercase' }}>
            FIDELIZA<span style={{ color:'#c9a84c' }}>.</span>
          </div>
          <p style={{ color:'#9e9c97', fontSize:13, marginTop:6 }}>Panel de administración</p>
        </div>

        {error && (
          <div style={{ background:'#fdf0e8', color:'#c0392b', border:'1px solid #f0997b',
                        padding:'12px 16px', borderRadius:8, marginBottom:14, fontSize:13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#5a5856',
                            marginBottom:6, textTransform:'uppercase', letterSpacing:.4 }}>
              Email
            </label>
            <input type="email" value={form.email} required
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ width:'100%', padding:'10px 12px', border:'1px solid #e2e0db',
                       borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box' }} />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#5a5856',
                            marginBottom:6, textTransform:'uppercase', letterSpacing:.4 }}>
              Contraseña
            </label>
            <input type="password" value={form.password} required
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ width:'100%', padding:'10px 12px', border:'1px solid #e2e0db',
                       borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box' }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:13, background: loading ? '#888' : '#1a1a1a',
                     color:'#fff', border:'none', borderRadius:10, fontSize:15,
                     fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer', marginTop:8 }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:20, fontSize:12, color:'#9e9c97' }}>
          Demo: admin@fideliza.com / admin123
        </p>
      </div>
    </div>
  );
}
