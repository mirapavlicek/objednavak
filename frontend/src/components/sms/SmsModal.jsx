import { useState } from 'react';
import { theme, PROCEDURES, MONO, FONT } from '../../utils/constants';
import { Modal, Btn, Input } from '../ui';
import { sendSms } from '../../api/sms';

const SMS_TEMPLATES = [
  { id: "confirm", label: "Potvrzení termínu", text: (apt, pet, proc) => `Potvrzujeme Vaši objednávku ${proc?.name || ""} pro ${pet?.name || apt?.manualPet || ""} dne ${apt.date} v ${apt.time}. Veterinární klinika VetBook.` },
  { id: "reminder", label: "Připomínka termínu", text: (apt, pet, proc) => `Připomínáme termín ${proc?.name || ""} pro ${pet?.name || apt?.manualPet || ""} zítra ${apt.date} v ${apt.time}. Veterinární klinika VetBook.` },
  { id: "cancel", label: "Zrušení termínu", text: (apt, pet, proc) => `Váš termín ${apt.date} v ${apt.time} pro ${pet?.name || apt?.manualPet || ""} byl zrušen. Kontaktujte nás pro nový termín. VetBook.` },
  { id: "ready", label: "Výsledky připraveny", text: (apt, pet) => `Výsledky vyšetření pro ${pet?.name || apt?.manualPet || ""} jsou připraveny k vyzvednutí. Veterinární klinika VetBook.` },
  { id: "custom", label: "Vlastní zpráva", text: () => "" },
];

export default function SmsModal({ apt, client, onClose }) {
  const pet = apt.pet;
  const proc = PROCEDURES.find(p => p.id === apt.procedureId);
  const [templateId, setTemplateId] = useState("confirm");
  const tmpl = SMS_TEMPLATES.find(t => t.id === templateId);
  const [text, setText] = useState(tmpl.text(apt, pet, proc));
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const phone = client?.phone || apt.manualPhone || '';

  const handleTemplateChange = (id) => {
    setTemplateId(id);
    const t = SMS_TEMPLATES.find(tt => tt.id === id);
    setText(t.text(apt, pet, proc));
  };

  const handleSend = async () => {
    if (!phone) { alert("Klient nemá telefonní číslo"); return; }
    setSending(true);
    try {
      await sendSms({ to: phone, body: text, appointmentId: apt.id, template: templateId });
      setResult({ ok: true });
    } catch (err) {
      setResult({ ok: false, error: err.response?.data?.message || err.message });
    }
    setSending(false);
  };

  const clientName = client ? `${client.firstName} ${client.lastName}` : (apt.manualName || '');

  return (
    <Modal title="📱 Odeslat SMS" subtitle={`${clientName} — ${phone}`} onClose={onClose}
      footer={!result ? <><Btn variant="ghost" onClick={onClose}>Zrušit</Btn><Btn variant="success" icon="send" disabled={!text || sending} onClick={handleSend}>{sending ? "Odesílám..." : "Odeslat SMS"}</Btn></> : <Btn onClick={onClose}>Zavřít</Btn>}>
      {result ? (
        <div style={{ padding: 20, textAlign: "center" }}>
          {result.ok ? (
            <><div style={{ fontSize: 40, marginBottom: 8 }}>✅</div><div style={{ fontWeight: 700, color: theme.success }}>SMS odeslána!</div></>
          ) : (
            <><div style={{ fontSize: 40, marginBottom: 8 }}>❌</div><div style={{ fontWeight: 700, color: theme.danger }}>Chyba při odesílání</div><div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{result.error}</div></>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>Šablona</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SMS_TEMPLATES.map(t => (
                <button key={t.id} onClick={() => handleTemplateChange(t.id)} style={{ padding: "5px 12px", borderRadius: 16, border: `1.5px solid ${templateId === t.id ? theme.accent : theme.border}`, background: templateId === t.id ? theme.accentLight : "white", color: templateId === t.id ? theme.accent : theme.textSecondary, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t.label}</button>
              ))}
            </div>
          </div>
          <Input label={`Zpráva (${text.length}/160 znaků)`} textarea value={text} onChange={e => setText(e.target.value)} style={{ minHeight: 100 }} />
          <div style={{ padding: 10, background: theme.bg, borderRadius: theme.radiusSm, fontSize: 12, color: theme.textMuted }}>
            📱 Příjemce: <strong>{phone}</strong> — Brána: <strong>SmsManager.cz</strong>
            {text.length > 160 && <span style={{ color: theme.warning, marginLeft: 8 }}>⚠️ Zpráva přesahuje 160 znaků</span>}
          </div>
        </div>
      )}
    </Modal>
  );
}
