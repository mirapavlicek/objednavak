import { PROCEDURES } from './constants';
import { getToday, addDays } from './time';

const CZ_DAYS_MAP = { "pondeli": 1, "pondelí": 1, "pondělí": 1, "po": 1, "utery": 2, "úterý": 2, "ut": 2, "streda": 3, "středa": 3, "st": 3, "ctvrtek": 4, "čtvrtek": 4, "ct": 4, "čt": 4, "patek": 5, "pátek": 5, "pa": 5, "pá": 5, "sobota": 6, "so": 6, "nedele": 7, "neděle": 7, "ne": 7, "zitra": -1, "zítra": -1, "pozitri": -2, "pozítří": -2 };

const PROC_KEYWORDS = {
  vaccination: ["vakc", "očko", "očkov"],
  checkup: ["prohlíd", "prohlid", "prevenc", "kontrola"],
  surgery_small: ["operac", "zákrok", "zakrok", "chirurg"],
  surgery_large: ["velk", "velká operac"],
  dental: ["dent", "zuby", "zub", "drápky", "drapky", "dráp", "drap"],
  xray: ["rtg", "rentgen", "snímek", "snimek"],
  ultrasound: ["ultra", "sono", "usg"],
  blood_work: ["krev", "odběr", "odber", "labor", "rozbor"],
  castration: ["kastr", "steriliz"],
  dermatology: ["derma", "kůže", "kuze", "srst", "alergi"],
  emergency: ["akut", "pohotov", "naléh", "naleh", "urgentní", "urgentni"],
  followup: ["kontrol", "follow"],
  euthanasia: ["eutan"],
  other: [],
};

const dateStr = d => typeof d === 'string' ? d : d.toISOString().split("T")[0];

export function parseQuickBook(text, clients, pets) {
  const raw = text.trim();
  if (!raw) return null;
  const tokens = raw.split(/\s+/);
  const used = new Set();
  let result = { clientId: "", petId: "", manualName: "", manualPet: "", procedureId: "", date: "", time: "", isAcute: false, tokens: [], remaining: [] };

  // 1) Extract time (HH:MM or H:MM or H.MM)
  for (let i = 0; i < tokens.length; i++) {
    const m = tokens[i].match(/^(\d{1,2})[:\.](\d{2})$/);
    if (m) { result.time = `${m[1].padStart(2, "0")}:${m[2]}`; used.add(i); break; }
    if (/^\d{1,2}$/.test(tokens[i]) && parseInt(tokens[i]) >= 6 && parseInt(tokens[i]) <= 23 && !tokens[i + 1]?.match(/^[:\.]?\d{2}$/)) {
      const h = parseInt(tokens[i]);
      if (h >= 6 && h <= 23) { result.time = `${String(h).padStart(2, "0")}:00`; used.add(i); break; }
    }
  }

  // 2) Extract date — day names or DD.MM. or DD.MM.YYYY
  for (let i = 0; i < tokens.length; i++) {
    if (used.has(i)) continue;
    const low = tokens[i].toLowerCase().replace(/[.,]/g, "");
    if (CZ_DAYS_MAP[low] !== undefined) {
      const v = CZ_DAYS_MAP[low];
      if (v === -1) {
        result.date = addDays(new Date(), 1); used.add(i);
      } else if (v === -2) {
        result.date = addDays(new Date(), 2); used.add(i);
      } else {
        const today = new Date();
        const todayDow = today.getDay() === 0 ? 7 : today.getDay();
        let diff = v - todayDow;
        if (diff <= 0) diff += 7;
        result.date = addDays(today, diff); used.add(i);
      }
      break;
    }
    const dm = tokens[i].match(/^(\d{1,2})\.(\d{1,2})\.?(\d{2,4})?$/);
    if (dm) {
      const year = dm[3] ? (dm[3].length === 2 ? 2000 + parseInt(dm[3]) : parseInt(dm[3])) : new Date().getFullYear();
      const d = new Date(year, parseInt(dm[2]) - 1, parseInt(dm[1]));
      if (!isNaN(d.getTime())) { result.date = dateStr(d); used.add(i); break; }
    }
  }

  // 3) Extract procedure by keywords
  const unusedText = tokens.filter((_, i) => !used.has(i)).join(" ").toLowerCase();
  let bestProc = null, bestProcLen = 0;
  for (const [procId, keywords] of Object.entries(PROC_KEYWORDS)) {
    for (const kw of keywords) {
      if (unusedText.includes(kw) && kw.length > bestProcLen) { bestProc = procId; bestProcLen = kw.length; }
    }
  }
  if (bestProc) {
    result.procedureId = bestProc;
    for (let i = 0; i < tokens.length; i++) {
      if (used.has(i)) continue;
      const low = tokens[i].toLowerCase().replace(/[.,]/g, "");
      for (const kw of (PROC_KEYWORDS[bestProc] || [])) {
        if (low.includes(kw) || kw.includes(low)) { used.add(i); break; }
      }
    }
  }

  // 4) Try to match client
  const nameTokens = tokens.filter((_, i) => !used.has(i)).map(t => t.toLowerCase().replace(/[.,]/g, ""));
  if (nameTokens.length > 0) {
    const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let matches = [];
    for (const c of clients) {
      const ln = norm(c.lastName), fn = norm(c.firstName);
      let score = 0;
      for (const t of nameTokens) {
        const nt = norm(t);
        if (ln === nt || fn === nt) score += 10;
        else if (ln.startsWith(nt) || fn.startsWith(nt)) score += 5;
        else if (ln.includes(nt) || fn.includes(nt)) score += 2;
      }
      if (score > 0) matches.push({ client: c, score });
    }
    matches.sort((a, b) => b.score - a.score);
    if (matches.length === 1 || (matches.length > 1 && matches[0].score > matches[1].score)) {
      result.clientId = matches[0].client.id;
      const cPets = pets.filter(p => p.clientId === result.clientId);
      if (cPets.length === 1) result.petId = cPets[0].id;
      else {
        for (const p of cPets) {
          const pn = norm(p.name);
          for (const t of nameTokens) {
            if (pn === norm(t) || pn.startsWith(norm(t))) { result.petId = p.id; break; }
          }
          if (result.petId) break;
        }
      }
    }
    result.manualName = tokens.filter((_, i) => !used.has(i)).join(" ");
  }

  // 5) Determine acute
  if (!result.date && !result.time) result.isAcute = true;

  // Build token info for display
  result.tokens = tokens.map((t, i) => {
    if (result.time && t.match(/^(\d{1,2})[:\.](\d{2})$|^\d{1,2}$/) && used.has(i)) return { text: t, type: "time" };
    const low = t.toLowerCase().replace(/[.,]/g, "");
    if (CZ_DAYS_MAP[low] !== undefined && used.has(i)) return { text: t, type: "date" };
    if (t.match(/^\d{1,2}\.\d{1,2}/) && used.has(i)) return { text: t, type: "date" };
    if (used.has(i)) return { text: t, type: "procedure" };
    if (result.clientId) return { text: t, type: "client" };
    return { text: t, type: "name" };
  });

  return result;
}