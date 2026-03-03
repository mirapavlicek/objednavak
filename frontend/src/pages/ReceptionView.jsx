import { useState, useCallback, useEffect, useMemo } from 'react';
import { theme, FONT, MONO, PROCEDURES } from '../utils/constants';
import { getToday } from '../utils/time';
import { Icon, Btn, Card, StatBox, Input, Select } from '../components/ui';
import { getAppointments, createAppointment, appointmentAction } from '../api/appointments';
import { getClients } from '../api/clients';
import { getPets } from '../api/pets';
import CalendarView from '../components/calendar/CalendarView';
import QuickBookBar from '../components/quickbook/QuickBookBar';
import ClientRegistry from '../components/clients/ClientRegistry';
import EditAptModal from '../components/appointments/EditAptModal';
import FreeSlotModal from '../components/appointments/FreeSlotModal';
import QuickAcuteModal from '../components/appointments/QuickAcuteModal';
import SmsModal from '../components/sms/SmsModal';
import InlineSlotPicker from '../components/appointments/InlineSlotPicker';
import AptRow from '../components/appointments/AptRow';

export default function ReceptionView({ config }) {
  const today = getToday();
  const [tab, setTab] = useState("today");
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showAcute, setShowAcute] = useState(false);
  const [showSlotFinder, setShowSlotFinder] = useState(false);
  const [editApt, setEditApt] = useState(null);
  const [smsApt, setSmsApt] = useState(null);
  const [newApt, setNewApt] = useState({ clientId: "", petId: "", procedureId: "", doctorId: "", date: today, time: "", note: "", manualName: "", manualPhone: "", manualPet: "" });
  const [clientMode, setClientMode] = useState("select");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [aptsRes, allAptsRes, clientsRes, petsRes] = await Promise.all([
        getAppointments({ date: today }),
        getAppointments({}),
        getClients(),
        getPets(),
      ]);
      setAppointments(aptsRes.data.data || []);
      setAllAppointments(allAptsRes.data.data || []);
      setClients(clientsRes.data.data || []);
      setPets(petsRes.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [today]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (id, action) => {
    try { await appointmentAction(id, action); await fetchData(); }
    catch (err) { alert(err.response?.data?.message || 'Chyba'); }
  };

  const todayApts = appointments.sort((a, b) => a.time.localeCompare(b.time));
  const pendingApts = allAppointments.filter(a => a.status === "pending");
  const waitingApts = todayApts.filter(a => a.status === "arrived");
  const inProgress = todayApts.filter(a => a.status === "in_progress");
  const selPets = pets.filter(p => p.clientId === newApt.clientId);

  const handleSave = async () => {
    const proc = PROCEDURES.find(p => p.id === newApt.procedureId);
    const apt = {
      client_id: clientMode === "select" ? (newApt.clientId || null) : null,
      pet_id: clientMode === "select" ? (newApt.petId || null) : null,
      manual_name: clientMode === "manual" ? newApt.manualName : "",
      manual_phone: clientMode === "manual" ? newApt.manualPhone : "",
      manual_pet: clientMode === "manual" ? newApt.manualPet : "",
      procedure_id: newApt.procedureId,
      doctor_id: newApt.doctorId || null,
      date: newApt.date,
      time: newApt.time,
      duration: proc?.duration || 20,
      status: "confirmed",
      note: newApt.note,
      created_by: "reception",
    };
    setSaving(true);
    try {
      await createAppointment(apt);
      setShowNew(false);
      setNewApt({ clientId: "", petId: "", procedureId: "", doctorId: "", date: today, time: "", note: "", manualName: "", manualPhone: "", manualPet: "" });
      setClientMode("select");
      await fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Chyba'); }
    finally { setSaving(false); }
  };

  const canSaveNew = newApt.procedureId && newApt.time && (
    (clientMode === "select" && newApt.clientId && newApt.petId) ||
    (clientMode === "manual" && newApt.manualName)
  );

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: theme.textMuted }}>Načítání...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatBox label="Dnes" value={todayApts.length} color={theme.accent} icon="📋" />
        <StatBox label="Čekárna" value={waitingApts.length} color={theme.warning} icon="🏠" />
        <StatBox label="U lékaře" value={inProgress.length} color={theme.purple} icon="🩺" />
        <StatBox label="Ke schválení" value={pendingApts.length} color={theme.danger} icon="⏳" />
      </div>

      <QuickBookBar clients={clients} pets={pets} config={config} onBooked={fetchData} />

      {waitingApts.length > 0 && (
        <Card accent={theme.warning} noPad>
          <div style={{ padding: "12px 20px", background: theme.warningLight }}><span style={{ fontWeight: 700, color: theme.warning }}>🏠 Čekárna — {waitingApts.length}</span></div>
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>{waitingApts.map(a => <AptRow key={a.id} apt={a} onAction={handleAction} onEdit={setEditApt} onSms={setSmsApt} role="reception" />)}</div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 4, borderBottom: `2px solid ${theme.border}`, alignItems: "center", overflowX: "auto" }}>
        {[
          { id: "today", l: `Dnes (${todayApts.length})` },
          { id: "calendar", l: "📅 Kalendář" },
          { id: "pending", l: `Ke schválení (${pendingApts.length})`, alert: pendingApts.length > 0 },
          { id: "all", l: "Vše" },
          { id: "clients", l: `👥 Klienti (${clients.length})` },
        ].map(t =>
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 14px", border: "none", borderBottom: `3px solid ${tab === t.id ? theme.accent : "transparent"}`, background: "none", color: tab === t.id ? theme.accent : theme.textSecondary, fontSize: 13, fontWeight: 700, cursor: "pointer", position: "relative", whiteSpace: "nowrap", fontFamily: FONT }}>
            {t.l}{t.alert && <span style={{ position: "absolute", top: 6, right: 4, width: 8, height: 8, borderRadius: "50%", background: theme.danger }} />}
          </button>
        )}
        <div style={{ flex: 1 }} />
        <Btn small variant="danger" icon="alert" onClick={() => setShowAcute(true)} style={{ marginRight: 4 }}>Akut</Btn>
        <Btn small icon="search" variant="outline" onClick={() => setShowSlotFinder(true)} style={{ marginRight: 4 }}>Volné</Btn>
        <Btn icon="plus" onClick={() => setShowNew(true)}>Objednávka</Btn>
      </div>

      {tab === "clients" ? (
        <ClientRegistry clients={clients} pets={pets} onRefresh={fetchData} />
      ) : tab === "calendar" ? (
        <CalendarView config={config} onEdit={setEditApt} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(tab === "today" ? todayApts : tab === "pending" ? pendingApts : [...allAppointments].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)))
            .map(a => <AptRow key={a.id} apt={a} onAction={handleAction} onEdit={setEditApt} onSms={setSmsApt} role="reception" />)}
          {((tab === "today" && !todayApts.length) || (tab === "pending" && !pendingApts.length) || (tab === "all" && !allAppointments.length)) && <div style={{ padding: 40, textAlign: "center", color: theme.textMuted }}>Žádné záznamy</div>}
        </div>
      )}

      {/* New appointment modal */}
      {showNew && (
        <div onClick={() => setShowNew(false)} style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: theme.radiusLg, width: "min(800px, 95vw)", maxHeight: "90vh", overflow: "auto", boxShadow: theme.shadowLg, animation: "slideUp 0.25s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${theme.border}` }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Nová objednávka</h2>
              <button onClick={() => setShowNew(false)} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textMuted, padding: 4, display: "flex" }}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                    <button onClick={() => setClientMode("select")} style={{ padding: "6px 14px", borderRadius: 6, border: `1.5px solid ${clientMode === "select" ? theme.accent : theme.border}`, background: clientMode === "select" ? theme.accentLight : "white", color: clientMode === "select" ? theme.accent : theme.textSecondary, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📋 Z číselníku</button>
                    <button onClick={() => setClientMode("manual")} style={{ padding: "6px 14px", borderRadius: 6, border: `1.5px solid ${clientMode === "manual" ? theme.accent : theme.border}`, background: clientMode === "manual" ? theme.accentLight : "white", color: clientMode === "manual" ? theme.accent : theme.textSecondary, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✏️ Ručně</button>
                  </div>
                  {clientMode === "select" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <Select label="Klient" required value={newApt.clientId} onChange={e => setNewApt({ ...newApt, clientId: e.target.value, petId: "" })}><option value="">— vyberte —</option>{clients.map(c => <option key={c.id} value={c.id}>{c.lastName} {c.firstName} ({c.phone})</option>)}</Select>
                      {newApt.clientId && <Select label="Zvíře" required value={newApt.petId} onChange={e => setNewApt({ ...newApt, petId: e.target.value })}><option value="">— vyberte —</option>{selPets.map(p => <option key={p.id} value={p.id}>🐾 {p.name} ({p.species})</option>)}</Select>}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, background: theme.bg, borderRadius: theme.radius }}>
                      <div style={{ display: "flex", gap: 10 }}>
                        <div style={{ flex: 2 }}><Input label="Jméno klienta" required value={newApt.manualName} onChange={e => setNewApt({ ...newApt, manualName: e.target.value })} placeholder="Příjmení Jméno" /></div>
                        <div style={{ flex: 1 }}><Input label="Telefon" icon="phone" value={newApt.manualPhone} onChange={e => setNewApt({ ...newApt, manualPhone: e.target.value })} /></div>
                      </div>
                      <Input label="Zvíře (jméno, druh)" value={newApt.manualPet} onChange={e => setNewApt({ ...newApt, manualPet: e.target.value })} placeholder="Rex, pes" />
                    </div>
                  )}
                </div>
                <Select label="Procedura" required value={newApt.procedureId} onChange={e => setNewApt({ ...newApt, procedureId: e.target.value, time: "" })}><option value="">— vyberte —</option>{PROCEDURES.map(p => <option key={p.id} value={p.id}>{p.name} ({p.duration}')</option>)}</Select>
                <Select label="Lékař" value={newApt.doctorId} onChange={e => setNewApt({ ...newApt, doctorId: e.target.value, time: "" })}><option value="">— kdokoliv —</option>{(config?.doctors || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</Select>
                {newApt.procedureId && (
                  <InlineSlotPicker procedureId={newApt.procedureId} doctorId={newApt.doctorId}
                    selectedDate={newApt.date} selectedTime={newApt.time}
                    onSelect={s => setNewApt({ ...newApt, date: s.date, time: s.time, doctorId: s.doctorId })} />
                )}
                {newApt.time && <div style={{ padding: 8, background: theme.successLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.success, fontWeight: 600 }}>✓ Termín: <span style={{ fontFamily: MONO }}>{newApt.date} {newApt.time}</span></div>}
                <Input label="Poznámka" textarea value={newApt.note} onChange={e => setNewApt({ ...newApt, note: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "16px 24px", borderTop: `1px solid ${theme.border}` }}>
              <Btn variant="ghost" onClick={() => setShowNew(false)}>Zrušit</Btn>
              <Btn variant="success" icon="check" disabled={!canSaveNew || saving} onClick={handleSave}>{saving ? 'Ukládám...' : 'Uložit'}</Btn>
            </div>
          </div>
        </div>
      )}

      {showAcute && <QuickAcuteModal clients={clients} pets={pets} config={config} onSaved={fetchData} onClose={() => setShowAcute(false)} />}
      {showSlotFinder && <FreeSlotModal config={config} onClose={() => setShowSlotFinder(false)}
        onSelect={s => { setNewApt({ ...newApt, date: s.date, time: s.time, doctorId: s.doctorId }); setShowSlotFinder(false); setShowNew(true); }} />}
      {editApt && <EditAptModal apt={editApt} config={config} clients={clients} pets={pets} onSaved={fetchData} onClose={() => setEditApt(null)} />}
      {smsApt && <SmsModal apt={smsApt} client={smsApt.client} onClose={() => setSmsApt(null)} />}
    </div>
  );
}
