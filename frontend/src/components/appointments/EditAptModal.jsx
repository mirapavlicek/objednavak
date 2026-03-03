import { useState } from 'react';
import { theme, PROCEDURES, STATUSES, FONT, MONO } from '../../utils/constants';
import { Modal, Btn, Input, Select } from '../ui';
import { updateAppointment } from '../../api/appointments';

export default function EditAptModal({ apt, config, clients, pets, onSaved, onClose }) {
  const [form, setForm] = useState({
    clientId: apt.clientId || '',
    petId: apt.petId || '',
    manualName: apt.manualName || '',
    manualPhone: apt.manualPhone || '',
    manualPet: apt.manualPet || '',
    procedureId: apt.procedureId || '',
    doctorId: apt.doctorId || '',
    date: apt.date || '',
    time: apt.time || '',
    duration: apt.duration || 20,
    status: apt.status || 'pending',
    note: apt.note || '',
  });
  const [saving, setSaving] = useState(false);
  const isManual = !form.clientId;
  const selPets = pets.filter(p => p.clientId === form.clientId);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAppointment(apt.id, {
        client_id: form.clientId || null,
        pet_id: form.petId || null,
        manual_name: form.manualName,
        manual_phone: form.manualPhone,
        manual_pet: form.manualPet,
        procedure_id: form.procedureId,
        doctor_id: form.doctorId || null,
        date: form.date,
        time: form.time,
        duration: form.duration,
        status: form.status,
        note: form.note,
      });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Chyba při ukládání');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Upravit objednávku" subtitle={`ID: ${apt.id}`} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>Zrušit</Btn><Btn variant="primary" icon="check" disabled={saving} onClick={handleSave}>{saving ? 'Ukládám...' : 'Uložit změny'}</Btn></>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {isManual ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, background: theme.bg, borderRadius: theme.radius }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.warning, textTransform: "uppercase" }}>Ručně zadaný klient</div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 2 }}><Input label="Jméno" value={form.manualName} onChange={e => setForm({ ...form, manualName: e.target.value })} /></div>
              <div style={{ flex: 1 }}><Input label="Telefon" icon="phone" value={form.manualPhone} onChange={e => setForm({ ...form, manualPhone: e.target.value })} /></div>
            </div>
            <Input label="Zvíře" value={form.manualPet} onChange={e => setForm({ ...form, manualPet: e.target.value })} />
          </div>
        ) : (
          <>
            <Select label="Klient" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value, petId: "" })}>
              {clients.map(c => <option key={c.id} value={c.id}>{c.lastName} {c.firstName}</option>)}
            </Select>
            <Select label="Zvíře" value={form.petId} onChange={e => setForm({ ...form, petId: e.target.value })}>
              <option value="">— vyberte —</option>
              {selPets.map(p => <option key={p.id} value={p.id}>🐾 {p.name} ({p.species})</option>)}
            </Select>
          </>
        )}
        <Select label="Procedura" value={form.procedureId} onChange={e => { const proc = PROCEDURES.find(p => p.id === e.target.value); setForm({ ...form, procedureId: e.target.value, duration: proc?.duration || form.duration }); }}>
          {PROCEDURES.map(p => <option key={p.id} value={p.id}>{p.name} ({p.duration}')</option>)}
        </Select>
        <Select label="Lékař" value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
          {(config?.doctors || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}><Input label="Datum" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          <div style={{ flex: 1 }}><Input label="Čas" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
          <div style={{ flex: 1 }}><Input label="Délka (min)" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 15 })} style={{ width: "100%" }} /></div>
        </div>
        <Select label="Stav" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </Select>
        <Input label="Poznámka" textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
      </div>
    </Modal>
  );
}
