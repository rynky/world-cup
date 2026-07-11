import { useState, useEffect, useRef } from "react"
import { fetchMatches, fetchTeams, fetchStandings, fetchTopScorers } from "./api"
import MatchCard from "./components/MatchCard"
import NavBar from "./components/NavBar"
import Standings from "./components/Standings"
import TopScorers from "./components/TopScorers"

function getToday() {
  const d = new Date()
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

export default function App() {
  const [matches, setMatches] = useState(null)
  const [teams, setTeams] = useState(null)
  const [standings, setStandings] = useState(null)
  const [topScorers, setTopScorers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("matches")
  const [selectedMatch, setSelectedMatch] = useState(null)
  const intervalRef = useRef(null)

  const today = getToday()
  const todayMatches = matches
    ? matches.filter((m) => m.date === today)
    : []

  const isLive = matches ? hasLiveMatch(todayMatches) : false

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
        const live = enriched.find((m) => m.status !== "finished" && m.status !== "scheduled")
        if (live) setSelectedMatch(live.num)
        else setSelectedMatch(enriched[0]?.num)
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
          const live = enriched.find((m) => m.status !== "finished" && m.status !== "scheduled")
          if (live) setSelectedMatch(live.num)
          else if (!selectedMatch) setSelectedMatch(enriched[0]?.num)
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
  }, [isLive, matches, teams, selectedMatch])

  function resolveTeam(id) {
    return teams?.[id]
  }

  return (
    <>
      {/* Navigation bar */}
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex flex-col items-center min-h-screen gap-6 px-4 pt-6">
        {/* Header */}
        <div className="text-terminal-dim text-2xl tracking-[0.3em] uppercase select-none pt-4 pb-2">
          FIFA 2026 World Cup
        </div>

      {/* Game tabs */}
      {activeTab === "matches" && todayMatches.length > 0 && (
        <div className="flex justify-center gap-1 text-sm tracking-[0.15em] px-1 py-1 w-full">
          {todayMatches.map((m) => (
            <button
              key={m.num}
              onClick={() => setSelectedMatch(m.num)}
              className={`px-3 py-1 rounded transition-colors ${
                selectedMatch === m.num
                  ? "bg-terminal-accent text-terminal-bg"
                  : "bg-terminal-border text-terminal-dim hover:text-terminal-text"
              }`}
            >
              {m.homeCode} vs {m.awayCode}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-terminal-dim text-sm tracking-widest animate-pulse">
          LOADING...
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full">
          {activeTab === "matches" && (
            <>
              {todayMatches.length === 0 ? (
                <div className="text-terminal-dim text-sm tracking-wider">
                  No matches today
                </div>
              ) : (
                (() => {
                  const match = todayMatches.find((m) => m.num === selectedMatch)
                  if (!match) return null
                  return (
                    <MatchCard
                      match={match}
                      homeLogo={resolveTeam(match._homeTeamId)?.flag}
                      awayLogo={resolveTeam(match._awayTeamId)?.flag}
                    />
                  )
                })()
              )}
            </>
          )}

          {activeTab === "standings" && <Standings standings={standings} />}

          {activeTab === "scorers" && <TopScorers scorers={topScorers} />}
        </div>
      )}

      {/* Live indicator */}
      {isLive && (
        <div className="fixed top-4 right-4 flex items-center gap-2 text-terminal-red text-sm tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-terminal-red animate-pulse" />
          LIVE
        </div>
      )}

      {/* Attribution */}
      <div className="fixed bottom-3 right-4 text-terminal-dim text-[14px]">
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
    </>
  )
}
