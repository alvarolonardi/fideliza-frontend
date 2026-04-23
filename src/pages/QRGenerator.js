import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../utils/api';

const VINO = '#8B1A1A';

export default function QRGenerator() {
  const [origen, setOrigen]   = useState('tienda_principal');
  const [qrData, setQrData]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const generar = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/qr/generar?origen=${encodeURIComponent(origen)}`);
      setQrData(data);
    } catch (err) {
      setError('No se pudo generar el QR. Verificá que el servidor esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const descargar = () => {
    const svg = document.getElementById('qr-svg');
    if (!svg) return;

    // Crear SVG con logo/texto incluido para imprimir
    const wrapper = `
      <svg xmlns="http://www.w3.org/2000/svg" width="320" height="380" viewBox="0 0 320 380">
        <rect width="320" height="380" fill="#ffffff" rx="16"/>
        <!-- QR -->
        ${svg.innerHTML}
        <!-- Texto inferior -->
        <text x="160" y="350" font-family="Georgia,serif" font-size="18" font-weight="bold"
              fill="${VINO}" text-anchor="middle">Casa Sierra</text>
        <text x="160" y="370" font-family="Arial,sans-serif" font-size="11"
              fill="#888" text-anchor="middle">Escaneá y sumá puntos</text>
      </svg>`;

    const blob = new Blob([wrapper], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `QR-CasaSierra-${origen}.svg`;
    a.click();
  };

  const imprimirQR = () => {
    const win = window.open('', '_blank');
    const svg = document.getElementById('qr-svg');
    if (!svg || !win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Casa Sierra — ${origen}</title>
          <style>
            body { display:flex; flex-direction:column; align-items:center;
                   justify-content:center; min-height:100vh; margin:0;
                   font-family: Georgia, serif; background:#fff; }
            .qr-wrap { text-align:center; padding:32px; border:2px solid #8B1A1A;
                       border-radius:16px; max-width:300px; }
            h1 { color:#8B1A1A; font-size:28px; margin:0 0 8px; }
            p  { color:#555; font-size:14px; margin:12px 0 0; }
            svg { margin: 12px 0; }
          </style>
        </head>
        <body>
          <div class="qr-wrap">
            <h1>Casa Sierra</h1>
            ${svg.outerHTML}
            <p>📱 Escaneá y sumá puntos</p>
            <p style="font-size:11px;color:#aaa;margin-top:8px;">Origen: ${origen}</p>
          </div>
          <script>window.onload = () => window.print();<\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="page-content">
      <div className="topbar"><h1>Generador de QR</h1></div>
      <div style={{ padding: '20px 0' }}>
        <div className="grid2">
          {/* ── Panel izquierdo ── */}
          <div className="card">
            <div className="card-title">Configurar QR</div>
            <div className="form-group">
              <label>Identificador de origen</label>
              <input
                value={origen}
                onChange={e => setOrigen(e.target.value)}
                placeholder="tienda_centro, evento_mayo, etc."
              />
              <p style={{ fontSize: 11, color: '#9e9c97', marginTop: 6 }}>
                Sirve para saber dónde escanean más.
                Ej: "tienda_hombre", "tienda_mujer", "instagram_bio"
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={generar}
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? <span className="spinner" /> : '⬛ Generar QR'}
            </button>

            {error && (
              <div style={{ marginTop: 12, padding: 10, background: '#fdecea',
                            borderRadius: 8, color: '#c0392b', fontSize: 13 }}>
                {error}
              </div>
            )}

            {qrData && (
              <div style={{ marginTop: 16, padding: 14, background: '#fdf5f5', borderRadius: 8 }}>
                <p style={{ fontSize: 12, color: '#9e9c97', marginBottom: 6 }}>URL de registro:</p>
                <code style={{ fontSize: 11, wordBreak: 'break-all', color: '#1a1a1a' }}>{qrData.url}</code>
              </div>
            )}

            {/* Instrucciones de Twilio */}
            <div style={{ marginTop: 20, padding: 14, background: '#fff8f0',
                          border: '1px solid #f5c87a', borderRadius: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#8a6000', marginBottom: 8 }}>
                ⚠️ Para que el WhatsApp funcione al escanear:
              </p>
              <ol style={{ fontSize: 12, color: '#7a5800', paddingLeft: 16, margin: 0, lineHeight: 1.7 }}>
                <li>Completá <code>TWILIO_ACCOUNT_SID</code> y <code>TWILIO_AUTH_TOKEN</code> en el <code>.env</code></li>
                <li>Cambiá <code>WHATSAPP_MOCK=false</code> en el <code>.env</code></li>
                <li>El cliente que escanee <strong>debe haber unido el sandbox</strong> primero enviando el mensaje de activación a Twilio</li>
                <li>Cuando tengas un número aprobado de Twilio, cambiá <code>TWILIO_WHATSAPP_FROM</code></li>
              </ol>
            </div>
          </div>

          {/* ── Panel derecho: vista previa ── */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="card-title">Vista previa</div>
            {qrData ? (
              <>
                {/* QR con marco Casa Sierra */}
                <div style={{
                  display: 'inline-block',
                  padding: 20,
                  background: '#fff',
                  border: `2px solid ${VINO}`,
                  borderRadius: 16,
                  marginBottom: 12,
                  boxShadow: '0 2px 12px rgba(139,26,26,.12)',
                }}>
                  <p style={{ fontFamily: 'Georgia,serif', color: VINO,
                               fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>
                    Casa Sierra
                  </p>
                  <QRCodeSVG
                    id="qr-svg"
                    value={qrData.url}
                    size={220}
                    fgColor={VINO}
                    bgColor="#ffffff"
                    level="H"
                  />
                  <p style={{ fontSize: 12, color: '#888', margin: '8px 0 0' }}>
                    📱 Escaneá y sumá puntos
                  </p>
                </div>

                <p style={{ fontSize: 13, color: '#9e9c97', marginBottom: 16 }}>
                  Origen: <strong style={{ color: '#1a1a1a' }}>{qrData.origen}</strong>
                </p>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost" onClick={descargar}>⬇ Descargar SVG</button>
                  <button
                    className="btn btn-primary"
                    style={{ background: VINO }}
                    onClick={imprimirQR}
                  >
                    🖨 Imprimir QR
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: 60, color: '#9e9c97', fontSize: 13 }}>
                Configurá el QR y hacé click en "Generar"
              </div>
            )}
          </div>
        </div>

        {/* ── Guía de uso ── */}
        <div className="card mt16">
          <div className="card-title">Cómo usar el QR en tu local</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, fontSize: 13 }}>
            {[
              ['1. Imprimí el QR', 'Tamaño A5 o mayor con el botón "Imprimir QR". Colocalo en el mostrador, espejo del probador o bolsa.'],
              ['2. Capacitá a las vendedoras', 'Guión: "Escaneá esto y sumá puntos en tu próxima compra 🎁"'],
              ['3. Cliente escanea', 'Va a la landing de Casa Sierra, completa nombre y WhatsApp en 30 segundos.'],
              ['4. Sistema hace el resto', 'Bienvenida automática por WhatsApp, puntos acumulados, seguimiento.'],
            ].map(([t, d]) => (
              <div key={t} style={{ padding: 14, background: '#fdf5f5', borderRadius: 8 }}>
                <strong style={{ display: 'block', marginBottom: 6, fontSize: 12,
                                  textTransform: 'uppercase', letterSpacing: .5, color: VINO }}>
                  {t}
                </strong>
                <p style={{ color: '#5a5856', lineHeight: 1.5 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
