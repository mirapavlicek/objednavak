import React from "react";
import { theme } from "../../utils/constants";
import Icon from "./Icon";

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

export default Modal;
