export default function Standings({ standings }) {
  if (!standings) {
    return (
      <div className="text-terminal-red text-sm tracking-widest uppercase">
        ERROR
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
      {standings.map((group) => (
        <div key={group.group} className="border border-terminal-border rounded-sm">
          <div className="px-3 py-1.5 border-b border-terminal-border text-terminal-accent text-sm tracking-[0.2em] font-bold">
            GROUP {group.group}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-terminal-dim border-b border-terminal-border">
                <th className="px-2 py-1 text-left font-normal w-6">#</th>
                <th className="px-2 py-1 text-left font-normal">Team</th>
                <th className="px-1 py-1 text-center font-normal w-6">P</th>
                <th className="px-1 py-1 text-center font-normal w-6">W</th>
                <th className="px-1 py-1 text-center font-normal w-6">D</th>
                <th className="px-1 py-1 text-center font-normal w-6">L</th>
                <th className="px-1 py-1 text-center font-normal w-8">GF</th>
                <th className="px-1 py-1 text-center font-normal w-8">GA</th>
                <th className="px-1 py-1 text-center font-normal w-8">GD</th>
                <th className="px-2 py-1 text-center font-bold w-8">PTS</th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map((row) => (
                <tr
                  key={row.pos}
                  className="border-t border-terminal-border/50 hover:bg-terminal-border/20"
                >
                  <td className="px-2 py-1 text-terminal-dim">{row.pos}</td>
                  <td className="px-2 py-1 text-terminal-text truncate max-w-[120px]">
                    {row.team}
                  </td>
                  <td className="px-1 py-1 text-center text-terminal-dim">{row.p}</td>
                  <td className="px-1 py-1 text-center text-terminal-dim">{row.w}</td>
                  <td className="px-1 py-1 text-center text-terminal-dim">{row.d}</td>
                  <td className="px-1 py-1 text-center text-terminal-dim">{row.l}</td>
                  <td className="px-1 py-1 text-center text-terminal-dim">{row.gf}</td>
                  <td className="px-1 py-1 text-center text-terminal-dim">{row.ga}</td>
                  <td className="px-1 py-1 text-center text-terminal-dim">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                  <td className="px-2 py-1 text-center font-bold text-terminal-green">{row.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
