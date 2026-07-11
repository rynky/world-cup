export default function TopScorers({ scorers }) {
  if (!scorers) {
    return (
      <div className="text-terminal-red text-sm tracking-widest uppercase">
        ERROR
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl border border-terminal-border rounded-sm">
      <div className="px-4 py-2 border-b border-terminal-border text-terminal-accent text-sm tracking-[0.2em] font-bold">
        TOP SCORERS
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-terminal-dim border-b border-terminal-border">
            <th className="px-3 py-1.5 text-left font-normal w-8">#</th>
            <th className="px-3 py-1.5 text-left font-normal">Player</th>
            <th className="px-3 py-1.5 text-left font-normal">Team</th>
            <th className="px-3 py-1.5 text-center font-normal w-10">G</th>
            <th className="px-3 py-1.5 text-center font-normal w-10">A</th>
            <th className="px-3 py-1.5 text-center font-normal w-10">MP</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((s) => (
            <tr
              key={s.rank}
              className="border-t border-terminal-border/50 hover:bg-terminal-border/20"
            >
              <td className="px-3 py-1.5 text-terminal-dim">{s.rank}</td>
              <td className="px-3 py-1.5 text-terminal-accent font-bold">{s.player}</td>
              <td className="px-3 py-1.5 text-terminal-dim">{s.team}</td>
              <td className="px-3 py-1.5 text-center text-terminal-green font-bold">{s.goals}</td>
              <td className="px-3 py-1.5 text-center text-terminal-dim">{s.assists}</td>
              <td className="px-3 py-1.5 text-center text-terminal-dim">{s.matches}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
