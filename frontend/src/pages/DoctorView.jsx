import { useState, useCallback, useEffect, useMemo } from 'react';
import { theme, MONO } from '../utils/constants';
import { getToday } from '../utils/time';
import { Card, StatBox } from '../components/ui';
import { getAppointments, appointmentAction } from '../api/appointments';
import AptRow from '../components/appointments/AptRow';
import EditAptModal from '../components/appointments/EditAptModal';
import SmsModal from '../components/sms/SmsModal';
import { getClients } from '../api/clients';
import { getPets } from '../api/pets';

export default function DoctorView({ config, user }) {
  const today = getToday();
  const [selDoc, setSelDoc] = useState(user?.doctorId || (config?.doctors || [])[0]?.id || "");
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editApt, setEditApt] = useState(null);
  const [smsApt, setSmsApt] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [aptsRes, clientsRes, petsRes] = await Promise.all([
        getAppointments({ date: today }),
        getClients(),
        getPets(),
      ]);
      setAppointments(aptsRes.data.data || []);
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

  const todayApts = appointments.filter(a => a.doctorId === selDoc).sort((a, b) => a.time.localeCompare(b.time));
  const waiting = todayApts.filter(a => a.status === "arrived");
  const inProg = todayApts.filter(a => a.status === "in_progress");
  const upcoming = todayApts.filter(a => a.status === "confirmed");
  const completed = todayApts.filter(a => a.status === "completed");

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: theme.textMuted }}>Načítání...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: theme.textSecondary }}>Lékař:</span>
        {(config?.doctors || []).map(d => (
          <button key={d.id} onClick={() => setSelDoc(d.id)} style={{ padding: "6px 14px", border: `2px solid ${selDoc === d.id ? d.color : theme.border}`, borderRadius: 20, background: selDoc === d.id ? d.color + "15" : "white", color: selDoc === d.id ? d.color : theme.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{d.name}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatBox label="Čekárna" value={waiting.length} color={theme.warning} icon="🏠" />
        <StatBox label="U mě" value={inProg.length} color={theme.purple} icon="🩺" />
        <StatBox label="Další" value={upcoming.length} color={theme.accent} icon="📋" />
        <StatBox label="Hotovo" value={completed.length} color={theme.success} icon="✔" />
      </div>
      {inProg.length > 0 && <Card accent={theme.purple} title="🩺 Právě u mě"><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{inProg.map(a => <AptRow key={a.id} apt={a} onAction={handleAction} onEdit={setEditApt} onSms={setSmsApt} role="doctor" />)}</div></Card>}
      {waiting.length > 0 && <Card accent={theme.warning} title={`🏠 Čekárna (${waiting.length})`}><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{waiting.map(a => <AptRow key={a.id} apt={a} onAction={handleAction} onEdit={setEditApt} onSms={setSmsApt} role="doctor" />)}</div></Card>}
      <Card title={`📋 Nadcházející (${upcoming.length})`}><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{upcoming.map(a => <AptRow key={a.id} apt={a} onAction={handleAction} onEdit={setEditApt} onSms={setSmsApt} role="doctor" />)}{!upcoming.length && <div style={{ padding: 20, textAlign: "center", color: theme.textMuted }}>Žádné další</div>}</div></Card>
      {completed.length > 0 && <Card title={`✔ Hotovo (${completed.length})`}><div style={{ display: "flex", flexDirection: "column", gap: 6, opacity: 0.7 }}>{completed.map(a => <AptRow key={a.id} apt={a} onAction={handleAction} onEdit={setEditApt} onSms={setSmsApt} role="doctor" />)}</div></Card>}

      {editApt && <EditAptModal apt={editApt} config={config} clients={clients} pets={pets} onSaved={fetchData} onClose={() => setEditApt(null)} />}
      {smsApt && <SmsModal apt={smsApt} client={smsApt.client} onClose={() => setSmsApt(null)} />}
    </div>
  );
}
