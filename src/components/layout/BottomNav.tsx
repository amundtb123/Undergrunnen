export type Tab = 'marked' | 'reise' | 'lager' | 'okonomi' | 'logg'

const ICONS: Record<Tab, string> = {
  marked: 'M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6',
  reise: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  lager: 'M3 7l9-4 9 4v10l-9 4-9-4V7zm0 0l9 4 9-4M12 11v10',
  okonomi: 'M12 3v18M17 7.5C17 5.6 14.8 4.5 12 4.5S7 5.6 7 7.5 9 10.5 12 11s5 1.6 5 3.5-2.2 3-5 3-5-1.1-5-3',
  logg: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
}
const LABELS: Record<Tab, string> = {
  marked: 'Marked',
  reise: 'Reise',
  lager: 'Lager',
  okonomi: 'Økonomi',
  logg: 'Logg',
}

export default function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-white/5 bg-ink-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <ul className="grid grid-cols-5">
        {(Object.keys(LABELS) as Tab[]).map((t) => {
          const active = t === tab
          return (
            <li key={t}>
              <button
                onClick={() => onChange(t)}
                className={`flex h-16 w-full flex-col items-center justify-center gap-1 transition-colors ${
                  active ? 'text-glow' : 'text-ink-400 active:text-ink-100'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
                  <path d={ICONS[t]} />
                </svg>
                <span className="text-[11px] font-medium">{LABELS[t]}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
