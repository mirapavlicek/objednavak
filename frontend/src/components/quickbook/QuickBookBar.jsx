import { useState, useMemo } from 'react';
import { theme, FONT, PROCEDURES } from '../../utils/constants';
import { getToday } from '../../utils/time';
import { Icon } from '../ui';
import { parseQuickBook } from '../../utils/quickbook';
import { createAppointment } from '../../api/appointments';

const tokenColors = { time: "#7c3aed", date: "#059669", procedure: "#d97706", client: "#2563eb", name: "#64748b" };
const tokenLabels = { time: "čas", date: "datum", procedure: "procedura", client: "klient", name: "text" };

export default function QuickBookBar({ clients, pets, config, onBooked }) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState(false);
  const parsed = useMemo(() => parseQuickBook(text, clients, pets), [text, clients, pets]);
  const client = parsed?.clientId ? clients.find(c => c.id === parsed.clientId) : null;
  const pet = parsed?.petId ? pets.find(p => p.id === parsed.petId) : null;
  const proc = parsed?.procedureId ? PROCEDURES.find(p => p.id === parsed.procedureId) : null;
  const today = getToday();

  const handleBook = async () => {
    if (!parsed || (!parsed.manualName && !parsed.clientId)) return;
    const finalProc = proc || PROCEDURES.find(p => p.id === "other");
    const now = new Date().toTimeString().slice(0, 5);
    const apt = {
      client_id: parsed.clientId || null,
      pet_id: parsed.petId || null,
      manual_name: parsed.clientId ? "" : parsed.manualName,
      manual_phone: "",
      manual_pet: "",
      procedure_id: finalProc.id,
      doctor_id: null,
      date: parsed.isAcute ? today : (parsed.date || today),
      time: parsed.isAcute ? now : (parsed.time || "09:00"),
      duration: finalProc.duration,
      status: parsed.isAcute ? "arrived" : "confirmed",
      note: parsed.isAcute ? "Akutní — rychlá objednávka" : "Rychlá objednávka",
      created_by: "reception",
      ...(parsed.isAcute ? { arrival_time: now } : {}),
    };
    setSaving(true);
    try {
      await createAppointment(apt);
      setText("");
      if (onBooked) onBooked();
    } catch (err) {
      alert(err.response?.data?.message || 'Chyba při vytváření objednávky');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: "white", border: `2px solid ${focused ? theme.accent : theme.border}`, borderRadius: theme.radius, padding: 0, transition: "border-color 0.15s", boxShadow: focused ? `0 0 0 3px ${theme.accent}15` : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px" }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>⚡</span>
        <input value={text} onChange={e => setText(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onKeyDown={e => { if (e.key === "Enter" && parsed && (parsed.clientId || parsed.manualName)) handleBook(); }}
          placeholder='Černý drápky sobota 14:30 — nebo jen Novák pro akutní příjem...'
          style={{ flex: 1, border: "none", outline: "none", fontSize: 15, fontFamily: FONT, fontWeight: 500, background: "transparent", color: theme.text, letterSpacing: "-0.01em" }} />
        {text && (
          <button onClick={() => setText("")} style={{ border: "none", background: "none", color: theme.textMuted, cursor: "pointer", fontSize: 14, padding: 4 }}>✕</button>
        )}
        {parsed && (parsed.clientId || parsed.manualName) && (
          <button onClick={handleBook} disabled={saving}
            style={{ padding: "6px 16px", border: "none", borderRadius: 6, background: parsed.isAcute ? theme.danger : theme.accent, color: "white", fontWeight: 700, fontSize: 13, cursor: saving ? "wait" : "pointer", whiteSpace: "nowrap", fontFamily: FONT, transition: "all 0.1s", opacity: saving ? 0.7 : 1 }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = "0.85"; }} onMouseLeave={e => { e.currentTarget.style.opacity = saving ? "0.7" : "1"; }}>
            {saving ? "..." : parsed.isAcute ? "🚨 Akut" : "✓ Objednat"}
          </button>
        )}
      </div>

      {text && parsed && (
        <div style={{ padding: "0 14px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {parsed.tokens.map((t, i) => (
              <span key={i} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600, background: tokenColors[t.type] + "12", color: tokenColors[t.type], border: `1px solid ${tokenColors[t.type]}25` }}>
                {t.text} <span style={{ fontSize: 9, opacity: 0.7 }}>{tokenLabels[t.type]}</span>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", fontSize: 12 }}>
            {client ? (
              <span style={{ color: "#2563eb", fontWeight: 700 }}>👤 {client.lastName} {client.firstName}</span>
            ) : parsed.manualName ? (
              <span style={{ color: "#64748b", fontWeight: 600 }}>👤 {parsed.manualName} <span style={{ fontSize: 10, opacity: 0.7 }}>(ruční)</span></span>
            ) : (
              <span style={{ color: theme.textMuted }}>👤 —</span>
            )}
            {pet && <span style={{ color: "#2563eb" }}>🐾 {pet.name}</span>}
            {proc ? (
              <span style={{ color: proc.color, fontWeight: 600 }}>{proc.name} ({proc.duration}')</span>
            ) : (
              <span style={{ color: theme.textMuted }}>📋 Jiné (volný text)</span>
            )}
            {parsed.isAcute ? (
              <span style={{ color: theme.danger, fontWeight: 800, background: theme.dangerLight, padding: "2px 8px", borderRadius: 4 }}>🚨 AKUTNÍ → čekárna</span>
            ) : (
              <>
                {parsed.date && <span style={{ color: "#059669", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>📅 {new Date(parsed.date + "T00:00").toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "numeric" })}</span>}
                {parsed.time && <span style={{ color: "#7c3aed", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>🕐 {parsed.time}</span>}
                {!parsed.date && parsed.time && <span style={{ color: theme.warning, fontSize: 11 }}>📅 dnes</span>}
              </>
            )}
          </div>
          {!parsed.clientId && parsed.manualName && clients.length > 0 && (
            <div style={{ fontSize: 11, color: theme.textMuted }}>💡 Klient nenalezen v číselníku — bude založen jako ruční záznam</div>
          )}
          {parsed.clientId && !parsed.petId && pets.filter(p => p.clientId === parsed.clientId).length > 1 && (
            <div style={{ fontSize: 11, color: theme.warning }}>⚠️ Klient má více zvířat — bude potřeba vybrat ručně</div>
          )}
        </div>
      )}

      {!text && focused && (
        <div style={{ padding: "4px 14px 10px", fontSize: 12, color: theme.textMuted, lineHeight: 1.6 }}>
          <strong>Příklady:</strong> Černý drápky sobota 14:30 &bull; Nováková vakcinace zítra 10:00 &bull; Dvořák (= akut) &bull; Svobodová ultrazvuk pátek 9:00 &bull; Novák kontrola 15.3. 8:30
        </div>
      )}
    </div>
  );
}