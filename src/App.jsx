import { useState, useMemo } from "react";

// ─── FONTS & THEME ───
const FONT = `'DM Sans', 'Segoe UI', system-ui, sans-serif`;
const MONO = `'JetBrains Mono', 'Fira Code', monospace`;
const theme = {
  bg: "#f6f7f9", surface: "#ffffff", border: "#e2e8f0", borderLight: "#f1f5f9",
  text: "#0f172a", textSecondary: "#64748b", textMuted: "#94a3b8",
  accent: "#2563eb", accentLight: "#dbeafe",
  danger: "#dc2626", dangerLight: "#fee2e2",
  success: "#059669", successLight: "#d1fae5",
  warning: "#d97706", warningLight: "#fef3c7",
  purple: "#7c3aed", purpleLight: "#ede9fe",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
  shadowLg: "0 10px 25px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)",
  radius: "10px", radiusSm: "6px", radiusLg: "14px",
};

const ROLES = {
  public: { label: "Veřejnost", icon: "🌐", color: "#6366f1" },
  reception: { label: "Recepce", icon: "🖥️", color: "#2563eb" },
  doctor: { label: "Lékař", icon: "🩺", color: "#059669" },
  manager: { label: "Manažer", icon: "📊", color: "#7c3aed" },
};

const DEFAULT_CONFIG = {
  clinicName: "Veterinární klinika VetBook",
  openingHours: { mon: { open: "07:30", close: "18:00" }, tue: { open: "07:30", close: "18:00" }, wed: { open: "07:30", close: "18:00" }, thu: { open: "07:30", close: "18:00" }, fri: { open: "07:30", close: "16:00" }, sat: { open: "08:00", close: "12:00" }, sun: null },
  slotInterval: 15,
  acuteBufferSlots: 3,
  acuteBufferSpacing: 90,
  doctors: [
    { id: "d1", name: "MVDr. Jan Novák", specializations: ["chirurgie", "diagnostika", "prevence", "specialni", "akutni", "ostatni"], color: "#2563eb" },
    { id: "d2", name: "MVDr. Petra Králová", specializations: ["prevence", "diagnostika", "specialni", "ostatni"], color: "#059669" },
    { id: "d3", name: "MVDr. Tomáš Veselý", specializations: ["chirurgie", "diagnostika", "akutni"], color: "#d97706" },
  ],
  procedureBlocks: [
    { id: "b1", label: "Ranní prevence", timeFrom: "07:30", timeTo: "10:00", categories: ["prevence"], doctorIds: ["d1", "d2"] },
    { id: "b2", label: "Chirurgie", timeFrom: "10:00", timeTo: "13:00", categories: ["chirurgie"], doctorIds: ["d1", "d3"] },
    { id: "b3", label: "Odpolední ambulance", timeFrom: "13:00", timeTo: "16:00", categories: ["prevence", "diagnostika", "specialni", "ostatni"], doctorIds: ["d1", "d2"] },
    { id: "b4", label: "Diagnostika", timeFrom: "08:00", timeTo: "12:00", categories: ["diagnostika"], doctorIds: ["d2", "d3"] },
  ],
};

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
const DAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_LABELS_CZ = { mon: "Po", tue: "Út", wed: "St", thu: "Čt", fri: "Pá", sat: "So", sun: "Ne" };
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const fromMin = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

const DEMO_CLIENTS = [
  { id: "c1", firstName: "Jana", lastName: "Nováková", phone: "602111222", email: "jana@email.cz" },
  { id: "c2", firstName: "Petr", lastName: "Dvořák", phone: "603222333", email: "petr@email.cz" },
  { id: "c3", firstName: "Marie", lastName: "Svobodová", phone: "604333444", email: "marie@email.cz" },
  { id: "c4", firstName: "Tomáš", lastName: "Černý", phone: "605444555", email: "tomas@email.cz" },
];
const DEMO_PETS = [
  { id: "p1", clientId: "c1", name: "Rex", species: "Pes", breed: "Německý ovčák" },
  { id: "p2", clientId: "c1", name: "Mícka", species: "Kočka", breed: "Britská" },
  { id: "p3", clientId: "c2", name: "Bety", species: "Pes", breed: "Labrador" },
  { id: "p4", clientId: "c3", name: "Mourek", species: "Kočka", breed: "Domácí" },
  { id: "p5", clientId: "c4", name: "Ťapka", species: "Pes", breed: "Jezevčík" },
];
const DEMO_APTS = [
  { id: "a1", clientId: "c1", petId: "p1", procedureId: "checkup", doctorId: "d1", date: TODAY, time: "08:00", duration: 20, status: "confirmed", note: "Pravidelná kontrola", createdBy: "reception" },
  { id: "a2", clientId: "c2", petId: "p3", procedureId: "vaccination", doctorId: "d2", date: TODAY, time: "08:30", duration: 15, status: "confirmed", note: "Přeočkování vzteklina", createdBy: "reception" },
  { id: "a3", clientId: "c3", petId: "p4", procedureId: "blood_work", doctorId: "d2", date: TODAY, time: "09:00", duration: 15, status: "arrived", note: "Kontrolní KO, ledviny", createdBy: "reception" },
  { id: "a4", clientId: "c4", petId: "p5", procedureId: "dental", doctorId: "d1", date: TODAY, time: "10:00", duration: 60, status: "confirmed", note: "Zubní kámen, možná extrakce", createdBy: "reception" },
  { id: "a5", clientId: "c1", petId: "p2", procedureId: "castration", doctorId: "d3", date: TODAY, time: "11:00", duration: 60, status: "confirmed", note: "Kastrace kočky, nalačno", createdBy: "public" },
  { id: "a6", clientId: "c2", petId: "p3", procedureId: "dermatology", doctorId: "d2", date: TOMORROW, time: "08:00", duration: 30, status: "pending", note: "Svědění, vypadávání srsti", createdBy: "public" },
  { id: "a7", clientId: "c3", petId: "p4", procedureId: "ultrasound", doctorId: "d3", date: TOMORROW, time: "09:00", duration: 30, status: "pending", note: "Kontrola ledvin po léčbě", createdBy: "public" },
  { id: "a8", clientId: "c1", petId: "p1", procedureId: "emergency", doctorId: "d1", date: TODAY, time: "10:15", duration: 20, status: "in_progress", note: "Kulhání, podezření na úraz", createdBy: "reception", arrivalTime: "10:10" },
];

// ─── FREE SLOT FINDER ───
function findFreeSlots(config, appointments, procedureId, dateFrom, dateTo, doctorId) {
  const proc = PROCEDURES.find(p => p.id === procedureId);
  if (!proc) return [];
  const duration = proc.duration;
  const slots = [];
  const start = new Date(dateFrom);
  const end = new Date(dateTo);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const dayName = DAY_NAMES[d.getDay()];
    const hours = config.openingHours[dayName];
    if (!hours) continue;

    const openMin = toMin(hours.open);
    const closeMin = toMin(hours.close);
    const dayApts = appointments.filter(a => a.date === dateStr && a.status !== "rejected" && a.status !== "no_show" && a.status !== "completed");

    const eligibleDoctors = doctorId ? config.doctors.filter(doc => doc.id === doctorId) :
      config.doctors.filter(doc => doc.specializations.includes(proc.category));

    for (const doc of eligibleDoctors) {
      const docApts = dayApts.filter(a => a.doctorId === doc.id);
      const relevantBlocks = config.procedureBlocks.filter(b =>
        b.categories.includes(proc.category) && b.doctorIds.includes(doc.id)
      );

      for (let min = openMin; min + duration <= closeMin; min += config.slotInterval) {
        const timeStr = fromMin(min);
        const aptEnd = min + duration;
        const inBlock = relevantBlocks.length === 0 || relevantBlocks.some(b => min >= toMin(b.timeFrom) && aptEnd <= toMin(b.timeTo));
        if (!inBlock) continue;
        const conflict = docApts.some(a => {
          const aStart = toMin(a.time);
          const aEnd = aStart + a.duration;
          return min < aEnd && aptEnd > aStart;
        });
        if (!conflict) {
          slots.push({ date: dateStr, time: timeStr, doctorId: doc.id, doctorName: doc.name, doctorColor: doc.color, duration });
        }
      }
    }
  }
  return slots.slice(0, 50);
}

