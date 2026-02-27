# VetBook — Veterinární objednávací systém

## Projekt

Single-page React aplikace pro veterinární kliniku. Objednávání pacientů (zvířat), správa čekárny, kalendář, SMS notifikace, PWA. Bez backendu — veškerý stav je v React state (demo data). Deploy na Vercel.

## Příkazy

```bash
npm run dev      # lokální dev server (Vite, port 5173)
npm run build    # produkční build → dist/
npm run preview  # preview produkčního buildu
```

Build MUSÍ projít bez chyb. Po každé změně: `npm run build` → ověřit.

## Architektura

**Jeden soubor:** `src/App.jsx` (~1950 řádků). Vše je v jednom souboru záměrně — jednoduchost, žádné importy mezi moduly, snadný deploy.

**Žádný backend.** Stav je v `useState` v hlavní komponentě `VetApp`. Demo data (`DEMO_CLIENTS`, `DEMO_PETS`, `DEMO_APTS`) se načtou při startu. V budoucnu se napojí na API/databázi.

**Inline CSS.** Žádný CSS framework, žádné třídy. Všechny styly jsou inline `style={{}}` objekty. Téma je v konstantě `theme` nahoře.

## Struktura App.jsx (shora dolů)

| Řádky cca | Sekce | Popis |
|---|---|---|
| 1–90 | Konstanty | `FONT`, `MONO`, `theme`, `ROLES`, `DEFAULT_CONFIG`, `PROCEDURES`, `STATUSES`, `TODAY/TOMORROW` |
| 90–120 | Demo data | `DEMO_CLIENTS`, `DEMO_PETS`, `DEMO_APTS` |
| 118–165 | `findFreeSlots()` | Algoritmus hledání volných slotů s respektem k otvírací době, blokům procedur, specializacím lékařů |
| 165–250 | UI primitiva | `Icon` (SVG), `StatusBadge`, `ProcBadge`, `Btn`, `Input`, `Select`, `Card`, `Modal`, `StatBox` |
| 250–310 | `AptRow` | Řádek objednávky s akcemi (potvrdit/přišel/převzít/hotovo/no-show/edit/SMS) |
| 310–375 | `FreeSlotModal` | Modální hledač volných termínů |
| 375–425 | `EditAptModal` | Editace objednávky (podporuje i ruční klienty) |
| 425–500 | `SmsModal` | SMS odeslání přes SmsManager.cz API, 5 šablon |
| 500–600 | Helpers | `generatePassword()`, `InlineSlotPicker` (minutové sloty), `QuickAcuteModal` |
| 600–690 | `ClientRegistry` | Seznam klientů a zvířat s CRUD |
| 690–995 | `SettingsView` | Nastavení: otvírací doba, lékaři, bloky, akutní, zaměstnanci, SMS, WinVet |
| 995–1105 | `PublicView` | Veřejný objednávkový portál pro zákazníky s registrací |
| 1107–1360 | QuickBook | `parseQuickBook()` smart parser + `QuickBookBar` UI |
| 1360–1590 | `CalendarView` | Denní/týdenní/měsíční pohled |
| 1590–1640 | `PwaInstallBanner` | PWA install prompt (Android + iOS instrukce) |
| 1640–1810 | Role views | `ReceptionView`, `DoctorView`, `ManagerView` |
| 1876–konec | `VetApp` | Hlavní komponenta, routing podle role, state management |

## Klíčové datové struktury

### Appointment (objednávka)
```js
{
  id, clientId, petId,              // vazby na číselník
  manualName, manualPhone, manualPet, // ruční zadání (bez číselníku)
  procedureId, doctorId,
  date: "2026-03-01", time: "09:30",
  duration: 30, status: "confirmed",
  note, createdBy: "reception"|"public",
  arrivalTime                       // pro akutní
}
```

### Config (`DEFAULT_CONFIG`)
- `openingHours` — po dnech (mon–sun), `{ open, close }` nebo `null` (zavřeno)
- `slotInterval` — minuty (default 5)
- `doctors[]` — `{ id, name, specializations[], color }`
- `procedureBlocks[]` — časové bloky s kategoriemi a přiřazenými lékaři
- `employees[]` — `{ id, name, email, role, pin, doctorId? }`
- `smsApiKey` — API klíč SmsManager.cz
- `smsReminderHours` — kolik hodin před termínem poslat připomínku

### Statusy objednávek
`pending` → `confirmed` → `arrived` → `in_progress` → `completed`
Alternativně: `rejected`, `no_show`

## Role a přístupy

- **public** — veřejný portál, může podat žádost o termín
- **reception** — plná správa objednávek, čekárna, akutní příjem, klienti, kalendář, QuickBook
- **doctor** — workflow svých pacientů (převzít, hotovo)
- **manager** — statistiky, nastavení, registr klientů, plná editace

## SMS integrace

**SmsManager.cz JSON API v2**
- Endpoint: `POST https://api.smsmngr.com/v2/message`
- Header: `x-api-key: {config.smsApiKey}`
- Body: `{ body: "text", to: [{ phone_number: "+420..." }] }`
- SMS se posílá JEN klientům s telefonním číslem

## PWA

- `public/manifest.json` — manifest pro install
- `public/sw.js` — service worker (cache + push notifications)
- `index.html` — Apple meta tagy pro iOS
- Ikony: `public/icon-192.png`, `public/icon-512.png`

## QuickBook parser

Textový vstup v recepci. Rozpoznává:
- **Klienty** — fuzzy match příjmení/jména s normalizací diakritiky
- **Procedury** — klíčová slova (`drápky`→dental, `vakc`→vaccination, `ultra`→ultrasound...)
- **Datum** — české dny (`pondělí`, `so`, `zítra`, `pozítří`), `DD.MM.`, `DD.MM.YYYY`
- **Čas** — `14:30`, `8.30`, bare `9` (= 9:00)
- **Bez data+času** = akutní příjem (rovnou do čekárny)

Keyword mapa je v `PROC_KEYWORDS`, mapování dnů v `CZ_DAYS_MAP`.

## Konvence

- **Jazyk UI:** čeština (české popisky, hlášky, dny)
- **Jazyk kódu:** angličtina (proměnné, funkce, komentáře)
- **Formátování:** inline styly, žádné CSS soubory
- **Fonty:** DM Sans (text), JetBrains Mono (čísla/kódy)
- **Ikony:** SVG inline v komponentě `Icon`, emoji pro dekoraci
- **Barvy:** `theme` objekt — `accent` (modrá), `success`, `warning`, `danger`, `purple`
- **Čas:** vždy `"HH:MM"` string, helper funkce `toMin()` / `fromMin()`
- **Datum:** vždy `"YYYY-MM-DD"` ISO string

## Deploy

- GitHub repo: `mirapavlicek/objednavak`
- Auto-deploy: Vercel (main branch)
- Build: `npm run build` → `dist/`

## TODO / plánované

- [ ] Backend API (Node/Express nebo Supabase)
- [ ] Persistence dat (databáze místo demo dat)
- [ ] Push notifications (VAPID keys, subscription management)
- [ ] Auto-SMS triggery (cron pro připomínky)
- [ ] WinVet integrace (SOAP/REST)
- [ ] Tisk/export objednávek
- [ ] Vícejazičnost
