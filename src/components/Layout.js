import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', ico: '◆', label: 'Dashboard'  },
  { to: '/clientes',  ico: '👥', label: 'Clientes'   },
  { to: '/campanas',  ico: '📢', label: 'Campañas'   },
  { to: '/qr',        ico: '⬛', label: 'QR'         },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">FIDELIZA<span>.</span></div>
        <nav className="sidebar-nav">
          {navItems.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="ico">{n.ico}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{marginBottom:8}}>{admin?.nombre}</div>
          <button className="nav-item" onClick={handleLogout} style={{padding:'6px 0',color:'rgba(255,255,255,.4)'}}>
            <span className="ico">↩</span><span>Salir</span>
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