// ─── SVG ICONS ───
const Icon = ({ name, size = 16 }) => {
  const s = { width: size, height: size, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, style: { flexShrink: 0 } };
  const icons = {
    plus: <svg {...s}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    x: <svg {...s}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    check: <svg {...s}><polyline points="20 6 9 17 4 12"/></svg>,
    clock: <svg {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    calendar: <svg {...s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    user: <svg {...s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    phone: <svg {...s}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    search: <svg {...s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    chevronRight: <svg {...s}><polyline points="9 18 15 12 9 6"/></svg>,
    send: <svg {...s}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    move: <svg {...s}><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>,
    edit: <svg {...s}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    bar: <svg {...s}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    download: <svg {...s}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    upload: <svg {...s}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    settings: <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    database: <svg {...s}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
    alert: <svg {...s}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    userX: <svg {...s}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>,
    sms: <svg {...s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  };
  return icons[name] || null;
};

// ─── SHARED COMPONENTS ───
function StatusBadge({ status }) {
  const s = STATUSES[status]; if (!s) return null;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600, fontFamily: MONO, color: s.color, background: s.bg, border: `1.5px solid ${s.color}20`, borderRadius: 20, whiteSpace: "nowrap" }}><span style={{ fontSize: 10 }}>{s.icon}</span>{s.label}</span>;
}
function ProcBadge({ proc }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600, fontFamily: FONT, color: proc.color, background: proc.color + "15", border: `1.5px solid ${proc.color}30`, borderRadius: 20, whiteSpace: "nowrap" }}>{proc.name}<span style={{ fontFamily: MONO, fontSize: 10, opacity: 0.7 }}>{proc.duration}'</span></span>;
}
function Btn({ children, variant = "primary", small, icon, disabled, ...props }) {
  const styles = { primary: { bg: theme.accent, c: "white", b: "none" }, danger: { bg: theme.danger, c: "white", b: "none" }, success: { bg: theme.success, c: "white", b: "none" }, ghost: { bg: "transparent", c: theme.textSecondary, b: `1.5px solid ${theme.border}` }, outline: { bg: "white", c: theme.accent, b: `1.5px solid ${theme.accent}` } };
  const st = styles[variant];
  return <button disabled={disabled} {...props} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: small ? "5px 12px" : "8px 18px", background: disabled ? theme.border : st.bg, color: disabled ? theme.textMuted : st.c, border: st.b, borderRadius: theme.radiusSm, fontSize: small ? 12 : 14, fontWeight: 600, fontFamily: FONT, cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s", ...props.style }}>{icon && <Icon name={icon} size={small ? 14 : 16} />}{children}</button>;
}
function Input({ label, required, icon, textarea, ...props }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}{required && <span style={{ color: theme.danger, marginLeft: 2 }}>*</span>}</label>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 10, top: textarea ? 12 : "50%", transform: textarea ? "none" : "translateY(-50%)", color: theme.textMuted, display: "flex" }}><Icon name={icon} /></span>}
        <Tag {...props} style={{ width: "100%", boxSizing: "border-box", padding: icon ? "8px 12px 8px 34px" : "8px 12px", border: `1.5px solid ${theme.border}`, borderRadius: theme.radiusSm, fontSize: 14, fontFamily: FONT, color: theme.text, outline: "none", background: "white", resize: textarea ? "vertical" : undefined, minHeight: textarea ? 80 : undefined, ...props.style }}
          onFocus={e => e.target.style.borderColor = theme.accent} onBlur={e => e.target.style.borderColor = theme.border} />
      </div>
    </div>
  );
}
function Select({ label, required, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}{required && <span style={{ color: theme.danger, marginLeft: 2 }}>*</span>}</label>}
      <select {...props} style={{ padding: "8px 12px", border: `1.5px solid ${theme.border}`, borderRadius: theme.radiusSm, fontSize: 14, fontFamily: FONT, background: "white", outline: "none", ...props.style }}>{children}</select>
    </div>
  );
}
function Card({ children, title, action, accent, noPad, style: sx }) {
  return (
    <div style={{ background: "white", borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, borderTop: accent ? `3px solid ${accent}` : undefined, boxShadow: theme.shadow, overflow: "hidden", ...sx }}>
      {title && <div style={{ padding: "14px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 14, fontWeight: 700 }}>{title}</span>{action}</div>}
      {!noPad ? <div style={{ padding: "16px 20px" }}>{children}</div> : children}
    </div>
  );
}
function Modal({ title, subtitle, onClose, children, footer, wide }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: theme.radiusLg, width: wide ? "min(800px, 95vw)" : "min(520px, 95vw)", maxHeight: "90vh", overflow: "auto", boxShadow: theme.shadowLg, animation: "slideUp 0.25s ease-out" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${theme.border}` }}>
          <div><h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h2>{subtitle && <p style={{ margin: "2px 0 0", fontSize: 13, color: theme.textSecondary }}>{subtitle}</p>}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textMuted, padding: 4, display: "flex" }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding: "20px 24px" }}>{children}</div>
        {footer && <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "16px 24px", borderTop: `1px solid ${theme.border}` }}>{footer}</div>}
      </div>
    </div>
  );
}
function StatBox({ label, value, color, icon }) {
  return <div style={{ flex: 1, minWidth: 130, padding: "14px 18px", background: "white", borderRadius: theme.radius, border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div><div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: MONO, marginTop: 2 }}>{value}</div></div>{icon && <span style={{ fontSize: 28, opacity: 0.3 }}>{icon}</span>}</div></div>;
}

// ─── APT ROW ───
function AptRow({ apt, clients, pets, config, onAction, onEdit, onSms, role }) {
  const client = clients.find(c => c.id === apt.clientId);
  const pet = pets.find(p => p.id === apt.petId);
  const proc = PROCEDURES.find(p => p.id === apt.procedureId);
  const doc = config.doctors.find(d => d.id === apt.doctorId);
  const endTime = fromMin(toMin(apt.time) + apt.duration);
  const canEdit = role === "reception" || role === "manager";
  const canNoShow = role === "reception" && ["confirmed", "arrived"].includes(apt.status);
  const canSms = (role === "reception" || role === "manager") && client?.phone;
  const IconBtn = ({ icon, title, color, onClick }) => (
    <button title={title} onClick={onClick} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${color}30`, borderRadius: 6, background: color + "08", color, cursor: "pointer", transition: "all 0.15s", flexShrink: 0 }}
      onMouseEnter={e => { e.currentTarget.style.background = color + "20"; }} onMouseLeave={e => { e.currentTarget.style.background = color + "08"; }}>
      <Icon name={icon} size={14} />
    </button>
  );
  return (
    <div style={{ padding: "12px 16px", borderRadius: theme.radius, border: `1.5px solid ${proc?.color || theme.border}20`, borderLeft: `4px solid ${proc?.color || theme.border}`, background: "white", boxShadow: theme.shadow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700 }}>{apt.time}–{endTime}</span>
            {proc && <ProcBadge proc={proc} />}
            <StatusBadge status={apt.status} />
            {doc && <span style={{ fontSize: 11, fontWeight: 600, color: doc.color, background: doc.color + "15", padding: "2px 8px", borderRadius: 12 }}>{doc.name.split(" ").pop()}</span>}
            {apt.date !== TODAY && <span style={{ fontSize: 11, fontFamily: MONO, color: theme.textMuted, background: theme.bg, padding: "2px 6px", borderRadius: 4 }}>{apt.date}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{client?.lastName} {client?.firstName}</span>
            <span style={{ color: theme.textSecondary }}>—</span>
            <span style={{ fontSize: 14, color: theme.accent, fontWeight: 600 }}>🐾 {pet?.name}</span>
            <span style={{ fontSize: 12, color: theme.textMuted }}>({pet?.species})</span>
          </div>
          {apt.note && <div style={{ fontSize: 12, color: theme.textSecondary }}>📋 {apt.note}</div>}
        </div>
        {role !== "public" && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap", alignItems: "center" }}>
            {role === "reception" && apt.status === "pending" && <><Btn small variant="success" icon="check" onClick={() => onAction(apt.id, "confirm")}>Potvrdit</Btn><Btn small variant="danger" icon="x" onClick={() => onAction(apt.id, "reject")}>Zamítnout</Btn></>}
            {role === "reception" && apt.status === "confirmed" && <Btn small variant="outline" icon="check" onClick={() => onAction(apt.id, "arrive")}>Přišel</Btn>}
            {(role === "reception" || role === "doctor") && apt.status === "arrived" && <Btn small variant="primary" icon="chevronRight" onClick={() => onAction(apt.id, "start")}>Převzít</Btn>}
            {(role === "reception" || role === "doctor") && apt.status === "in_progress" && <Btn small variant="success" icon="check" onClick={() => onAction(apt.id, "complete")}>Hotovo</Btn>}
            {role === "reception" && ["confirmed", "pending"].includes(apt.status) && <Btn small variant="ghost" icon="move" onClick={() => onAction(apt.id, "reschedule")}>Přesunout</Btn>}
            {canNoShow && <IconBtn icon="userX" title="Nedostavil se" color={theme.danger} onClick={() => onAction(apt.id, "no_show")} />}
            {canEdit && !["completed", "rejected", "no_show"].includes(apt.status) && <IconBtn icon="edit" title="Upravit" color={theme.accent} onClick={() => onEdit(apt)} />}
            {canSms && <IconBtn icon="sms" title="Poslat SMS" color="#059669" onClick={() => onSms(apt, client)} />}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FREE SLOT FINDER MODAL ───
function FreeSlotModal({ config, appointments, onClose, onSelect }) {
  const [procId, setProcId] = useState("");
  const [docId, setDocId] = useState("");
  const [dateFrom, setDateFrom] = useState(TODAY);
  const [dateTo, setDateTo] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);
  const slots = useMemo(() => procId ? findFreeSlots(config, appointments, procId, dateFrom, dateTo, docId || null) : [], [procId, docId, dateFrom, dateTo, config, appointments]);
  const grouped = useMemo(() => {
    const m = {};
    slots.forEach(s => { if (!m[s.date]) m[s.date] = []; m[s.date].push(s); });
    return Object.entries(m);
  }, [slots]);

  return (
    <Modal title="🔍 Najít volný termín" subtitle="Vyhledání dostupných časů podle procedury, lékaře a období" onClose={onClose} wide>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: 180 }}>
            <Select label="Procedura" required value={procId} onChange={e => setProcId(e.target.value)}>
              <option value="">— vyberte proceduru —</option>
              {PROCEDURES.filter(p => p.id !== "emergency").map(p => <option key={p.id} value={p.id}>{p.name} ({p.duration}')</option>)}
            </Select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <Select label="Lékař (nepovinné)" value={docId} onChange={e => setDocId(e.target.value)}>
              <option value="">Kdokoliv</option>
              {config.doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
          <div style={{ flex: 1, minWidth: 130 }}><Input label="Od" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></div>
          <div style={{ flex: 1, minWidth: 130 }}><Input label="Do" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></div>
        </div>

        {procId && (
          <div style={{ maxHeight: 400, overflow: "auto", border: `1px solid ${theme.border}`, borderRadius: theme.radius }}>
            {grouped.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: theme.textMuted }}>Žádné volné termíny v zadaném období</div>
            ) : grouped.map(([date, daySlots]) => (
              <div key={date}>
                <div style={{ padding: "8px 16px", background: theme.bg, fontWeight: 700, fontSize: 13, fontFamily: FONT, borderBottom: `1px solid ${theme.border}`, position: "sticky", top: 0, zIndex: 1 }}>
                  📅 {new Date(date + "T00:00").toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" })}
                  <span style={{ fontWeight: 400, color: theme.textMuted, marginLeft: 8 }}>{daySlots.length} volných</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 16px" }}>
                  {daySlots.map((s, i) => (
                    <button key={i} onClick={() => onSelect(s)}
                      style={{ padding: "6px 14px", border: `1.5px solid ${s.doctorColor}30`, borderRadius: theme.radiusSm, background: s.doctorColor + "08", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s", fontSize: 13, fontFamily: FONT }}
                      onMouseEnter={e => { e.currentTarget.style.background = s.doctorColor + "20"; e.currentTarget.style.borderColor = s.doctorColor; }}
                      onMouseLeave={e => { e.currentTarget.style.background = s.doctorColor + "08"; e.currentTarget.style.borderColor = s.doctorColor + "30"; }}>
                      <span style={{ fontFamily: MONO, fontWeight: 700, color: theme.text }}>{s.time}</span>
                      <span style={{ fontSize: 11, color: s.doctorColor, fontWeight: 600 }}>{s.doctorName.split(" ").pop()}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {!procId && <div style={{ padding: 30, textAlign: "center", color: theme.textMuted, background: theme.bg, borderRadius: theme.radius }}>⬆️ Vyberte proceduru pro vyhledání volných termínů</div>}
      </div>
    </Modal>
  );
}

// ─── EDIT APPOINTMENT MODAL ───
function EditAptModal({ apt, config, clients, pets, onSave, onClose }) {
  const [form, setForm] = useState({ ...apt });
  const selPets = pets.filter(p => p.clientId === form.clientId);
  return (
    <Modal title="✏️ Upravit objednávku" subtitle={`ID: ${apt.id}`} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>Zrušit</Btn><Btn variant="primary" icon="check" onClick={() => { onSave(form); onClose(); }}>Uložit změny</Btn></>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Select label="Klient" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value, petId: "" })}>
          {clients.map(c => <option key={c.id} value={c.id}>{c.lastName} {c.firstName}</option>)}
        </Select>
        <Select label="Zvíře" value={form.petId} onChange={e => setForm({ ...form, petId: e.target.value })}>
          <option value="">— vyberte —</option>
          {selPets.map(p => <option key={p.id} value={p.id}>🐾 {p.name} ({p.species})</option>)}
        </Select>
        <Select label="Procedura" value={form.procedureId} onChange={e => { const proc = PROCEDURES.find(p => p.id === e.target.value); setForm({ ...form, procedureId: e.target.value, duration: proc?.duration || form.duration }); }}>
          {PROCEDURES.map(p => <option key={p.id} value={p.id}>{p.name} ({p.duration}')</option>)}
        </Select>
        <Select label="Lékař" value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
          {config.doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}><Input label="Datum" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          <div style={{ flex: 1 }}><Input label="Čas" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} step="900" /></div>
          <div style={{ flex: 1 }}><Input label="Délka (min)" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 15 })} style={{ width: "100%" }} /></div>
        </div>
        <Select label="Stav" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </Select>
        <Input label="Poznámka" textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
      </div>
    </Modal>
  );
}

// ─── SMS MODAL ───
const SMS_TEMPLATES = [
  { id: "confirm", label: "Potvrzení termínu", text: (apt, pet, proc) => `Potvrzujeme Vasi objednavku ${proc?.name || ""} pro ${pet?.name || ""} dne ${apt.date} v ${apt.time}. Veterinarni klinika VetBook.` },
  { id: "reminder", label: "Připomínka termínu", text: (apt, pet, proc) => `Pripominame termin ${proc?.name || ""} pro ${pet?.name || ""} zitra ${apt.date} v ${apt.time}. Veterinarni klinika VetBook.` },
  { id: "cancel", label: "Zrušení termínu", text: (apt, pet, proc) => `Vas termin ${apt.date} v ${apt.time} pro ${pet?.name || ""} byl zrusen. Kontaktujte nas pro novy termin. VetBook.` },
  { id: "ready", label: "Výsledky připraveny", text: (apt, pet) => `Vysledky vysetreni pro ${pet?.name || ""} jsou pripraveny k vyzvednuti. Veterinarni klinika VetBook.` },
  { id: "custom", label: "Vlastní zpráva", text: () => "" },
];

function SmsModal({ apt, client, pets, config, onClose }) {
  const pet = pets.find(p => p.id === apt.petId);
  const proc = PROCEDURES.find(p => p.id === apt.procedureId);
  const [templateId, setTemplateId] = useState("confirm");
  const tmpl = SMS_TEMPLATES.find(t => t.id === templateId);
  const [text, setText] = useState(tmpl.text(apt, pet, proc));
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleTemplateChange = (id) => {
    setTemplateId(id);
    const t = SMS_TEMPLATES.find(tt => tt.id === id);
    setText(t.text(apt, pet, proc));
  };

  const handleSend = async () => {
    const apiKey = config.smsApiKey;
    if (!apiKey) { alert("Nastavte SMS Manager API klíč v Nastavení → SMS upozornění"); return; }
    setSending(true);
    try {
      // SmsManager.cz JSON API v2
      const res = await fetch("https://api.smsmngr.com/v2/message", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ body: text, to: [{ phone_number: "+420" + client.phone.replace(/^(\+420|420)/, "") }] }),
      });
      const data = await res.json();
      if (data.accepted && data.accepted.length > 0) {
        setResult({ ok: true, id: data.accepted[0].message_id });
      } else {
        setResult({ ok: false, error: data.rejected?.[0]?.reason || "Neznámá chyba" });
      }
    } catch (err) {
      setResult({ ok: false, error: err.message });
    }
    setSending(false);
  };

  return (
    <Modal title="📱 Odeslat SMS" subtitle={`${client.firstName} ${client.lastName} — ${client.phone}`} onClose={onClose}
      footer={!result ? <><Btn variant="ghost" onClick={onClose}>Zrušit</Btn><Btn variant="success" icon="send" disabled={!text || sending} onClick={handleSend}>{sending ? "Odesílám..." : "Odeslat SMS"}</Btn></> : <Btn onClick={onClose}>Zavřít</Btn>}>
      {result ? (
        <div style={{ padding: 20, textAlign: "center" }}>
          {result.ok ? (
            <><div style={{ fontSize: 40, marginBottom: 8 }}>✅</div><div style={{ fontWeight: 700, color: theme.success }}>SMS odeslána!</div><div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4, fontFamily: MONO }}>ID: {result.id}</div></>
          ) : (
            <><div style={{ fontSize: 40, marginBottom: 8 }}>❌</div><div style={{ fontWeight: 700, color: theme.danger }}>Chyba při odesílání</div><div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{result.error}</div></>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>Šablona</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SMS_TEMPLATES.map(t => (
                <button key={t.id} onClick={() => handleTemplateChange(t.id)} style={{ padding: "5px 12px", borderRadius: 16, border: `1.5px solid ${templateId === t.id ? theme.accent : theme.border}`, background: templateId === t.id ? theme.accentLight : "white", color: templateId === t.id ? theme.accent : theme.textSecondary, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t.label}</button>
              ))}
            </div>
          </div>
          <Input label={`Zpráva (${text.length}/160 znaků)`} textarea value={text} onChange={e => setText(e.target.value)} style={{ minHeight: 100 }} />
          <div style={{ padding: 10, background: theme.bg, borderRadius: theme.radiusSm, fontSize: 12, color: theme.textMuted }}>
            📱 Příjemce: <strong>+420{client.phone.replace(/^(\+420|420)/, "")}</strong> — Brána: <strong>SmsManager.cz</strong> (JSON API v2)
            {text.length > 160 && <span style={{ color: theme.warning, marginLeft: 8 }}>⚠️ Zpráva přesahuje 160 znaků — bude rozdělena</span>}
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── PASSWORD GENERATOR ───
const generatePassword = () => {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pw = "";
  for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
};

// ─── SETTINGS VIEW ───
function SettingsView({ config, setConfig }) {
  const [tab, setTab] = useState("hours");
  const [winvetTab, setWinvetTab] = useState("info");
  const tabs = [
    { id: "hours", label: "⏰ Otvírací doba" },
    { id: "doctors", label: "👨‍⚕️ Lékaři" },
    { id: "blocks", label: "📋 Bloky procedur" },
    { id: "acute", label: "🚨 Akutní sloty" },
    { id: "sms", label: "📱 SMS upozornění" },
    { id: "winvet", label: "🔗 WinVet integrace" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 4, borderBottom: `2px solid ${theme.border}`, overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 16px", border: "none", borderBottom: `3px solid ${tab === t.id ? theme.purple : "transparent"}`, background: "none", color: tab === t.id ? theme.purple : theme.textSecondary, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{t.label}</button>
        ))}
      </div>

      {tab === "hours" && (
        <Card title="⏰ Otvírací doba ordinace">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(DAY_LABELS_CZ).map(([day, label]) => {
              const h = config.openingHours[day];
              return (
                <div key={day} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 30, fontWeight: 700, fontSize: 14, fontFamily: MONO }}>{label}</span>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input type="checkbox" checked={!!h} onChange={e => setConfig({ ...config, openingHours: { ...config.openingHours, [day]: e.target.checked ? { open: "08:00", close: "17:00" } : null } })} />
                    <span style={{ fontSize: 13, color: h ? theme.text : theme.textMuted }}>{h ? "Otevřeno" : "Zavřeno"}</span>
                  </label>
                  {h && <>
                    <input type="time" value={h.open} onChange={e => setConfig({ ...config, openingHours: { ...config.openingHours, [day]: { ...h, open: e.target.value } } })}
                      style={{ padding: "4px 8px", border: `1px solid ${theme.border}`, borderRadius: 4, fontFamily: MONO, fontSize: 13 }} />
                    <span style={{ color: theme.textMuted }}>–</span>
                    <input type="time" value={h.close} onChange={e => setConfig({ ...config, openingHours: { ...config.openingHours, [day]: { ...h, close: e.target.value } } })}
                      style={{ padding: "4px 8px", border: `1px solid ${theme.border}`, borderRadius: 4, fontFamily: MONO, fontSize: 13 }} />
                  </>}
                </div>
              );
            })}
            <div style={{ marginTop: 8 }}><Input label="Interval slotů (min)" type="number" value={config.slotInterval} onChange={e => setConfig({ ...config, slotInterval: parseInt(e.target.value) || 15 })} style={{ width: 100 }} /></div>
          </div>
        </Card>
      )}

      {tab === "doctors" && (
        <Card title="👨‍⚕️ Lékaři a specializace">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {config.doctors.map((doc, idx) => (
              <div key={doc.id} style={{ padding: 14, border: `1.5px solid ${doc.color}30`, borderLeft: `4px solid ${doc.color}`, borderRadius: theme.radius, background: doc.color + "05" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, color: doc.color }}>{doc.name}</span>
                  <input type="color" value={doc.color} onChange={e => { const d = [...config.doctors]; d[idx] = { ...d[idx], color: e.target.value }; setConfig({ ...config, doctors: d }); }} style={{ width: 30, height: 24, border: "none", cursor: "pointer" }} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["prevence", "diagnostika", "chirurgie", "specialni", "akutni", "ostatni"].map(cat => {
                    const active = doc.specializations.includes(cat);
                    return <button key={cat} onClick={() => { const d = [...config.doctors]; d[idx] = { ...d[idx], specializations: active ? d[idx].specializations.filter(s => s !== cat) : [...d[idx].specializations, cat] }; setConfig({ ...config, doctors: d }); }}
                      style={{ padding: "4px 10px", borderRadius: 12, border: `1.5px solid ${active ? doc.color : theme.border}`, background: active ? doc.color + "15" : "white", color: active ? doc.color : theme.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{cat}</button>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "blocks" && (
        <Card title="📋 Bloky procedur — rozdělení dne">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {config.procedureBlocks.map((block, idx) => (
              <div key={block.id} style={{ padding: 14, border: `1px solid ${theme.border}`, borderRadius: theme.radius, background: theme.bg }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{block.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 13, color: theme.accent, fontWeight: 600 }}>{block.timeFrom}–{block.timeTo}</span>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: theme.textMuted, marginRight: 4 }}>Kategorie:</span>
                  {block.categories.map(c => <span key={c} style={{ padding: "2px 8px", borderRadius: 10, background: theme.accentLight, color: theme.accent, fontSize: 11, fontWeight: 600 }}>{c}</span>)}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: theme.textMuted, marginRight: 4 }}>Lékaři:</span>
                  {block.doctorIds.map(dId => { const d = config.doctors.find(x => x.id === dId); return d ? <span key={dId} style={{ padding: "2px 8px", borderRadius: 10, background: d.color + "15", color: d.color, fontSize: 11, fontWeight: 600 }}>{d.name.split(" ").pop()}</span> : null; })}
                </div>
              </div>
            ))}
            <div style={{ padding: 12, background: theme.warningLight, borderRadius: theme.radiusSm, fontSize: 12, color: theme.warning }}>💡 V produkci bude možné bloky přidávat, editovat a mazat. Toto je demo ukázka konfigurace.</div>
          </div>
        </Card>
      )}

      {tab === "acute" && (
        <Card title="🚨 Akutní sloty — buffer pro urgentní případy" accent={theme.danger}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: 14, background: theme.dangerLight, borderRadius: theme.radius, fontSize: 13, color: theme.danger }}>
              ⚠️ Systém automaticky rezervuje prázdné sloty pro akutní případy. Tyto sloty se uvolní do běžného objednávání, pokud nejsou obsazeny akutem 60 min předem.
            </div>
            <Input label="Počet akutních bufferů za den" type="number" value={config.acuteBufferSlots} onChange={e => setConfig({ ...config, acuteBufferSlots: parseInt(e.target.value) || 2 })} style={{ width: 100 }} />
            <Input label="Rozestup bufferů (min)" type="number" value={config.acuteBufferSpacing} onChange={e => setConfig({ ...config, acuteBufferSpacing: parseInt(e.target.value) || 90 })} style={{ width: 100 }} />
            <div style={{ fontSize: 13, color: theme.textSecondary }}>
              Aktuální nastavení: <strong>{config.acuteBufferSlots} slotů</strong> po <strong>{config.acuteBufferSpacing} min</strong> — akutní se řadí podle <strong>času příchodu</strong>, ne podle objednání.
            </div>
          </div>
        </Card>
      )}

      {tab === "sms" && (
        <Card title="📱 SMS upozornění — SmsManager.cz" accent="#059669">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: 14, background: theme.successLight, borderRadius: theme.radius, fontSize: 13, color: theme.success }}>
              SMS brána přes <strong>SmsManager.cz</strong> (JSON API v2). Umožňuje automatické i manuální odesílání SMS klientům — potvrzení termínu, připomínky, zrušení.
            </div>
            <Input label="API klíč (SmsManager.cz)" icon="edit" value={config.smsApiKey || ""} onChange={e => setConfig({ ...config, smsApiKey: e.target.value })} placeholder="Váš API klíč z SmsManager.cz" />
            <Input label="Odesílatel (nepovinné)" value={config.smsSender || ""} onChange={e => setConfig({ ...config, smsSender: e.target.value })} placeholder="Název ordinace nebo tel. číslo" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>Automatické SMS</label>
              {[
                { key: "smsOnConfirm", label: "Při potvrzení termínu recepcí" },
                { key: "smsOnReminder", label: "Připomínka den před termínem" },
                { key: "smsOnCancel", label: "Při zrušení/zamítnutí termínu" },
              ].map(opt => (
                <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={!!config[opt.key]} onChange={e => setConfig({ ...config, [opt.key]: e.target.checked })} />
                  {opt.label}
                </label>
              ))}
            </div>
            <div style={{ padding: 10, background: theme.bg, borderRadius: theme.radiusSm, fontSize: 12, color: theme.textMuted }}>
              💡 Ruční odeslání SMS: klikněte na ikonu 💬 u libovolné objednávky. Šablony zpráv si můžete upravit.<br/>
              📡 Endpoint: <code style={{ fontFamily: MONO }}>POST https://api.smsmngr.com/v2/message</code> — Header: <code style={{ fontFamily: MONO }}>x-api-key</code>
            </div>
            <Btn variant="outline" icon="send" onClick={() => {
              if (!config.smsApiKey) { alert("Vyplňte API klíč"); return; }
              alert("Testovací SMS odeslána na číslo z nastavení (v produkci).");
            }}>Odeslat testovací SMS</Btn>
          </div>
        </Card>
      )}

      {tab === "winvet" && (
        <Card title="🔗 WinVet integrace" accent="#e67e22">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: 14, background: "#fff8f0", borderRadius: theme.radius, border: "1.5px solid #f0c078" }}>
              <div style={{ fontWeight: 700, color: "#c0710a", marginBottom: 6 }}>O programu WinVet</div>
              <div style={{ fontSize: 13, color: "#8a5d1f", lineHeight: 1.6 }}>
                WinVet je desktopová aplikace (Windows) s <strong>Firebird databází</strong>. Nemá veřejné REST API. Integrace je možná těmito způsoby:
              </div>
            </div>

            <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${theme.border}` }}>
              {[{id:"info",l:"ℹ️ Možnosti"},{id:"csv",l:"📄 CSV import"},{id:"db",l:"🗄️ Firebird DB"},{id:"gcal",l:"📅 Google Cal"}].map(t =>
                <button key={t.id} onClick={() => setWinvetTab(t.id)} style={{ padding: "8px 14px", border: "none", borderBottom: `2px solid ${winvetTab === t.id ? "#e67e22" : "transparent"}`, background: "none", color: winvetTab === t.id ? "#e67e22" : theme.textMuted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{t.l}</button>
              )}
            </div>

            {winvetTab === "info" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { icon: "📄", title: "CSV/TXT export → import", desc: "WinVet umožňuje export majitelů a pacientů do textových souborů. VetBook je naimportuje.", effort: "Nízká", status: "✅ Implementováno" },
                  { icon: "🗄️", title: "Přímý přístup k Firebird DB", desc: "Čtení dat přímo z WinVet databáze (fbclient.dll). Vyžaduje síťový přístup k DB serveru.", effort: "Střední", status: "🔧 Vyžaduje konfiguraci" },
                  { icon: "📅", title: "Google Calendar sync", desc: "WinVet již umí synchronizovat s Google Kalendářem. VetBook může číst stejný kalendář.", effort: "Nízká", status: "🔧 Vyžaduje Google API klíč" },
                  { icon: "📋", title: "Modul Fronta", desc: "WinVet má vlastní Frontu pro recepci. VetBook ji nahrazuje s rozšířeným workflow.", effort: "—", status: "↔️ Nahrazeno VetBookem" },
                ].map((item, i) => (
                  <div key={i} style={{ padding: 12, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 24 }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{item.desc}</div>
                      <div style={{ fontSize: 11, marginTop: 4 }}>
                        <span style={{ color: theme.textMuted }}>Náročnost: {item.effort}</span>
                        <span style={{ marginLeft: 12 }}>{item.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {winvetTab === "csv" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.6 }}>
                  <strong>Postup:</strong> V programu WinVet → Přehledy → Přehled majitelů a zvířat → Exportovat do souboru (CSV/TXT). Nahrajte soubor níže.
                </div>
                <div style={{ padding: 30, border: `2px dashed ${theme.border}`, borderRadius: theme.radius, textAlign: "center", cursor: "pointer", background: theme.bg }}
                  onClick={() => alert("V produkci se zde otevře dialog pro nahrání CSV souboru z WinVet exportu. Data se naparsují a naimportují do VetBooku.")}>
                  <Icon name="upload" size={32} />
                  <div style={{ fontWeight: 700, marginTop: 8 }}>Klikněte pro nahrání CSV z WinVet</div>
                  <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>Podporované formáty: CSV, TXT (oddělovač ; nebo TAB)</div>
                </div>
                <div style={{ fontSize: 12, color: theme.textSecondary }}>
                  Očekávaná struktura: <code style={{ fontFamily: MONO, background: theme.bg, padding: "2px 6px", borderRadius: 3 }}>Příjmení;Jméno;Telefon;Email;Zvíře;Druh;Plemeno;Čip</code>
                </div>
              </div>
            )}

            {winvetTab === "db" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ padding: 12, background: theme.warningLight, borderRadius: theme.radiusSm, fontSize: 12, color: theme.warning }}>
                  ⚠️ Přímý přístup k DB vyžaduje Firebird klienta a síťovou viditelnost serveru WinVet. Toto je pro pokročilou konfiguraci.
                </div>
                <Input label="Host (IP adresa WinVet serveru)" placeholder="192.168.1.100" />
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}><Input label="Port" placeholder="3050" /></div>
                  <div style={{ flex: 2 }}><Input label="Cesta k databázi" placeholder="C:\WinVet\Data\WINVET.FDB" /></div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}><Input label="Uživatel" placeholder="SYSDBA" /></div>
                  <div style={{ flex: 1 }}><Input label="Heslo" type="password" placeholder="•••••" /></div>
                </div>
                <Btn variant="outline" icon="database" onClick={() => alert("V produkci se provede test připojení k Firebird DB a synchronizace klientů/pacientů.")}>Otestovat připojení</Btn>
              </div>
            )}

            {winvetTab === "gcal" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.6 }}>
                  WinVet podporuje synchronizaci s <strong>Google Kalendářem</strong>. VetBook může číst stejný kalendář a zobrazovat termíny z WinVet vedle online objednávek.
                </div>
                <Input label="Google Calendar ID" placeholder="xxxxx@group.calendar.google.com" />
                <Input label="API klíč" placeholder="AIza..." />
                <Btn variant="outline" icon="calendar" onClick={() => alert("V produkci se napojí na Google Calendar API a provede sync.")}>Synchronizovat s Google Calendar</Btn>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── PUBLIC VIEW ───
function PublicView({ onSubmitRequest, clients, pets, config, appointments }) {
  const [step, setStep] = useState("login");
  const [client, setClient] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [form, setForm] = useState({ petId: "", procedureId: "", date: TOMORROW, time: "09:00", note: "", doctorId: "" });
  const [showSlotFinder, setShowSlotFinder] = useState(false);
  const myPets = pets.filter(p => p.clientId === client?.id);

  const handleLogin = () => { const f = clients.find(c => c.email === loginEmail); if (f) { setClient(f); setStep("form"); } else alert("Účet nenalezen."); };
  const handleSubmit = () => {
    const proc = PROCEDURES.find(p => p.id === form.procedureId);
    onSubmitRequest({ id: generateId(), clientId: client.id, petId: form.petId, procedureId: form.procedureId, doctorId: form.doctorId || config.doctors[0]?.id, date: form.date, time: form.time, duration: proc?.duration || 20, status: "pending", note: form.note, createdBy: "public" });
    setStep("done");
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🐾</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{config.clinicName}</h1>
        <p style={{ color: theme.textSecondary, fontSize: 15 }}>Online objednání na vyšetření</p>
      </div>

      {step === "login" && (
        <Card title="Přihlášení" accent={theme.accent}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="E-mail" required icon="user" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="vas@email.cz" />
            <Btn onClick={handleLogin} style={{ width: "100%" }}>Přihlásit se</Btn>
            <div style={{ textAlign: "center", fontSize: 13, color: theme.textMuted }}>Nemáte účet? <span onClick={() => setStep("register")} style={{ color: theme.accent, cursor: "pointer", fontWeight: 600 }}>Zaregistrujte se</span></div>
            <div style={{ padding: 12, background: theme.warningLight, borderRadius: theme.radiusSm, fontSize: 12, color: theme.warning }}>💡 Demo: <strong>jana@email.cz</strong>, <strong>petr@email.cz</strong>, <strong>marie@email.cz</strong>, <strong>tomas@email.cz</strong></div>
          </div>
        </Card>
      )}

      {step === "register" && (
        <Card title="Registrace nového klienta" accent={theme.accent}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 12 }}><div style={{ flex: 1 }}><Input label="Jméno" required /></div><div style={{ flex: 1 }}><Input label="Příjmení" required /></div></div>
            <Input label="Telefon" required icon="phone" placeholder="+420 ..." />
            <Input label="E-mail" required icon="user" placeholder="vas@email.cz" />
            <div style={{ padding: 14, background: theme.successLight, borderRadius: theme.radius, border: `1.5px solid ${theme.success}30` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: theme.success, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>🔑 Vygenerované heslo</div>
              <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 800, color: theme.text, letterSpacing: "0.1em", textAlign: "center", padding: "8px 0", userSelect: "all" }}>{generatePassword()}</div>
              <div style={{ fontSize: 11, color: theme.textSecondary, textAlign: "center", marginTop: 4 }}>Heslo si zapište nebo vyfotografujte. Bude odesláno na zadaný e-mail a SMS.</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" onClick={() => setStep("login")}>← Zpět</Btn>
              <Btn onClick={() => { alert("Registrace dokončena! Heslo bylo odesláno na e-mail a SMS."); setStep("login"); }} style={{ flex: 1 }}>Registrovat a odeslat heslo</Btn>
            </div>
          </div>
        </Card>
      )}

      {step === "form" && (
        <Card title={`Žádost o termín — ${client.firstName} ${client.lastName}`} accent={theme.accent}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Select label="Zvíře" required value={form.petId} onChange={e => setForm({ ...form, petId: e.target.value })}>
              <option value="">— vyberte —</option>
              {myPets.map(p => <option key={p.id} value={p.id}>🐾 {p.name} ({p.species})</option>)}
            </Select>
            <Select label="Procedura" required value={form.procedureId} onChange={e => setForm({ ...form, procedureId: e.target.value })}>
              <option value="">— vyberte typ vyšetření —</option>
              {["prevence", "diagnostika", "chirurgie", "specialni", "ostatni"].map(cat =>
                <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                  {PROCEDURES.filter(p => p.category === cat && p.id !== "emergency").map(p => <option key={p.id} value={p.id}>{p.name} ({p.duration} min)</option>)}
                </optgroup>
              )}
            </Select>
            <Select label="Preferovaný lékař (nepovinné)" value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
              <option value="">Bez preference</option>
              {config.doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>

            {form.procedureId && (
              <Btn variant="outline" icon="search" onClick={() => setShowSlotFinder(true)} style={{ width: "100%" }}>🔍 Najít volný termín automaticky</Btn>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}><Input label="Preferovaný den" type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} min={TOMORROW} /></div>
              <div style={{ flex: 1 }}><Input label="Preferovaný čas" type="time" required value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} min="07:00" max="17:00" step="900" /></div>
            </div>
            <Input label="Popis problému" textarea icon="edit" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Popište příznaky..." />
            <div style={{ padding: 12, background: theme.warningLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.warning }}>⚠️ Jedná se o <strong>žádost</strong> — termín potvrdí recepce.</div>
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
            <p style={{ color: theme.textSecondary, marginBottom: 20 }}>Recepce potvrdí termín e-mailem.</p>
            <Btn onClick={() => { setForm({ petId: "", procedureId: "", date: TOMORROW, time: "09:00", note: "", doctorId: "" }); setStep("form"); }}>Další žádost</Btn>
          </div>
        </Card>
      )}

      {showSlotFinder && <FreeSlotModal config={config} appointments={appointments} onClose={() => setShowSlotFinder(false)}
        onSelect={s => { setForm({ ...form, date: s.date, time: s.time, doctorId: s.doctorId }); setShowSlotFinder(false); }} />}
    </div>
  );
}

// ─── RECEPTION VIEW ───
function ReceptionView({ appointments, clients, pets, config, onAction, onAddApt, onEdit, onSms }) {
  const [tab, setTab] = useState("today");
  const [showNew, setShowNew] = useState(false);
  const [showSlotFinder, setShowSlotFinder] = useState(false);
  const [newApt, setNewApt] = useState({ clientId: "", petId: "", procedureId: "", doctorId: "", date: TODAY, time: "08:00", note: "" });
  const todayApts = appointments.filter(a => a.date === TODAY).sort((a, b) => a.time.localeCompare(b.time));
  const pendingApts = appointments.filter(a => a.status === "pending");
  const waitingApts = todayApts.filter(a => a.status === "arrived");
  const inProgress = todayApts.filter(a => a.status === "in_progress");
  const selPets = pets.filter(p => p.clientId === newApt.clientId);

  const handleSave = () => {
    const proc = PROCEDURES.find(p => p.id === newApt.procedureId);
    onAddApt({ id: generateId(), ...newApt, duration: proc?.duration || 20, status: "confirmed", createdBy: "reception" });
    setShowNew(false); setNewApt({ clientId: "", petId: "", procedureId: "", doctorId: "", date: TODAY, time: "08:00", note: "" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatBox label="Dnes" value={todayApts.length} color={theme.accent} icon="📋" />
        <StatBox label="Čekárna" value={waitingApts.length} color={theme.warning} icon="🏠" />
        <StatBox label="U lékaře" value={inProgress.length} color={theme.purple} icon="🩺" />
        <StatBox label="Ke schválení" value={pendingApts.length} color={theme.danger} icon="⏳" />
      </div>

      {waitingApts.length > 0 && (
        <Card accent={theme.warning} noPad>
          <div style={{ padding: "12px 20px", background: theme.warningLight }}><span style={{ fontWeight: 700, color: theme.warning }}>🏠 Čekárna — {waitingApts.length}</span></div>
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>{waitingApts.map(a => <AptRow key={a.id} apt={a} clients={clients} pets={pets} config={config} onAction={onAction} onEdit={onEdit} onSms={onSms} role="reception" />)}</div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 4, borderBottom: `2px solid ${theme.border}`, alignItems: "center" }}>
        {[{ id: "today", l: `Dnes (${todayApts.length})` }, { id: "pending", l: `Ke schválení (${pendingApts.length})`, alert: pendingApts.length > 0 }, { id: "all", l: "Vše" }].map(t =>
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 20px", border: "none", borderBottom: `3px solid ${tab === t.id ? theme.accent : "transparent"}`, background: "none", color: tab === t.id ? theme.accent : theme.textSecondary, fontSize: 14, fontWeight: 700, cursor: "pointer", position: "relative" }}>
            {t.l}{t.alert && <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: theme.danger }} />}
          </button>
        )}
        <div style={{ flex: 1 }} />
        <Btn small icon="search" variant="outline" onClick={() => setShowSlotFinder(true)} style={{ marginRight: 6 }}>Volné termíny</Btn>
        <Btn icon="plus" onClick={() => setShowNew(true)}>Nová objednávka</Btn>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(tab === "today" ? todayApts : tab === "pending" ? pendingApts : appointments.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)))
          .map(a => <AptRow key={a.id} apt={a} clients={clients} pets={pets} config={config} onAction={onAction} onEdit={onEdit} onSms={onSms} role="reception" />)}
        {((tab === "today" && !todayApts.length) || (tab === "pending" && !pendingApts.length)) && <div style={{ padding: 40, textAlign: "center", color: theme.textMuted }}>Žádné záznamy</div>}
      </div>

      {showNew && (
        <Modal title="Nová objednávka" onClose={() => setShowNew(false)} footer={<><Btn variant="ghost" onClick={() => setShowNew(false)}>Zrušit</Btn><Btn variant="success" icon="check" disabled={!newApt.clientId || !newApt.petId || !newApt.procedureId} onClick={handleSave}>Uložit</Btn></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Select label="Klient" required value={newApt.clientId} onChange={e => setNewApt({ ...newApt, clientId: e.target.value, petId: "" })}><option value="">— vyberte —</option>{clients.map(c => <option key={c.id} value={c.id}>{c.lastName} {c.firstName}</option>)}</Select>
            {newApt.clientId && <Select label="Zvíře" required value={newApt.petId} onChange={e => setNewApt({ ...newApt, petId: e.target.value })}><option value="">— vyberte —</option>{selPets.map(p => <option key={p.id} value={p.id}>🐾 {p.name} ({p.species})</option>)}</Select>}
            <Select label="Procedura" required value={newApt.procedureId} onChange={e => setNewApt({ ...newApt, procedureId: e.target.value })}><option value="">— vyberte —</option>{PROCEDURES.map(p => <option key={p.id} value={p.id}>{p.name} ({p.duration}')</option>)}</Select>
            <Select label="Lékař" value={newApt.doctorId} onChange={e => setNewApt({ ...newApt, doctorId: e.target.value })}><option value="">— automaticky —</option>{config.doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</Select>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}><Input label="Datum" type="date" value={newApt.date} onChange={e => setNewApt({ ...newApt, date: e.target.value })} /></div>
              <div style={{ flex: 1 }}><Input label="Čas" type="time" value={newApt.time} onChange={e => setNewApt({ ...newApt, time: e.target.value })} step="900" /></div>
            </div>
            <Input label="Poznámka" textarea value={newApt.note} onChange={e => setNewApt({ ...newApt, note: e.target.value })} />
          </div>
        </Modal>
      )}

      {showSlotFinder && <FreeSlotModal config={config} appointments={appointments} onClose={() => setShowSlotFinder(false)}
        onSelect={s => { setNewApt({ ...newApt, date: s.date, time: s.time, doctorId: s.doctorId }); setShowSlotFinder(false); setShowNew(true); }} />}
    </div>
  );
}

// ─── DOCTOR VIEW ───
function DoctorView({ appointments, clients, pets, config, onAction, onEdit, onSms }) {
  const [selDoc, setSelDoc] = useState(config.doctors[0]?.id || "");
  const todayApts = appointments.filter(a => a.date === TODAY && a.doctorId === selDoc).sort((a, b) => a.time.localeCompare(b.time));
  const waiting = todayApts.filter(a => a.status === "arrived");
  const inProg = todayApts.filter(a => a.status === "in_progress");
  const upcoming = todayApts.filter(a => a.status === "confirmed");
  const completed = todayApts.filter(a => a.status === "completed");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: theme.textSecondary }}>Lékař:</span>
        {config.doctors.map(d => (
          <button key={d.id} onClick={() => setSelDoc(d.id)} style={{ padding: "6px 14px", border: `2px solid ${selDoc === d.id ? d.color : theme.border}`, borderRadius: 20, background: selDoc === d.id ? d.color + "15" : "white", color: selDoc === d.id ? d.color : theme.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{d.name}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatBox label="Čekárna" value={waiting.length} color={theme.warning} icon="🏠" />
        <StatBox label="U mě" value={inProg.length} color={theme.purple} icon="🩺" />
        <StatBox label="Další" value={upcoming.length} color={theme.accent} icon="📋" />
        <StatBox label="Hotovo" value={completed.length} color={theme.success} icon="✔" />
      </div>
      {inProg.length > 0 && <Card accent={theme.purple} title="🩺 Právě u mě"><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{inProg.map(a => <AptRow key={a.id} apt={a} clients={clients} pets={pets} config={config} onAction={onAction} onEdit={onEdit} onSms={onSms} role="doctor" />)}</div></Card>}
      {waiting.length > 0 && <Card accent={theme.warning} title={`🏠 Čekárna (${waiting.length})`}><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{waiting.map(a => <AptRow key={a.id} apt={a} clients={clients} pets={pets} config={config} onAction={onAction} onEdit={onEdit} onSms={onSms} role="doctor" />)}</div></Card>}
      <Card title={`📋 Nadcházející (${upcoming.length})`}><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{upcoming.map(a => <AptRow key={a.id} apt={a} clients={clients} pets={pets} config={config} onAction={onAction} onEdit={onEdit} onSms={onSms} role="doctor" />)}{!upcoming.length && <div style={{ padding: 20, textAlign: "center", color: theme.textMuted }}>Žádné další</div>}</div></Card>
      {completed.length > 0 && <Card title={`✔ Hotovo (${completed.length})`}><div style={{ display: "flex", flexDirection: "column", gap: 6, opacity: 0.7 }}>{completed.map(a => <AptRow key={a.id} apt={a} clients={clients} pets={pets} config={config} onAction={onAction} onEdit={onEdit} onSms={onSms} role="doctor" />)}</div></Card>}
    </div>
  );
}

// ─── MANAGER VIEW ───
function ManagerView({ appointments, clients, pets, config, onAction, onEdit, onSms }) {
  const todayApts = appointments.filter(a => a.date === TODAY);
  const totalMin = todayApts.reduce((s, a) => s + a.duration, 0);
  const byProc = PROCEDURES.map(p => ({ ...p, count: appointments.filter(a => a.procedureId === p.id).length })).filter(p => p.count > 0).sort((a, b) => b.count - a.count);
  const byStatus = Object.entries(STATUSES).map(([k, v]) => ({ k, ...v, count: appointments.filter(a => a.status === k).length })).filter(s => s.count > 0);
  const byDoc = config.doctors.map(d => ({ ...d, count: appointments.filter(a => a.doctorId === d.id).length, minutes: appointments.filter(a => a.doctorId === d.id).reduce((s, a) => s + a.duration, 0) }));
  const mx = Math.max(...byProc.map(p => p.count), 1);
  const publicReq = appointments.filter(a => a.createdBy === "public").length;
  const recCreated = appointments.filter(a => a.createdBy === "reception").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatBox label="Celkem" value={appointments.length} color={theme.accent} icon="📊" />
        <StatBox label="Obsazenost dnes" value={`${Math.round((totalMin / 540) * 100)}%`} color={theme.success} icon="📈" />
        <StatBox label="Klientů" value={new Set(appointments.map(a => a.clientId)).size} color={theme.purple} icon="👥" />
        <StatBox label="Ø délka" value={`${appointments.length ? Math.round(appointments.reduce((s, a) => s + a.duration, 0) / appointments.length) : 0}'`} color={theme.warning} icon="⏱" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <Card title="📊 Procedury">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {byProc.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, minWidth: 140 }}>{p.name}</span>
                <div style={{ flex: 1, height: 20, background: theme.bg, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(p.count / mx) * 100}%`, background: p.color + "40", borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 6 }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: p.color }}>{p.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="👨‍⚕️ Vytížení lékařů">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {byDoc.map(d => (
              <div key={d.id} style={{ padding: "10px 12px", background: d.color + "08", borderRadius: theme.radiusSm, borderLeft: `3px solid ${d.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: d.color }}>{d.name}</span>
                  <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: d.color }}>{d.count}</span>
                </div>
                <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{d.minutes} minut celkem</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="📈 Stavy">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {byStatus.map(s => <div key={s.k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", background: s.bg, borderRadius: theme.radiusSm }}><span style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.icon} {s.label}</span><span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 800, color: s.color }}>{s.count}</span></div>)}
          </div>
        </Card>
        <Card title="📬 Zdroj">
          <div style={{ display: "flex", gap: 20, justifyContent: "center", padding: "20px 0" }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 32, fontWeight: 800, fontFamily: MONO, color: theme.accent }}>{recCreated}</div><div style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 600, marginTop: 4 }}>🖥️ Recepce</div></div>
            <div style={{ width: 1, height: 50, background: theme.border }} />
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 32, fontWeight: 800, fontFamily: MONO, color: "#6366f1" }}>{publicReq}</div><div style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 600, marginTop: 4 }}>🌐 Online</div></div>
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
  const [appointments, setAppointments] = useState(DEMO_APTS);
  const [clients] = useState(DEMO_CLIENTS);
  const [pets] = useState(DEMO_PETS);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [showSettings, setShowSettings] = useState(false);
  const [editApt, setEditApt] = useState(null);
  const [smsApt, setSmsApt] = useState(null);

  const handleAction = (id, action) => {
    setAppointments(prev => prev.map(a => {
      if (a.id !== id) return a;
      switch (action) {
        case "confirm": return { ...a, status: "confirmed" };
        case "reject": return { ...a, status: "rejected" };
        case "arrive": return { ...a, status: "arrived", arrivalTime: new Date().toTimeString().slice(0, 5) };
        case "start": return { ...a, status: "in_progress" };
        case "complete": return { ...a, status: "completed" };
        case "no_show": return { ...a, status: "no_show" };
        case "reschedule": alert("Přesunutí — v produkci kalendářový dialog"); return a;
        default: return a;
      }
    }));
  };
  const handleAdd = apt => setAppointments(prev => [...prev, apt]);
  const handleEditSave = (updated) => setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
  const handleSmsOpen = (apt, client) => setSmsApt({ apt, client });
  const roleInfo = ROLES[role];
  const dateStr = new Date().toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: FONT, color: theme.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        select:focus, input:focus { outline: none; border-color: ${theme.accent} !important; }
      `}</style>

      <header style={{ background: "white", borderBottom: `1px solid ${theme.border}`, padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: theme.shadow, position: "sticky", top: 0, zIndex: 50, height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: `linear-gradient(135deg, ${roleInfo.color}, ${roleInfo.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{roleInfo.icon}</div>
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em" }}>VetBook <span style={{ fontWeight: 400, color: theme.textSecondary, fontSize: 13 }}>— {showSettings ? "Nastavení" : roleInfo.label}</span></h1>
            <div style={{ fontSize: 11, color: theme.textMuted }}>{dateStr}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!showSettings && (
            <div style={{ display: "flex", gap: 2, background: theme.bg, padding: 3, borderRadius: 8 }}>
              {Object.entries(ROLES).map(([key, r]) => (
                <button key={key} onClick={() => setRole(key)} style={{ padding: "6px 12px", border: "none", borderRadius: 6, cursor: "pointer", background: role === key ? "white" : "transparent", boxShadow: role === key ? theme.shadow : "none", color: role === key ? r.color : theme.textMuted, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s" }}>
                  <span style={{ fontSize: 13 }}>{r.icon}</span>
                  <span style={{ display: role === key ? "inline" : "none" }}>{r.label}</span>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setShowSettings(!showSettings)} style={{ padding: "6px 12px", border: `1.5px solid ${showSettings ? theme.purple : theme.border}`, borderRadius: 6, background: showSettings ? theme.purpleLight : "white", color: showSettings ? theme.purple : theme.textMuted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
            <Icon name="settings" size={14} />{showSettings ? "Zavřít" : ""}
          </button>
        </div>
      </header>

      <main style={{ padding: "20px 24px", maxWidth: role === "public" && !showSettings ? 700 : 1200, margin: "0 auto" }}>
        {showSettings ? <SettingsView config={config} setConfig={setConfig} /> :
          role === "public" ? <PublicView onSubmitRequest={handleAdd} clients={clients} pets={pets} config={config} appointments={appointments} /> :
          role === "reception" ? <ReceptionView appointments={appointments} clients={clients} pets={pets} config={config} onAction={handleAction} onAddApt={handleAdd} onEdit={setEditApt} onSms={handleSmsOpen} /> :
          role === "doctor" ? <DoctorView appointments={appointments} clients={clients} pets={pets} config={config} onAction={handleAction} onEdit={setEditApt} onSms={handleSmsOpen} /> :
          <ManagerView appointments={appointments} clients={clients} pets={pets} config={config} onAction={handleAction} onEdit={setEditApt} onSms={handleSmsOpen} />}
      </main>

      {editApt && <EditAptModal apt={editApt} config={config} clients={clients} pets={pets} onSave={handleEditSave} onClose={() => setEditApt(null)} />}
      {smsApt && <SmsModal apt={smsApt.apt} client={smsApt.client} pets={pets} config={config} onClose={() => setSmsApt(null)} />}
    </div>
  );
}
