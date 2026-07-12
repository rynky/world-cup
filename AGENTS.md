# world-cup

FIFA 2026 World Cup HUD and statistics viewing tool. Built with React (Vite) and Tailwind CSS v4.

## Setup

1. Install Node.js (v24+ recommended)
2. Clone the repository
3. Install dependencies:
   ```
   npm install
   ```
4. Start the dev server:
   ```
   npm run dev
   ```
5. Open `http://localhost:5173/` in your browser

**Note:** Node.js must be on your PATH. If `npm`/`node` are not found, ensure `C:\Program Files\nodejs\` is in your `~/.bashrc` PATH export.

## Available Scripts

- `npm run dev` — Start the Vite dev server with HMR
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run oxlint for code quality

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4 with `@tailwindcss/vite` plugin
- **Font:** JetBrains Mono (loaded via Google Fonts)
- **Linter:** oxlint
- **Runtime:** Node.js v24+

## API Data Sources

### SportScore (primary — matches, standings, top scorers, live detail)

- **Base URL:** `https://sportscore.com/api/widget/`
- **Auth:** None required
- **CORS:** Enabled (`Access-Control-Allow-Origin: *`)
- **Rate limit:** ~10,000 requests/24h/IP
- **Attribution:** Required — "Powered by SportScore" link in bottom-right corner
- **Endpoints:**
  - `/api/widget/matches/?sport=football&limit=100` — Recent matches (client-side filtered to FIFA World Cup)
  - `/api/widget/match/?sport=football&slug={slug}` — Match detail with live minute, incidents, stats
  - `/api/widget/standings/?sport=football&slug=fifa-world-cup` — Group standings tables
  - `/api/widget/topscorers/?sport=football&slug=fifa-world-cup&limit=10` — Tournament top scorers

### worldcup26.ir (backup — today's match schedule)

- **Base URL:** `https://worldcup26.ir/`
- **Auth:** None required
- **CORS:** Enabled (`Access-Control-Allow-Origin: *`)
- **Endpoints:**
  - `/get/games` — All 104 matches; filtered to today's date as backup when SportScore list misses WC matches

## Project Conventions

- All components live in `src/components/`
- API layer lives in `src/api.js`
- Theme colors are defined in `src/index.css` under `@theme` as `--color-terminal-*`
- Team logos are remote URLs from SportScore (`img.thesports.com`) — no local SVGs used
- Full team names used throughout (SportScore provides no FIFA codes)
- Use monospace font and dark terminal aesthetic throughout
- Today's matches shown as game tabs with diamond separators, one match displayed at a time
- NavBar renders edge-to-edge golden bar, placed outside main flex container via React Fragment
- Data is fetched on mount; if a live match is detected, polls every 30s
- Live match auto-selected on load/refresh
- Stoppage time normalized: running-clock minutes converted to `X+Y` format (e.g. `45+2'`)

## File Structure

```
world-cup
├── AGENTS.md
├── index.html
├── index-test.html          (test simulation entry point)
├── package.json
├── vite.config.js
├── public/
│   ├── flags/          (legacy — only esp.svg, bel.svg)
│   └── icons.svg
├── src/
│   ├── main.jsx
│   ├── index.css
│   ├── App.jsx
│   ├── api.js
│   ├── mockData.js          (mock match data for test simulation)
│   ├── test-sim.jsx         (standalone test simulation entry)
│   ├── teams.js             (legacy — no longer imported)
│   └── components/
│       ├── MatchCard.jsx
│       ├── NavBar.jsx
│       ├── Standings.jsx
│       └── TopScorers.jsx
├── .opencode/
└── dist/
```

## Design Philosophy

The UI follows a TUI (Terminal User Interface) inspired aesthetic:
- Dark backgrounds with muted borders
- Monospace typography (JetBrains Mono)
- Minimal color palette: amber for team codes/headers, green for scores, dim gray for structural elements
- Clean, information-dense layouts over decorative elements

## Observations

- Obsidian vault for project notes: `C:\Users\raiya\Obsidian\world-cup`
- `src/teams.js` is legacy dead code — teams are now fetched from SportScore
- The wheniskickoff.com API is no longer used (had CORS issues and stale data)
- SportScore's `/matches/` endpoint doesn't always include FIFA World Cup matches — worldcup26.ir backup ensures today's WC matches always appear
- SportScore uses "Group 1"–"Group 12" instead of "A"–"L"; mapped via `GROUP_LABELS`
- SportScore provides no FIFA codes — full team names used throughout
