import { useState, useEffect, useMemo, useCallback } from "react";

// ─── FONTS & THEME ───
const FONT = `'DM Sans', 'Segoe UI', system-ui, sans-serif`;
const MONO = `'JetBrains Mono', 'Fira Code', monospace`;

const theme = {
  bg: "#f6f7f9",
  surface: "#ffffff",
  surfaceHover: "#f1f5f9",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  text: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  accent: "#2563eb",
  accentLight: "#dbeafe",
  accentDark: "#1d4ed8",
  danger: "#dc2626",
  dangerLight: "#fee2e2",
  success: "#059669",
  successLight: "#d1fae5",
  warning: "#d97706",
  warningLight: "#fef3c7",
  purple: "#7c3aed",
  purpleLight: "#ede9fe",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
  shadowLg: "0 10px 25px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)",
  radius: "10px",
  radiusSm: "6px",
  radiusLg: "14px",
};

const ROLES = {
  public: { label: "Veřejnost", icon: "🌐", color: "#6366f1", desc: "Registrace & žádost o termín" },
  reception: { label: "Recepce", icon: "🖥️", color: "#2563eb", desc: "Správa objednávek & fronta" },
  doctor: { label: "Lékař", icon: "🩺", color: "#059669", desc: "Denní přehled & pacienti" },
  manager: { label: "Manažer", icon: "📊", color: "#7c3aed", desc: "Sestavy & řízení" },
};

// ─── PROCEDURES ───
const PROCEDURES = [
  { id: "vaccination", name: "Vakcinace", duration: 15, color: "#059669", category: "prevence" },
  { id: "checkup", name: "Preventivní prohlídka", duration: 20, color: "#2563eb", category: "prevence" },
  { id: "surgery_small", name: "Malý chirurgický zákrok", duration: 45, color: "#dc2626", category: "chirurgie" },
  { id: "surgery_large", name: "Velký chirurgický zákrok", duration: 120, color: "#dc2626", category: "chirurgie" },
  { id: "dental", name: "Dentální ošetření", duration: 60, color: "#d97706", category: "specialni" },
  { id: "xray", name: "RTG vyšetření", duration: 30, color: "#7c3aed", category: "diagnostika" },
  { id: "ultrasound", name: "Ultrazvuk", duration: 30, color: "#7c3aed", category: "diagnostika" },
  { id: "blood_work", name: "Odběr krve / laboratoř", duration: 15, color: "#0891b2", category: "diagnostika" },
  { id: "castration", name: "Kastrace", duration: 60, color: "#dc2626", category: "chirurgie" },
  { id: "dermatology", name: "Dermatologie", duration: 30, color: "#d97706", category: "specialni" },
  { id: "emergency", name: "Akutní příjem", duration: 20, color: "#ef4444", category: "akutni" },
  { id: "followup", name: "Kontrola po zákroku", duration: 15, color: "#059669", category: "prevence" },
  { id: "euthanasia", name: "Eutanazie", duration: 45, color: "#64748b", category: "specialni" },
  { id: "other", name: "Jiné (volný text)", duration: 20, color: "#94a3b8", category: "ostatni" },
];

const STATUSES = {
  pending: { label: "Čeká na schválení", color: "#d97706", bg: "#fef3c7", icon: "⏳" },
  confirmed: { label: "Potvrzeno", color: "#059669", bg: "#d1fae5", icon: "✓" },
  rejected: { label: "Zamítnuto", color: "#dc2626", bg: "#fee2e2", icon: "✕" },
  arrived: { label: "V čekárně", color: "#2563eb", bg: "#dbeafe", icon: "🏠" },
  in_progress: { label: "U lékaře", color: "#7c3aed", bg: "#ede9fe", icon: "▶" },
  completed: { label: "Dokončeno", color: "#64748b", bg: "#f1f5f9", icon: "✔" },
  no_show: { label: "Nedostavil se", color: "#dc2626", bg: "#fee2e2", icon: "✕" },
};

const generateId = () => Math.random().toString(36).substr(2, 9);
const TODAY = new Date().toISOString().split("T")[0];
const TOMORROW = new Date(Date.now() + 86400000).toISOString().split("T")[0];

// ─── DEMO DATA ───
const DEMO_CLIENTS = [
  { id: "c1", firstName: "Jana", lastName: "Nováková", phone: "602111222", email: "jana@email.cz", registered: true },
  { id: "c2", firstName: "Petr", lastName: "Dvořák", phone: "603222333", email: "petr@email.cz", registered: true },
  { id: "c3", firstName: "Marie", lastName: "Svobodová", phone: "604333444", email: "marie@email.cz", registered: true },
  { id: "c4", firstName: "Tomáš", lastName: "Černý", phone: "605444555", email: "tomas@email.cz", registered: true },
];

