import type { ReactNode } from 'react'

/** Bottom sheet. `onClose` omitted = not dismissable (forced choice). */
export default function Sheet({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div
        className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[480px] animate-sheet-up rounded-t-3xl border-t border-white/10 bg-ink-900 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-600" />
        {children}
      </div>
    </div>
  )
}
