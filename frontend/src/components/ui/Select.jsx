import React from "react";
import { theme, FONT } from "../../utils/constants";

function Select({ label, required, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}{required && <span style={{ color: theme.danger, marginLeft: 2 }}>*</span>}</label>}
      <select {...props} style={{ padding: "8px 12px", border: `1.5px solid ${theme.border}`, borderRadius: theme.radiusSm, fontSize: 14, fontFamily: FONT, background: "white", outline: "none", ...props.style }}>{children}</select>
    </div>
  );
}

export default Select;
