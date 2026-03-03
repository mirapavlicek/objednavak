import React from "react";
import { theme, FONT } from "../../utils/constants";
import Icon from "./Icon";

function Btn({ children, variant = "primary", small, icon, disabled, ...props }) {
  const styles = { primary: { bg: theme.accent, c: "white", b: "none" }, danger: { bg: theme.danger, c: "white", b: "none" }, success: { bg: theme.success, c: "white", b: "none" }, ghost: { bg: "transparent", c: theme.textSecondary, b: `1.5px solid ${theme.border}` }, outline: { bg: "white", c: theme.accent, b: `1.5px solid ${theme.accent}` } };
  const st = styles[variant];
  return <button disabled={disabled} {...props} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: small ? "5px 12px" : "8px 18px", background: disabled ? theme.border : st.bg, color: disabled ? theme.textMuted : st.c, border: st.b, borderRadius: theme.radiusSm, fontSize: small ? 12 : 14, fontWeight: 600, fontFamily: FONT, cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s", ...props.style }}>{icon && <Icon name={icon} size={small ? 14 : 16} />}{children}</button>;
}

export default Btn;
