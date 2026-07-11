const GAMES_URL = "https://worldcup26.ir/get/games"
const TEAMS_URL = "https://worldcup26.ir/get/teams"
const GROUPS_URL = "https://worldcup26.ir/get/groups"
const TOP_SCORERS_URL = "https://sportscore.com/api/widget/topscorers/?sport=football&slug=fifa-world-cup&limit=10"

function parseScorers(raw) {
  if (!raw || raw === "null") return []
  try {
    let inner = raw.replace(/^\{|\}$/g, "")
    inner = inner.replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'")
    const parts = inner.split('","')
    return parts.map((s) => {
      let trimmed = s.replace(/^"|"$/g, "").replace(/\}$/, "").trim()
      trimmed = trimmed.replace(/\s*\(OG\)\s*'?$/i, "")
      trimmed = trimmed.replace(/\s*\(P\)\s*'?$/i, "")
      const match = trimmed.match(/^(.+?)\s+(\d+)['\u2019]?\s*(?:[+\u002B]\s*(\d+)['\u2019]?)?$/)
      if (match) {
        const minute = match[3] ? `${match[2]}+${match[3]}` : match[2]
        return { name: match[1].trim(), minute }
      }
      return { name: trimmed, minute: null }
    })
  } catch {
    return []
  }
}

export async function fetchMatches() {
  const res = await fetch(GAMES_URL)
  if (!res.ok) throw new Error(`Matches fetch failed: ${res.status}`)
  const json = await res.json()

  return json.games.map((g) => ({
    num: Number(g.id),
    homeCode: null,
    awayCode: null,
    homeName: g.home_team_name_en,
    awayName: g.away_team_name_en,
    homeScore: g.home_score !== "0" || g.finished === "TRUE" ? Number(g.home_score) : null,
    awayScore: g.away_score !== "0" || g.finished === "TRUE" ? Number(g.away_score) : null,
    status:
      g.time_elapsed === "finished" ? "finished" :
      g.time_elapsed === "notstarted" ? "scheduled" :
      g.time_elapsed || "scheduled",
    phase: g.type,
    group: g.group,
    homeScorers: parseScorers(g.home_scorers),
    awayScorers: parseScorers(g.away_scorers),
    venue: g.stadium_id,
    venueCity: null,
    date: g.local_date ? g.local_date.replace(/(\d{2})\/(\d{2})\/(\d{4}).*/, "$3-$1-$2") : null,
    time: g.local_date ? g.local_date.split(" ")[1] : null,
    _homeTeamId: g.home_team_id,
    _awayTeamId: g.away_team_id,
  }))
}

export async function fetchTeams() {
  const res = await fetch(TEAMS_URL)
  if (!res.ok) throw new Error(`Teams fetch failed: ${res.status}`)
  const json = await res.json()

  const lookup = {}
  for (const t of json.teams) {
    lookup[t.id] = {
      code: t.fifa_code,
      name: t.name_en,
      group: t.groups,
      flag: t.flag,
    }
  }
  return lookup
}

export async function fetchStandings(teamsById) {
  const res = await fetch(GROUPS_URL)
  if (!res.ok) throw new Error(`Standings fetch failed: ${res.status}`)
  const json = await res.json()

  return json.groups.map((g) => ({
    group: g.name,
    rows: g.teams
      .map((t) => {
        const team = teamsById?.[t.team_id]
        return {
          pos: 0,
          team: team?.name || t.team_id,
          logo: team?.flag || null,
          p: Number(t.mp),
          w: Number(t.w),
          d: Number(t.d),
          l: Number(t.l),
          gf: Number(t.gf),
          ga: Number(t.ga),
          gd: Number(t.gd),
          pts: Number(t.pts),
        }
      })
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
      .map((r, i) => ({ ...r, pos: i + 1 })),
  }))
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
