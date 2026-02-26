import { useState, useEffect, useRef } from "react";

const SLOT_TYPES = {
  A1: {
    id: "A1",
    label: "Obecný slot",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    durations: [10, 20, 30, 40, 50, 60],
    requiresReason: true,
  },
  A2_OCKO: {
    id: "A2_OCKO",
    label: "Očkování",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    durations: [10, 20],
    defaultDuration: 10,
    category: "A2",
    nursePrep: 40,
  },
  A2_KO: {
    id: "A2_KO",
    label: "Krevní obraz",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    durations: [10, 20],
    defaultDuration: 10,
    category: "A2",
    nursePrep: 40,
  },
  A2_VISIT: {
    id: "A2_VISIT",
    label: "1. návštěva",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    durations: [20, 40],
    defaultDuration: 20,
    category: "A2",
    nursePrep: 40,
  },
  A2_KONZULT: {
    id: "A2_KONZULT",
    label: "Konzultace",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    durations: [20, 40],
    defaultDuration: 20,
    category: "A2",
    nursePrep: 40,
  },
  A2_USG: {
    id: "A2_USG",
    label: "Ultrazvuk",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    durations: [20, 40],
    defaultDuration: 20,
    category: "A2",
    nursePrep: 40,
  },
  OPER: {
    id: "OPER",
    label: "Operace",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#86efac",
    durations: [30, 60, 90, 120],
    defaultDuration: 60,
    requiresReason: true,
    requiresResources: true,
  },
  AKUT: {
    id: "AKUT",
    label: "Akutní příjem",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fca5a5",
    durations: [10, 20, 30, 40],
    defaultDuration: 20,
    requiresReason: true,
    isAcute: true,
  },
};

const FACILITIES = ["CA", "FE"];

