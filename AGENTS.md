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

### worldcup26.ir (matches, teams, standings)

- **Base URL:** `https://worldcup26.ir/`
- **Auth:** None required
- **CORS:** Enabled (`Access-Control-Allow-Origin: *`)
- **Endpoints:**
  - `/get/games` — All 104 matches with scores, scorers, status, phases
  - `/get/teams` — All 48 teams with FIFA codes, names, group assignments, flag URLs
  - `/get/groups` — All 12 group standings tables
- **Scorer data:** Per-match player names + minutes included directly
- **Note:** Community-maintained open-source API. No registration required.

### SportScore (top scorers)

- **Base URL:** `https://sportscore.com/api/widget/`
- **Auth:** None required
- **CORS:** Enabled (`Access-Control-Allow-Origin: *`)
- **Rate limit:** ~10,000 requests/24h/IP
- **Attribution:** Required — "Powered by SportScore" link in bottom-right corner
- **Endpoints:**
  - `/api/widget/topscorers/?sport=football&slug=fifa-world-cup&limit=10` — Tournament top scorers

## Project Conventions

- All components live in `src/components/`
- API layer lives in `src/api.js`
- Theme colors are defined in `src/index.css` under `@theme` as `--color-terminal-*`
- Team flags are remote URLs from worldcup26.ir (flagcdn.com) — no local SVGs used
- Use monospace font and dark terminal aesthetic throughout
- Matches grouped by local date into TODAY / TOMORROW sections with golden headers
- Decorative `❖` divider between day sections
- Data is fetched on mount; if a live match is detected, polls every 60s
- Partial API failures show a red `ERROR` badge while rendering available data

## File Structure

```
world-cup
├── AGENTS.md
├── index.html
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
│   ├── teams.js           (legacy — no longer imported)
│   └── components/
│       ├── MatchCard.jsx
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
- `src/teams.js` is legacy dead code — teams are now fetched from worldcup26.ir
- The wheniskickoff.com API is no longer used (had CORS issues and stale data)
- Scorer strings from worldcup26.ir require special parsing (curly quotes, injury time, penalty/OG notations)
