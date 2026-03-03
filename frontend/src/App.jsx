import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { theme, FONT, ROLES } from './utils/constants';
import LoginPage from './pages/LoginPage';
import PublicView from './pages/PublicView';
import ReceptionView from './pages/ReceptionView';
import DoctorView from './pages/DoctorView';
import ManagerView from './pages/ManagerView';
import SettingsView from './pages/SettingsView';
import PwaInstallBanner from './components/pwa/PwaInstallBanner';
import { Icon } from './components/ui';

// --- MAIN LAYOUT ---
function MainLayout() {
  const { user, logout } = useAuth();
  const { config, loading: configLoading } = useConfig();
  const [view, setView] = useState('main');

  const roleInfo = ROLES[user.role] || ROLES.reception;

  const tabs = [];
  if (user.role === 'reception') {
    tabs.push({ key: 'main', label: 'Recepce', icon: 'calendar' });
  } else if (user.role === 'doctor') {
    tabs.push({ key: 'main', label: 'Pacienti', icon: 'activity' });
  } else if (user.role === 'manager') {
    tabs.push({ key: 'main', label: 'Přehled', icon: 'chart' });
    tabs.push({ key: 'settings', label: 'Nastavení', icon: 'settings' });
  }

  if (configLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
        <div style={{ textAlign: 'center', color: theme.textMuted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🐾</div>
          Načítání konfigurace...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: FONT }}>
      {/* Header */}
      <header style={{
        background: 'white', borderBottom: `1px solid ${theme.border}`,
        padding: '0 24px', height: 56, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', boxShadow: theme.shadow,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🐾</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: theme.text }}>
            {config?.clinicName || 'VetBook'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <nav style={{ display: 'flex', gap: 4 }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setView(tab.key)} style={{
                padding: '6px 14px', border: 'none', borderRadius: theme.radiusSm,
                fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                background: view === tab.key ? theme.accentLight : 'transparent',
                color: view === tab.key ? theme.accent : theme.textSecondary,
              }}>
                <Icon name={tab.icon} size={14} />{tab.label}
              </button>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: theme.textSecondary }}>
              {roleInfo.icon} {user.name}
            </span>
            <button onClick={logout} style={{
              padding: '5px 10px', border: `1px solid ${theme.border}`,
              borderRadius: theme.radiusSm, background: 'white', cursor: 'pointer',
              fontSize: 12, color: theme.textSecondary, fontFamily: FONT,
            }}>
              Odhlásit
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {view === 'settings' && user.role === 'manager' ? (
          <SettingsView />
        ) : user.role === 'reception' ? (
          <ReceptionView config={config} />
        ) : user.role === 'doctor' ? (
          <DoctorView config={config} user={user} />
        ) : user.role === 'manager' ? (
          <ManagerView config={config} />
        ) : (
          <ReceptionView config={config} />
        )}
      </main>

      <PwaInstallBanner />
    </div>
  );
}

// --- ROOT ---
function App() {
  // Employee admin at /admin path
  if (window.location.pathname.startsWith('/admin')) {
    return (
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    );
  }

  // Public portal is the default (/)
  return <PublicView />;
}

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
        <div style={{ textAlign: 'center', color: theme.textMuted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🐾</div>
          Načítání...
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <ConfigProvider>
      <MainLayout />
    </ConfigProvider>
  );
}

export default App;
