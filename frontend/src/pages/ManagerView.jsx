import { useState, useCallback, useEffect } from 'react';
import { theme, FONT, MONO, PROCEDURES, STATUSES } from '../utils/constants';
import { getToday } from '../utils/time';
import { Card, StatBox } from '../components/ui';
import { getAppointments } from '../api/appointments';
import { getClients } from '../api/clients';
import { getPets } from '../api/pets';
import ClientRegistry from '../components/clients/ClientRegistry';

export default function ManagerView({ config }) {
  const today = getToday();
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [aptsRes, clientsRes, petsRes] = await Promise.all([
        getAppointments({}),
        getClients(),
        getPets(),
      ]);
      setAppointments(aptsRes.data.data || []);
      setClients(clientsRes.data.data || []);
      setPets(petsRes.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: theme.textMuted }}>Načítání...</div>;

  const todayApts = appointments.filter(a => a.date === today);
  const totalMin = todayApts.reduce((s, a) => s + a.duration, 0);
  const byProc = PROCEDURES.map(p => ({ ...p, count: appointments.filter(a => a.procedureId === p.id).length })).filter(p => p.count > 0).sort((a, b) => b.count - a.count);
  const byStatus = Object.entries(STATUSES).map(([k, v]) => ({ k, ...v, count: appointments.filter(a => a.status === k).length })).filter(s => s.count > 0);
  const byDoc = (config?.doctors || []).map(d => ({ ...d, count: appointments.filter(a => a.doctorId === d.id).length, minutes: appointments.filter(a => a.doctorId === d.id).reduce((s, a) => s + a.duration, 0) }));
  const mx = Math.max(...byProc.map(p => p.count), 1);
  const publicReq = appointments.filter(a => a.createdBy === "public").length;
  const recCreated = appointments.filter(a => a.createdBy === "reception").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatBox label="Celkem" value={appointments.length} color={theme.accent} icon="📊" />
        <StatBox label="Obsazenost dnes" value={`${Math.round((totalMin / 540) * 100)}%`} color={theme.success} icon="📈" />
        <StatBox label="Klientů" value={new Set(appointments.map(a => a.clientId).filter(Boolean)).size} color={theme.purple} icon="👥" />
        <StatBox label="Ø délka" value={`${appointments.length ? Math.round(appointments.reduce((s, a) => s + a.duration, 0) / appointments.length) : 0}'`} color={theme.warning} icon="⏱" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <Card title="📊 Procedury">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {byProc.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, minWidth: 140 }}>{p.name}</span>
                <div style={{ flex: 1, height: 20, background: theme.bg, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(p.count / mx) * 100}%`, background: p.color + "40", borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 6 }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: p.color }}>{p.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="👨‍⚕️ Vytížení lékařů">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {byDoc.map(d => (
              <div key={d.id} style={{ padding: "10px 12px", background: d.color + "08", borderRadius: theme.radiusSm, borderLeft: `3px solid ${d.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: d.color }}>{d.name}</span>
                  <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: d.color }}>{d.count}</span>
                </div>
                <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>{d.minutes} minut celkem</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="📈 Stavy">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {byStatus.map(s => <div key={s.k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", background: s.bg, borderRadius: theme.radiusSm }}><span style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.icon} {s.label}</span><span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 800, color: s.color }}>{s.count}</span></div>)}
          </div>
        </Card>
        <Card title="📬 Zdroj">
          <div style={{ display: "flex", gap: 20, justifyContent: "center", padding: "20px 0" }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 32, fontWeight: 800, fontFamily: MONO, color: theme.accent }}>{recCreated}</div><div style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 600, marginTop: 4 }}>🖥️ Recepce</div></div>
            <div style={{ width: 1, height: 50, background: theme.border }} />
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 32, fontWeight: 800, fontFamily: MONO, color: "#6366f1" }}>{publicReq}</div><div style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 600, marginTop: 4 }}>🌐 Online</div></div>
          </div>
        </Card>
      </div>
      <Card title={`👥 Registr klientů a zvířat (${clients.length} klientů, ${pets.length} zvířat)`}>
        <ClientRegistry clients={clients} pets={pets} onRefresh={fetchData} />
      </Card>
    </div>
  );
}
