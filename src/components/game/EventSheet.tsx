import type { PendingEvent } from '@engine/index.ts'
import Sheet from '@/components/ui/Sheet.tsx'

export default function EventSheet({ event, onChoose }: { event: PendingEvent; onChoose: (id: string) => void }) {
  return (
    <Sheet>
      <div className="text-[11px] font-semibold tracking-[0.2em] text-alert uppercase">Hendelse</div>
      <h3 className="mt-1 font-display text-3xl font-bold tracking-wide uppercase">{event.title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-300">{event.text}</p>
      <div className="mt-5 space-y-2">
        {event.choices.map((c, i) => (
          <button
            key={c.id}
            disabled={c.disabled}
            onClick={() => onChoose(c.id)}
            className={`w-full rounded-2xl px-4 py-3 text-left transition-transform active:scale-[0.98] disabled:opacity-30 ${
              i === 0 ? 'bg-alert text-ink-950' : 'bg-ink-800 text-ink-100'
            }`}
          >
            <div className="font-semibold">{c.label}</div>
            {c.hint && <div className={`text-xs ${i === 0 ? 'text-ink-950/70' : 'text-ink-400'}`}>{c.hint}</div>}
          </button>
        ))}
      </div>
    </Sheet>
  )
}
