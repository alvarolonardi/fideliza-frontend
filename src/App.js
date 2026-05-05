import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout     from './components/Layout';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Clientes   from './pages/Clientes';
import ClienteDetalle from './pages/ClienteDetalle';
import Campanas   from './pages/Campanas';
import QRGenerator from './pages/QRGenerator';
import Registro   from './pages/Registro';
import Privacidad from './pages/Privacidad';
import './styles/global.css';

function PrivateRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div style={{padding:40}}>Cargando...</div>;
  return admin ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/registro"  element={<Registro />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/privacidad" element={<Privacidad />} />

          {/* Rutas privadas: panel admin */}
          <Route path="/" element={
            <PrivateRoute><Layout /></PrivateRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"        element={<Dashboard />} />
            <Route path="clientes"         element={<Clientes />} />
            <Route path="clientes/:id"     element={<ClienteDetalle />} />
            <Route path="campanas"         element={<Campanas />} />
            <Route path="qr"               element={<QRGenerator />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
