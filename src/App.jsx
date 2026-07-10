import MatchCard from "./components/MatchCard"

export default function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="text-terminal-dim text-xs tracking-[0.3em] uppercase select-none">
        FIFA 2026 World Cup
      </div>
      <MatchCard />
    </div>
  )
}
