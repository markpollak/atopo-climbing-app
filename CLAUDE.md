# Atopo — Climbing Guide App

## What this is
Offline-first climbing guide app. Two products:
- **Mobile web** (simulated phone shell) — `src/screens/mobile/`
- **Atopo Studio** (desktop editor for guide authors) — `src/screens/studio/`

Separate from the horse racing / betting app in `~/`.

## How to run
```bash
cd ~/atopo
npm run dev        # starts on http://localhost:5174
```
Dev server config: `~/.claude/launch.json` → name "atopo", port 5174.

## Stack
Vite + React 18 + TypeScript. No backend yet — all data is local.

## Key files
| Path | Purpose |
|---|---|
| `src/data/stanage.ts` | Stanage Edge crag data — 21 routes with normalised line coords |
| `src/data/bracken.ts` | Bracken Edge data (kept for reference, not used in main app) |
| `src/data/grades.ts` | Grade conversion (UK/French/YDS), STATUS_META |
| `src/assets/stanage-left.jpg` | Hi-res Stanage photo (4072×2200, aspect 1.8509) |
| `src/components/TopoStage.tsx` | Pannable/zoomable topo with SVG route lines |
| `src/screens/mobile/MobileApp.tsx` | Tab navigator — entry point for mobile |
| `src/screens/studio/StudioApp.tsx` | Studio editor |
| `src/theme/index.ts` | Design token colours |
| `src/styles/atopo.css` | All CSS design tokens + shared classes |

## Architecture decisions
- **Route lines are normalised [x, y] in [0,1]** — x=0 left, y=0 top. Never burn into photo.
- Lines extracted via pixel analysis of annotated source photo — fine-tune in Studio.
- Grade system (UK/French/YDS) is a display-layer concern only. Store UK trad grades canonically.
- No backend yet. Guide data bundled as TypeScript. Next step: FastAPI + SQLite or Supabase.

## Current crag: Stanage Edge
- 21 routes, VDiff to E4, all Trad
- Source photo: `~/Mark personal/atopo web app/original photos/stanage-hi-res-left`
- Route lines were auto-extracted from annotated photo — positions are approximate, use Studio to fine-tune

## Environment variables
```
VITE_GOOGLE_MAPS_API_KEY=   # Google Maps JS API — map screen falls back to CSS if missing
```
Copy `.env.example` → `.env` and fill in.

## Design tokens
Font stack: Archivo (display/headings), Hanken Grotesk (UI), Spline Sans Mono (grades/coords).
Loaded from Google Fonts in `index.html`.
Key colours: `--rust: #C86B3C` (primary action), `--slate: #2D302F` (dark), `--moss: #3F5F4B` (offline/success).

## What's built
- [x] Home screen — featured crag hero, downloaded guides, recently viewed, projects
- [x] Crag detail — hero, stat chips, Overview/Approach/Access/Sectors tabs, grade spread chart
- [x] Topo viewer — pannable photo, SVG route lines, route list, detail sheet, Project/Tick actions
- [x] Map screen — crag markers, filter chips, Google Maps (with CSS fallback)
- [x] Search — live filter by name/grade/style/stars/status
- [x] Logbook — stats, recent ticks, current projects
- [x] Profile — grade system switcher (UK/French/YDS), preferences
- [x] Studio — topo editor with draggable handles, route inspector, route table, publish checklist

## What's not yet built
- [ ] Real backend / API (guide data is hardcoded)
- [ ] Offline storage (IndexedDB / SQLite)
- [ ] Guide download flow
- [ ] Auth (user accounts)
- [ ] Adding new route lines in Studio (Draw Route tool is placeholder)
- [ ] Expo native app (`~/atopo-native`) — scaffolded but needs finishing

## GitHub
https://github.com/markpollak/atopo-climbing-app
Main branch: master
