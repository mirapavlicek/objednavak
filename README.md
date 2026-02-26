# 🏥 Objednávací systém — Prototyp

Interaktivní prototyp objednávacího systému pro ambulantní provoz.

## Typy návštěv

| Kód | Typ | Délky |
|-----|-----|-------|
| A1 | Obecný slot | 10–60 min |
| A2 | Očko, KO, 1.visit, Konzult, USG | 10–40 min |
| OPER | Operace | 30–120 min |
| B | Akutní příjem | 10–40 min |

## Rychlý start (lokálně)

```bash
npm install
npm run dev
```

Otevře se na `http://localhost:5173`

## Deploy na Vercel

### Varianta A — přes GitHub (doporučeno)

1. Vytvoř nový repozitář na GitHub
2. Pushni tento projekt:
   ```bash
   git init
   git add .
   git commit -m "init: objednavaci system"
   git remote add origin https://github.com/TVUJ-USERNAME/objednavaci-system.git
   git push -u origin main
   ```
3. Jdi na [vercel.com/new](https://vercel.com/new)
4. Propoj GitHub účet → vyber repozitář
5. Vercel automaticky detekuje Vite — klikni **Deploy**
6. Za ~30 sekund máš URL: `https://objednavaci-system.vercel.app`

### Varianta B — přes Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

## Technologie

- React 18
- Vite 6
- Vanilla CSS (žádné frameworky)
