import { useState, useEffect } from 'react';
import { theme, FONT, MONO, PROCEDURES, STATUSES, DAY_NAMES } from '../../utils/constants';
import { getToday, toMin, fromMin, addDays, getMonday } from '../../utils/time';
import { getCalendar } from '../../api/calendar';

const CZ_DAY_SHORT = ["Ne", "Po", "Ut", "St", "Ct", "Pa", "So"];
const dateStr = d => d.toISOString().split("T")[0];

export default function CalendarView({ config, onEdit }) {
  const today = getToday();
  const [viewDate, setViewDate] = useState(today);
  const [mode, setMode] = useState("week");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getCalendar({ date: viewDate, mode });
        if (!cancelled) setAppointments(res.data.data || []);
      } catch (err) {
        console.error('Calendar load error:', err);
        if (!cancelled) setAppointments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [viewDate, mode]);

  const activeApts = appointments.filter(a => a.status !== "rejected" && a.status !== "no_show");

  const getAptColor = (apt) => {
    const doc = (config?.doctors || []).find(d => d.id === apt.doctorId);
    const proc = PROCEDURES.find(p => p.id === apt.procedureId);
    return apt.doctor?.color || doc?.color || proc?.color || theme.accent;
  };

  const aptLabel = (apt) => {
    return apt.client ? `${apt.client.lastName}` : (apt.manualName || "?");
  };

  const navigate = (dir) => {
    const d = new Date(viewDate + "T00:00");
    if (mode === "day") d.setDate(d.getDate() + dir);
    else if (mode === "week") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setViewDate(dateStr(d));
  };

  const titleText = () => {
    const d = new Date(viewDate + "T00:00");
    if (mode === "day") return d.toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
    if (mode === "week") {
      const monStr = getMonday(viewDate);
      const sunStr = addDays(monStr, 6);
      const mon = new Date(monStr + "T00:00");
      const sun = new Date(sunStr + "T00:00");
      return `${mon.getDate()}.${mon.getMonth() + 1}. \u2014 ${sun.getDate()}.${sun.getMonth() + 1}. ${sun.getFullYear()}`;
    }
    return d.toLocaleDateString("cs-CZ", { month: "long", year: "numeric" });
  };

  const openingHours = config?.openingHours || {};

  // Day view
  const renderDay = () => {
    const dayName = DAY_NAMES[new Date(viewDate + "T00:00").getDay()];
    const oh = openingHours[dayName];
    const dayApts = activeApts.filter(a => a.date === viewDate).sort((a, b) => a.time.localeCompare(b.time));
    if (!oh) return (
      <div style={{ padding: 60, textAlign: "center", color: theme.textMuted, background: "white", borderRadius: theme.radius, border: `1px solid ${theme.border}` }}>
        Zavřeno
      </div>
    );
    const startH = parseInt(oh.open.split(":")[0]);
    const endH = Math.ceil(toMin(oh.close) / 60);
    const PX = 72;
    const hours = [];
    for (let h = startH; h < endH; h++) hours.push(h);
    return (
      <div style={{ display: "flex", background: "white", border: `1px solid ${theme.border}`, borderRadius: theme.radius, overflow: "hidden", minHeight: hours.length * PX }}>
        <div style={{ width: 52, borderRight: `1px solid ${theme.border}`, flexShrink: 0 }}>
          {hours.map(h => (
            <div key={h} style={{ height: PX, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 6, paddingTop: 2, fontSize: 10, fontFamily: MONO, color: theme.textMuted, fontWeight: 600 }}>
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          {hours.map(h => (
            <div key={h} style={{ height: PX, borderBottom: `1px solid ${theme.border}10` }}>
              <div style={{ height: PX / 2, borderBottom: `1px dashed ${theme.border}08` }} />
            </div>
          ))}
          {dayApts.map(apt => {
            const color = getAptColor(apt);
            const top = ((toMin(apt.time) - startH * 60) / 60) * PX;
            const height = Math.max((apt.duration / 60) * PX, 20);
            const proc = PROCEDURES.find(p => p.id === apt.procedureId);
            const si = STATUSES[apt.status];
            return (
              <div
                key={apt.id}
                onClick={() => onEdit && onEdit(apt)}
                style={{
                  position: "absolute", top, left: 4, right: 4,
                  height: Math.max(height - 2, 18),
                  background: color + "12",
                  border: `1.5px solid ${color}40`,
                  borderLeft: `4px solid ${color}`,
                  borderRadius: 6, padding: "2px 8px",
                  cursor: "pointer", overflow: "hidden",
                  fontSize: 12, zIndex: 2, transition: "all .1s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = color + "28"; e.currentTarget.style.zIndex = 10; }}
                onMouseLeave={e => { e.currentTarget.style.background = color + "12"; e.currentTarget.style.zIndex = 2; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11 }}>{apt.time}</span>
                  <span style={{ fontSize: 10, color: si?.color }}>{si?.icon}</span>
                </div>
                {height > 26 && (
                  <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {aptLabel(apt)}{apt.pet ? ` \u2014 ${apt.pet.name}` : apt.manualPet ? ` \u2014 ${apt.manualPet}` : ""}
                  </div>
                )}
                {height > 46 && (
                  <div style={{ fontSize: 10, color: theme.textMuted }}>{proc?.name}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Week view
  const renderWeek = () => {
    const monStr = getMonday(viewDate);
    const days = Array.from({ length: 7 }, (_, i) => {
      const ds = addDays(monStr, i);
      const d = new Date(ds + "T00:00");
      const dn = DAY_NAMES[d.getDay()];
      const oh = openingHours[dn];
      return {
        date: d, ds, dn, oh,
        apts: activeApts.filter(a => a.date === ds).sort((a, b) => a.time.localeCompare(b.time)),
      };
    });
    let minH = 24, maxH = 0;
    days.forEach(d => {
      if (d.oh) {
        minH = Math.min(minH, parseInt(d.oh.open.split(":")[0]));
        maxH = Math.max(maxH, Math.ceil(toMin(d.oh.close) / 60));
      }
    });
    if (minH >= maxH) { minH = 7; maxH = 18; }
    const PX = 56;
    const hours = [];
    for (let h = minH; h < maxH; h++) hours.push(h);

    return (
      <div style={{ display: "flex", background: "white", border: `1px solid ${theme.border}`, borderRadius: theme.radius, overflow: "auto" }}>
        <div style={{ width: 44, borderRight: `1px solid ${theme.border}`, flexShrink: 0 }}>
          <div style={{ height: 52, borderBottom: `1px solid ${theme.border}` }} />
          {hours.map(h => (
            <div key={h} style={{ height: PX, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 4, paddingTop: 1, fontSize: 10, fontFamily: MONO, color: theme.textMuted }}>
              {String(h).padStart(2, "0")}
            </div>
          ))}
        </div>
        {days.map(day => {
          const isToday = day.ds === today;
          const closed = !day.oh;
          return (
            <div key={day.ds} style={{ flex: 1, minWidth: 100, borderRight: `1px solid ${theme.border}08` }}>
              <div
                onClick={() => { setViewDate(day.ds); setMode("day"); }}
                style={{
                  height: 52, borderBottom: `1px solid ${theme.border}`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  background: isToday ? theme.accentLight : closed ? "#fef2f220" : "transparent",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: isToday ? theme.accent : theme.textMuted }}>
                  {CZ_DAY_SHORT[day.date.getDay()]}
                </div>
                <div style={{
                  fontSize: 16, fontWeight: 800,
                  color: isToday ? theme.accent : theme.text,
                  width: 28, height: 28, borderRadius: "50%",
                  background: isToday ? theme.accent + "18" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {day.date.getDate()}
                </div>
              </div>
              <div style={{ position: "relative", minHeight: hours.length * PX, background: closed ? "#fef2f208" : "transparent" }}>
                {hours.map(h => (
                  <div key={h} style={{ height: PX, borderBottom: `1px solid ${theme.border}06` }} />
                ))}
                {closed && (
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 11, color: theme.textMuted, fontWeight: 600, whiteSpace: "nowrap" }}>
                    Zavřeno
                  </div>
                )}
                {day.apts.map(apt => {
                  const color = getAptColor(apt);
                  const top = ((toMin(apt.time) - minH * 60) / 60) * PX;
                  const height = Math.max((apt.duration / 60) * PX, 28);
                  const si = STATUSES[apt.status];
                  return (
                    <div
                      key={apt.id}
                      onClick={() => onEdit && onEdit(apt)}
                      title={`${apt.time} ${aptLabel(apt)}`}
                      style={{
                        position: "absolute", top, left: 2, right: 2,
                        height: Math.max(height - 1, 26),
                        background: color + "18",
                        border: `1px solid ${color}35`,
                        borderLeft: `3px solid ${color}`,
                        borderRadius: 4, padding: "1px 4px",
                        cursor: "pointer", overflow: "hidden",
                        zIndex: 2, transition: "all .1s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = color + "35"; e.currentTarget.style.zIndex = 10; }}
                      onMouseLeave={e => { e.currentTarget.style.background = color + "18"; e.currentTarget.style.zIndex = 2; }}
                    >
                      <div style={{ fontSize: 9, fontFamily: MONO, fontWeight: 700, lineHeight: 1.2 }}>{apt.time} <span style={{ fontFamily: FONT, fontWeight: 600 }}>{aptLabel(apt)}</span></div>
                      {height > 30 && (
                        <div style={{ fontSize: 9, color: si?.color }}>{si?.icon}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Month view
  const renderMonth = () => {
    const d = new Date(viewDate + "T00:00");
    const year = d.getFullYear(), month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const totalDays = lastDay.getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) {
      const pd = new Date(year, month, -startOffset + i + 1);
      cells.push({ date: pd, ds: dateStr(pd), inMonth: false });
    }
    for (let i = 1; i <= totalDays; i++) {
      const cd = new Date(year, month, i);
      cells.push({ date: cd, ds: dateStr(cd), inMonth: true });
    }
    while (cells.length % 7 !== 0) {
      const nd = new Date(year, month + 1, cells.length - startOffset - totalDays + 1);
      cells.push({ date: nd, ds: dateStr(nd), inMonth: false });
    }
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    return (
      <div style={{ background: "white", border: `1px solid ${theme.border}`, borderRadius: theme.radius, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${theme.border}` }}>
          {CZ_DAY_SHORT.slice(1).concat(CZ_DAY_SHORT[0]).map(d => (
            <div key={d} style={{ padding: "8px 0", textAlign: "center", fontSize: 11, fontWeight: 700, color: theme.textMuted, background: theme.bg }}>
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: wi < weeks.length - 1 ? `1px solid ${theme.border}10` : "none" }}>
            {week.map(cell => {
              const isToday = cell.ds === today;
              const dayApts = activeApts.filter(a => a.date === cell.ds);
              const dn = DAY_NAMES[cell.date.getDay()];
              const oh = openingHours[dn];
              const closed = !oh;
              return (
                <div
                  key={cell.ds}
                  onClick={() => { setViewDate(cell.ds); setMode("day"); }}
                  style={{
                    minHeight: 80,
                    borderRight: `1px solid ${theme.border}06`,
                    padding: 4, cursor: "pointer",
                    background: isToday ? theme.accentLight : closed ? "#fef2f210" : cell.inMonth ? "transparent" : "#f8fafc80",
                    transition: "background .1s",
                  }}
                  onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = theme.bg; }}
                  onMouseLeave={e => {
                    if (!isToday) e.currentTarget.style.background = isToday ? theme.accentLight : closed ? "#fef2f210" : cell.inMonth ? "transparent" : "#f8fafc80";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <span style={{
                      fontSize: 13, fontWeight: isToday ? 800 : cell.inMonth ? 600 : 400,
                      color: isToday ? theme.accent : cell.inMonth ? theme.text : theme.textMuted,
                      width: 24, height: 24, borderRadius: "50%",
                      background: isToday ? theme.accent + "20" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {cell.date.getDate()}
                    </span>
                    {dayApts.length > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: theme.accent, fontFamily: MONO }}>
                        {dayApts.length}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {dayApts.slice(0, 3).map(apt => {
                      const color = getAptColor(apt);
                      return (
                        <div key={apt.id} style={{
                          fontSize: 9, padding: "1px 4px",
                          background: color + "15", borderRadius: 3,
                          borderLeft: `2px solid ${color}`,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          lineHeight: 1.4,
                        }}>
                          <span style={{ fontFamily: MONO, fontWeight: 600 }}>{apt.time}</span> {aptLabel(apt)}
                        </div>
                      );
                    })}
                    {dayApts.length > 3 && (
                      <div style={{ fontSize: 9, color: theme.textMuted, paddingLeft: 4 }}>
                        +{dayApts.length - 3} další
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Navigation bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "white", padding: "8px 12px", borderRadius: theme.radius,
        border: `1px solid ${theme.border}`, flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ border: "none", background: theme.bg, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 15 }}
          >
            {"\u25C2"}
          </button>
          <button
            onClick={() => setViewDate(today)}
            style={{
              border: `1px solid ${theme.border}`,
              background: viewDate === today ? theme.accent : "white",
              color: viewDate === today ? "white" : theme.textSecondary,
              borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700,
            }}
          >
            Dnes
          </button>
          <button
            onClick={() => navigate(1)}
            style={{ border: "none", background: theme.bg, borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 15 }}
          >
            {"\u25B8"}
          </button>
        </div>
        <div style={{ fontWeight: 800, fontSize: 15, textAlign: "center", flex: 1, minWidth: 140 }}>
          {titleText()}
        </div>
        <div style={{ display: "flex", gap: 2, background: theme.bg, padding: 2, borderRadius: 6 }}>
          {[{ id: "day", l: "Den" }, { id: "week", l: "Týden" }, { id: "month", l: "Měsíc" }].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={{
                padding: "5px 12px", border: "none", borderRadius: 5, cursor: "pointer",
                background: mode === m.id ? "white" : "transparent",
                boxShadow: mode === m.id ? theme.shadow : "none",
                color: mode === m.id ? theme.accent : theme.textMuted,
                fontSize: 12, fontWeight: 700,
              }}
            >
              {m.l}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar content */}
      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: theme.textMuted }}>
          Načítám kalendář...
        </div>
      ) : (
        <>
          {mode === "day" && renderDay()}
          {mode === "week" && renderWeek()}
          {mode === "month" && renderMonth()}
        </>
      )}
    </div>
  );
}
