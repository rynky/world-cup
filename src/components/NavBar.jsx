const TABS = ["matches", "standings", "scorers"]

export default function NavBar({ activeTab, onTabChange }) {
  return (
    <div className="bg-terminal-accent w-full">
      <div className="flex justify-center gap-1 text-sm tracking-[0.15em] uppercase px-1 py-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === tab
                ? "bg-terminal-bg text-terminal-accent"
                : "text-terminal-bg hover:bg-terminal-accent/80"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}
