import React from "react";
import { theme, FONT } from "../../utils/constants";
import Icon from "./Icon";

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

export default Input;
