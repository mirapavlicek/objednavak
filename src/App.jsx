import { useState, useMemo, useEffect } from "react";

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
  slotInterval: 5,
  acuteBufferSlots: 3,
  acuteBufferSpacing: 90,
  smsApiKey: "e435ed0c3c6ad1fc3b2a549dca750633286e4ac8",
  smsSender: "",
  smsOnConfirm: true,
  smsOnReminder: true,
  smsOnCancel: false,
  smsReminderHours: 24,
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
  employees: [
    { id: "e1", name: "Admin", email: "admin@klinika.cz", role: "manager", pin: "1234" },
    { id: "e2", name: "Jana Recepční", email: "jana@klinika.cz", role: "reception", pin: "5678" },
    { id: "e3", name: "MVDr. Jan Novák", email: "novak@klinika.cz", role: "doctor", doctorId: "d1", pin: "1111" },
    { id: "e4", name: "MVDr. Petra Králová", email: "kralova@klinika.cz", role: "doctor", doctorId: "d2", pin: "2222" },
    { id: "e5", name: "MVDr. Tomáš Veselý", email: "vesely@klinika.cz", role: "doctor", doctorId: "d3", pin: "3333" },
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
  const clientPhone = client?.phone || apt.manualPhone;
  const canSms = (role === "reception" || role === "manager") && clientPhone;
  const displayName = client ? `${client.lastName} ${client.firstName}` : (apt.manualName || "Neznámý");
  const displayPet = pet ? pet.name : (apt.manualPet || "");
  const displaySpecies = pet ? pet.species : "";
  const smsClient = client || (apt.manualPhone ? { firstName: apt.manualName || "", lastName: "", phone: apt.manualPhone } : null);
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
            <span style={{ fontSize: 15, fontWeight: 600 }}>{displayName}</span>
            {!client && apt.manualName && <span style={{ fontSize: 10, color: theme.warning, fontWeight: 600, background: theme.warningLight, padding: "1px 6px", borderRadius: 4 }}>ruční</span>}
            {displayPet && <><span style={{ color: theme.textSecondary }}>—</span><span style={{ fontSize: 14, color: theme.accent, fontWeight: 600 }}>🐾 {displayPet}</span></>}
            {displaySpecies && <span style={{ fontSize: 12, color: theme.textMuted }}>({displaySpecies})</span>}
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
            {canSms && <IconBtn icon="sms" title="Poslat SMS" color="#059669" onClick={() => onSms(apt, smsClient)} />}
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
  const isManual = !form.clientId;
  const selPets = pets.filter(p => p.clientId === form.clientId);
  return (
    <Modal title="✏️ Upravit objednávku" subtitle={`ID: ${apt.id}`} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>Zrušit</Btn><Btn variant="primary" icon="check" onClick={() => { onSave(form); onClose(); }}>Uložit změny</Btn></>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {isManual ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, background: theme.bg, borderRadius: theme.radius }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.warning, textTransform: "uppercase" }}>Ručně zadaný klient</div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 2 }}><Input label="Jméno" value={form.manualName || ""} onChange={e => setForm({ ...form, manualName: e.target.value })} /></div>
              <div style={{ flex: 1 }}><Input label="Telefon" icon="phone" value={form.manualPhone || ""} onChange={e => setForm({ ...form, manualPhone: e.target.value })} /></div>
            </div>
            <Input label="Zvíře" value={form.manualPet || ""} onChange={e => setForm({ ...form, manualPet: e.target.value })} />
          </div>
        ) : (
          <>
            <Select label="Klient" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value, petId: "" })}>
              {clients.map(c => <option key={c.id} value={c.id}>{c.lastName} {c.firstName}</option>)}
            </Select>
            <Select label="Zvíře" value={form.petId} onChange={e => setForm({ ...form, petId: e.target.value })}>
              <option value="">— vyberte —</option>
              {selPets.map(p => <option key={p.id} value={p.id}>🐾 {p.name} ({p.species})</option>)}
            </Select>
          </>
        )}
        <Select label="Procedura" value={form.procedureId} onChange={e => { const proc = PROCEDURES.find(p => p.id === e.target.value); setForm({ ...form, procedureId: e.target.value, duration: proc?.duration || form.duration }); }}>
          {PROCEDURES.map(p => <option key={p.id} value={p.id}>{p.name} ({p.duration}')</option>)}
        </Select>
        <Select label="Lékař" value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
          {config.doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}><Input label="Datum" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          <div style={{ flex: 1 }}><Input label="Čas" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} step="60" /></div>
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

// ─── INLINE SLOT PICKER ───
function InlineSlotPicker({ config, appointments, procedureId, doctorId, onSelect, selectedDate, selectedTime }) {
  const [viewDate, setViewDate] = useState(selectedDate || TOMORROW);
  const proc = PROCEDURES.find(p => p.id === procedureId);
  const slots = useMemo(() => proc ? findFreeSlots(config, appointments, procedureId, viewDate, viewDate, doctorId || null) : [], [proc, config, appointments, procedureId, viewDate, doctorId]);
  if (!proc) return null;
  const grouped = {};
  slots.forEach(s => { const h = s.time.split(":")[0]; if (!grouped[h]) grouped[h] = []; grouped[h].push(s); });
  const hours = Object.keys(grouped).sort();
  return (
    <div style={{ border: `1.5px solid ${theme.accent}30`, borderRadius: theme.radius, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: theme.accentLight, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: theme.accent }}>📅 Volné termíny — {proc.name} ({proc.duration}')</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button onClick={() => setViewDate(new Date(new Date(viewDate).getTime() - 86400000).toISOString().split("T")[0])} style={{ border: "none", background: "white", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 14 }}>◂</button>
          <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} min={TODAY} style={{ padding: "3px 8px", border: `1px solid ${theme.border}`, borderRadius: 4, fontFamily: MONO, fontSize: 12 }} />
          <button onClick={() => setViewDate(new Date(new Date(viewDate).getTime() + 86400000).toISOString().split("T")[0])} style={{ border: "none", background: "white", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 14 }}>▸</button>
        </div>
      </div>
      <div style={{ padding: "8px 14px", maxHeight: 220, overflowY: "auto" }}>
        {hours.length === 0 ? (
          <div style={{ padding: 16, textAlign: "center", color: theme.textMuted, fontSize: 13 }}>Žádné volné termíny pro tento den</div>
        ) : hours.map(h => (
          <div key={h} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, marginBottom: 3 }}>{h}:00</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {grouped[h].map((s, i) => {
                const isSel = s.date === selectedDate && s.time === selectedTime && s.doctorId === (doctorId || s.doctorId);
                return (
                  <button key={i} onClick={() => onSelect(s)}
                    style={{ padding: "3px 8px", border: `1.5px solid ${isSel ? theme.accent : s.doctorColor + "40"}`, borderRadius: 4, background: isSel ? theme.accent : s.doctorColor + "08", color: isSel ? "white" : theme.text, cursor: "pointer", fontSize: 12, fontFamily: MONO, fontWeight: 600, transition: "all 0.1s" }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = s.doctorColor + "20"; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = s.doctorColor + "08"; }}
                    title={s.doctorName}>
                    {s.time}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── QUICK ACUTE MODAL ───
function QuickAcuteModal({ clients, pets, config, onSave, onClose }) {
  const [clientId, setClientId] = useState("");
  const [petId, setPetId] = useState("");
  const [note, setNote] = useState("");
  const [withTime, setWithTime] = useState(false);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [doctorId, setDoctorId] = useState(config.doctors.find(d => d.specializations.includes("akutni"))?.id || config.doctors[0]?.id || "");
  const selPets = pets.filter(p => p.clientId === clientId);
  const handleSave = () => {
    const proc = PROCEDURES.find(p => p.id === "emergency");
    onSave({ id: generateId(), clientId, petId, procedureId: "emergency", doctorId, date: TODAY, time: withTime ? time : new Date().toTimeString().slice(0, 5), duration: proc?.duration || 20, status: "arrived", note: note || "Akutní příjem", createdBy: "reception", arrivalTime: new Date().toTimeString().slice(0, 5) });
    onClose();
  };
  return (
    <Modal title="🚨 Akutní příjem" subtitle="Rychlé zařazení pacienta — rovnou do čekárny" onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>Zrušit</Btn><Btn variant="danger" icon="alert" disabled={!clientId || !petId} onClick={handleSave}>Akutní příjem → Čekárna</Btn></>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ padding: 12, background: theme.dangerLight, borderRadius: theme.radius, fontSize: 13, color: theme.danger, fontWeight: 600 }}>
          ⚡ Pacient bude zařazen rovnou do čekárny se stavem „Přišel"
        </div>
        <Select label="Klient" required value={clientId} onChange={e => { setClientId(e.target.value); setPetId(""); }}>
          <option value="">— vyberte —</option>{clients.map(c => <option key={c.id} value={c.id}>{c.lastName} {c.firstName} ({c.phone})</option>)}
        </Select>
        {clientId && <Select label="Zvíře" required value={petId} onChange={e => setPetId(e.target.value)}>
          <option value="">— vyberte —</option>{selPets.map(p => <option key={p.id} value={p.id}>🐾 {p.name} ({p.species})</option>)}
        </Select>}
        <Select label="Lékař" value={doctorId} onChange={e => setDoctorId(e.target.value)}>
          {config.doctors.filter(d => d.specializations.includes("akutni")).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={withTime} onChange={e => setWithTime(e.target.checked)} /> Zadat konkrétní čas (nepovinné)
        </label>
        {withTime && <Input label="Čas" type="time" value={time} onChange={e => setTime(e.target.value)} style={{ width: 140 }} />}
        <Input label="Poznámka" textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Důvod akutního příjmu..." />
      </div>
    </Modal>
  );
}

// ─── CLIENT REGISTRY ───
function ClientRegistry({ clients, pets, setClients, setPets }) {
  const [search, setSearch] = useState("");
  const [editClient, setEditClient] = useState(null);
  const [editPet, setEditPet] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddPet, setShowAddPet] = useState(null);
  const [newClient, setNewClient] = useState({ firstName: "", lastName: "", phone: "", email: "" });
  const [newPet, setNewPet] = useState({ name: "", species: "Pes", breed: "" });
  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q) || pets.filter(p => p.clientId === c.id).some(p => p.name.toLowerCase().includes(q));
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ flex: 1 }}><Input icon="search" placeholder="Hledat klienta, zvíře, telefon..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Btn icon="plus" onClick={() => setShowAddClient(true)}>Nový klient</Btn>
      </div>
      <div style={{ fontSize: 12, color: theme.textMuted }}>{filtered.length} z {clients.length} klientů • {pets.length} zvířat celkem</div>
      {filtered.map(c => {
        const cPets = pets.filter(p => p.clientId === c.id);
        return (
          <div key={c.id} style={{ border: `1px solid ${theme.border}`, borderRadius: theme.radius, background: "white", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.borderLight}` }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{c.lastName} {c.firstName}</span>
                <span style={{ marginLeft: 12, fontSize: 12, color: theme.textMuted }}><Icon name="phone" size={12} /> {c.phone}</span>
                <span style={{ marginLeft: 12, fontSize: 12, color: theme.textMuted }}>{c.email}</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <Btn small variant="ghost" icon="plus" onClick={() => { setShowAddPet(c.id); setNewPet({ name: "", species: "Pes", breed: "" }); }}>Zvíře</Btn>
                <Btn small variant="ghost" icon="edit" onClick={() => setEditClient({ ...c })}>Upravit</Btn>
              </div>
            </div>
            {cPets.length > 0 && (
              <div style={{ padding: "8px 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {cPets.map(p => (
                  <div key={p.id} onClick={() => setEditPet({ ...p })} style={{ padding: "6px 12px", background: theme.accentLight, borderRadius: 8, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s", border: `1px solid transparent` }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = theme.accent}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
                    <span style={{ fontSize: 16 }}>🐾</span>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span style={{ color: theme.textSecondary, fontSize: 11 }}>{p.species} • {p.breed}</span>
                    <span style={{ fontSize: 10, color: theme.textMuted }}>✏️</span>
                  </div>
                ))}
              </div>
            )}
            {cPets.length === 0 && <div style={{ padding: "8px 16px", fontSize: 12, color: theme.textMuted }}>Žádná zvířata</div>}
          </div>
        );
      })}

      {editClient && (
        <Modal title="Upravit klienta" onClose={() => setEditClient(null)} footer={<><Btn variant="ghost" onClick={() => setEditClient(null)}>Zrušit</Btn><Btn icon="check" onClick={() => { setClients(prev => prev.map(c => c.id === editClient.id ? editClient : c)); setEditClient(null); }}>Uložit</Btn></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 12 }}><div style={{ flex: 1 }}><Input label="Jméno" value={editClient.firstName} onChange={e => setEditClient({ ...editClient, firstName: e.target.value })} /></div><div style={{ flex: 1 }}><Input label="Příjmení" value={editClient.lastName} onChange={e => setEditClient({ ...editClient, lastName: e.target.value })} /></div></div>
            <Input label="Telefon" value={editClient.phone} onChange={e => setEditClient({ ...editClient, phone: e.target.value })} />
            <Input label="E-mail" value={editClient.email} onChange={e => setEditClient({ ...editClient, email: e.target.value })} />
          </div>
        </Modal>
      )}
      {editPet && (
        <Modal title={`Upravit zvíře — ${editPet.name}`} onClose={() => setEditPet(null)} footer={<><Btn variant="danger" onClick={() => { if(confirm("Smazat zvíře?")) { setPets(prev => prev.filter(p => p.id !== editPet.id)); setEditPet(null); } }}>Smazat</Btn><div style={{flex:1}}/><Btn variant="ghost" onClick={() => setEditPet(null)}>Zrušit</Btn><Btn icon="check" onClick={() => { setPets(prev => prev.map(p => p.id === editPet.id ? editPet : p)); setEditPet(null); }}>Uložit</Btn></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Jméno" value={editPet.name} onChange={e => setEditPet({ ...editPet, name: e.target.value })} />
            <Select label="Druh" value={editPet.species} onChange={e => setEditPet({ ...editPet, species: e.target.value })}><option>Pes</option><option>Kočka</option><option>Králík</option><option>Křeček</option><option>Had</option><option>Pták</option><option>Jiné</option></Select>
            <Input label="Plemeno" value={editPet.breed} onChange={e => setEditPet({ ...editPet, breed: e.target.value })} />
          </div>
        </Modal>
      )}
      {showAddClient && (
        <Modal title="Nový klient" onClose={() => setShowAddClient(false)} footer={<><Btn variant="ghost" onClick={() => setShowAddClient(false)}>Zrušit</Btn><Btn icon="check" disabled={!newClient.lastName || !newClient.phone} onClick={() => { setClients(prev => [...prev, { ...newClient, id: generateId() }]); setShowAddClient(false); setNewClient({ firstName: "", lastName: "", phone: "", email: "" }); }}>Přidat</Btn></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 12 }}><div style={{ flex: 1 }}><Input label="Jméno" required value={newClient.firstName} onChange={e => setNewClient({ ...newClient, firstName: e.target.value })} /></div><div style={{ flex: 1 }}><Input label="Příjmení" required value={newClient.lastName} onChange={e => setNewClient({ ...newClient, lastName: e.target.value })} /></div></div>
            <Input label="Telefon" required value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} />
            <Input label="E-mail" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} />
          </div>
        </Modal>
      )}
      {showAddPet && (
        <Modal title="Přidat zvíře" subtitle={`Klient: ${clients.find(c => c.id === showAddPet)?.lastName || ""}`} onClose={() => setShowAddPet(null)} footer={<><Btn variant="ghost" onClick={() => setShowAddPet(null)}>Zrušit</Btn><Btn icon="check" disabled={!newPet.name} onClick={() => { setPets(prev => [...prev, { ...newPet, id: generateId(), clientId: showAddPet }]); setShowAddPet(null); }}>Přidat</Btn></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Jméno zvířete" required value={newPet.name} onChange={e => setNewPet({ ...newPet, name: e.target.value })} />
            <Select label="Druh" value={newPet.species} onChange={e => setNewPet({ ...newPet, species: e.target.value })}><option>Pes</option><option>Kočka</option><option>Králík</option><option>Křeček</option><option>Had</option><option>Pták</option><option>Jiné</option></Select>
            <Input label="Plemeno" value={newPet.breed} onChange={e => setNewPet({ ...newPet, breed: e.target.value })} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SETTINGS VIEW ───
function SettingsView({ config, setConfig }) {
  const [tab, setTab] = useState("hours");
  const [winvetTab, setWinvetTab] = useState("info");
  const tabs = [
    { id: "hours", label: "⏰ Otvírací doba" },
    { id: "doctors", label: "👨‍⚕️ Lékaři" },
    { id: "blocks", label: "📋 Bloky procedur" },
    { id: "acute", label: "🚨 Akutní sloty" },
    { id: "admin", label: "🔐 Zaměstnanci" },
    { id: "sms", label: "📱 SMS" },
    { id: "winvet", label: "🔗 WinVet" },
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

      {tab === "admin" && (
        <Card title="🔐 Zaměstnanci a přístupová práva" accent={theme.purple}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: 12, background: theme.purpleLight, borderRadius: theme.radius, fontSize: 13, color: theme.purple }}>
              Správa zaměstnanců kliniky. Každý zaměstnanec má přidělenou roli a přístupová práva.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(config.employees || []).map((emp, idx) => (
                <div key={emp.id} style={{ padding: 12, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, display: "flex", justifyContent: "space-between", alignItems: "center", background: "white" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 32, height: 32, borderRadius: "50%", background: ROLES[emp.role]?.color + "20" || theme.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{ROLES[emp.role]?.icon || "👤"}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: theme.textMuted }}>{emp.email} • PIN: <span style={{ fontFamily: MONO }}>{emp.pin}</span></div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <select value={emp.role} onChange={e => { const emps = [...config.employees]; emps[idx] = { ...emps[idx], role: e.target.value }; setConfig({ ...config, employees: emps }); }}
                      style={{ padding: "4px 8px", border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 12, fontFamily: FONT }}>
                      <option value="manager">📊 Manažer</option>
                      <option value="reception">🖥️ Recepce</option>
                      <option value="doctor">🩺 Lékař</option>
                    </select>
                    {emp.role === "doctor" && (
                      <select value={emp.doctorId || ""} onChange={e => { const emps = [...config.employees]; emps[idx] = { ...emps[idx], doctorId: e.target.value }; setConfig({ ...config, employees: emps }); }}
                        style={{ padding: "4px 8px", border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 12 }}>
                        <option value="">— lékař —</option>
                        {config.doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    )}
                    <button onClick={() => { if(confirm(`Smazat ${emp.name}?`)) setConfig({ ...config, employees: config.employees.filter((_,i) => i !== idx) }); }}
                      style={{ border: "none", background: "none", color: theme.danger, cursor: "pointer", fontSize: 14 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 14, border: `2px dashed ${theme.border}`, borderRadius: theme.radius, background: theme.bg }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: theme.textSecondary, marginBottom: 8 }}>Přidat zaměstnance</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}>
                <div style={{ flex: 2, minWidth: 140 }}><Input label="Jméno" id="newEmpName" placeholder="Jan Novotný" /></div>
                <div style={{ flex: 2, minWidth: 160 }}><Input label="E-mail" id="newEmpEmail" placeholder="novotny@klinika.cz" /></div>
                <div style={{ flex: 1, minWidth: 80 }}><Input label="PIN" id="newEmpPin" placeholder="0000" style={{ fontFamily: MONO }} /></div>
                <Btn icon="plus" onClick={() => {
                  const name = document.getElementById("newEmpName")?.value;
                  const email = document.getElementById("newEmpEmail")?.value;
                  const pin = document.getElementById("newEmpPin")?.value || String(Math.floor(1000 + Math.random() * 9000));
                  if (!name) return;
                  setConfig({ ...config, employees: [...(config.employees || []), { id: generateId(), name, email: email || "", role: "reception", pin }] });
                  if (document.getElementById("newEmpName")) document.getElementById("newEmpName").value = "";
                  if (document.getElementById("newEmpEmail")) document.getElementById("newEmpEmail").value = "";
                  if (document.getElementById("newEmpPin")) document.getElementById("newEmpPin").value = "";
                }}>Přidat</Btn>
              </div>
            </div>
            <div style={{ fontSize: 12, color: theme.textMuted }}>
              <strong>Role:</strong> 📊 Manažer — plný přístup, nastavení, statistiky • 🖥️ Recepce — objednávky, klienti, čekárna • 🩺 Lékař — vlastní pacienti, workflow
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
                { key: "smsOnReminder", label: "Připomínka před termínem" },
                { key: "smsOnCancel", label: "Při zrušení/zamítnutí termínu" },
              ].map(opt => (
                <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={!!config[opt.key]} onChange={e => setConfig({ ...config, [opt.key]: e.target.checked })} />
                  {opt.label}
                  {opt.key === "smsOnReminder" && config.smsOnReminder && (
                    <select value={config.smsReminderHours || 24} onChange={e => setConfig({ ...config, smsReminderHours: parseInt(e.target.value) })}
                      style={{ marginLeft: 8, padding: "2px 8px", border: `1px solid ${theme.border}`, borderRadius: 4, fontSize: 12, fontFamily: FONT }}>
                      <option value={1}>1 hodinu</option>
                      <option value={2}>2 hodiny</option>
                      <option value={4}>4 hodiny</option>
                      <option value={12}>12 hodin</option>
                      <option value={24}>24 hodin (den předem)</option>
                      <option value={48}>48 hodin</option>
                    </select>
                  )}
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
  const [form, setForm] = useState({ petId: "", procedureId: "", date: TOMORROW, time: "", note: "", doctorId: "" });
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
              <InlineSlotPicker config={config} appointments={appointments} procedureId={form.procedureId} doctorId={form.doctorId}
                selectedDate={form.date} selectedTime={form.time}
                onSelect={s => setForm({ ...form, date: s.date, time: s.time, doctorId: s.doctorId })} />
            )}

            {form.procedureId && form.date && form.time && (
              <div style={{ padding: 10, background: theme.successLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.success, fontWeight: 600 }}>
                ✓ Vybraný termín: <span style={{ fontFamily: MONO }}>{form.date} {form.time}</span>
                {form.doctorId && <span> — {config.doctors.find(d => d.id === form.doctorId)?.name}</span>}
              </div>
            )}
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

    </div>
  );
}

// ─── CALENDAR HELPERS ───
const CZ_DAY_SHORT = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];
const CZ_DAY_FULL = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"];
const dateStr = d => d.toISOString().split("T")[0];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const getMonday = d => { const r = new Date(d); const day = r.getDay(); r.setDate(r.getDate() - (day === 0 ? 6 : day - 1)); return r; };

// ─── CALENDAR VIEW ───
function CalendarView({ appointments, clients, pets, config, onAction, onEdit, onSms }) {
  const [viewDate, setViewDate] = useState(TODAY);
  const [mode, setMode] = useState("week"); // day | week | month

  const activeApts = appointments.filter(a => a.status !== "rejected" && a.status !== "no_show");

  const getAptColor = (apt) => {
    const doc = config.doctors.find(d => d.id === apt.doctorId);
    const proc = PROCEDURES.find(p => p.id === apt.procedureId);
    return doc?.color || proc?.color || theme.accent;
  };

  const aptLabel = (apt) => {
    const client = clients.find(c => c.id === apt.clientId);
    return client ? `${client.lastName}` : (apt.manualName || "?");
  };

  const navigate = (dir) => {
    const d = new Date(viewDate + "T00:00");
    if (mode === "day") d.setDate(d.getDate() + dir);
    else if (mode === "week") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setViewDate(dateStr(d));
  };

  const titleText = () => {
    const d = new Date(viewDate + "T00:00");
    if (mode === "day") return d.toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
    if (mode === "week") {
      const mon = getMonday(d);
      const sun = addDays(mon, 6);
      return `${mon.getDate()}.${mon.getMonth() + 1}. — ${sun.getDate()}.${sun.getMonth() + 1}. ${sun.getFullYear()}`;
    }
    return d.toLocaleDateString("cs-CZ", { month: "long", year: "numeric" });
  };

  // ── Day view ──
  const renderDay = () => {
    const dayName = DAY_NAMES[new Date(viewDate + "T00:00").getDay()];
    const oh = config.openingHours[dayName];
    const dayApts = activeApts.filter(a => a.date === viewDate).sort((a, b) => a.time.localeCompare(b.time));
    if (!oh) return <div style={{ padding: 60, textAlign: "center", color: theme.textMuted, background: "white", borderRadius: theme.radius, border: `1px solid ${theme.border}` }}>🔒 Zavřeno</div>;
    const startH = parseInt(oh.open.split(":")[0]);
    const endH = Math.ceil(toMin(oh.close) / 60);
    const PX = 72;
    const hours = []; for (let h = startH; h < endH; h++) hours.push(h);
    return (
      <div style={{ display: "flex", background: "white", border: `1px solid ${theme.border}`, borderRadius: theme.radius, overflow: "hidden", minHeight: hours.length * PX }}>
        <div style={{ width: 52, borderRight: `1px solid ${theme.border}`, flexShrink: 0 }}>
          {hours.map(h => <div key={h} style={{ height: PX, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 6, paddingTop: 2, fontSize: 10, fontFamily: MONO, color: theme.textMuted, fontWeight: 600 }}>{String(h).padStart(2, "0")}:00</div>)}
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          {hours.map(h => <div key={h} style={{ height: PX, borderBottom: `1px solid ${theme.border}10` }}><div style={{ height: PX / 2, borderBottom: `1px dashed ${theme.border}08` }} /></div>)}
          {dayApts.map(apt => {
            const color = getAptColor(apt);
            const top = ((toMin(apt.time) - startH * 60) / 60) * PX;
            const height = Math.max((apt.duration / 60) * PX, 20);
            const pet = pets.find(p => p.id === apt.petId);
            const proc = PROCEDURES.find(p => p.id === apt.procedureId);
            const si = STATUSES[apt.status];
            return (
              <div key={apt.id} onClick={() => onEdit(apt)} style={{ position: "absolute", top, left: 4, right: 4, height: Math.max(height - 2, 18), background: color + "12", border: `1.5px solid ${color}40`, borderLeft: `4px solid ${color}`, borderRadius: 6, padding: "2px 8px", cursor: "pointer", overflow: "hidden", fontSize: 12, zIndex: 2, transition: "all .1s" }}
                onMouseEnter={e => { e.currentTarget.style.background = color + "28"; e.currentTarget.style.zIndex = 10; }} onMouseLeave={e => { e.currentTarget.style.background = color + "12"; e.currentTarget.style.zIndex = 2; }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11 }}>{apt.time}</span><span style={{ fontSize: 10, color: si?.color }}>{si?.icon}</span></div>
                {height > 26 && <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{aptLabel(apt)}{pet || apt.manualPet ? ` — ${pet?.name || apt.manualPet}` : ""}</div>}
                {height > 46 && <div style={{ fontSize: 10, color: theme.textMuted }}>{proc?.name}</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Week view ──
  const renderWeek = () => {
    const mon = getMonday(new Date(viewDate + "T00:00"));
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(mon, i);
      const ds = dateStr(d);
      const dn = DAY_NAMES[d.getDay()];
      const oh = config.openingHours[dn];
      return { date: d, ds, dn, oh, apts: activeApts.filter(a => a.date === ds).sort((a, b) => a.time.localeCompare(b.time)) };
    });
    // find global hour range
    let minH = 24, maxH = 0;
    days.forEach(d => { if (d.oh) { minH = Math.min(minH, parseInt(d.oh.open.split(":")[0])); maxH = Math.max(maxH, Math.ceil(toMin(d.oh.close) / 60)); } });
    if (minH >= maxH) { minH = 7; maxH = 18; }
    const PX = 56;
    const hours = []; for (let h = minH; h < maxH; h++) hours.push(h);

    return (
      <div style={{ display: "flex", background: "white", border: `1px solid ${theme.border}`, borderRadius: theme.radius, overflow: "auto" }}>
        <div style={{ width: 44, borderRight: `1px solid ${theme.border}`, flexShrink: 0 }}>
          <div style={{ height: 52, borderBottom: `1px solid ${theme.border}` }} />
          {hours.map(h => <div key={h} style={{ height: PX, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 4, paddingTop: 1, fontSize: 10, fontFamily: MONO, color: theme.textMuted }}>{String(h).padStart(2, "0")}</div>)}
        </div>
        {days.map(day => {
          const isToday = day.ds === TODAY;
          const closed = !day.oh;
          return (
            <div key={day.ds} style={{ flex: 1, minWidth: 100, borderRight: `1px solid ${theme.border}08` }}>
              <div onClick={() => { setViewDate(day.ds); setMode("day"); }} style={{ height: 52, borderBottom: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: isToday ? theme.accentLight : closed ? "#fef2f220" : "transparent" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: isToday ? theme.accent : theme.textMuted }}>{CZ_DAY_SHORT[day.date.getDay()]}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: isToday ? theme.accent : theme.text, width: 28, height: 28, borderRadius: "50%", background: isToday ? theme.accent + "18" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{day.date.getDate()}</div>
              </div>
              <div style={{ position: "relative", minHeight: hours.length * PX, background: closed ? "#fef2f208" : "transparent" }}>
                {hours.map(h => <div key={h} style={{ height: PX, borderBottom: `1px solid ${theme.border}06` }} />)}
                {closed && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 11, color: theme.textMuted, fontWeight: 600, whiteSpace: "nowrap" }}>Zavřeno</div>}
                {day.apts.map(apt => {
                  const color = getAptColor(apt);
                  const top = ((toMin(apt.time) - minH * 60) / 60) * PX;
                  const height = Math.max((apt.duration / 60) * PX, 16);
                  const si = STATUSES[apt.status];
                  return (
                    <div key={apt.id} onClick={() => onEdit(apt)} title={`${apt.time} ${aptLabel(apt)}`}
                      style={{ position: "absolute", top, left: 2, right: 2, height: Math.max(height - 1, 14), background: color + "18", border: `1px solid ${color}35`, borderLeft: `3px solid ${color}`, borderRadius: 4, padding: "1px 4px", cursor: "pointer", overflow: "hidden", zIndex: 2, transition: "all .1s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = color + "35"; e.currentTarget.style.zIndex = 10; }} onMouseLeave={e => { e.currentTarget.style.background = color + "18"; e.currentTarget.style.zIndex = 2; }}>
                      <div style={{ fontSize: 9, fontFamily: MONO, fontWeight: 700 }}>{apt.time}</div>
                      {height > 18 && <div style={{ fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{aptLabel(apt)}</div>}
                      {height > 30 && <div style={{ fontSize: 9, color: si?.color }}>{si?.icon}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── Month view ──
  const renderMonth = () => {
    const d = new Date(viewDate + "T00:00");
    const year = d.getFullYear(), month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // monday=0
    const totalDays = lastDay.getDate();
    const cells = [];
    // pad before
    for (let i = 0; i < startOffset; i++) {
      const pd = new Date(year, month, -startOffset + i + 1);
      cells.push({ date: pd, ds: dateStr(pd), inMonth: false });
    }
    for (let i = 1; i <= totalDays; i++) {
      const cd = new Date(year, month, i);
      cells.push({ date: cd, ds: dateStr(cd), inMonth: true });
    }
    // pad after to fill rows
    while (cells.length % 7 !== 0) {
      const nd = new Date(year, month + 1, cells.length - startOffset - totalDays + 1);
      cells.push({ date: nd, ds: dateStr(nd), inMonth: false });
    }
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    return (
      <div style={{ background: "white", border: `1px solid ${theme.border}`, borderRadius: theme.radius, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${theme.border}` }}>
          {CZ_DAY_SHORT.slice(1).concat(CZ_DAY_SHORT[0]).map(d => (
            <div key={d} style={{ padding: "8px 0", textAlign: "center", fontSize: 11, fontWeight: 700, color: theme.textMuted, background: theme.bg }}>{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: wi < weeks.length - 1 ? `1px solid ${theme.border}10` : "none" }}>
            {week.map(cell => {
              const isToday = cell.ds === TODAY;
              const dayApts = activeApts.filter(a => a.date === cell.ds);
              const dn = DAY_NAMES[cell.date.getDay()];
              const oh = config.openingHours[dn];
              const closed = !oh;
              return (
                <div key={cell.ds} onClick={() => { setViewDate(cell.ds); setMode("day"); }}
                  style={{ minHeight: 80, borderRight: `1px solid ${theme.border}06`, padding: 4, cursor: "pointer", background: isToday ? theme.accentLight : closed ? "#fef2f210" : cell.inMonth ? "transparent" : "#f8fafc80", transition: "background .1s" }}
                  onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = theme.bg; }} onMouseLeave={e => { if (!isToday) e.currentTarget.style.background = isToday ? theme.accentLight : closed ? "#fef2f210" : cell.inMonth ? "transparent" : "#f8fafc80"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: isToday ? 800 : cell.inMonth ? 600 : 400, color: isToday ? theme.accent : cell.inMonth ? theme.text : theme.textMuted, width: 24, height: 24, borderRadius: "50%", background: isToday ? theme.accent + "20" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{cell.date.getDate()}</span>
                    {dayApts.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: theme.accent, fontFamily: MONO }}>{dayApts.length}</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {dayApts.slice(0, 3).map(apt => {
                      const color = getAptColor(apt);
                      return (
                        <div key={apt.id} style={{ fontSize: 9, padding: "1px 4px", background: color + "15", borderRadius: 3, borderLeft: `2px solid ${color}`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.4 }}>
                          <span style={{ fontFamily: MONO, fontWeight: 600 }}>{apt.time}</span> {aptLabel(apt)}
                        </div>
                      );
                    })}
                    {dayApts.length > 3 && <div style={{ fontSize: 9, color: theme.textMuted, paddingLeft: 4 }}>+{dayApts.length - 3} další</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "8px 12px", borderRadius: theme.radius, border: `1px solid ${theme.border}`, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button onClick={() => navigate(-1)} style={{ border: "none", background: theme.bg, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 15 }}>◂</button>
          <button onClick={() => setViewDate(TODAY)} style={{ border: `1px solid ${theme.border}`, background: viewDate === TODAY ? theme.accent : "white", color: viewDate === TODAY ? "white" : theme.textSecondary, borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Dnes</button>
          <button onClick={() => navigate(1)} style={{ border: "none", background: theme.bg, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 15 }}>▸</button>
        </div>
        <div style={{ fontWeight: 800, fontSize: 15, textAlign: "center", flex: 1, minWidth: 140 }}>{titleText()}</div>
        <div style={{ display: "flex", gap: 2, background: theme.bg, padding: 2, borderRadius: 6 }}>
          {[{ id: "day", l: "Den" }, { id: "week", l: "Týden" }, { id: "month", l: "Měsíc" }].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{ padding: "5px 12px", border: "none", borderRadius: 5, cursor: "pointer", background: mode === m.id ? "white" : "transparent", boxShadow: mode === m.id ? theme.shadow : "none", color: mode === m.id ? theme.accent : theme.textMuted, fontSize: 12, fontWeight: 700 }}>{m.l}</button>
          ))}
        </div>
      </div>
      {mode === "day" && renderDay()}
      {mode === "week" && renderWeek()}
      {mode === "month" && renderMonth()}
    </div>
  );
}

// ─── PWA INSTALL BANNER ───
function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIos] = useState(() => /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.navigator.standalone);
  const [showIos, setShowIos] = useState(false);

  useEffect(() => {
    const handler = e => { e.preventDefault(); setDeferredPrompt(e); setShow(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; if (outcome === "accepted") setShow(false); setDeferredPrompt(null); }
  };

  // Check if already installed
  if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) return null;

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
            1. Klepněte na <strong>Sdílet</strong> (ikona ⬆️ dole v Safari)<br/>
            2. Vyberte <strong>„Přidat na plochu"</strong><br/>
            3. Potvrďte <strong>„Přidat"</strong>
          </div>
        </div>
      )}
    </>
  );
}

// ─── RECEPTION VIEW ───
function ReceptionView({ appointments, clients, pets, config, onAction, onAddApt, onEdit, onSms, setClients, setPets }) {
  const [tab, setTab] = useState("today");
  const [showNew, setShowNew] = useState(false);
  const [showAcute, setShowAcute] = useState(false);
  const [showSlotFinder, setShowSlotFinder] = useState(false);
  const [newApt, setNewApt] = useState({ clientId: "", petId: "", procedureId: "", doctorId: "", date: TODAY, time: "", note: "", manualName: "", manualPhone: "", manualPet: "" });
  const [clientMode, setClientMode] = useState("select"); // select | manual
  const todayApts = appointments.filter(a => a.date === TODAY).sort((a, b) => a.time.localeCompare(b.time));
  const pendingApts = appointments.filter(a => a.status === "pending");
  const waitingApts = todayApts.filter(a => a.status === "arrived");
  const inProgress = todayApts.filter(a => a.status === "in_progress");
  const selPets = pets.filter(p => p.clientId === newApt.clientId);

  const handleSave = () => {
    const proc = PROCEDURES.find(p => p.id === newApt.procedureId);
    const apt = {
      id: generateId(),
      clientId: clientMode === "select" ? newApt.clientId : "",
      petId: clientMode === "select" ? newApt.petId : "",
      manualName: clientMode === "manual" ? newApt.manualName : "",
      manualPhone: clientMode === "manual" ? newApt.manualPhone : "",
      manualPet: clientMode === "manual" ? newApt.manualPet : "",
      procedureId: newApt.procedureId,
      doctorId: newApt.doctorId,
      date: newApt.date,
      time: newApt.time,
      duration: proc?.duration || 20,
      status: "confirmed",
      note: newApt.note,
      createdBy: "reception",
    };
    onAddApt(apt);
    setShowNew(false);
    setNewApt({ clientId: "", petId: "", procedureId: "", doctorId: "", date: TODAY, time: "", note: "", manualName: "", manualPhone: "", manualPet: "" });
    setClientMode("select");
  };

  const canSaveNew = newApt.procedureId && newApt.time && (
    (clientMode === "select" && newApt.clientId && newApt.petId) ||
    (clientMode === "manual" && newApt.manualName)
  );

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

      <div style={{ display: "flex", gap: 4, borderBottom: `2px solid ${theme.border}`, alignItems: "center", overflowX: "auto" }}>
        {[{ id: "today", l: `Dnes (${todayApts.length})` }, { id: "calendar", l: "📅 Kalendář" }, { id: "pending", l: `Ke schválení (${pendingApts.length})`, alert: pendingApts.length > 0 }, { id: "all", l: "Vše" }, { id: "clients", l: `👥 Klienti (${clients.length})` }].map(t =>
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 14px", border: "none", borderBottom: `3px solid ${tab === t.id ? theme.accent : "transparent"}`, background: "none", color: tab === t.id ? theme.accent : theme.textSecondary, fontSize: 13, fontWeight: 700, cursor: "pointer", position: "relative", whiteSpace: "nowrap" }}>
            {t.l}{t.alert && <span style={{ position: "absolute", top: 6, right: 4, width: 8, height: 8, borderRadius: "50%", background: theme.danger }} />}
          </button>
        )}
        <div style={{ flex: 1 }} />
        <Btn small variant="danger" icon="alert" onClick={() => setShowAcute(true)} style={{ marginRight: 4 }}>Akut</Btn>
        <Btn small icon="search" variant="outline" onClick={() => setShowSlotFinder(true)} style={{ marginRight: 4 }}>Volné</Btn>
        <Btn icon="plus" onClick={() => setShowNew(true)}>Objednávka</Btn>
      </div>

      {tab === "clients" ? (
        <ClientRegistry clients={clients} pets={pets} setClients={setClients} setPets={setPets} />
      ) : tab === "calendar" ? (
        <CalendarView appointments={appointments} clients={clients} pets={pets} config={config} onAction={onAction} onEdit={onEdit} onSms={onSms} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(tab === "today" ? todayApts : tab === "pending" ? pendingApts : [...appointments].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)))
            .map(a => <AptRow key={a.id} apt={a} clients={clients} pets={pets} config={config} onAction={onAction} onEdit={onEdit} onSms={onSms} role="reception" />)}
          {((tab === "today" && !todayApts.length) || (tab === "pending" && !pendingApts.length)) && <div style={{ padding: 40, textAlign: "center", color: theme.textMuted }}>Žádné záznamy</div>}
        </div>
      )}

      {showNew && (
        <Modal title="Nová objednávka" onClose={() => setShowNew(false)} wide footer={<><Btn variant="ghost" onClick={() => setShowNew(false)}>Zrušit</Btn><Btn variant="success" icon="check" disabled={!canSaveNew} onClick={handleSave}>Uložit</Btn></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                <button onClick={() => setClientMode("select")} style={{ padding: "6px 14px", borderRadius: 6, border: `1.5px solid ${clientMode === "select" ? theme.accent : theme.border}`, background: clientMode === "select" ? theme.accentLight : "white", color: clientMode === "select" ? theme.accent : theme.textSecondary, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📋 Z číselníku</button>
                <button onClick={() => setClientMode("manual")} style={{ padding: "6px 14px", borderRadius: 6, border: `1.5px solid ${clientMode === "manual" ? theme.accent : theme.border}`, background: clientMode === "manual" ? theme.accentLight : "white", color: clientMode === "manual" ? theme.accent : theme.textSecondary, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✏️ Ručně</button>
              </div>
              {clientMode === "select" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Select label="Klient" required value={newApt.clientId} onChange={e => setNewApt({ ...newApt, clientId: e.target.value, petId: "" })}><option value="">— vyberte —</option>{clients.map(c => <option key={c.id} value={c.id}>{c.lastName} {c.firstName} ({c.phone})</option>)}</Select>
                  {newApt.clientId && <Select label="Zvíře" required value={newApt.petId} onChange={e => setNewApt({ ...newApt, petId: e.target.value })}><option value="">— vyberte —</option>{selPets.map(p => <option key={p.id} value={p.id}>🐾 {p.name} ({p.species})</option>)}</Select>}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, background: theme.bg, borderRadius: theme.radius }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ flex: 2 }}><Input label="Jméno klienta" required value={newApt.manualName} onChange={e => setNewApt({ ...newApt, manualName: e.target.value })} placeholder="Příjmení Jméno" /></div>
                    <div style={{ flex: 1 }}><Input label="Telefon" icon="phone" value={newApt.manualPhone} onChange={e => setNewApt({ ...newApt, manualPhone: e.target.value })} placeholder="+420..." /></div>
                  </div>
                  <Input label="Zvíře (jméno, druh)" value={newApt.manualPet} onChange={e => setNewApt({ ...newApt, manualPet: e.target.value })} placeholder="Rex, pes" />
                </div>
              )}
            </div>
            <Select label="Procedura" required value={newApt.procedureId} onChange={e => setNewApt({ ...newApt, procedureId: e.target.value, time: "" })}><option value="">— vyberte —</option>{PROCEDURES.map(p => <option key={p.id} value={p.id}>{p.name} ({p.duration}')</option>)}</Select>
            <Select label="Lékař" value={newApt.doctorId} onChange={e => setNewApt({ ...newApt, doctorId: e.target.value, time: "" })}><option value="">— kdokoliv —</option>{config.doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</Select>
            {newApt.procedureId && (
              <InlineSlotPicker config={config} appointments={appointments} procedureId={newApt.procedureId} doctorId={newApt.doctorId}
                selectedDate={newApt.date} selectedTime={newApt.time}
                onSelect={s => setNewApt({ ...newApt, date: s.date, time: s.time, doctorId: s.doctorId })} />
            )}
            {newApt.time && <div style={{ padding: 8, background: theme.successLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.success, fontWeight: 600 }}>✓ Termín: <span style={{ fontFamily: MONO }}>{newApt.date} {newApt.time}</span></div>}
            <Input label="Poznámka" textarea value={newApt.note} onChange={e => setNewApt({ ...newApt, note: e.target.value })} />
            {clientMode === "manual" && newApt.manualPhone && (
              <div style={{ padding: 8, background: theme.successLight, borderRadius: theme.radiusSm, fontSize: 12, color: theme.success }}>📱 SMS upozornění bude odesláno na <strong>{newApt.manualPhone}</strong></div>
            )}
            {clientMode === "manual" && !newApt.manualPhone && (
              <div style={{ padding: 8, background: theme.warningLight, borderRadius: theme.radiusSm, fontSize: 12, color: theme.warning }}>⚠️ Bez telefonu nebude odesláno SMS upozornění</div>
            )}
          </div>
        </Modal>
      )}

      {showAcute && <QuickAcuteModal clients={clients} pets={pets} config={config} onSave={onAddApt} onClose={() => setShowAcute(false)} />}

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
function ManagerView({ appointments, clients, pets, config, onAction, onEdit, onSms, setClients, setPets }) {
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
      <Card title={`👥 Registr klientů a zvířat (${clients.length} klientů, ${pets.length} zvířat)`}>
        <ClientRegistry clients={clients} pets={pets} setClients={setClients} setPets={setPets} />
      </Card>
    </div>
  );
}

// ════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════
export default function VetApp() {
  const [role, setRole] = useState("reception");
  const [appointments, setAppointments] = useState(DEMO_APTS);
  const [clients, setClients] = useState(DEMO_CLIENTS);
  const [pets, setPets] = useState(DEMO_PETS);
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
          role === "reception" ? <ReceptionView appointments={appointments} clients={clients} pets={pets} config={config} onAction={handleAction} onAddApt={handleAdd} onEdit={setEditApt} onSms={handleSmsOpen} setClients={setClients} setPets={setPets} /> :
          role === "doctor" ? <DoctorView appointments={appointments} clients={clients} pets={pets} config={config} onAction={handleAction} onEdit={setEditApt} onSms={handleSmsOpen} /> :
          <ManagerView appointments={appointments} clients={clients} pets={pets} config={config} onAction={handleAction} onEdit={setEditApt} onSms={handleSmsOpen} setClients={setClients} setPets={setPets} />}
      </main>

      {editApt && <EditAptModal apt={editApt} config={config} clients={clients} pets={pets} onSave={handleEditSave} onClose={() => setEditApt(null)} />}
      {smsApt && <SmsModal apt={smsApt.apt} client={smsApt.client} pets={pets} config={config} onClose={() => setSmsApt(null)} />}
      <PwaInstallBanner />
    </div>
  );
}
