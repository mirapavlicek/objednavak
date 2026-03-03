import { useState } from 'react';
import { theme, PROCEDURES } from '../../utils/constants';
import { Modal, Btn, Input, Select } from '../ui';
import { createAppointment } from '../../api/appointments';
import { getToday } from '../../utils/time';

export default function QuickAcuteModal({ clients, pets, config, onSaved, onClose }) {
  const [clientId, setClientId] = useState("");
  const [petId, setPetId] = useState("");
  const [note, setNote] = useState("");
  const [withTime, setWithTime] = useState(false);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [doctorId, setDoctorId] = useState((config?.doctors || []).find(d => (d.specializations || d.specializationList || []).includes("akutni"))?.id || (config?.doctors || [])[0]?.id || "");
  const [saving, setSaving] = useState(false);
  const selPets = pets.filter(p => p.clientId === clientId);
  const today = getToday();

  const handleSave = async () => {
    const proc = PROCEDURES.find(p => p.id === "emergency");
    const now = new Date().toTimeString().slice(0, 5);
    setSaving(true);
    try {
      await createAppointment({
        client_id: clientId || null,
        pet_id: petId || null,
        procedure_id: "emergency",
        doctor_id: doctorId || null,
        date: today,
        time: withTime ? time : now,
        duration: proc?.duration || 20,
        status: "arrived",
        note: note || "Akutní příjem",
        created_by: "reception",
        arrival_time: now,
      });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Chyba');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="🚨 Akutní příjem" subtitle="Rychlé zařazení pacienta — rovnou do čekárny" onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>Zrušit</Btn><Btn variant="danger" icon="alert" disabled={!clientId || !petId || saving} onClick={handleSave}>{saving ? 'Ukládám...' : 'Akutní příjem → Čekárna'}</Btn></>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ padding: 12, background: theme.dangerLight, borderRadius: theme.radius, fontSize: 13, color: theme.danger, fontWeight: 600 }}>
          Pacient bude zařazen rovnou do čekárny se stavem „Přišel"
        </div>
        <Select label="Klient" required value={clientId} onChange={e => { setClientId(e.target.value); setPetId(""); }}>
          <option value="">— vyberte —</option>{clients.map(c => <option key={c.id} value={c.id}>{c.lastName} {c.firstName} ({c.phone})</option>)}
        </Select>
        {clientId && <Select label="Zvíře" required value={petId} onChange={e => setPetId(e.target.value)}>
          <option value="">— vyberte —</option>{selPets.map(p => <option key={p.id} value={p.id}>🐾 {p.name} ({p.species})</option>)}
        </Select>}
        <Select label="Lékař" value={doctorId} onChange={e => setDoctorId(e.target.value)}>
          {(config?.doctors || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={withTime} onChange={e => setWithTime(e.target.checked)} /> Zadat konkrétní čas (nepovinné)
        </label>
        {withTime && <Input label="Čas" type="time" value={time} onChange={e => setTime(e.target.value)} style={{ width: 140 }} />}
        <Input label="Poznámka" textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Důvod akutního příjmu..." />
      </div>
    </Modal>
  );
}
