const phaseLabel = {
  group: "GROUP STAGE",
  r32: "ROUND OF 32",
  r16: "ROUND OF 16",
  qf: "QUARTER FINALS",
  sf: "SEMI FINALS",
  final: "FINAL",
  third: "THIRD PLACE",
}

export default function MatchCard({ match }) {
  const isFinished = match.status === "finished"
  const isScheduled = match.status === "scheduled"
  const elapsed = match.elapsedTime

  return (
    <div className="inline-block min-w-[420px]">
      <div className="text-terminal-dim text-[14px] tracking-[0.25em] uppercase text-center mb-1 select-none">
        {phaseLabel[match.phase] || match.phase}
      </div>

      <div className="border border-terminal-border rounded-sm">
        {/* Teams row */}
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            {match.homeLogo && (
              <img
                src={match.homeLogo}
                alt={`${match.homeName} logo`}
                className="w-8 h-8 object-contain rounded-[2px]"
              />
            )}
            <span className="text-xl font-bold text-terminal-accent tracking-widest">
              {match.homeName}
            </span>
          </div>

          <div className="text-sm tracking-widest select-none">
            {isFinished ? (
              <span className="text-terminal-dim">FT</span>
            ) : isScheduled ? (
              <span className="text-terminal-dim">VS</span>
            ) : elapsed ? (
              <span className="text-terminal-accent">(LIVE) {elapsed}&apos;</span>
            ) : (
              <span className="text-terminal-dim">LIVE</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-terminal-accent tracking-widest">
              {match.awayName}
            </span>
            {match.awayLogo && (
              <img
                src={match.awayLogo}
                alt={`${match.awayName} logo`}
                className="w-8 h-8 object-contain rounded-[2px]"
              />
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-terminal-border" />

        {/* Score row */}
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-3xl font-bold text-terminal-green w-16 text-center">
            {isFinished ? match.homeScore : isScheduled ? "\u2014" : match.homeScore ?? 0}
          </span>

          <span className="text-terminal-dim text-xl select-none">:</span>

          <span className="text-3xl font-bold text-terminal-green w-16 text-center">
            {isFinished ? match.awayScore : isScheduled ? "\u2014" : match.awayScore ?? 0}
          </span>
        </div>
      </div>

      {/* Scorers */}
      {!isScheduled && (match.homeScorers.length > 0 || match.awayScorers.length > 0) && (
        <div className="flex justify-between px-1 pt-2 text-[14px]">
          <div className="text-left text-terminal-dim leading-relaxed">
            {match.homeScorers.map((s, i) => (
              <div key={i}>
                <span className="text-terminal-text">{s.name}</span>
                {s.minute != null && <span className="text-terminal-accent"> {s.minute}&apos;</span>}
              </div>
            ))}
          </div>
          <div className="text-right text-terminal-dim leading-relaxed">
            {match.awayScorers.map((s, i) => (
              <div key={i}>
                {s.minute != null && <span className="text-terminal-accent">{s.minute}&apos; </span>}
                <span className="text-terminal-text">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kickoff time for scheduled matches */}
      {isScheduled && match.time && (
        <div className="text-center pt-2 text-terminal-dim text-sm tracking-wider">
          {match.time} UTC
        </div>
      )}
    </div>
  )
}
