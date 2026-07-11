import { useState, useEffect, useRef } from "react"
import { fetchMatches, fetchTeams, fetchStandings, fetchTopScorers } from "./api"
import MatchCard from "./components/MatchCard"
import Standings from "./components/Standings"
import TopScorers from "./components/TopScorers"

const TABS = ["matches", "standings", "scorers"]

function getLocalDate(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function hasLiveMatch(matches) {
  return matches.some(
    (m) => m.status !== "finished" && m.status !== "scheduled"
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3 w-full max-w-[500px] py-2 select-none">
      <div className="flex-1 h-px bg-terminal-border" />
      <span className="text-terminal-accent text-sm tracking-widest">&#x2756;</span>
      <div className="flex-1 h-px bg-terminal-border" />
    </div>
  )
}

function DaySection({ label, matches, resolveTeam }) {
  if (matches.length === 0) return null
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="text-terminal-accent text-[11px] tracking-[0.3em] font-bold uppercase select-none">
        {label}
      </div>
      <div className="flex flex-col items-center gap-4">
        {matches.map((m) => (
          <MatchCard
            key={m.num}
            match={m}
            homeLogo={resolveTeam(m._homeTeamId)?.flag}
            awayLogo={resolveTeam(m._awayTeamId)?.flag}
          />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [matches, setMatches] = useState(null)
  const [teams, setTeams] = useState(null)
  const [standings, setStandings] = useState(null)
  const [topScorers, setTopScorers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("matches")
  const intervalRef = useRef(null)

  const today = getLocalDate(0)
  const tomorrow = getLocalDate(1)
  const todayMatches = matches
    ? matches.filter((m) => m.date === today)
    : null
  const tomorrowMatches = matches
    ? matches.filter((m) => m.date === tomorrow)
    : null

  const isLive = matches ? hasLiveMatch(matches) : false

  useEffect(() => {
    let cancelled = false

    async function loadAll() {
      const [t, m, ts] = await Promise.allSettled([
        fetchTeams(),
        fetchMatches(),
        fetchTopScorers(),
      ])
      if (cancelled) return

      const teamsData = t.status === "fulfilled" ? t.value : null
      setTeams(teamsData)
      setTopScorers(ts.status === "fulfilled" ? ts.value : null)

      if (m.status === "fulfilled" && m.value) {
        const enriched = m.value.map((match) => {
          const home = teamsData?.[match._homeTeamId]
          const away = teamsData?.[match._awayTeamId]
          return {
            ...match,
            homeCode: home?.code || match.homeName,
            awayCode: away?.code || match.awayName,
          }
        })
        setMatches(enriched)
      } else {
        setMatches(null)
      }

      const s = await fetchStandings(teamsData)
      if (cancelled) return
      setStandings(s)
      setLoading(false)
    }

    loadAll()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!matches) return

    if (isLive) {
      intervalRef.current = setInterval(async () => {
        try {
          const m = await fetchMatches()
          const enriched = m.map((match) => {
            const home = teams?.[match._homeTeamId]
            const away = teams?.[match._awayTeamId]
            return {
              ...match,
              homeCode: home?.code || match.homeName,
              awayCode: away?.code || match.awayName,
            }
          })
          setMatches(enriched)
        } catch {
          // keep existing data on refetch failure
        }
      }, 60000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isLive, matches, teams])

  function resolveTeam(id) {
    return teams?.[id]
  }

  const hasAnyMatches = todayMatches && tomorrowMatches
    ? todayMatches.length + tomorrowMatches.length > 0
    : false

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      {/* Header */}
      <div className="text-terminal-dim text-xs tracking-[0.3em] uppercase select-none">
        FIFA 2026 World Cup
      </div>

      {/* Tabs */}
      <div className="flex gap-4 text-xs tracking-[0.15em] uppercase">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-0.5 border-b transition-colors ${
              activeTab === tab
                ? "text-terminal-accent border-terminal-accent"
                : "text-terminal-dim border-transparent hover:text-terminal-text"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-terminal-dim text-xs tracking-widest animate-pulse">
          LOADING...
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full">
          {activeTab === "matches" && (
            <>
              {todayMatches === null ? (
                <div className="flex items-center gap-2">
                  <span className="text-terminal-red text-xs tracking-widest uppercase">
                    ERROR
                  </span>
                  <span className="text-terminal-dim text-xs">
                    Match data unavailable
                  </span>
                </div>
              ) : !hasAnyMatches ? (
                <div className="text-terminal-dim text-xs tracking-wider">
                  No matches today
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 w-full">
                  {todayMatches.length > 0 && (
                    <DaySection
                      label="Today"
                      matches={todayMatches}
                      resolveTeam={resolveTeam}
                    />
                  )}
                  {todayMatches.length > 0 && tomorrowMatches.length > 0 && (
                    <Divider />
                  )}
                  {tomorrowMatches.length > 0 && (
                    <DaySection
                      label="Tomorrow"
                      matches={tomorrowMatches}
                      resolveTeam={resolveTeam}
                    />
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === "standings" && <Standings standings={standings} />}

          {activeTab === "scorers" && <TopScorers scorers={topScorers} />}
        </div>
      )}

      {/* Live indicator */}
      {isLive && (
        <div className="fixed top-4 right-4 flex items-center gap-2 text-terminal-red text-xs tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-terminal-red animate-pulse" />
          LIVE
        </div>
      )}

      {/* Attribution */}
      <div className="fixed bottom-3 right-4 text-terminal-dim text-[10px]">
        Data from{" "}
        <a
          href="https://sportscore.com/"
          rel="dofollow"
          target="_blank"
          className="underline hover:text-terminal-text"
        >
          SportScore
        </a>
      </div>
    </div>
  )
}
