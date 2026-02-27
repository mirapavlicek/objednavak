# 🐾 VetBook — Veterinární objednávací systém

Moderní objednávací systém pro veterinární kliniku. React SPA, deploy na Vercel, PWA ready.

## Funkce

- **⚡ QuickBook** — rychlá objednávka textovým příkazem (`Černý drápky sobota 14:30`)
- **📅 Kalendář** — denní / týdenní / měsíční pohled
- **🏠 Čekárna** — real-time přehled pacientů v ordinaci
- **🚨 Akutní příjem** — jeden klik, rovnou do čekárny
- **📱 SMS notifikace** — SmsManager.cz API, šablony, auto-připomínky
- **👥 Registr klientů** — fulltext hledání, editace, CRUD zvířat
- **🔐 Role** — recepce, lékař, manažer, veřejný portál
- **⚙️ Nastavení** — otvírací doba, lékaři, procedurní bloky, zaměstnanci
- **📱 PWA** — instalace na plochu, offline, push notifications ready

## Quick start

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build    # → dist/
```

Auto-deploy na Vercel z `main` branche.

## Tech stack

- React 18 + Vite
- Inline CSS (žádný framework)
- SmsManager.cz (SMS API)
- Service Worker (PWA)
- Vercel (hosting)

## Struktura

```
src/App.jsx          # Celá aplikace (~1950 řádků)
src/main.jsx         # React entry point
public/manifest.json # PWA manifest
public/sw.js         # Service worker
public/icon-*.png    # PWA ikony
CLAUDE.md            # Kontext pro Claude Code
```

Podrobná dokumentace architektury v [CLAUDE.md](./CLAUDE.md).
