import React from "react";
import { theme, MONO } from "../../utils/constants";

function StatBox({ label, value, color, icon }) {
  return <div style={{ flex: 1, minWidth: 130, padding: "14px 18px", background: "white", borderRadius: theme.radius, border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div><div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: MONO, marginTop: 2 }}>{value}</div></div>{icon && <span style={{ fontSize: 28, opacity: 0.3 }}>{icon}</span>}</div></div>;
}

export default StatBox;
