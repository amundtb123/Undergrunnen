import { useEffect, useRef, useState } from 'react'
import { getCity, tripFor, type CityId, type ItemId } from '@engine/index.ts'
import { useGame } from '@/features/game/useGame.ts'
import { CityBackdrop } from '@/components/game/CityHero.tsx'
import StatusBar from '@/components/layout/StatusBar.tsx'
import BottomNav, { type Tab } from '@/components/layout/BottomNav.tsx'
import TradeSheet from '@/components/game/TradeSheet.tsx'
import EventSheet from '@/components/game/EventSheet.tsx'
import TravelOverlay, { type Transit } from '@/components/game/TravelOverlay.tsx'
import MarketScreen from '@/screens/MarketScreen.tsx'
import TravelScreen from '@/screens/TravelScreen.tsx'
import InventoryScreen from '@/screens/InventoryScreen.tsx'
import FinanceScreen from '@/screens/FinanceScreen.tsx'
import NewsScreen from '@/screens/NewsScreen.tsx'
import TitleScreen from '@/screens/TitleScreen.tsx'
import GameOverScreen from '@/screens/GameOverScreen.tsx'

const TRANSIT_MS = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 300 : 1400

export default function App() {
  const {
    game, save, scores, error, starting, submit, playerName, mode, setMode,
    dispatch, newGame, submitScore, quit, clearError,
  } = useGame()
  const [inGame, setInGame] = useState(false)
  const [tab, setTab] = useState<Tab>('marked')
  const [tradeItem, setTradeItem] = useState<ItemId | null>(null)
  const [transit, setTransit] = useState<Transit | null>(null)

  useEffect(() => {
    if (!error) return
    const t = setTimeout(clearError, 2600)
    return () => clearTimeout(t)
  }, [error, clearError])

  useEffect(() => {
    if (!transit) return
    const t = setTimeout(() => setTransit(null), TRANSIT_MS)
    return () => clearTimeout(t)
  }, [transit])

  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0 })
  }, [tab, game?.cityId])

  // Header stays pinned until the element marked data-header-stop (the goods list) reaches it, then gets pushed up with it.
  const mainRef = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const main = mainRef.current
    const head = headRef.current
    if (!main || !head) return
    const update = () => {
      const stop = main.querySelector('[data-header-stop]')
      let shift = 0
      if (stop) {
        const top = stop.getBoundingClientRect().top - main.getBoundingClientRect().top
        shift = Math.min(0, top - head.offsetHeight)
      }
      head.style.transform = shift ? `translateY(${shift}px)` : ''
    }
    update()
    main.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      main.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [inGame, tab, game?.cityId, game?.day])

  const startNew = async () => {
    await newGame()
    setTab('marked')
    setInGame(true)
  }

  if (!game || !save || !inGame) {
    return (
      <TitleScreen
        canContinue={!!game && game.status === 'active'}
        starting={starting}
        scores={scores}
        mode={mode}
        onSetMode={setMode}
        onContinue={() => setInGame(true)}
        onNew={startNew}
      />
    )
  }

  if (game.status !== 'active' && !transit) {
    return (
      <GameOverScreen
        key={save.runId ?? game.seed}
        save={save}
        submit={submit}
        defaultName={playerName}
        onSubmit={submitScore}
        onNew={startNew}
        onMenu={() => {
          quit()
          setInGame(false)
        }}
      />
    )
  }

  const travel = (to: CityId) => {
    const r = tripFor(game, to)
    const from = game.cityId
    if (dispatch({ type: 'travel', to })) {
      const mode = { Fly: 'Flyr', Tog: 'Tar toget', Haik: 'Haiker' }[r.mode]
      setTransit({ from, to, day: game.day + r.days, mode })
      setTab('marked')
    }
  }

  return (
    <div className="mx-auto flex h-dvh max-w-[480px] flex-col bg-ink-950 sm:border-x sm:border-white/5">
      <main ref={mainRef} className="relative flex-1 overflow-y-auto overscroll-contain">
        <CityBackdrop city={getCity(game.cityId)!} />
        <div ref={headRef} className="sticky top-0 z-30 will-change-transform">
          <StatusBar game={game} onHome={() => setInGame(false)} />
        </div>
        <div key={`${tab}-${game.cityId}-${game.day}`} className="relative animate-fade-in">
          {tab === 'marked' && (
            <MarketScreen game={game} onPick={setTradeItem} onFinish={() => dispatch({ type: 'retire' })} />
          )}
          {tab === 'reise' && <TravelScreen game={game} onTravel={travel} />}
          {tab === 'lager' && <InventoryScreen game={game} onPick={setTradeItem} />}
          {tab === 'okonomi' && (
            <FinanceScreen
              game={game}
              onAction={dispatch}
              onRetire={() => {
                if (confirm('Avslutte spillet nå? Varer teller ikke i sluttsummen.')) dispatch({ type: 'retire' })
              }}
            />
          )}
          {tab === 'logg' && <NewsScreen game={game} />}
        </div>
      </main>
      <BottomNav tab={tab} onChange={setTab} />

      {tradeItem && game.market[tradeItem] !== undefined && (
        <TradeSheet key={tradeItem} game={game} itemId={tradeItem} onAction={dispatch} onClose={() => setTradeItem(null)} />
      )}
      {game.pendingEvent && !transit && (
        <EventSheet event={game.pendingEvent} onChoose={(id) => dispatch({ type: 'resolve', choiceId: id })} />
      )}
      {transit && <TravelOverlay transit={transit} />}
      {error && (
        <div
          key={error.id}
          role="alert"
          className="fixed inset-x-4 bottom-24 z-[60] mx-auto max-w-[440px] animate-fade-in rounded-xl border border-loss/30 bg-ink-850 px-4 py-3 text-sm shadow-xl"
        >
          {error.text}
        </div>
      )}
    </div>
  )
}
