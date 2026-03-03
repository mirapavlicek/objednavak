import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { theme, FONT, MONO } from '../utils/constants';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, pin);
    } catch (err) {
      setError(err.response?.data?.message || 'Chyba přihlášení');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, fontFamily: FONT }}>
      <div style={{ background: 'white', padding: 40, borderRadius: theme.radiusLg, boxShadow: theme.shadowLg, width: 'min(400px, 90vw)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🐾</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: theme.text }}>VetBook</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: theme.textSecondary }}>Veterinární objednávkový systém</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@klinika.cz"
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: `1.5px solid ${theme.border}`, borderRadius: theme.radiusSm, fontSize: 14, fontFamily: FONT, outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>PIN</label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              required
              placeholder="1234"
              maxLength={10}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: `1.5px solid ${theme.border}`, borderRadius: theme.radiusSm, fontSize: 18, fontFamily: MONO, letterSpacing: '0.3em', textAlign: 'center', outline: 'none' }}
            />
          </div>

          {error && (
            <div style={{ padding: '8px 12px', background: theme.dangerLight, color: theme.danger, borderRadius: theme.radiusSm, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: theme.accent, color: 'white', border: 'none', borderRadius: theme.radiusSm, fontSize: 15, fontWeight: 700, fontFamily: FONT, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Přihlašování...' : 'Přihlásit se'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: theme.textMuted }}>
          Demo: admin@klinika.cz / PIN: 1234
        </div>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <a href="/" style={{ fontSize: 13, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>
            ← Zpět na objednávky
          </a>
        </div>
      </div>
    </div>
  );
}
