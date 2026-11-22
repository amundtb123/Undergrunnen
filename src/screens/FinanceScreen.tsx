import { useState } from 'react'
import { CONTACTS, RULES, availableCredit, getCity, netWorth, type Action, type GameState } from '@engine/index.ts'
import { haptic, kr } from '@/lib/format.ts'

function AmountPanel({
  title,
  subtitle,
  balance,
  balanceTone,
  actions,
}: {
  title: string
  subtitle: string
  balance: number
  balanceTone: string
  actions: { label: string; max: number; run: (n: number) => void; primary?: boolean }[]
}) {
  const [amount, setAmount] = useState('')
  const n = Math.floor(Number(amount.replace(/\s/g, '')) || 0)

  return (
    <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-wide uppercase">{title}</h3>
          <p className="text-xs text-ink-400">{subtitle}</p>
        </div>
        <div className={`tabular font-display text-xl font-semibold ${balanceTone}`}>{kr(balance)}</div>
      </div>
      <input
        inputMode="numeric"
        placeholder="Beløp"
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
        className="tabular mt-4 h-12 w-full rounded-xl border border-white/10 bg-ink-800 px-4 text-lg outline-none focus:border-cta/60"
      />
      <div className="mt-3 grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <div key={a.label} className="space-y-1.5">
            <button
              disabled={n <= 0 || n > a.max}
              onClick={() => {
                a.run(n)
                setAmount('')
                haptic()
              }}
              className={`h-11 w-full rounded-xl text-sm font-semibold disabled:opacity-30 ${
                a.primary ? 'bg-cta text-ink-950' : 'bg-ink-700 text-ink-100'
              }`}
            >
              {a.label}
            </button>
            <button
              disabled={a.max <= 0}
              onClick={() => setAmount(String(a.max))}
              className="tabular w-full text-center text-[11px] text-ink-400 disabled:opacity-30"
            >
              Maks {kr(a.max)}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function FinanceScreen({
  game,
  onAction,
  onRetire,
}: {
  game: GameState
  onAction: (a: Action) => void
  onRetire: () => void
}) {
  const city = getCity(game.cityId)!
  const worth = netWorth(game)

  return (
    <div className="space-y-4 px-4 py-4">
      <section className="rounded-2xl border border-white/5 bg-gradient-to-br from-ink-850 to-ink-900 p-4">
        <div className="text-[11px] font-semibold tracking-[0.18em] text-ink-400 uppercase">Nettoformue</div>
        <div className={`tabular font-display text-4xl font-bold ${worth >= 0 ? 'text-ink-100' : 'text-loss'}`}>{kr(worth)}</div>
        <p className="mt-1 text-xs text-ink-400">Kontanter + bank + varer (dagens pris) − gjeld</p>
      </section>

      {city.hasBank ? (
        <>
          <AmountPanel
            title={CONTACTS.lender.name}
            subtitle={`Lånehai · ${Math.round(RULES.debtRate * 100)} % rente per dag · maks ${kr(RULES.creditLimit)}`}
            balance={game.debt}
            balanceTone={game.debt > 0 ? 'text-loss' : 'text-ink-400'}
            actions={[
              { label: 'Betal ned', max: Math.min(game.debt, game.cash), run: (n) => onAction({ type: 'repay', amount: n }), primary: true },
              { label: 'Lån mer', max: availableCredit(game), run: (n) => onAction({ type: 'borrow', amount: n }) },
            ]}
          />
          <AmountPanel
            title={CONTACTS.banker.name}
            subtitle={`Trygt mot ran · ${RULES.bankRate * 100} % rente per dag`}
            balance={game.bank}
            balanceTone="text-ice"
            actions={[
              { label: 'Sett inn', max: game.cash, run: (n) => onAction({ type: 'deposit', amount: n }), primary: true },
              { label: 'Ta ut', max: game.bank, run: (n) => onAction({ type: 'withdraw', amount: n }) },
            ]}
          />
        </>
      ) : (
        <section className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-ink-400">
          <div className="font-display text-base font-semibold tracking-wide text-ink-100 uppercase">Ingen bank her</div>
          <p className="mt-1">
            {CONTACTS.lender.name} og {CONTACTS.banker.name} holder til i Hamar. Gjelden vokser med{' '}
            {Math.round(RULES.debtRate * 100)} % hver dag uansett hvor du er.
          </p>
        </section>
      )}

      <button onClick={onRetire} className="h-11 w-full rounded-xl border border-white/10 text-sm text-ink-400 active:bg-ink-800">
        Trekk deg tilbake nå
      </button>
    </div>
  )
}