const DEMO_PETS = [
  { id: "p1", clientId: "c1", name: "Rex", species: "Pes", breed: "Německý ovčák", age: "5 let" },
  { id: "p2", clientId: "c1", name: "Mícka", species: "Kočka", breed: "Britská", age: "3 roky" },
  { id: "p3", clientId: "c2", name: "Bety", species: "Pes", breed: "Labrador", age: "2 roky" },
  { id: "p4", clientId: "c3", name: "Mourek", species: "Kočka", breed: "Domácí", age: "8 let" },
  { id: "p5", clientId: "c4", name: "Ťapka", species: "Pes", breed: "Jezevčík", age: "10 let" },
];

const DEMO_APPOINTMENTS = [
  { id: "a1", clientId: "c1", petId: "p1", procedureId: "checkup", date: TODAY, time: "08:00", duration: 20, status: "confirmed", note: "Pravidelná kontrola", createdBy: "reception" },
  { id: "a2", clientId: "c2", petId: "p3", procedureId: "vaccination", date: TODAY, time: "08:30", duration: 15, status: "confirmed", note: "Přeočkování vzteklina", createdBy: "reception" },
  { id: "a3", clientId: "c3", petId: "p4", procedureId: "blood_work", date: TODAY, time: "09:00", duration: 15, status: "arrived", note: "Kontrolní KO, ledviny", createdBy: "reception" },
  { id: "a4", clientId: "c4", petId: "p5", procedureId: "dental", date: TODAY, time: "09:30", duration: 60, status: "confirmed", note: "Zubní kámen, možná extrakce", createdBy: "reception" },
  { id: "a5", clientId: "c1", petId: "p2", procedureId: "castration", date: TODAY, time: "11:00", duration: 60, status: "confirmed", note: "Kastrace kočky, nalačno", createdBy: "public" },
  { id: "a6", clientId: "c2", petId: "p3", procedureId: "dermatology", date: TOMORROW, time: "08:00", duration: 30, status: "pending", note: "Svědění, vypadávání srsti", createdBy: "public" },
  { id: "a7", clientId: "c3", petId: "p4", procedureId: "ultrasound", date: TOMORROW, time: "09:00", duration: 30, status: "pending", note: "Kontrola ledvin po léčbě", createdBy: "public" },
  { id: "a8", clientId: "c1", petId: "p1", procedureId: "emergency", date: TODAY, time: "10:15", duration: 20, status: "in_progress", note: "Kulhání, podezření na úraz", createdBy: "reception", arrivalTime: "10:10" },
];

// ─── ICONS ───
const Icon = ({ name, size = 16 }) => {
  const s = { width: size, height: size, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 };
  const icons = {
    plus: <svg {...s}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    x: <svg {...s}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    check: <svg {...s}><polyline points="20 6 9 17 4 12"/></svg>,
    clock: <svg {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    calendar: <svg {...s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    user: <svg {...s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    phone: <svg {...s}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    alert: <svg {...s}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    search: <svg {...s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    chevronRight: <svg {...s}><polyline points="9 18 15 12 9 6"/></svg>,
    send: <svg {...s}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    move: <svg {...s}><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>,
    edit: <svg {...s}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    bar: <svg {...s}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    download: <svg {...s}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  };
  return icons[name] || null;
};

// ─── SHARED COMPONENTS ───
function StatusBadge({ status, small }) {
  const s = STATUSES[status];
  if (!s) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: small ? "2px 8px" : "3px 10px", fontSize: small ? 11 : 12, fontWeight: 600, fontFamily: MONO, color: s.color, background: s.bg, border: `1.5px solid ${s.color}20`, borderRadius: 20, whiteSpace: "nowrap" }}>
      <span style={{ fontSize: small ? 10 : 12 }}>{s.icon}</span>{s.label}
    </span>
  );
}

function ProcBadge({ proc, small }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: small ? "2px 8px" : "3px 10px", fontSize: small ? 11 : 12, fontWeight: 600, fontFamily: FONT, color: proc.color, background: proc.color + "15", border: `1.5px solid ${proc.color}30`, borderRadius: 20, whiteSpace: "nowrap" }}>
      {proc.name}<span style={{ fontFamily: MONO, fontSize: 10, opacity: 0.7 }}>{proc.duration}'</span>
    </span>
  );
}

