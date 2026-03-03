import { useState, useEffect } from 'react';
import { theme } from '../../utils/constants';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIos] = useState(() => typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.navigator.standalone);
  const [showIos, setShowIos] = useState(false);

  useEffect(() => {
    const handler = e => { e.preventDefault(); setDeferredPrompt(e); setShow(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; if (outcome === "accepted") setShow(false); setDeferredPrompt(null); }
  };

  if (typeof window !== 'undefined' && (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone)) return null;

  return (
    <>
      {(show || isIos) && (
        <div style={{ position: "fixed", bottom: 16, left: 16, right: 16, maxWidth: 420, margin: "0 auto", background: "white", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, zIndex: 100, border: `1.5px solid ${theme.accent}30`, animation: "slideUp 0.3s ease-out" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🐾</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Přidat VetBook na plochu</div>
            <div style={{ fontSize: 12, color: theme.textMuted }}>Rychlý přístup + upozornění na termíny</div>
          </div>
          {show ? (
            <button onClick={handleInstall} style={{ padding: "8px 16px", background: theme.accent, color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>Přidat</button>
          ) : isIos ? (
            <button onClick={() => setShowIos(!showIos)} style={{ padding: "8px 16px", background: theme.accent, color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>Jak?</button>
          ) : null}
          <button onClick={() => { setShow(false); setShowIos(false); }} style={{ border: "none", background: "none", color: theme.textMuted, cursor: "pointer", fontSize: 16, padding: 2 }}>✕</button>
        </div>
      )}
      {showIos && (
        <div style={{ position: "fixed", bottom: 90, left: 16, right: 16, maxWidth: 420, margin: "0 auto", background: "white", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", padding: "16px 20px", zIndex: 100, border: `1.5px solid ${theme.accent}30` }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>📱 Na iPhonu/iPadu:</div>
          <div style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.8 }}>
            1. Klepněte na <strong>Sdílet</strong> (ikona dole v Safari)<br/>
            2. Vyberte <strong>Přidat na plochu</strong><br/>
            3. Potvrďte <strong>Přidat</strong>
          </div>
        </div>
      )}
    </>
  );
}