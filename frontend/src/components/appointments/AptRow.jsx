import { theme, FONT, MONO, PROCEDURES, STATUSES } from '../../utils/constants';
import { getToday } from '../../utils/time';
import { Icon, Btn, StatusBadge, ProcBadge } from '../ui';
import { toMin, fromMin } from '../../utils/time';

const IconBtn = ({ icon, title, color, onClick }) => (
  <button title={title} onClick={onClick} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${color}30`, borderRadius: 6, background: color + "08", color, cursor: "pointer", transition: "all 0.15s", flexShrink: 0 }}
    onMouseEnter={e => { e.currentTarget.style.background = color + "20"; }} onMouseLeave={e => { e.currentTarget.style.background = color + "08"; }}>
    <Icon name={icon} size={14} />
  </button>
);

export default function AptRow({ apt, onAction, onEdit, onSms, role = "reception" }) {
  const proc = PROCEDURES.find(p => p.id === apt.procedureId);
  const doc = apt.doctor;
  const today = getToday();
  const endTime = fromMin(toMin(apt.time) + apt.duration);
  const canEdit = role === "reception" || role === "manager";
  const canNoShow = role === "reception" && ["confirmed", "arrived"].includes(apt.status);
  const clientPhone = apt.client?.phone || apt.manualPhone;
  const canSms = (role === "reception" || role === "manager") && clientPhone;
  const displayName = apt.client ? `${apt.client.lastName} ${apt.client.firstName}` : (apt.manualName || "Neznámý");
  const displayPet = apt.pet ? apt.pet.name : (apt.manualPet || "");
  const displaySpecies = apt.pet ? apt.pet.species : "";

  return (
    <div style={{ padding: "12px 16px", borderRadius: theme.radius, border: `1.5px solid ${proc?.color || theme.border}20`, borderLeft: `4px solid ${proc?.color || theme.border}`, background: "white", boxShadow: theme.shadow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700 }}>{apt.time}–{endTime}</span>
            {proc && <ProcBadge proc={proc} />}
            <StatusBadge status={apt.status} />
            {doc && <span style={{ fontSize: 11, fontWeight: 600, color: doc.color || theme.accent, background: (doc.color || theme.accent) + "15", padding: "2px 8px", borderRadius: 12 }}>{doc.name.split(" ").pop()}</span>}
            {apt.date !== today && <span style={{ fontSize: 11, fontFamily: MONO, color: theme.textMuted, background: theme.bg, padding: "2px 6px", borderRadius: 4 }}>{apt.date}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{displayName}</span>
            {!apt.client && apt.manualName && <span style={{ fontSize: 10, color: theme.warning, fontWeight: 600, background: theme.warningLight, padding: "1px 6px", borderRadius: 4 }}>ruční</span>}
            {displayPet && <><span style={{ color: theme.textSecondary }}>—</span><span style={{ fontSize: 14, color: theme.accent, fontWeight: 600 }}>🐾 {displayPet}</span></>}
            {displaySpecies && <span style={{ fontSize: 12, color: theme.textMuted }}>({displaySpecies})</span>}
          </div>
          {apt.note && <div style={{ fontSize: 12, color: theme.textSecondary }}>📋 {apt.note}</div>}
        </div>
        {role !== "public" && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0, flexWrap: "wrap", alignItems: "center" }}>
            {role === "reception" && apt.status === "pending" && <><Btn small variant="success" icon="check" onClick={() => onAction(apt.id, "confirm")}>Potvrdit</Btn><Btn small variant="danger" icon="x" onClick={() => onAction(apt.id, "reject")}>Zamítnout</Btn></>}
            {role === "reception" && apt.status === "confirmed" && <Btn small variant="outline" icon="check" onClick={() => onAction(apt.id, "arrive")}>Přišel</Btn>}
            {(role === "reception" || role === "doctor") && apt.status === "arrived" && <Btn small variant="primary" icon="chevronRight" onClick={() => onAction(apt.id, "start")}>Převzít</Btn>}
            {(role === "reception" || role === "doctor") && apt.status === "in_progress" && <Btn small variant="success" icon="check" onClick={() => onAction(apt.id, "complete")}>Hotovo</Btn>}
            {canNoShow && <IconBtn icon="userX" title="Nedostavil se" color={theme.danger} onClick={() => onAction(apt.id, "no_show")} />}
            {canEdit && !["completed", "rejected", "no_show"].includes(apt.status) && <IconBtn icon="edit" title="Upravit" color={theme.accent} onClick={() => onEdit && onEdit(apt)} />}
            {canSms && <IconBtn icon="sms" title="Poslat SMS" color="#059669" onClick={() => onSms && onSms(apt)} />}
          </div>
        )}
      </div>
    </div>
  );
}