function Btn({ children, variant = "primary", small, icon, disabled, ...props }) {
  const styles = {
    primary: { bg: theme.accent, color: "white", border: "none", shadow: "0 2px 8px rgba(37,99,235,0.25)" },
    danger: { bg: theme.danger, color: "white", border: "none", shadow: "0 2px 8px rgba(220,38,38,0.25)" },
    success: { bg: theme.success, color: "white", border: "none", shadow: "0 2px 8px rgba(5,150,105,0.25)" },
    ghost: { bg: "transparent", color: theme.textSecondary, border: `1.5px solid ${theme.border}`, shadow: "none" },
    outline: { bg: "white", color: theme.accent, border: `1.5px solid ${theme.accent}`, shadow: "none" },
  };
  const st = styles[variant];
  return (
    <button disabled={disabled} {...props} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: small ? "5px 12px" : "8px 18px", background: disabled ? theme.border : st.bg, color: disabled ? theme.textMuted : st.color, border: st.border, borderRadius: theme.radiusSm, fontSize: small ? 12 : 14, fontWeight: 600, fontFamily: FONT, cursor: disabled ? "not-allowed" : "pointer", boxShadow: disabled ? "none" : st.shadow, transition: "all 0.15s", ...props.style }}>
      {icon && <Icon name={icon} size={small ? 14 : 16} />}{children}
    </button>
  );
}

function Input({ label, required, icon, textarea, ...props }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: FONT }}>{label}{required && <span style={{ color: theme.danger, marginLeft: 2 }}>*</span>}</label>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 10, top: textarea ? 12 : "50%", transform: textarea ? "none" : "translateY(-50%)", color: theme.textMuted, display: "flex" }}><Icon name={icon} /></span>}
        <Tag {...props} style={{ width: "100%", boxSizing: "border-box", padding: icon ? (textarea ? "10px 12px 10px 34px" : "8px 12px 8px 34px") : "8px 12px", border: `1.5px solid ${theme.border}`, borderRadius: theme.radiusSm, fontSize: 14, fontFamily: FONT, color: theme.text, outline: "none", transition: "border-color 0.15s", background: "white", resize: textarea ? "vertical" : undefined, minHeight: textarea ? 80 : undefined, ...props.style }}
          onFocus={(e) => (e.target.style.borderColor = theme.accent)} onBlur={(e) => (e.target.style.borderColor = theme.border)} />
      </div>
    </div>
  );
}

