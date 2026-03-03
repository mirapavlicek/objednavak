import React from "react";
import { FONT, MONO } from "../../utils/constants";

function ProcBadge({ proc }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600, fontFamily: FONT, color: proc.color, background: proc.color + "15", border: `1.5px solid ${proc.color}30`, borderRadius: 20, whiteSpace: "nowrap" }}>{proc.name}<span style={{ fontFamily: MONO, fontSize: 10, opacity: 0.7 }}>{proc.duration}'</span></span>;
}

export default ProcBadge;