const HOURS = Array.from({ length: 10 }, (_, i) => i + 7); // 7:00 - 16:00

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatTime = (hour, minute) =>
  `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

// ─── DEMO DATA ───
const DEMO_APPOINTMENTS = [
  {
    id: generateId(),
    patient: { firstName: "Jana", lastName: "Nováková", phone: "602111222" },
    type: SLOT_TYPES.A2_VISIT,
    duration: 20,
    date: new Date().toISOString().split("T")[0],
    time: "08:00",
    facility: "CA",
    reason: "Nový pacient, bolest zad",
    status: "confirmed",
  },
  {
    id: generateId(),
    patient: { firstName: "Petr", lastName: "Dvořák", phone: "603222333" },
    type: SLOT_TYPES.A2_KO,
    duration: 10,
    date: new Date().toISOString().split("T")[0],
    time: "08:30",
    facility: "CA",
    reason: "Kontrolní KO",
    status: "confirmed",
  },
  {
    id: generateId(),
    patient: { firstName: "Marie", lastName: "Svobodová", phone: "604333444" },
    type: SLOT_TYPES.A2_USG,
    duration: 20,
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    facility: "CA",
    reason: "USG břicha",
    status: "confirmed",
  },
  {
    id: generateId(),
    patient: { firstName: "Tomáš", lastName: "Černý", phone: "605444555" },
    type: SLOT_TYPES.OPER,
    duration: 90,
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    facility: "FE",
    reason: "Artroskopie kolene",
    status: "confirmed",
  },
  {
    id: generateId(),
    patient: { firstName: "Eva", lastName: "Krejčí", phone: "606555666" },
    type: SLOT_TYPES.AKUT,
    duration: 20,
    date: new Date().toISOString().split("T")[0],
    time: "09:15",
    facility: "CA",
    reason: "Akutní bolest na hrudi",
    status: "in-progress",
    arrivalTime: "09:12",
  },
];

// ─── ICONS ───
const Icons = {
  Calendar: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Phone: () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Alert: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  X: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Extend: () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <polyline points="15 3 21 3 21 9" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  List: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Grid: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
};

// ─── STYLE CONSTANTS ───
const FONT = `'DM Sans', 'Segoe UI', system-ui, sans-serif`;
const MONO = `'JetBrains Mono', 'Fira Code', monospace`;

const theme = {
  bg: "#f8f9fb",
  surface: "#ffffff",
  surfaceHover: "#f1f5f9",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  text: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  accent: "#2563eb",
  accentLight: "#dbeafe",
  danger: "#dc2626",
  dangerLight: "#fee2e2",
  success: "#059669",
  successLight: "#d1fae5",
  warning: "#d97706",
  warningLight: "#fef3c7",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
  shadowLg: "0 10px 25px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)",
  radius: "10px",
  radiusSm: "6px",
  radiusLg: "14px",
};

// ─── APPOINTMENT BADGE ───
function TypeBadge({ type, small }) {
  const t = typeof type === "string" ? SLOT_TYPES[type] : type;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: small ? "2px 8px" : "3px 10px",
        fontSize: small ? 11 : 12,
        fontWeight: 600,
        fontFamily: MONO,
        letterSpacing: "0.02em",
        color: t.color,
        background: t.bg,
        border: `1.5px solid ${t.border}`,
        borderRadius: 20,
        whiteSpace: "nowrap",
      }}
    >
      {t.isAcute && (
        <span style={{ display: "flex", color: t.color }}>
          <Icons.Alert />
        </span>
      )}
      {t.label}
    </span>
  );
}

// ─── DURATION PICKER ───
function DurationPicker({ durations, value, onChange, color }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {durations.map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          style={{
            width: 52,
            height: 36,
            border: `2px solid ${value === d ? color : theme.border}`,
            borderRadius: theme.radiusSm,
            background: value === d ? color : "white",
            color: value === d ? "white" : theme.text,
            fontFamily: MONO,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {d}'
        </button>
      ))}
    </div>
  );
}

// ─── INPUT COMPONENT ───
function Input({ label, required, icon, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && (
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: theme.textSecondary,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontFamily: FONT,
          }}
        >
          {label}
          {required && (
            <span style={{ color: theme.danger, marginLeft: 2 }}>*</span>
          )}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: theme.textMuted,
              display: "flex",
            }}
          >
            {icon}
          </span>
        )}
        <input
          {...props}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: icon ? "8px 12px 8px 34px" : "8px 12px",
            border: `1.5px solid ${theme.border}`,
            borderRadius: theme.radiusSm,
            fontSize: 14,
            fontFamily: FONT,
            color: theme.text,
            outline: "none",
            transition: "border-color 0.15s",
            background: "white",
            ...props.style,
          }}
          onFocus={(e) => (e.target.style.borderColor = theme.accent)}
          onBlur={(e) => (e.target.style.borderColor = theme.border)}
        />
      </div>
    </div>
  );
}

// ─── BOOKING MODAL ───
function BookingModal({ onClose, onSave, existingAppointments, selectedDate }) {
  const [step, setStep] = useState(1);
  const [patient, setPatient] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [selectedType, setSelectedType] = useState(null);
  const [duration, setDuration] = useState(null);
  const [facility, setFacility] = useState("CA");
  const [reason, setReason] = useState("");
  const [time, setTime] = useState("08:00");

  const typeGroups = [
    {
      label: "A1 — Obecný slot",
      desc: "Volný slot pro libovolný účel",
      types: [SLOT_TYPES.A1],
    },
    {
      label: "A2 — Předdefinované",
      desc: "Sestra připraví pacienta (40 min)",
      types: [
        SLOT_TYPES.A2_OCKO,
        SLOT_TYPES.A2_KO,
        SLOT_TYPES.A2_VISIT,
        SLOT_TYPES.A2_KONZULT,
        SLOT_TYPES.A2_USG,
      ],
    },
    {
      label: "Operace",
      desc: "Vyžaduje sál a anestezii",
      types: [SLOT_TYPES.OPER],
    },
    {
      label: "B — Akutní příjem",
      desc: "Řazeno podle času příchodu",
      types: [SLOT_TYPES.AKUT],
    },
  ];

  const handleSelectType = (t) => {
    setSelectedType(t);
    setDuration(t.defaultDuration || t.durations[0]);
    if (t.isAcute) {
      const now = new Date();
      setTime(formatTime(now.getHours(), now.getMinutes()));
    }
  };

  const handleSave = () => {
    const apt = {
      id: generateId(),
      patient,
      type: selectedType,
      duration,
      date: selectedDate,
      time,
      facility,
      reason,
      status: selectedType.isAcute ? "in-progress" : "confirmed",
      ...(selectedType.isAcute && { arrivalTime: time }),
    };
    onSave(apt);
    onClose();
  };

  const isValid =
    patient.lastName &&
    patient.firstName &&
    selectedType &&
    duration &&
    time;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15,23,42,0.4)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: theme.radiusLg,
          width: "min(560px, 95vw)",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: theme.shadowLg,
          animation: "slideUp 0.25s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 24px",
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                fontFamily: FONT,
                color: theme.text,
              }}
            >
              Nová objednávka
            </h2>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 13,
                color: theme.textSecondary,
                fontFamily: FONT,
              }}
            >
              Krok {step} ze 3 — {step === 1 ? "Pacient" : step === 2 ? "Typ návštěvy" : "Čas a potvrzení"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: theme.textMuted,
              padding: 4,
              display: "flex",
            }}
          >
            <Icons.X />
          </button>
        </div>

        {/* Step Indicator */}
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "0 24px",
            paddingTop: 16,
          }}
        >
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: s <= step ? theme.accent : theme.borderLight,
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: "20px 24px" }}>
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <Input
                    label="Příjmení"
                    required
                    icon={<Icons.User />}
                    value={patient.lastName}
                    onChange={(e) =>
                      setPatient({ ...patient, lastName: e.target.value })
                    }
                    placeholder="Nováková"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Input
                    label="Jméno"
                    required
                    icon={<Icons.User />}
                    value={patient.firstName}
                    onChange={(e) =>
                      setPatient({ ...patient, firstName: e.target.value })
                    }
                    placeholder="Jana"
                  />
                </div>
              </div>
              <Input
                label="Telefon"
                icon={<Icons.Phone />}
                value={patient.phone}
                onChange={(e) =>
                  setPatient({ ...patient, phone: e.target.value })
                }
                placeholder="+420 602 123 456"
                type="tel"
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: theme.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Pracoviště
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {FACILITIES.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFacility(f)}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        border: `2px solid ${facility === f ? theme.accent : theme.border}`,
                        borderRadius: theme.radiusSm,
                        background: facility === f ? theme.accentLight : "white",
                        color: facility === f ? theme.accent : theme.textSecondary,
                        fontFamily: MONO,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {typeGroups.map((group) => (
                <div key={group.label}>
                  <div style={{ marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: theme.text,
                        fontFamily: FONT,
                      }}
                    >
                      {group.label}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: theme.textMuted,
                        marginLeft: 8,
                      }}
                    >
                      {group.desc}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {group.types.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleSelectType(t)}
                        style={{
                          padding: "8px 16px",
                          border: `2px solid ${selectedType?.id === t.id ? t.color : theme.border}`,
                          borderRadius: theme.radiusSm,
                          background:
                            selectedType?.id === t.id ? t.bg : "white",
                          color:
                            selectedType?.id === t.id
                              ? t.color
                              : theme.textSecondary,
                          fontFamily: FONT,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {t.isAcute && <Icons.Alert />}
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {selectedType && (
                <div
                  style={{
                    padding: 16,
                    background: selectedType.bg,
                    borderRadius: theme.radius,
                    border: `1.5px solid ${selectedType.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: selectedType.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 8,
                    }}
                  >
                    Délka návštěvy
                  </div>
                  <DurationPicker
                    durations={selectedType.durations}
                    value={duration}
                    onChange={setDuration}
                    color={selectedType.color}
                  />
                  {selectedType.category === "A2" && (
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        color: selectedType.color,
                        fontFamily: FONT,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Icons.Clock />
                      Výchozí: {selectedType.defaultDuration}' — klikem
                      prodloužíte na {selectedType.durations[1]}'
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <Input
                    label="Čas"
                    required
                    icon={<Icons.Clock />}
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    min="07:00"
                    max="16:00"
                    step="600"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: theme.textSecondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 4,
                    }}
                  >
                    Délka
                  </div>
                  <div
                    style={{
                      padding: "8px 12px",
                      background: selectedType?.bg,
                      borderRadius: theme.radiusSm,
                      border: `1.5px solid ${selectedType?.border}`,
                      fontFamily: MONO,
                      fontSize: 14,
                      fontWeight: 700,
                      color: selectedType?.color,
                    }}
                  >
                    {duration} minut
                  </div>
                </div>
              </div>

              <Input
                label="Důvod / CO?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Důvod návštěvy..."
                required={selectedType?.requiresReason}
              />

              {selectedType?.isAcute && (
                <div
                  style={{
                    padding: 14,
                    background: theme.dangerLight,
                    borderRadius: theme.radiusSm,
                    border: `1.5px solid ${SLOT_TYPES.AKUT.border}`,
                    fontSize: 13,
                    color: theme.danger,
                    fontFamily: FONT,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Icons.Alert />
                  Akutní příjem — řazeno podle času příchodu, ne podle objednání
                </div>
              )}

              {/* Summary */}
              <div
                style={{
                  padding: 16,
                  background: theme.bg,
                  borderRadius: theme.radius,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: theme.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 10,
                  }}
                >
                  Souhrn objednávky
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: "6px 16px",
                    fontSize: 14,
                    fontFamily: FONT,
                  }}
                >
                  <span style={{ color: theme.textMuted }}>Pacient:</span>
                  <span style={{ fontWeight: 600 }}>
                    {patient.lastName} {patient.firstName}
                  </span>
                  <span style={{ color: theme.textMuted }}>Typ:</span>
                  <span>
                    <TypeBadge type={selectedType} small />
                  </span>
                  <span style={{ color: theme.textMuted }}>Čas:</span>
                  <span style={{ fontFamily: MONO, fontWeight: 600 }}>
                    {time} ({duration}')
                  </span>
                  <span style={{ color: theme.textMuted }}>Pracoviště:</span>
                  <span style={{ fontFamily: MONO, fontWeight: 600 }}>
                    {facility}
                  </span>
                  {reason && (
                    <>
                      <span style={{ color: theme.textMuted }}>Důvod:</span>
                      <span>{reason}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderTop: `1px solid ${theme.border}`,
          }}
        >
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
            style={{
              padding: "9px 20px",
              border: `1.5px solid ${theme.border}`,
              borderRadius: theme.radiusSm,
              background: "white",
              color: theme.textSecondary,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: FONT,
              cursor: "pointer",
            }}
          >
            {step > 1 ? "← Zpět" : "Zrušit"}
          </button>
          <button
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else handleSave();
            }}
            disabled={
              (step === 1 && (!patient.lastName || !patient.firstName)) ||
              (step === 2 && !selectedType)
            }
            style={{
              padding: "9px 24px",
              border: "none",
              borderRadius: theme.radiusSm,
              background:
                (step === 1 && (!patient.lastName || !patient.firstName)) ||
                (step === 2 && !selectedType)
                  ? theme.border
                  : step === 3
                    ? theme.success
                    : theme.accent,
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: FONT,
              cursor:
                (step === 1 && (!patient.lastName || !patient.firstName)) ||
                (step === 2 && !selectedType)
                  ? "not-allowed"
                  : "pointer",
              transition: "background 0.15s",
            }}
          >
            {step === 3 ? "✓ Potvrdit" : "Další →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── APPOINTMENT CARD ───
function AppointmentCard({ apt, onExtend, compact }) {
  const t = apt.type;
  const endMinutes =
    parseInt(apt.time.split(":")[0]) * 60 +
    parseInt(apt.time.split(":")[1]) +
    apt.duration;
  const endTime = formatTime(
    Math.floor(endMinutes / 60),
    endMinutes % 60
  );

  return (
    <div
      style={{
        padding: compact ? "8px 12px" : "12px 16px",
        background: "white",
        borderRadius: theme.radius,
        border: `1.5px solid ${t.border}`,
        borderLeft: `4px solid ${t.color}`,
        boxShadow: theme.shadow,
        transition: "all 0.15s",
        cursor: "default",
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: compact ? 12 : 14,
                fontWeight: 700,
                color: theme.text,
              }}
            >
              {apt.time}–{endTime}
            </span>
            <TypeBadge type={t} small />
          </div>
          <div
            style={{
              fontSize: compact ? 13 : 15,
              fontWeight: 600,
              color: theme.text,
              fontFamily: FONT,
            }}
          >
            {apt.patient.lastName} {apt.patient.firstName}
          </div>
          {apt.reason && !compact && (
            <div
              style={{
                fontSize: 12,
                color: theme.textSecondary,
                marginTop: 2,
              }}
            >
              {apt.reason}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {t.category === "A2" && apt.duration === t.durations[0] && (
            <button
              onClick={() => onExtend(apt.id)}
              title="Prodloužit"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 8px",
                border: `1.5px solid ${theme.border}`,
                borderRadius: theme.radiusSm,
                background: "white",
                color: theme.textSecondary,
                fontSize: 11,
                fontFamily: MONO,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <Icons.Extend />
              {t.durations[1]}'
            </button>
          )}
          <span
            style={{
              padding: "4px 8px",
              borderRadius: theme.radiusSm,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: MONO,
              background:
                apt.status === "confirmed"
                  ? theme.successLight
                  : apt.status === "in-progress"
                    ? theme.warningLight
                    : theme.bg,
              color:
                apt.status === "confirmed"
                  ? theme.success
                  : apt.status === "in-progress"
                    ? theme.warning
                    : theme.textMuted,
            }}
          >
            {apt.status === "confirmed"
              ? "✓"
              : apt.status === "in-progress"
                ? "▶"
                : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── TIMELINE VIEW ───
function TimelineView({ appointments, onExtend }) {
  const pixelsPerMinute = 2.2;
  const startHour = 7;

  return (
    <div style={{ position: "relative", overflow: "auto" }}>
      <div style={{ display: "flex", minHeight: 600 }}>
        {/* Time labels */}
        <div style={{ width: 56, flexShrink: 0, position: "relative" }}>
          {HOURS.map((h) => (
            <div
              key={h}
              style={{
                position: "absolute",
                top: (h - startHour) * 60 * pixelsPerMinute - 8,
                right: 8,
                fontSize: 12,
                fontFamily: MONO,
                fontWeight: 600,
                color: theme.textMuted,
              }}
            >
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Grid + appointments */}
        <div style={{ flex: 1, position: "relative" }}>
          {/* Hour lines */}
          {HOURS.map((h) => (
            <div
              key={h}
              style={{
                position: "absolute",
                top: (h - startHour) * 60 * pixelsPerMinute,
                left: 0,
                right: 0,
                height: 1,
                background: theme.borderLight,
              }}
            />
          ))}

          {/* Half-hour lines */}
          {HOURS.map((h) => (
            <div
              key={`${h}-30`}
              style={{
                position: "absolute",
                top: (h - startHour) * 60 * pixelsPerMinute + 30 * pixelsPerMinute,
                left: 0,
                right: 0,
                height: 1,
                background: theme.borderLight,
                opacity: 0.5,
              }}
            />
          ))}

          {/* Current time marker */}
          {(() => {
            const now = new Date();
            const mins = now.getHours() * 60 + now.getMinutes();
            const startMins = startHour * 60;
            if (mins >= startMins && mins <= 17 * 60) {
              return (
                <div
                  style={{
                    position: "absolute",
                    top: (mins - startMins) * pixelsPerMinute,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: theme.danger,
                    zIndex: 10,
                    opacity: 0.7,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: -4,
                      top: -4,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: theme.danger,
                    }}
                  />
                </div>
              );
            }
            return null;
          })()}

          {/* Appointment blocks */}
          {appointments.map((apt, idx) => {
            const [h, m] = apt.time.split(":").map(Number);
            const startMin = h * 60 + m - startHour * 60;
            const t = apt.type;
            return (
              <div
                key={apt.id}
                style={{
                  position: "absolute",
                  top: startMin * pixelsPerMinute,
                  left: 8 + (idx % 2) * 4,
                  right: 8,
                  height: apt.duration * pixelsPerMinute - 2,
                  background: t.bg,
                  border: `1.5px solid ${t.border}`,
                  borderLeft: `4px solid ${t.color}`,
                  borderRadius: theme.radiusSm,
                  padding: "4px 10px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "transform 0.1s, box-shadow 0.1s",
                  zIndex: 5,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.01)";
                  e.currentTarget.style.boxShadow = theme.shadowMd;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      fontWeight: 700,
                      color: t.color,
                    }}
                  >
                    {apt.time}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: theme.text,
                    }}
                  >
                    {apt.patient.lastName}
                  </span>
                  <TypeBadge type={t} small />
                </div>
                {apt.duration >= 30 && apt.reason && (
                  <div
                    style={{
                      fontSize: 11,
                      color: theme.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    {apt.reason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ACUTE QUEUE ───
function AcuteQueue({ appointments }) {
  const acuteApts = appointments
    .filter((a) => a.type.isAcute)
    .sort((a, b) => a.arrivalTime?.localeCompare(b.arrivalTime));

  if (acuteApts.length === 0) return null;

  return (
    <div
      style={{
        background: theme.dangerLight,
        borderRadius: theme.radius,
        border: `1.5px solid ${SLOT_TYPES.AKUT.border}`,
        padding: "12px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          fontSize: 13,
          fontWeight: 700,
          color: theme.danger,
          fontFamily: FONT,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        <Icons.Alert />
        Akutní fronta — řazeno podle času příchodu
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {acuteApts.map((apt, i) => (
          <div
            key={apt.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 12px",
              background: "white",
              borderRadius: theme.radiusSm,
              border: `1px solid ${SLOT_TYPES.AKUT.border}`,
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: theme.danger,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: MONO,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 13,
                fontWeight: 700,
                color: theme.danger,
                flexShrink: 0,
              }}
            >
              {apt.arrivalTime}
            </span>
            <span
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: theme.text,
                fontFamily: FONT,
              }}
            >
              {apt.patient.lastName} {apt.patient.firstName}
            </span>
            <span
              style={{
                fontSize: 12,
                color: theme.textSecondary,
                flex: 1,
              }}
            >
              {apt.reason}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 12,
                fontWeight: 600,
                color: theme.textMuted,
              }}
            >
              {apt.duration}'
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STATS BAR ───
function StatsBar({ appointments }) {
  const total = appointments.length;
  const totalMinutes = appointments.reduce((s, a) => s + a.duration, 0);
  const acute = appointments.filter((a) => a.type.isAcute).length;
  const oper = appointments.filter((a) => a.type.id === "OPER").length;

  const stats = [
    { label: "Objednávky", value: total, color: theme.accent },
    {
      label: "Obsazeno",
      value: `${Math.round((totalMinutes / 540) * 100)}%`,
      color: theme.success,
    },
    { label: "Akutní", value: acute, color: theme.danger },
    { label: "Operace", value: oper, color: "#16a34a" },
  ];

  return (
    <div style={{ display: "flex", gap: 12 }}>
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "white",
            borderRadius: theme.radius,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: theme.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontFamily: FONT,
            }}
          >
            {s.label}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: s.color,
              fontFamily: MONO,
              marginTop: 2,
            }}
          >
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ───
export default function ObjednavkaApp() {
  const [appointments, setAppointments] = useState(DEMO_APPOINTMENTS);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // list | timeline
  const [selectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedFacility, setSelectedFacility] = useState("all");

  const filteredApts = appointments
    .filter((a) => a.date === selectedDate)
    .filter(
      (a) => selectedFacility === "all" || a.facility === selectedFacility
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleExtend = (id) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id && a.type.category === "A2") {
          return { ...a, duration: a.type.durations[1] };
        }
        return a;
      })
    );
  };

  const handleSave = (apt) => {
    setAppointments((prev) => [...prev, apt]);
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString("cs-CZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        fontFamily: FONT,
        color: theme.text,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
        
        * { box-sizing: border-box; margin: 0; }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <header
        style={{
          background: "white",
          borderBottom: `1px solid ${theme.border}`,
          padding: "14px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: theme.shadow,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${theme.accent}, #7c3aed)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            FN
          </div>
          <div>
            <h1
              style={{
                fontSize: 17,
                fontWeight: 800,
                fontFamily: FONT,
                letterSpacing: "-0.02em",
              }}
            >
              Objednávací systém
            </h1>
            <div
              style={{
                fontSize: 12,
                color: theme.textSecondary,
                fontFamily: FONT,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Icons.Calendar />
              {dateStr}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Facility filter */}
          <div
            style={{
              display: "flex",
              border: `1.5px solid ${theme.border}`,
              borderRadius: theme.radiusSm,
              overflow: "hidden",
            }}
          >
            {["all", ...FACILITIES].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFacility(f)}
                style={{
                  padding: "6px 14px",
                  border: "none",
                  background:
                    selectedFacility === f ? theme.accent : "white",
                  color: selectedFacility === f ? "white" : theme.textSecondary,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: MONO,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {f === "all" ? "VŠE" : f}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div
            style={{
              display: "flex",
              border: `1.5px solid ${theme.border}`,
              borderRadius: theme.radiusSm,
              overflow: "hidden",
            }}
          >
            {[
              { id: "list", icon: <Icons.List /> },
              { id: "timeline", icon: <Icons.Grid /> },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                style={{
                  padding: "6px 10px",
                  border: "none",
                  background:
                    viewMode === v.id ? theme.accent : "white",
                  color: viewMode === v.id ? "white" : theme.textSecondary,
                  cursor: "pointer",
                  display: "flex",
                  transition: "all 0.15s",
                }}
              >
                {v.icon}
              </button>
            ))}
          </div>

          {/* New appointment */}
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 18px",
              border: "none",
              borderRadius: theme.radiusSm,
              background: theme.accent,
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: FONT,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#1d4ed8")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = theme.accent)
            }
          >
            <Icons.Plus />
            Nová objednávka
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ padding: "20px 28px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Stats */}
        <StatsBar appointments={filteredApts} />

        {/* Acute queue */}
        <div style={{ marginTop: 16 }}>
          <AcuteQueue appointments={filteredApts} />
        </div>

        {/* Content */}
        <div style={{ marginTop: 16 }}>
          {viewMode === "list" ? (
            <div
              style={{
                background: "white",
                borderRadius: theme.radiusLg,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: `1px solid ${theme.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: FONT,
                  }}
                >
                  Denní přehled
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: theme.textMuted,
                    fontFamily: MONO,
                  }}
                >
                  {filteredApts.filter((a) => !a.type.isAcute).length}{" "}
                  objednávek
                </span>
              </div>
              <div
                style={{
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {filteredApts
                  .filter((a) => !a.type.isAcute)
                  .map((apt) => (
                    <AppointmentCard
                      key={apt.id}
                      apt={apt}
                      onExtend={handleExtend}
                    />
                  ))}
                {filteredApts.filter((a) => !a.type.isAcute).length === 0 && (
                  <div
                    style={{
                      padding: 40,
                      textAlign: "center",
                      color: theme.textMuted,
                      fontSize: 14,
                    }}
                  >
                    Žádné objednávky pro tento den
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "white",
                borderRadius: theme.radiusLg,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
                padding: "12px 0 12px 0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "4px 20px 12px",
                  borderBottom: `1px solid ${theme.border}`,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: FONT,
                }}
              >
                Časová osa
              </div>
              <div style={{ padding: "8px 12px", overflowX: "auto" }}>
                <TimelineView
                  appointments={filteredApts.filter((a) => !a.type.isAcute)}
                  onExtend={handleExtend}
                />
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div
          style={{
            marginTop: 16,
            padding: "12px 20px",
            background: "white",
            borderRadius: theme.radius,
            border: `1px solid ${theme.border}`,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: theme.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginRight: 4,
            }}
          >
            Typy:
          </span>
          <TypeBadge type={SLOT_TYPES.A1} small />
          <TypeBadge type={SLOT_TYPES.A2_VISIT} small />
          <TypeBadge type={SLOT_TYPES.OPER} small />
          <TypeBadge type={SLOT_TYPES.AKUT} small />
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <BookingModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          existingAppointments={filteredApts}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
