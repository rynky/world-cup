import { useState, useEffect, useRef } from "react"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import MatchCard from "./components/MatchCard"
import NavBar from "./components/NavBar"
import { mockMatch } from "./mockData"
import "./index.css"

const TIMELINE = [
  { minute: "45", homeScore: 1, awayScore: 0, homeScorers: [{ name: "Erling Haaland", minute: "45" }], awayScorers: [] },
  { minute: "45+1", homeScore: 1, awayScore: 0, homeScorers: [{ name: "Erling Haaland", minute: "45" }], awayScorers: [] },
  { minute: "45+2", homeScore: 1, awayScore: 0, homeScorers: [{ name: "Erling Haaland", minute: "45" }], awayScorers: [] },
  { minute: "45+3", homeScore: 1, awayScore: 1, homeScorers: [{ name: "Erling Haaland", minute: "45" }], awayScorers: [{ name: "Harry Kane", minute: "45+3" }] },
]

export default function TestSim() {
  const [match, setMatch] = useState({ ...mockMatch })
  const [activeTab, setActiveTab] = useState("matches")
  const tickRef = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      const tick = tickRef.current
      if (tick >= TIMELINE.length) {
        clearInterval(id)
        return
      }
      const event = TIMELINE[tick]
      setMatch((prev) => ({
        ...prev,
        homeScore: event.homeScore,
        awayScore: event.awayScore,
        homeScorers: event.homeScorers,
        awayScorers: event.awayScorers,
        status: event.minute,
        elapsedTime: event.minute,
      }))
      tickRef.current++
    }, 1000)

    return () => clearInterval(id)
  }, [])

  return (
    <>
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex flex-col items-center min-h-screen gap-6 px-4 pt-6">
        <div className="text-terminal-dim text-2xl tracking-[0.3em] uppercase select-none pt-4 pb-2">
          FIFA 2026 World Cup
        </div>

        <div className="flex justify-center gap-1 text-sm tracking-[0.15em] px-1 py-1 w-full">
          <button
            className="px-3 py-1 rounded bg-terminal-accent text-terminal-bg"
          >
            {match.homeCode} vs {match.awayCode}
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          <MatchCard
            match={match}
          />
        </div>

        <div className="fixed top-4 right-4 flex items-center gap-2 text-terminal-red text-sm tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-terminal-red animate-pulse" />
          LIVE
        </div>
      </div>
    </>
  )
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TestSim />
  </StrictMode>,
)