function Card({ children, title, action, accent, noPad, style: extraStyle }) {
  return (
    <div style={{ background: "white", borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, borderTop: accent ? `3px solid ${accent}` : undefined, boxShadow: theme.shadow, overflow: "hidden", ...extraStyle }}>
      {title && <div style={{ padding: "14px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 14, fontWeight: 700, fontFamily: FONT }}>{title}</span>{action}</div>}
      {!noPad ? <div style={{ padding: "16px 20px" }}>{children}</div> : children}
    </div>
  );
}

function Modal({ title, subtitle, onClose, children, footer, wide }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: theme.radiusLg, width: wide ? "min(720px, 95vw)" : "min(520px, 95vw)", maxHeight: "90vh", overflow: "auto", boxShadow: theme.shadowLg, animation: "slideUp 0.25s ease-out" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${theme.border}` }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: FONT }}>{title}</h2>
            {subtitle && <p style={{ margin: "2px 0 0", fontSize: 13, color: theme.textSecondary }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textMuted, padding: 4, display: "flex" }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
        {footer && <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "16px 24px", borderTop: `1px solid ${theme.border}` }}>{footer}</div>}
      </div>
    </div>
  );
}

function StatBox({ label, value, color, icon }) {
  return (
    <div style={{ flex: 1, minWidth: 140, padding: "14px 18px", background: "white", borderRadius: theme.radius, border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: MONO, marginTop: 2 }}>{value}</div>
        </div>
        {icon && <span style={{ fontSize: 28, opacity: 0.3 }}>{icon}</span>}
      </div>
    </div>
  );
}

// ─── APPOINTMENT ROW ───
function AptRow({ apt, clients, pets, onAction, role }) {
  const client = clients.find((c) => c.id === apt.clientId);
  const pet = pets.find((p) => p.id === apt.petId);
  const proc = PROCEDURES.find((p) => p.id === apt.procedureId);
  const endMin = parseInt(apt.time.split(":")[0]) * 60 + parseInt(apt.time.split(":")[1]) + apt.duration;
  const endTime = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;

  return (
    <div style={{ padding: "12px 16px", borderRadius: theme.radius, border: `1.5px solid ${proc?.color || theme.border}20`, borderLeft: `4px solid ${proc?.color || theme.border}`, background: "white", boxShadow: theme.shadow, transition: "all 0.15s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: theme.text }}>{apt.time}–{endTime}</span>
            {proc && <ProcBadge proc={proc} small />}
            <StatusBadge status={apt.status} small />
            {apt.date !== TODAY && <span style={{ fontSize: 11, fontFamily: MONO, color: theme.textMuted, background: theme.bg, padding: "2px 6px", borderRadius: 4 }}>{apt.date}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>{client?.lastName} {client?.firstName}</span>
            <span style={{ fontSize: 13, color: theme.textSecondary }}>—</span>
            <span style={{ fontSize: 14, color: theme.accent, fontWeight: 600 }}>🐾 {pet?.name}</span>
            <span style={{ fontSize: 12, color: theme.textMuted }}>({pet?.species}, {pet?.breed})</span>
          </div>
          {apt.note && <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 1 }}>📋 {apt.note}</div>}
        </div>
        {role !== "public" && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap" }}>
            {role === "reception" && apt.status === "pending" && (<><Btn small variant="success" icon="check" onClick={() => onAction(apt.id, "confirm")}>Potvrdit</Btn><Btn small variant="danger" icon="x" onClick={() => onAction(apt.id, "reject")}>Zamítnout</Btn></>)}
            {role === "reception" && apt.status === "confirmed" && <Btn small variant="outline" icon="check" onClick={() => onAction(apt.id, "arrive")}>Přišel</Btn>}
            {(role === "reception" || role === "doctor") && apt.status === "arrived" && <Btn small variant="primary" icon="chevronRight" onClick={() => onAction(apt.id, "start")}>Převzít</Btn>}
            {(role === "reception" || role === "doctor") && apt.status === "in_progress" && <Btn small variant="success" icon="check" onClick={() => onAction(apt.id, "complete")}>Hotovo</Btn>}
            {role === "reception" && ["confirmed", "pending"].includes(apt.status) && <Btn small variant="ghost" icon="move" onClick={() => onAction(apt.id, "reschedule")}>Přesunout</Btn>}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
//  PUBLIC VIEW
// ════════════════════════════════════════
function PublicView({ onSubmitRequest, clients, pets }) {
  const [step, setStep] = useState("login");
  const [client, setClient] = useState(null);
  const [regForm, setRegForm] = useState({ firstName: "", lastName: "", phone: "", email: "" });
  const [form, setForm] = useState({ petId: "", procedureId: "", date: TOMORROW, time: "09:00", note: "" });
  const [loginEmail, setLoginEmail] = useState("");
  const myPets = pets.filter((p) => p.clientId === client?.id);

  const handleLogin = () => {
    const found = clients.find((c) => c.email === loginEmail);
    if (found) { setClient(found); setStep("form"); }
    else alert("Účet nenalezen. Zaregistrujte se prosím.");
  };

  const handleSubmit = () => {
    const proc = PROCEDURES.find((p) => p.id === form.procedureId);
    onSubmitRequest({ id: generateId(), clientId: client.id, petId: form.petId, procedureId: form.procedureId, date: form.date, time: form.time, duration: proc?.duration || 20, status: "pending", note: form.note, createdBy: "public" });
    setStep("done");
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🐾</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: FONT, marginBottom: 4 }}>Veterinární ordinace</h1>
        <p style={{ color: theme.textSecondary, fontSize: 15 }}>Online objednání na vyšetření</p>
      </div>

      {step === "login" && (
        <Card title="Přihlášení" accent={theme.accent}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="E-mail" required icon="user" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="vas@email.cz" />
            <Btn onClick={handleLogin} style={{ width: "100%" }}>Přihlásit se</Btn>
            <div style={{ textAlign: "center", fontSize: 13, color: theme.textMuted }}>Nemáte účet?{" "}<span onClick={() => setStep("register")} style={{ color: theme.accent, cursor: "pointer", fontWeight: 600 }}>Zaregistrujte se</span></div>
            <div style={{ padding: 12, background: theme.warningLight, borderRadius: theme.radiusSm, fontSize: 12, color: theme.warning }}>💡 Demo: použijte <strong>jana@email.cz</strong>, <strong>petr@email.cz</strong>, <strong>marie@email.cz</strong> nebo <strong>tomas@email.cz</strong></div>
          </div>
        </Card>
      )}

      {step === "register" && (
        <Card title="Registrace nového klienta" accent={theme.accent}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}><Input label="Jméno" required value={regForm.firstName} onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })} /></div>
              <div style={{ flex: 1 }}><Input label="Příjmení" required value={regForm.lastName} onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })} /></div>
            </div>
            <Input label="Telefon" required icon="phone" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} />
            <Input label="E-mail" required icon="user" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
            <div style={{ padding: 12, background: theme.accentLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.accent }}>ℹ️ Po registraci budete moci přidávat své zvířata a odesílat žádosti o termín. Registrace podléhá schválení recepcí.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" onClick={() => setStep("login")}>← Zpět</Btn>
              <Btn onClick={() => { alert("Registrace odeslána ke schválení!"); setStep("login"); }} style={{ flex: 1 }}>Registrovat</Btn>
            </div>
          </div>
        </Card>
      )}

      {step === "form" && (
        <Card title={`Žádost o termín — ${client.firstName} ${client.lastName}`} accent={theme.accent}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>Zvíře <span style={{ color: theme.danger }}>*</span></label>
              <select value={form.petId} onChange={(e) => setForm({ ...form, petId: e.target.value })} style={{ padding: "8px 12px", border: `1.5px solid ${theme.border}`, borderRadius: theme.radiusSm, fontSize: 14, fontFamily: FONT, background: "white" }}>
                <option value="">— vyberte —</option>
                {myPets.map((p) => <option key={p.id} value={p.id}>🐾 {p.name} ({p.species} — {p.breed})</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>Procedura <span style={{ color: theme.danger }}>*</span></label>
              <select value={form.procedureId} onChange={(e) => setForm({ ...form, procedureId: e.target.value })} style={{ padding: "8px 12px", border: `1.5px solid ${theme.border}`, borderRadius: theme.radiusSm, fontSize: 14, fontFamily: FONT, background: "white" }}>
                <option value="">— vyberte typ vyšetření —</option>
                {["prevence", "diagnostika", "chirurgie", "specialni", "ostatni"].map((cat) => (
                  <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                    {PROCEDURES.filter((p) => p.category === cat && p.id !== "emergency").map((p) => (<option key={p.id} value={p.id}>{p.name} ({p.duration} min)</option>))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}><Input label="Preferovaný den" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} min={TOMORROW} /></div>
              <div style={{ flex: 1 }}><Input label="Preferovaný čas" type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} min="07:00" max="17:00" step="900" /></div>
            </div>
            <Input label="Popis problému / poznámka" textarea icon="edit" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Popište příznaky, jak dlouho trvají..." />
            <div style={{ padding: 12, background: theme.warningLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.warning }}>⚠️ Jedná se o <strong>žádost</strong> — termín bude potvrzen recepcí. Při akutních stavech volejte přímo!</div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" onClick={() => { setClient(null); setStep("login"); }}>← Odhlásit</Btn>
              <Btn icon="send" disabled={!form.petId || !form.procedureId} onClick={handleSubmit} style={{ flex: 1 }}>Odeslat žádost</Btn>
            </div>
          </div>
        </Card>
      )}

      {step === "done" && (
        <Card accent={theme.success}>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Žádost odeslána!</h2>
            <p style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 20 }}>Recepce vaši žádost posoudí a potvrdí termín. Budete informováni e-mailem.</p>
            <Btn onClick={() => { setForm({ petId: "", procedureId: "", date: TOMORROW, time: "09:00", note: "" }); setStep("form"); }}>Odeslat další žádost</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

// ════════════════════════════════════════
//  RECEPTION VIEW
// ════════════════════════════════════════
function ReceptionView({ appointments, clients, pets, onAction, onAddApt }) {
  const [tab, setTab] = useState("today");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newApt, setNewApt] = useState({ clientId: "", petId: "", procedureId: "", date: TODAY, time: "08:00", note: "" });

  const todayApts = appointments.filter((a) => a.date === TODAY).sort((a, b) => a.time.localeCompare(b.time));
  const pendingApts = appointments.filter((a) => a.status === "pending").sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  const waitingApts = todayApts.filter((a) => a.status === "arrived");
  const inProgressApts = todayApts.filter((a) => a.status === "in_progress");
  const selectedPets = pets.filter((p) => p.clientId === newApt.clientId);

  const tabs = [
    { id: "today", label: `Dnes (${todayApts.length})` },
    { id: "pending", label: `Ke schválení (${pendingApts.length})`, alert: pendingApts.length > 0 },
    { id: "all", label: "Vše" },
  ];

  const handleNewSave = () => {
    const proc = PROCEDURES.find((p) => p.id === newApt.procedureId);
    onAddApt({ id: generateId(), ...newApt, duration: proc?.duration || 20, status: "confirmed", createdBy: "reception" });
    setShowNewModal(false);
    setNewApt({ clientId: "", petId: "", procedureId: "", date: TODAY, time: "08:00", note: "" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatBox label="Dnes celkem" value={todayApts.length} color={theme.accent} icon="📋" />
        <StatBox label="V čekárně" value={waitingApts.length} color={theme.warning} icon="🏠" />
        <StatBox label="U lékaře" value={inProgressApts.length} color={theme.purple} icon="🩺" />
        <StatBox label="Ke schválení" value={pendingApts.length} color={theme.danger} icon="⏳" />
      </div>

      {waitingApts.length > 0 && (
        <Card accent={theme.warning} noPad>
          <div style={{ padding: "12px 20px", background: theme.warningLight, borderBottom: `1px solid ${theme.warning}30` }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: theme.warning }}>🏠 Čekárna — {waitingApts.length} pacient{waitingApts.length > 1 ? "ů" : ""}</span>
          </div>
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {waitingApts.map((a) => <AptRow key={a.id} apt={a} clients={clients} pets={pets} onAction={onAction} role="reception" />)}
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 4, borderBottom: `2px solid ${theme.border}`, paddingBottom: 0 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 20px", border: "none", borderBottom: `3px solid ${tab === t.id ? theme.accent : "transparent"}`, background: "none", color: tab === t.id ? theme.accent : theme.textSecondary, fontSize: 14, fontWeight: 700, fontFamily: FONT, cursor: "pointer", transition: "all 0.15s", position: "relative" }}>
            {t.label}
            {t.alert && <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: theme.danger }} />}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <Btn icon="plus" onClick={() => setShowNewModal(true)} style={{ alignSelf: "center" }}>Nová objednávka</Btn>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(tab === "today" ? todayApts : tab === "pending" ? pendingApts : appointments.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)))
          .map((a) => <AptRow key={a.id} apt={a} clients={clients} pets={pets} onAction={onAction} role="reception" />)}
        {((tab === "today" && todayApts.length === 0) || (tab === "pending" && pendingApts.length === 0)) && <div style={{ padding: 40, textAlign: "center", color: theme.textMuted }}>Žádné záznamy</div>}
      </div>

      {showNewModal && (
        <Modal title="Nová objednávka" subtitle="Recepce — přímé objednání" onClose={() => setShowNewModal(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowNewModal(false)}>Zrušit</Btn><Btn variant="success" icon="check" disabled={!newApt.clientId || !newApt.petId || !newApt.procedureId} onClick={handleNewSave}>Uložit</Btn></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>Klient *</label>
              <select value={newApt.clientId} onChange={(e) => setNewApt({ ...newApt, clientId: e.target.value, petId: "" })} style={{ padding: "8px 12px", border: `1.5px solid ${theme.border}`, borderRadius: theme.radiusSm, fontSize: 14, fontFamily: FONT, background: "white" }}>
                <option value="">— vyberte klienta —</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.lastName} {c.firstName} ({c.phone})</option>)}
              </select>
            </div>
            {newApt.clientId && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>Zvíře *</label>
                <select value={newApt.petId} onChange={(e) => setNewApt({ ...newApt, petId: e.target.value })} style={{ padding: "8px 12px", border: `1.5px solid ${theme.border}`, borderRadius: theme.radiusSm, fontSize: 14, fontFamily: FONT, background: "white" }}>
                  <option value="">— vyberte zvíře —</option>
                  {selectedPets.map((p) => <option key={p.id} value={p.id}>🐾 {p.name} ({p.species})</option>)}
                </select>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>Procedura *</label>
              <select value={newApt.procedureId} onChange={(e) => setNewApt({ ...newApt, procedureId: e.target.value })} style={{ padding: "8px 12px", border: `1.5px solid ${theme.border}`, borderRadius: theme.radiusSm, fontSize: 14, fontFamily: FONT, background: "white" }}>
                <option value="">— vyberte —</option>
                {PROCEDURES.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.duration} min)</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}><Input label="Datum" type="date" value={newApt.date} onChange={(e) => setNewApt({ ...newApt, date: e.target.value })} /></div>
              <div style={{ flex: 1 }}><Input label="Čas" type="time" value={newApt.time} onChange={(e) => setNewApt({ ...newApt, time: e.target.value })} min="07:00" max="17:00" step="900" /></div>
            </div>
            <Input label="Poznámka" textarea value={newApt.note} onChange={(e) => setNewApt({ ...newApt, note: e.target.value })} placeholder="Důvod, příprava..." />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════════════════
//  DOCTOR VIEW
// ════════════════════════════════════════
function DoctorView({ appointments, clients, pets, onAction }) {
  const todayApts = appointments.filter((a) => a.date === TODAY).sort((a, b) => a.time.localeCompare(b.time));
  const waiting = todayApts.filter((a) => a.status === "arrived");
  const inProgress = todayApts.filter((a) => a.status === "in_progress");
  const upcoming = todayApts.filter((a) => a.status === "confirmed");
  const completed = todayApts.filter((a) => a.status === "completed");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatBox label="V čekárně" value={waiting.length} color={theme.warning} icon="🏠" />
        <StatBox label="Právě ošetřuji" value={inProgress.length} color={theme.purple} icon="🩺" />
        <StatBox label="Další v pořadí" value={upcoming.length} color={theme.accent} icon="📋" />
        <StatBox label="Hotovo dnes" value={completed.length} color={theme.success} icon="✔" />
      </div>

      {inProgress.length > 0 && (
        <Card accent={theme.purple} title="🩺 Právě u mě">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {inProgress.map((a) => <AptRow key={a.id} apt={a} clients={clients} pets={pets} onAction={onAction} role="doctor" />)}
          </div>
        </Card>
      )}

      {waiting.length > 0 && (
        <Card accent={theme.warning} title={`🏠 Čekárna (${waiting.length})`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {waiting.map((a) => <AptRow key={a.id} apt={a} clients={clients} pets={pets} onAction={onAction} role="doctor" />)}
          </div>
        </Card>
      )}

      <Card title={`📋 Nadcházející objednávky (${upcoming.length})`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {upcoming.map((a) => <AptRow key={a.id} apt={a} clients={clients} pets={pets} onAction={onAction} role="doctor" />)}
          {upcoming.length === 0 && <div style={{ padding: 20, textAlign: "center", color: theme.textMuted }}>Žádné další objednávky</div>}
        </div>
      </Card>

      {completed.length > 0 && (
        <Card title={`✔ Dokončené dnes (${completed.length})`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, opacity: 0.7 }}>
            {completed.map((a) => <AptRow key={a.id} apt={a} clients={clients} pets={pets} onAction={onAction} role="doctor" />)}
          </div>
        </Card>
      )}
    </div>
  );
}

// ════════════════════════════════════════
//  MANAGER VIEW
// ════════════════════════════════════════
function ManagerView({ appointments, clients, pets }) {
  const todayApts = appointments.filter((a) => a.date === TODAY);
  const totalMinutes = todayApts.reduce((s, a) => s + a.duration, 0);
  const byProc = PROCEDURES.map((p) => ({ ...p, count: appointments.filter((a) => a.procedureId === p.id).length })).filter((p) => p.count > 0).sort((a, b) => b.count - a.count);
  const byStatus = Object.entries(STATUSES).map(([key, val]) => ({ key, ...val, count: appointments.filter((a) => a.status === key).length })).filter((s) => s.count > 0);
  const publicRequests = appointments.filter((a) => a.createdBy === "public").length;
  const receptionCreated = appointments.filter((a) => a.createdBy === "reception").length;
  const avgDuration = appointments.length ? Math.round(appointments.reduce((s, a) => s + a.duration, 0) / appointments.length) : 0;
  const uniqueClients = new Set(appointments.map((a) => a.clientId)).size;
  const maxCount = Math.max(...byProc.map((p) => p.count), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatBox label="Celkem objednávek" value={appointments.length} color={theme.accent} icon="📊" />
        <StatBox label="Dnešní obsazenost" value={`${Math.round((totalMinutes / 540) * 100)}%`} color={theme.success} icon="📈" />
        <StatBox label="Unikátních klientů" value={uniqueClients} color={theme.purple} icon="👥" />
        <StatBox label="Ø délka návštěvy" value={`${avgDuration}'`} color={theme.warning} icon="⏱" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
        <Card title="📊 Procedury — četnost">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {byProc.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, minWidth: 160, color: theme.text }}>{p.name}</span>
                <div style={{ flex: 1, height: 22, background: theme.bg, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(p.count / maxCount) * 100}%`, background: p.color + "40", borderRadius: 4, transition: "width 0.5s ease", display: "flex", alignItems: "center", paddingLeft: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: p.color }}>{p.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="📈 Stavy objednávek">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {byStatus.map((s) => (
              <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: s.bg, borderRadius: theme.radiusSm }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: s.color, display: "flex", alignItems: "center", gap: 6 }}><span>{s.icon}</span> {s.label}</span>
                <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 800, color: s.color }}>{s.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="📬 Zdroj objednávek">
          <div style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, fontFamily: MONO, color: theme.accent }}>{receptionCreated}</div>
              <div style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 600, marginTop: 4 }}>🖥️ Recepce</div>
            </div>
            <div style={{ width: 1, height: 50, background: theme.border }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, fontFamily: MONO, color: "#6366f1" }}>{publicRequests}</div>
              <div style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 600, marginTop: 4 }}>🌐 Online</div>
            </div>
          </div>
        </Card>

        <Card title="⬇️ Export dat">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Btn variant="outline" icon="download" onClick={() => alert("Export CSV — v produkci by se generoval soubor")}>Exportovat objednávky (CSV)</Btn>
            <Btn variant="outline" icon="download" onClick={() => alert("Export klientů — v produkci by se generoval soubor")}>Exportovat klienty (CSV)</Btn>
            <Btn variant="outline" icon="bar" onClick={() => alert("Měsíční report — v produkci PDF sestava")}>Měsíční sestava (PDF)</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════
export default function VetApp() {
  const [role, setRole] = useState("reception");
  const [appointments, setAppointments] = useState(DEMO_APPOINTMENTS);
  const [clients] = useState(DEMO_CLIENTS);
  const [pets] = useState(DEMO_PETS);

  const handleAction = (id, action) => {
    setAppointments((prev) => prev.map((a) => {
      if (a.id !== id) return a;
      switch (action) {
        case "confirm": return { ...a, status: "confirmed" };
        case "reject": return { ...a, status: "rejected" };
        case "arrive": return { ...a, status: "arrived", arrivalTime: new Date().toTimeString().slice(0, 5) };
        case "start": return { ...a, status: "in_progress" };
        case "complete": return { ...a, status: "completed" };
        case "no_show": return { ...a, status: "no_show" };
        case "reschedule": alert("Přesunutí — v produkci by se otevřel kalendář"); return a;
        default: return a;
      }
    }));
  };

  const handleAddApt = (apt) => setAppointments((prev) => [...prev, apt]);
  const today = new Date();
  const dateStr = today.toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
  const roleInfo = ROLES[role];

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: FONT, color: theme.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        select:focus { outline: none; border-color: ${theme.accent} !important; }
      `}</style>

      <header style={{ background: "white", borderBottom: `1px solid ${theme.border}`, padding: "0 28px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: theme.shadow, position: "sticky", top: 0, zIndex: 50, height: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${roleInfo.color}, ${roleInfo.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{roleInfo.icon}</div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>VetBook <span style={{ fontWeight: 400, color: theme.textSecondary, fontSize: 14 }}>— {roleInfo.label}</span></h1>
            <div style={{ fontSize: 12, color: theme.textMuted, display: "flex", alignItems: "center", gap: 4 }}><Icon name="calendar" size={12} /> {dateStr}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 3, background: theme.bg, padding: 3, borderRadius: 8 }}>
          {Object.entries(ROLES).map(([key, r]) => (
            <button key={key} onClick={() => setRole(key)} style={{ padding: "7px 14px", border: "none", borderRadius: 6, cursor: "pointer", background: role === key ? "white" : "transparent", boxShadow: role === key ? theme.shadow : "none", color: role === key ? r.color : theme.textMuted, fontSize: 13, fontWeight: 600, fontFamily: FONT, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 14 }}>{r.icon}</span>
              <span style={{ display: role === key ? "inline" : "none" }}>{r.label}</span>
            </button>
          ))}
        </div>
      </header>

      <main style={{ padding: "20px 28px", maxWidth: role === "public" ? 700 : 1200, margin: "0 auto" }}>
        {role === "public" && <PublicView onSubmitRequest={handleAddApt} clients={clients} pets={pets} />}
        {role === "reception" && <ReceptionView appointments={appointments} clients={clients} pets={pets} onAction={handleAction} onAddApt={handleAddApt} />}
        {role === "doctor" && <DoctorView appointments={appointments} clients={clients} pets={pets} onAction={handleAction} />}
        {role === "manager" && <ManagerView appointments={appointments} clients={clients} pets={pets} />}
      </main>
    </div>
  );
}
