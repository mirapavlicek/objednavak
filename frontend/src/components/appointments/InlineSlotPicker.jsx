import { useState, useMemo, useEffect } from 'react';
import { theme, PROCEDURES, MONO } from '../../utils/constants';
import { getToday, getTomorrow } from '../../utils/time';
import { getAvailableSlots } from '../../api/slots';

export default function InlineSlotPicker({ procedureId, doctorId, onSelect, selectedDate, selectedTime }) {
  const today = getToday();
  const [viewDate, setViewDate] = useState(selectedDate || getTomorrow());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const proc = PROCEDURES.find(p => p.id === procedureId);

  useEffect(() => {
    if (!proc) return;
    let cancelled = false;
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const res = await getAvailableSlots({ procedureId, dateFrom: viewDate, dateTo: viewDate, doctorId: doctorId || undefined });
        if (!cancelled) setSlots(res.data.data || res.data || []);
      } catch (err) {
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSlots();
    return () => { cancelled = true; };
  }, [procedureId, doctorId, viewDate, proc]);

  if (!proc) return null;

  const grouped = {};
  slots.forEach(s => { const h = s.time.split(":")[0]; if (!grouped[h]) grouped[h] = []; grouped[h].push(s); });
  const hours = Object.keys(grouped).sort();

  const navigateDay = (dir) => {
    const d = new Date(viewDate + "T00:00");
    d.setDate(d.getDate() + dir);
    setViewDate(d.toISOString().split("T")[0]);
  };

  return (
    <div style={{ border: `1.5px solid ${theme.accent}30`, borderRadius: theme.radius, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: theme.accentLight, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: theme.accent }}>📅 Volné termíny — {proc.name} ({proc.duration}')</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button onClick={() => navigateDay(-1)} style={{ border: "none", background: "white", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 14 }}>◂</button>
          <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} min={today} style={{ padding: "3px 8px", border: `1px solid ${theme.border}`, borderRadius: 4, fontFamily: MONO, fontSize: 12 }} />
          <button onClick={() => navigateDay(1)} style={{ border: "none", background: "white", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 14 }}>▸</button>
        </div>
      </div>
      <div style={{ padding: "8px 14px", maxHeight: 220, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: 16, textAlign: "center", color: theme.textMuted, fontSize: 13 }}>Načítám...</div>
        ) : hours.length === 0 ? (
          <div style={{ padding: 16, textAlign: "center", color: theme.textMuted, fontSize: 13 }}>Žádné volné termíny pro tento den</div>
        ) : hours.map(h => (
          <div key={h} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, marginBottom: 3 }}>{h}:00</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {grouped[h].map((s, i) => {
                const isSel = s.date === selectedDate && s.time === selectedTime && s.doctorId === (doctorId || s.doctorId);
                const color = s.doctorColor || theme.accent;
                return (
                  <button key={i} onClick={() => onSelect(s)}
                    style={{ padding: "3px 8px", border: `1.5px solid ${isSel ? theme.accent : color + "40"}`, borderRadius: 4, background: isSel ? theme.accent : color + "08", color: isSel ? "white" : theme.text, cursor: "pointer", fontSize: 12, fontFamily: MONO, fontWeight: 600, transition: "all 0.1s" }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = color + "20"; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = color + "08"; }}
                    title={s.doctorName || ''}>
                    {s.time}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
