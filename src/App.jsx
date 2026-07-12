import { useState, useEffect, useRef } from "react"
import { fetchMatches, fetchStandings, fetchTopScorers, fetchMatchDetail, fetchTodaysMatchIds } from "./api"
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

function fillLogos(matches, lookup) {
  if (!lookup || Object.keys(lookup).length === 0) return matches
  return matches.map((m) => ({
    ...m,
    homeLogo: m.homeLogo || lookup[m.homeName]?.logo || null,
    awayLogo: m.awayLogo || lookup[m.awayName]?.logo || null,
  }))
}

async function enrichLiveDetails(matches) {
  return Promise.all(
    matches.map(async (m) => {
      if (m.status === "scheduled" || !m.slug) return m
      try {
        const detail = await fetchMatchDetail(m.slug)
        if (!detail) return m
        return {
          ...m,
          elapsedTime: detail.liveMinute != null ? String(detail.liveMinute) : null,
          homeScore: detail.homeScore ?? m.homeScore,
          awayScore: detail.awayScore ?? m.awayScore,
          homeScorers: detail.homeScorers.length > 0 ? detail.homeScorers : m.homeScorers,
          awayScorers: detail.awayScorers.length > 0 ? detail.awayScorers : m.awayScorers,
          extraTime: detail.extraTime || m.extraTime,
        }
      } catch {
        return m
      }
    })
  )
}

export default function App() {
  const [matches, setMatches] = useState(null)
  const [standings, setStandings] = useState(null)
  const [teamLookup, setTeamLookup] = useState({})
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
      const [s, m, ts] = await Promise.allSettled([
        fetchStandings(),
        fetchMatches(),
        fetchTopScorers(),
      ])
      if (cancelled) return

      const standingsData = s.status === "fulfilled" ? s.value : null
      setStandings(standingsData?.groups ?? null)
      setTeamLookup(standingsData?.teamLookup ?? {})
      setTopScorers(ts.status === "fulfilled" ? ts.value : null)

      let matchesData = m.status === "fulfilled" ? m.value : []

      const { matches: backup, phaseLookup } = await fetchTodaysMatchIds()
      if (cancelled) return

      const ssNames = new Set(matchesData.map((m) => `${m.homeName}|${m.awayName}`))
      for (const b of backup) {
        if (!ssNames.has(`${b.homeName}|${b.awayName}`)) {
          matchesData.push({
            num: b.id,
            homeName: b.homeName,
            awayName: b.awayName,
            homeScore: null,
            awayScore: null,
            status: b.status,
            homeScorers: [],
            awayScorers: [],
            homeLogo: null,
            awayLogo: null,
            date: today,
            time: b.time,
            slug: b.slug,
            group: null,
            phase: b.phase,
            elapsedTime: null,
          })
        }
      }

      matchesData = matchesData.map((m) => ({
        ...m,
        phase: phaseLookup[`${m.homeName}|${m.awayName}`] || m.phase,
      }))

      if (matchesData.length > 0) {
        matchesData = await enrichLiveDetails(matchesData)
      }

      matchesData = fillLogos(matchesData, standingsData?.teamLookup)

      setMatches(matchesData.length > 0 ? matchesData : null)
      const live = matchesData.find((m) => m.status !== "finished" && m.status !== "scheduled")
      if (live) setSelectedMatch(live.num)
      else setSelectedMatch(matchesData[0]?.num)
      setLoading(false)
    }

    loadAll()

    return () => {
      cancelled = true
    }
  }, [today])

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(async () => {
        try {
          let m = await fetchMatches()
          const { matches: backup, phaseLookup } = await fetchTodaysMatchIds()
          const ssNames = new Set(m.map((x) => `${x.homeName}|${x.awayName}`))
          for (const b of backup) {
            if (!ssNames.has(`${b.homeName}|${b.awayName}`)) {
              m.push({
                num: b.id,
                homeName: b.homeName,
                awayName: b.awayName,
                homeScore: null,
                awayScore: null,
                status: b.status,
                homeScorers: [],
                awayScorers: [],
                homeLogo: null,
                awayLogo: null,
                date: today,
                time: b.time,
                slug: b.slug,
                group: null,
                phase: b.phase,
                elapsedTime: null,
              })
            }
          }
          m = m.map((x) => ({
            ...x,
            phase: phaseLookup[`${x.homeName}|${x.awayName}`] || x.phase,
          }))
          m = await enrichLiveDetails(m)
          m = fillLogos(m, teamLookup)
          setMatches(m.length > 0 ? m : null)
          const live = m.find((x) => x.status !== "finished" && x.status !== "scheduled")
          if (live) setSelectedMatch(live.num)
          else if (!selectedMatch) setSelectedMatch(m[0]?.num)
        } catch {
          // keep existing data on refetch failure
        }
      }, 30000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isLive, today, selectedMatch, teamLookup])

  return (
    <>
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex flex-col items-center min-h-screen gap-6 px-4 pt-6">
        <div className="text-terminal-dim text-2xl tracking-[0.3em] uppercase select-none pt-4 pb-2">
          FIFA 2026 World Cup
        </div>

      {activeTab === "matches" && todayMatches.length > 0 && (
        <div className="flex justify-center gap-1 text-sm tracking-[0.15em] px-1 py-1 w-full">
          {todayMatches.flatMap((m, i) => [
            ...(i > 0 ? [<span key={`sep-${m.num}`} className="text-terminal-dim select-none self-center text-xs px-1">&#9670;</span>] : []),
            <button
              key={m.num}
              onClick={() => setSelectedMatch(m.num)}
              className={`px-3 py-1 rounded transition-colors ${
                selectedMatch === m.num
                  ? "bg-terminal-accent text-terminal-bg"
                  : "bg-terminal-border text-terminal-dim hover:text-terminal-text"
              }`}
            >
              {m.homeName} vs {m.awayName}
            </button>,
          ])}
        </div>
      )}

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
                    <MatchCard match={match} />
                  )
                })()
              )}
            </>
          )}

          {activeTab === "standings" && <Standings standings={standings} />}

          {activeTab === "scorers" && <TopScorers scorers={topScorers} />}
        </div>
      )}

      {isLive && (
        <div className="fixed top-20 right-4 flex items-center gap-2 text-terminal-red text-sm tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-terminal-red animate-pulse" />
          LIVE
        </div>
      )}

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
