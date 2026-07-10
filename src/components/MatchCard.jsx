export default function MatchCard() {
  const match = {
    home: {
      code: "ESP",
      flag: "/flags/esp.svg",
      score: 2,
      scorers: [
        { name: "Fabián Ruiz", minute: 30 },
        { name: "Mikel Merino", minute: 88 },
      ],
    },
    away: {
      code: "BEL",
      flag: "/flags/bel.svg",
      score: 1,
      scorers: [
        { name: "Charles De Ketelaere", minute: 41 },
      ],
    },
  }

  return (
    <div className="inline-block min-w-[420px]">
      <div className="border border-terminal-border rounded-sm">
        {/* Teams row */}
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img
              src={match.home.flag}
              alt={`${match.home.code} flag`}
              className="w-8 h-5 object-cover rounded-[2px] shadow-sm"
            />
            <span className="text-lg font-bold text-terminal-accent tracking-widest">
              {match.home.code}
            </span>
          </div>

          <div className="text-terminal-dim text-xs tracking-widest select-none">
            VS
          </div>

          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-terminal-accent tracking-widest">
              {match.away.code}
            </span>
            <img
              src={match.away.flag}
              alt={`${match.away.code} flag`}
              className="w-8 h-5 object-cover rounded-[2px] shadow-sm"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-terminal-border" />

        {/* Score row */}
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-3xl font-bold text-terminal-green w-16 text-center">
            {match.home.score}
          </span>

          <span className="text-terminal-dim text-lg select-none">:</span>

          <span className="text-3xl font-bold text-terminal-green w-16 text-center">
            {match.away.score}
          </span>
        </div>
      </div>

      {/* Scorers */}
      <div className="flex justify-between px-1 pt-3">
        <div className="flex flex-col text-left text-xs text-terminal-dim">
          {match.home.scorers.map((s) => (
            <span key={s.name}>
              {s.name} <span className="text-terminal-accent">{s.minute}'</span>
            </span>
          ))}
        </div>

        <div className="flex flex-col text-right text-xs text-terminal-dim">
          {match.away.scorers.map((s) => (
            <span key={s.name}>
              {s.name} <span className="text-terminal-accent">{s.minute}'</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
