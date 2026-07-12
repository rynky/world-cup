const SS_BASE = "https://sportscore.com/api/widget"
const WC_GAMES_URL = "https://worldcup26.ir/get/games"
const TOP_SCORERS_URL = `${SS_BASE}/topscorers/?sport=football&slug=fifa-world-cup&limit=10`
const GROUP_LABELS = "ABCDEFGHIJKL".split("")

function mapStatus(status) {
  if (status === "finished") return "finished"
  if (status === "upcoming" || status === "cancelled" || status === "Delayed") return "scheduled"
  return status
}

function parseDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function parseTime(iso) {
  if (!iso) return null
  const d = new Date(iso)
  const h = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${h}:${min}`
}

function extractSlug(url) {
  if (!url) return null
  return url.replace(/^\/football\/match\//, "").replace(/\/$/, "")
}

function hadExtraTime(incidents) {
  return incidents && incidents.some((i) => i.time > 105)
}

function extractGoalsFromIncidents(incidents, side, htScore, matchStatusText) {
  if (!incidents) return []
  const inExtraTime = isExtraTime(matchStatusText) || hadExtraTime(incidents)
  return incidents
    .filter((i) => (i.type === "Goal" || i.type === "Penalty goal") && i.side === side)
    .map((i) => {
      let status
      if (inExtraTime && i.time > 90) {
        status = "extra time"
      } else {
        const is1stHalf = i.home_score + i.away_score <= htScore
        status = is1stHalf ? "1st half" : "2nd half"
      }
      return {
        name: i.player || "Unknown",
        minute: i.time != null ? normalizeMinute(i.time, status) : null,
      }
    })
}

export async function fetchStandings() {
  const res = await fetch(`${SS_BASE}/standings/?sport=football&slug=fifa-world-cup`)
  if (!res.ok) throw new Error(`Standings fetch failed: ${res.status}`)
  const json = await res.json()

  const teamLookup = {}

  const groups = json.tables.map((t, i) => {
    const groupLabel = GROUP_LABELS[i] || t.group
    return {
      group: groupLabel,
      rows: t.rows.map((r) => {
        teamLookup[r.team] = {
          logo: r.team_logo,
          slug: r.team_slug,
          group: groupLabel,
        }
        return {
          pos: r.pos,
          team: r.team,
          logo: r.team_logo,
          p: r.p,
          w: r.w,
          d: r.d,
          l: r.l,
          gf: r.gf,
          ga: r.ga,
          gd: r.gd,
          pts: r.pts,
        }
      }),
    }
  })

  return { groups, teamLookup }
}

export async function fetchMatches() {
  const res = await fetch(`${SS_BASE}/matches/?sport=football&limit=100`)
  if (!res.ok) throw new Error(`Matches fetch failed: ${res.status}`)
  const json = await res.json()

  return json.matches
    .filter((m) => m.competition === "FIFA World Cup")
    .map((m, i) => ({
      num: i,
      homeName: m.home,
      awayName: m.away,
      homeScore: m.home_score,
      awayScore: m.away_score,
      status: mapStatus(m.status),
      homeScorers: [],
      awayScorers: [],
      homeLogo: m.home_logo,
      awayLogo: m.away_logo,
      date: parseDate(m.time),
      time: parseTime(m.time),
      slug: extractSlug(m.url),
      group: null,
      phase: "group",
      elapsedTime: null,
    }))
}

function isExtraTime(statusText) {
  return /extra\s*time/i.test(statusText || "")
}

function normalizeMinute(liveMinute, statusText) {
  const s = String(liveMinute)
  if (isExtraTime(statusText)) {
    const n = parseInt(liveMinute, 10)
    if (isNaN(n)) return liveMinute
    return String(n)
  }
  if (s.includes("+")) {
    const after = s.split("+")[1]
    if (!after || after === "0") return s.split("+")[0]
    return liveMinute
  }
  const n = parseInt(liveMinute, 10)
  if (isNaN(n)) return liveMinute
  if (statusText === "1st half" && n > 45) return `45+${n - 45}`
  if (statusText === "2nd half" && n > 90) return `90+${n - 90}`
  return String(n)
}

export async function fetchMatchDetail(slug) {
  const res = await fetch(`${SS_BASE}/match/?sport=football&slug=${slug}`)
  if (!res.ok) return null
  const json = await res.json()
  const m = json.match
  if (!m) return null

  const htScore = (m.home_ht_score || 0) + (m.away_ht_score || 0)

  const homeGoals = (m.incidents || []).filter(
    (i) => (i.type === "Goal" || i.type === "Penalty goal") && i.side === "home"
  ).length
  const awayGoals = (m.incidents || []).filter(
    (i) => (i.type === "Goal" || i.type === "Penalty goal") && i.side === "away"
  ).length

  const extraTime = (m.incidents || []).some(
    (i) => i.time > 90 && (i.type === "Goal" || i.type === "Penalty goal")
  )

  return {
    liveMinute: normalizeMinute(m.live_minute, m.status_text),
    homeScorers: extractGoalsFromIncidents(m.incidents, "home", htScore, m.status_text),
    awayScorers: extractGoalsFromIncidents(m.incidents, "away", htScore, m.status_text),
    homeScore: homeGoals,
    awayScore: awayGoals,
    extraTime,
  }
}

export async function fetchTodaysMatchIds() {
  try {
    const res = await fetch(WC_GAMES_URL)
    if (!res.ok) return { matches: [], phaseLookup: {} }
    const json = await res.json()

    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, "0")
    const d = String(today.getDate()).padStart(2, "0")
    const todayStr = `${y}-${m}-${d}`

    const phaseLookup = {}
    for (const g of json.games) {
      if (g.home_team_name_en && g.away_team_name_en) {
        phaseLookup[`${g.home_team_name_en}|${g.away_team_name_en}`] = g.type || "group"
      }
    }

    const matches = json.games
      .filter((g) => {
        if (!g.local_date) return false
        const date = g.local_date.replace(/(\d{2})\/(\d{2})\/(\d{4}).*/, "$3-$1-$2")
        return date === todayStr
      })
      .map((g) => ({
        id: Number(g.id),
        homeName: g.home_team_name_en,
        awayName: g.away_team_name_en,
        time: g.local_date?.split(" ")[1],
        status: g.time_elapsed === "live"
          ? "live"
          : g.time_elapsed === "finished" || g.time_elapsed === "Finished"
            ? "finished"
            : "scheduled",
        slug: `${g.home_team_name_en}-vs-${g.away_team_name_en}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        phase: g.type || "group",
      }))

    return { matches, phaseLookup }
  } catch {
    return { matches: [], phaseLookup: {} }
  }
}

export async function fetchTopScorers() {
  const res = await fetch(TOP_SCORERS_URL)
  if (!res.ok) throw new Error(`Top scorers fetch failed: ${res.status}`)
  const json = await res.json()

  return json.scorers.map((s) => ({
    rank: s.rank,
    player: s.player,
    team: s.team,
    logo: s.player_logo,
    teamLogo: s.team_logo,
    goals: s.goals,
    assists: s.assists,
    matches: s.matches,
    minutes: s.minutes,
  }))
}
