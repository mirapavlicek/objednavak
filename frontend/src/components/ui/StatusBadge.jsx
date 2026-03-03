import React from "react";
import { STATUSES, MONO } from "../../utils/constants";

function StatusBadge({ status }) {
  const s = STATUSES[status]; if (!s) return null;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600, fontFamily: MONO, color: s.color, background: s.bg, border: `1.5px solid ${s.color}20`, borderRadius: 20, whiteSpace: "nowrap" }}><span style={{ fontSize: 10 }}>{s.icon}</span>{s.label}</span>;
}

export default StatusBadge;
