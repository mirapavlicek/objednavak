import { useState, useMemo, useEffect } from 'react';
import { theme, PROCEDURES, FONT, MONO } from '../../utils/constants';
import { Modal, Select, Input } from '../ui';
import { getAvailableSlots } from '../../api/slots';
import { getToday, addDays } from '../../utils/time';

export default function FreeSlotModal({ config, onClose, onSelect }) {
  const [procId, setProcId] = useState("");
  const [docId, setDocId] = useState("");
  const today = getToday();
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(addDays(new Date(), 7).toISOString().split("T")[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!procId) { setSlots([]); return; }
    let cancelled = false;
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const res = await getAvailableSlots({ procedureId: procId, dateFrom, dateTo, doctorId: docId || undefined });
        if (!cancelled) setSlots(res.data.data || res.data || []);
      } catch (err) {
        console.error('Failed to load slots:', err);
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSlots();
    return () => { cancelled = true; };
  }, [procId, docId, dateFrom, dateTo]);

  const grouped = useMemo(() => {
    const m = {};
    slots.forEach(s => { if (!m[s.date]) m[s.date] = []; m[s.date].push(s); });
    return Object.entries(m);
  }, [slots]);

  return (
    <Modal title="Najít volný termín" subtitle="Vyhledání dostupných časů podle procedury, lékaře a období" onClose={onClose} wide>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: 180 }}>
            <Select label="Procedura" required value={procId} onChange={e => setProcId(e.target.value)}>
              <option value="">— vyberte proceduru —</option>
              {PROCEDURES.filter(p => p.id !== "emergency").map(p => <option key={p.id} value={p.id}>{p.name} ({p.duration}')</option>)}
            </Select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <Select label="Lékař (nepovinné)" value={docId} onChange={e => setDocId(e.target.value)}>
              <option value="">Kdokoliv</option>
              {(config?.doctors || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
          <div style={{ flex: 1, minWidth: 130 }}><Input label="Od" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></div>
          <div style={{ flex: 1, minWidth: 130 }}><Input label="Do" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></div>
        </div>

        {procId && (
          <div style={{ maxHeight: 400, overflow: "auto", border: `1px solid ${theme.border}`, borderRadius: theme.radius }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: theme.textMuted }}>Hledám volné termíny...</div>
            ) : grouped.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: theme.textMuted }}>Žádné volné termíny v zadaném období</div>
            ) : grouped.map(([date, daySlots]) => (
              <div key={date}>
                <div style={{ padding: "8px 16px", background: theme.bg, fontWeight: 700, fontSize: 13, fontFamily: FONT, borderBottom: `1px solid ${theme.border}`, position: "sticky", top: 0, zIndex: 1 }}>
                  📅 {new Date(date + "T00:00").toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" })}
                  <span style={{ fontWeight: 400, color: theme.textMuted, marginLeft: 8 }}>{daySlots.length} volných</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 16px" }}>
                  {daySlots.map((s, i) => (
                    <button key={i} onClick={() => onSelect(s)}
                      style={{ padding: "6px 14px", border: `1.5px solid ${s.doctorColor || theme.accent}30`, borderRadius: theme.radiusSm, background: (s.doctorColor || theme.accent) + "08", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s", fontSize: 13, fontFamily: FONT }}
                      onMouseEnter={e => { e.currentTarget.style.background = (s.doctorColor || theme.accent) + "20"; e.currentTarget.style.borderColor = s.doctorColor || theme.accent; }}
                      onMouseLeave={e => { e.currentTarget.style.background = (s.doctorColor || theme.accent) + "08"; e.currentTarget.style.borderColor = (s.doctorColor || theme.accent) + "30"; }}>
                      <span style={{ fontFamily: MONO, fontWeight: 700, color: theme.text }}>{s.time}</span>
                      <span style={{ fontSize: 11, color: s.doctorColor || theme.accent, fontWeight: 600 }}>{(s.doctorName || '').split(" ").pop()}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {!procId && <div style={{ padding: 30, textAlign: "center", color: theme.textMuted, background: theme.bg, borderRadius: theme.radius }}>Vyberte proceduru pro vyhledání volných termínů</div>}
      </div>
    </Modal>
  );
}
