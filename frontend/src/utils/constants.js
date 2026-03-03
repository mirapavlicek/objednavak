export const FONT = "'DM Sans', 'Segoe UI', system-ui, sans-serif";
export const MONO = "'JetBrains Mono', 'Fira Code', monospace";

export const theme = {
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

export const ROLES = {
  public: { label: "Veřejnost", icon: "🌐", color: "#6366f1" },
  reception: { label: "Recepce", icon: "🖥️", color: "#2563eb" },
  doctor: { label: "Lékař", icon: "🩺", color: "#059669" },
  manager: { label: "Manažer", icon: "📊", color: "#7c3aed" },
};

export const PROCEDURES = [
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

export const STATUSES = {
  pending: { label: "Čeká na schválení", color: "#d97706", bg: "#fef3c7", icon: "⏳" },
  confirmed: { label: "Potvrzeno", color: "#059669", bg: "#d1fae5", icon: "✓" },
  rejected: { label: "Zamítnuto", color: "#dc2626", bg: "#fee2e2", icon: "✕" },
  arrived: { label: "V čekárně", color: "#2563eb", bg: "#dbeafe", icon: "🏠" },
  in_progress: { label: "U lékaře", color: "#7c3aed", bg: "#ede9fe", icon: "▶" },
  completed: { label: "Dokončeno", color: "#64748b", bg: "#f1f5f9", icon: "✔" },
  no_show: { label: "Nedostavil se", color: "#dc2626", bg: "#fee2e2", icon: "✕" },
  cancelled: { label: "Zrušeno", color: "#94a3b8", bg: "#f1f5f9", icon: "✕" },
};

export const DAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
export const DAY_LABELS_CZ = { mon: "Po", tue: "Út", wed: "St", thu: "Čt", fri: "Pá", sat: "So", sun: "Ne" };
