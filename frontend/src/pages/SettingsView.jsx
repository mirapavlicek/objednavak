import { useState, useEffect } from 'react';
import { theme, FONT, MONO, ROLES } from '../utils/constants';
import { DAY_LABELS_CZ } from '../utils/constants';
import { Icon, Btn, Input, Select, Card, Modal } from '../components/ui';
import { useConfig } from '../context/ConfigContext';
import { createDoctor, updateDoctor, deleteDoctor } from '../api/doctors';
import { createEmployee, updateEmployee, deleteEmployee } from '../api/employees';
import { createProcedureBlock, updateProcedureBlock, deleteProcedureBlock } from '../api/procedureBlocks';

const CATEGORIES = ['prevence', 'diagnostika', 'chirurgie', 'specialni', 'akutni', 'ostatni'];
const DOC_COLORS = ['#2563eb', '#059669', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#e11d48', '#4f46e5'];

export default function SettingsView() {
  const { config, refetch, updateConfig } = useConfig();
  const [tab, setTab] = useState('hours');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Opening hours local state
  const [hours, setHours] = useState({});
  const [slotInterval, setSlotInterval] = useState(5);
  const [clinicName, setClinicName] = useState('');

  // SMS local state
  const [smsApiKey, setSmsApiKey] = useState('');
  const [smsSender, setSmsSender] = useState('');
  const [smsReminderHours, setSmsReminderHours] = useState(24);
  const [smsOnConfirm, setSmsOnConfirm] = useState(true);
  const [smsOnReminder, setSmsOnReminder] = useState(true);
  const [smsOnCancel, setSmsOnCancel] = useState(false);

  // Acute local state
  const [acuteBufferSlots, setAcuteBufferSlots] = useState(3);
  const [acuteBufferSpacing, setAcuteBufferSpacing] = useState(90);

  // Modals
  const [doctorModal, setDoctorModal] = useState(null);
  const [employeeModal, setEmployeeModal] = useState(null);
  const [blockModal, setBlockModal] = useState(null);

  // Sync local state from config
  useEffect(() => {
    if (!config) return;
    setClinicName(config.clinicName || '');
    setSlotInterval(config.slotInterval || 5);
    setSmsApiKey(config.smsApiKey || '');
    setSmsSender(config.smsSender || '');
    setSmsReminderHours(config.smsReminderHours || 24);
    setSmsOnConfirm(config.smsOnConfirm ?? true);
    setSmsOnReminder(config.smsOnReminder ?? true);
    setSmsOnCancel(config.smsOnCancel ?? false);
    setAcuteBufferSlots(config.acuteBufferSlots || 3);
    setAcuteBufferSpacing(config.acuteBufferSpacing || 90);

    const h = {};
    for (const day of Object.keys(DAY_LABELS_CZ)) {
      const val = config.openingHours?.[day];
      h[day] = val ? { open: val.open, close: val.close, closed: false } : { open: '08:00', close: '18:00', closed: true };
    }
    setHours(h);
  }, [config]);

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 2500); };

  const saveConfig = async (updates) => {
    setSaving(true);
    try {
      await updateConfig(updates);
      flash('Uloženo');
    } catch (err) {
      alert(err.response?.data?.message || 'Chyba při ukládání');
    } finally {
      setSaving(false);
    }
  };

  const saveHours = () => {
    const opening_hours = {};
    for (const [day, val] of Object.entries(hours)) {
      const dow = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].indexOf(day);
      if (dow === -1) continue;
      opening_hours[dow] = val.closed ? { open: null, close: null } : { open: val.open, close: val.close };
    }
    saveConfig({ clinic_name: clinicName, slot_interval: slotInterval, opening_hours });
  };

  const saveSms = () => saveConfig({
    sms_api_key: smsApiKey, sms_sender: smsSender, sms_reminder_hours: smsReminderHours,
    sms_on_confirm: smsOnConfirm, sms_on_reminder: smsOnReminder, sms_on_cancel: smsOnCancel,
  });

  const saveAcute = () => saveConfig({ acute_buffer_slots: acuteBufferSlots, acute_buffer_spacing: acuteBufferSpacing });

  if (!config) return null;

  const tabs = [
    { id: 'hours', label: 'Otvírací doba' },
    { id: 'doctors', label: 'Lékaři' },
    { id: 'blocks', label: 'Bloky procedur' },
    { id: 'acute', label: 'Akutní sloty' },
    { id: 'admin', label: 'Zaměstnanci' },
    { id: 'sms', label: 'SMS' },
    { id: 'winvet', label: 'WinVet' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {msg && <div style={{ padding: '8px 16px', background: theme.successLight, color: theme.success, borderRadius: theme.radiusSm, fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{msg}</div>}

      <div style={{ display: 'flex', gap: 4, borderBottom: `2px solid ${theme.border}`, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '10px 16px', border: 'none', borderBottom: `3px solid ${tab === t.id ? theme.purple : 'transparent'}`, background: 'none', color: tab === t.id ? theme.purple : theme.textSecondary, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: FONT }}>{t.label}</button>
        ))}
      </div>

      {/* Opening hours */}
      {tab === 'hours' && (
        <Card title="Otvírací doba ordinace">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Název kliniky" value={clinicName} onChange={e => setClinicName(e.target.value)} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {Object.entries(DAY_LABELS_CZ).map(([day, label]) => {
                const h = hours[day] || { open: '08:00', close: '18:00', closed: true };
                return (
                  <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 30, fontWeight: 700, fontSize: 14, fontFamily: MONO }}>{label}</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, width: 90 }}>
                      <input type="checkbox" checked={!h.closed} onChange={e => setHours(prev => ({ ...prev, [day]: { ...prev[day], closed: !e.target.checked } }))} />
                      {h.closed ? 'Zavřeno' : 'Otevřeno'}
                    </label>
                    {!h.closed && <>
                      <input type="time" value={h.open} onChange={e => setHours(prev => ({ ...prev, [day]: { ...prev[day], open: e.target.value } }))} style={{ padding: '4px 8px', border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, fontFamily: MONO, fontSize: 13 }} />
                      <span style={{ color: theme.textMuted }}>—</span>
                      <input type="time" value={h.close} onChange={e => setHours(prev => ({ ...prev, [day]: { ...prev[day], close: e.target.value } }))} style={{ padding: '4px 8px', border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, fontFamily: MONO, fontSize: 13 }} />
                    </>}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Interval slotů:</label>
              <Select value={slotInterval} onChange={e => setSlotInterval(Number(e.target.value))} style={{ width: 80 }}>
                {[5, 10, 15, 20, 30].map(v => <option key={v} value={v}>{v} min</option>)}
              </Select>
            </div>
            <Btn icon="check" onClick={saveHours} disabled={saving}>{saving ? 'Ukládám...' : 'Uložit'}</Btn>
          </div>
        </Card>
      )}

      {/* Doctors */}
      {tab === 'doctors' && (
        <Card title="Lékaři a specializace">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(config.doctors || []).map(doc => (
              <div key={doc.id} style={{ padding: 14, border: `1.5px solid ${doc.color}30`, borderLeft: `4px solid ${doc.color}`, borderRadius: theme.radius, background: doc.color + '05', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, color: doc.color, marginBottom: 8 }}>{doc.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(doc.specializations || []).map(cat => (
                      <span key={cat} style={{ padding: '4px 10px', borderRadius: 12, border: `1.5px solid ${doc.color}`, background: doc.color + '15', color: doc.color, fontSize: 12, fontWeight: 600 }}>{cat}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <Btn small variant="ghost" icon="edit" onClick={() => setDoctorModal({ mode: 'edit', data: { ...doc } })}>Upravit</Btn>
                  <Btn small variant="danger" icon="x" onClick={async () => { if (confirm('Smazat lékaře ' + doc.name + '?')) { await deleteDoctor(doc.id); refetch(); } }}>Smazat</Btn>
                </div>
              </div>
            ))}
            <Btn icon="plus" variant="outline" onClick={() => setDoctorModal({ mode: 'add', data: { name: '', color: '#2563eb', specializations: [] } })}>Přidat lékaře</Btn>
          </div>
        </Card>
      )}

      {/* Procedure blocks */}
      {tab === 'blocks' && (
        <Card title="Bloky procedur — rozdělení dne">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(config.procedureBlocks || []).map(block => (
              <div key={block.id} style={{ padding: 14, border: `1px solid ${theme.border}`, borderRadius: theme.radius, background: theme.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{block.label}</span>
                    <span style={{ fontFamily: MONO, fontSize: 13, color: theme.accent, fontWeight: 600 }}>{block.timeFrom}–{block.timeTo}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: theme.textMuted, marginRight: 4 }}>Kategorie:</span>
                    {(block.categories || []).map(c => <span key={c} style={{ padding: '2px 8px', borderRadius: 10, background: theme.accentLight, color: theme.accent, fontSize: 11, fontWeight: 600 }}>{c}</span>)}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: theme.textMuted, marginRight: 4 }}>Lékaři:</span>
                    {(block.doctorIds || []).map(dId => { const d = (config.doctors || []).find(x => x.id === dId); return d ? <span key={dId} style={{ padding: '2px 8px', borderRadius: 10, background: d.color + '15', color: d.color, fontSize: 11, fontWeight: 600 }}>{d.name.split(' ').pop()}</span> : null; })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <Btn small variant="ghost" icon="edit" onClick={() => setBlockModal({ mode: 'edit', data: { id: block.id, label: block.label, timeFrom: block.timeFrom, timeTo: block.timeTo, categories: [...(block.categories || [])], doctorIds: [...(block.doctorIds || [])] } })}>Upravit</Btn>
                  <Btn small variant="danger" icon="x" onClick={async () => { if (confirm('Smazat blok ' + block.label + '?')) { await deleteProcedureBlock(block.id); refetch(); } }}>Smazat</Btn>
                </div>
              </div>
            ))}
            <Btn icon="plus" variant="outline" onClick={() => setBlockModal({ mode: 'add', data: { label: '', timeFrom: '08:00', timeTo: '12:00', categories: [], doctorIds: [] } })}>Přidat blok</Btn>
          </div>
        </Card>
      )}

      {/* Acute */}
      {tab === 'acute' && (
        <Card title="Akutní sloty — buffer pro urgentní případy" accent={theme.danger}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 14, background: theme.dangerLight, borderRadius: theme.radius, fontSize: 13, color: theme.danger }}>
              Systém automaticky rezervuje prázdné sloty pro akutní případy.
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
              <Input label="Počet slotů" type="number" value={acuteBufferSlots} onChange={e => setAcuteBufferSlots(Number(e.target.value))} style={{ width: 80 }} />
              <Input label="Rozestup (min)" type="number" value={acuteBufferSpacing} onChange={e => setAcuteBufferSpacing(Number(e.target.value))} style={{ width: 100 }} />
            </div>
            <Btn icon="check" onClick={saveAcute} disabled={saving}>{saving ? 'Ukládám...' : 'Uložit'}</Btn>
          </div>
        </Card>
      )}

      {/* Employees */}
      {tab === 'admin' && (
        <Card title="Zaměstnanci a přístupová práva" accent={theme.purple}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(config.employees || []).map(emp => (
                <div key={emp.id} style={{ padding: 12, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 32, height: 32, borderRadius: '50%', background: (ROLES[emp.role]?.color || theme.accent) + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{ROLES[emp.role]?.icon || '?'}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: theme.textMuted }}>{emp.email} — {ROLES[emp.role]?.label || emp.role}{emp.doctorId ? ` (lékař #${emp.doctorId})` : ''}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 12, background: (ROLES[emp.role]?.color || theme.accent) + '15', color: ROLES[emp.role]?.color || theme.accent, fontSize: 12, fontWeight: 600 }}>{ROLES[emp.role]?.label || emp.role}</span>
                    <Btn small variant="ghost" icon="edit" onClick={() => setEmployeeModal({ mode: 'edit', data: { ...emp, pin: '' } })}>Upravit</Btn>
                    <Btn small variant="danger" icon="x" onClick={async () => { if (confirm('Smazat zaměstnance ' + emp.name + '?')) { await deleteEmployee(emp.id); refetch(); } }}>Smazat</Btn>
                  </div>
                </div>
              ))}
            </div>
            <Btn icon="plus" variant="outline" onClick={() => setEmployeeModal({ mode: 'add', data: { name: '', email: '', role: 'reception', pin: '', doctorId: null } })}>Přidat zaměstnance</Btn>
          </div>
        </Card>
      )}

      {/* SMS */}
      {tab === 'sms' && (
        <Card title="SMS upozornění — SmsManager.cz" accent="#059669">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="API klíč (SmsManager.cz)" type="password" value={smsApiKey} onChange={e => setSmsApiKey(e.target.value)} placeholder="Zadejte API klíč" />
            <Input label="Odesílatel (název)" value={smsSender} onChange={e => setSmsSender(e.target.value)} placeholder="např. VetKlinika" />
            <Input label="Připomínka před termínem (hodiny)" type="number" value={smsReminderHours} onChange={e => setSmsReminderHours(Number(e.target.value))} style={{ width: 100 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={smsOnConfirm} onChange={e => setSmsOnConfirm(e.target.checked)} /> Auto SMS při potvrzení objednávky
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={smsOnReminder} onChange={e => setSmsOnReminder(e.target.checked)} /> Auto SMS připomínka před termínem
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={smsOnCancel} onChange={e => setSmsOnCancel(e.target.checked)} /> Auto SMS při zrušení objednávky
              </label>
            </div>
            <Btn icon="check" onClick={saveSms} disabled={saving}>{saving ? 'Ukládám...' : 'Uložit'}</Btn>
          </div>
        </Card>
      )}

      {/* WinVet */}
      {tab === 'winvet' && (
        <Card title="WinVet integrace" accent="#e67e22">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 14, background: '#fff8f0', borderRadius: theme.radius, border: '1.5px solid #f0c078' }}>
              <div style={{ fontWeight: 700, color: '#c0710a', marginBottom: 6 }}>O programu WinVet</div>
              <div style={{ fontSize: 13, color: '#8a5d1f', lineHeight: 1.6 }}>
                WinVet je desktopová aplikace s <strong>Firebird databází</strong>. Integrace je možná přes CSV import, přímý přístup k DB, nebo Google Calendar sync.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: 'file', title: 'CSV/TXT export -> import', desc: 'WinVet umožňuje export majitelů a pacientů do textových souborů.', status: 'Připraveno v API' },
                { icon: 'database', title: 'Přímý přístup k Firebird DB', desc: 'Čtení dat přímo z WinVet databáze.', status: 'Vyžaduje konfiguraci' },
                { icon: 'calendar', title: 'Google Calendar sync', desc: 'WinVet umí synchronizovat s Google Kalendářem.', status: 'Vyžaduje Google API klíč' },
              ].map((item, i) => (
                <div key={i} style={{ padding: 12, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Icon name={item.icon} size={24} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{item.desc}</div>
                    <div style={{ fontSize: 11, marginTop: 4, color: theme.textMuted }}>{item.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Doctor modal */}
      {doctorModal && <DoctorModal modal={doctorModal} doctors={config.doctors} onClose={() => setDoctorModal(null)} onSaved={() => { setDoctorModal(null); refetch(); }} />}

      {/* Employee modal */}
      {employeeModal && <EmployeeModal modal={employeeModal} doctors={config.doctors} onClose={() => setEmployeeModal(null)} onSaved={() => { setEmployeeModal(null); refetch(); }} />}

      {/* Block modal */}
      {blockModal && <BlockModal modal={blockModal} doctors={config.doctors} onClose={() => setBlockModal(null)} onSaved={() => { setBlockModal(null); refetch(); }} />}
    </div>
  );
}

// --- Doctor modal ---
function DoctorModal({ modal, onClose, onSaved }) {
  const [form, setForm] = useState(modal.data);
  const [saving, setSaving] = useState(false);
  const isEdit = modal.mode === 'edit';

  const toggleSpec = (cat) => {
    setForm(prev => ({
      ...prev,
      specializations: prev.specializations.includes(cat)
        ? prev.specializations.filter(c => c !== cat)
        : [...prev.specializations, cat],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert('Vyplňte jméno');
    if (form.specializations.length === 0) return alert('Vyberte alespoň jednu specializaci');
    setSaving(true);
    try {
      if (isEdit) {
        await updateDoctor(form.id, { name: form.name, color: form.color, specializations: form.specializations });
      } else {
        await createDoctor({ name: form.name, color: form.color, specializations: form.specializations });
      }
      onSaved();
    } catch (err) {
      alert(err.response?.data?.message || 'Chyba');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Upravit lékaře' : 'Nový lékař'} onClose={onClose} footer={<><Btn variant="ghost" onClick={onClose}>Zrušit</Btn><Btn onClick={handleSave} disabled={saving}>{saving ? 'Ukládám...' : 'Uložit'}</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input label="Jméno" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Barva</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {DOC_COLORS.map(c => (
              <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #0f172a' : '2px solid transparent', cursor: 'pointer' }} />
            ))}
            <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} style={{ width: 28, height: 28, border: 'none', padding: 0, cursor: 'pointer' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Specializace *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => toggleSpec(cat)} style={{ padding: '6px 14px', borderRadius: 14, border: `1.5px solid ${form.specializations.includes(cat) ? form.color : theme.border}`, background: form.specializations.includes(cat) ? form.color + '20' : 'white', color: form.specializations.includes(cat) ? form.color : theme.textSecondary, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>{cat}</button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// --- Employee modal ---
function EmployeeModal({ modal, doctors, onClose, onSaved }) {
  const [form, setForm] = useState(modal.data);
  const [saving, setSaving] = useState(false);
  const isEdit = modal.mode === 'edit';

  const handleSave = async () => {
    if (!form.name.trim()) return alert('Vyplňte jméno');
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email || null, role: form.role, doctor_id: form.role === 'doctor' ? (form.doctorId || null) : null };
      if (form.pin) payload.pin = form.pin;
      if (isEdit) {
        await updateEmployee(form.id, payload);
      } else {
        if (!form.pin) { setSaving(false); return alert('Vyplňte PIN'); }
        await createEmployee(payload);
      }
      onSaved();
    } catch (err) {
      alert(err.response?.data?.message || 'Chyba');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Upravit zaměstnance' : 'Nový zaměstnanec'} onClose={onClose} footer={<><Btn variant="ghost" onClick={onClose}>Zrušit</Btn><Btn onClick={handleSave} disabled={saving}>{saving ? 'Ukládám...' : 'Uložit'}</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input label="Jméno" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        <Input label="Email" type="email" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        <Select label="Role" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
          <option value="reception">Recepce</option>
          <option value="doctor">Lékař</option>
          <option value="manager">Manažer</option>
        </Select>
        {form.role === 'doctor' && (
          <Select label="Přiřazený lékař" value={form.doctorId || ''} onChange={e => setForm(p => ({ ...p, doctorId: e.target.value ? Number(e.target.value) : null }))}>
            <option value="">— Bez přiřazení —</option>
            {(doctors || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        )}
        <Input label={isEdit ? 'Nový PIN (ponechte prázdné pro zachování)' : 'PIN *'} type="password" value={form.pin} onChange={e => setForm(p => ({ ...p, pin: e.target.value }))} placeholder="min. 4 znaky" />
      </div>
    </Modal>
  );
}

// --- Procedure block modal ---
function BlockModal({ modal, doctors, onClose, onSaved }) {
  const [form, setForm] = useState(modal.data);
  const [saving, setSaving] = useState(false);
  const isEdit = modal.mode === 'edit';

  const toggleCat = (cat) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) ? prev.categories.filter(c => c !== cat) : [...prev.categories, cat],
    }));
  };

  const toggleDoc = (id) => {
    setForm(prev => ({
      ...prev,
      doctorIds: prev.doctorIds.includes(id) ? prev.doctorIds.filter(d => d !== id) : [...prev.doctorIds, id],
    }));
  };

  const handleSave = async () => {
    if (!form.label.trim()) return alert('Vyplňte název bloku');
    if (form.categories.length === 0) return alert('Vyberte alespoň jednu kategorii');
    if (form.doctorIds.length === 0) return alert('Vyberte alespoň jednoho lékaře');
    setSaving(true);
    try {
      const payload = { label: form.label, time_from: form.timeFrom, time_to: form.timeTo, categories: form.categories, doctor_ids: form.doctorIds };
      if (isEdit) {
        await updateProcedureBlock(form.id, payload);
      } else {
        await createProcedureBlock(payload);
      }
      onSaved();
    } catch (err) {
      alert(err.response?.data?.message || 'Chyba');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Upravit blok' : 'Nový blok procedur'} onClose={onClose} footer={<><Btn variant="ghost" onClick={onClose}>Zrušit</Btn><Btn onClick={handleSave} disabled={saving}>{saving ? 'Ukládám...' : 'Uložit'}</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input label="Název bloku" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} required />
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Od</label>
            <input type="time" value={form.timeFrom} onChange={e => setForm(p => ({ ...p, timeFrom: e.target.value }))} style={{ padding: '8px 12px', border: `1.5px solid ${theme.border}`, borderRadius: theme.radiusSm, fontFamily: MONO, fontSize: 14, width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Do</label>
            <input type="time" value={form.timeTo} onChange={e => setForm(p => ({ ...p, timeTo: e.target.value }))} style={{ padding: '8px 12px', border: `1.5px solid ${theme.border}`, borderRadius: theme.radiusSm, fontFamily: MONO, fontSize: 14, width: '100%', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kategorie *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => toggleCat(cat)} style={{ padding: '6px 14px', borderRadius: 14, border: `1.5px solid ${form.categories.includes(cat) ? theme.accent : theme.border}`, background: form.categories.includes(cat) ? theme.accentLight : 'white', color: form.categories.includes(cat) ? theme.accent : theme.textSecondary, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>{cat}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lékaři *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(doctors || []).map(doc => (
              <button key={doc.id} onClick={() => toggleDoc(doc.id)} style={{ padding: '6px 14px', borderRadius: 14, border: `1.5px solid ${form.doctorIds.includes(doc.id) ? doc.color : theme.border}`, background: form.doctorIds.includes(doc.id) ? doc.color + '20' : 'white', color: form.doctorIds.includes(doc.id) ? doc.color : theme.textSecondary, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>{doc.name}</button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
