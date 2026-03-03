import React from "react";
import { theme } from "../../utils/constants";

function Card({ children, title, action, accent, noPad, style: sx }) {
  return (
    <div style={{ background: "white", borderRadius: theme.radiusLg, border: `1px solid ${theme.border}`, borderTop: accent ? `3px solid ${accent}` : undefined, boxShadow: theme.shadow, overflow: "hidden", ...sx }}>
      {title && <div style={{ padding: "14px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 14, fontWeight: 700 }}>{title}</span>{action}</div>}
      {!noPad ? <div style={{ padding: "16px 20px" }}>{children}</div> : children}
    </div>
  );
}

export default Card;
