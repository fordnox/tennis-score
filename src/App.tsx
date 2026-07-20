import { useEffect, useState } from 'react'
import { HistoryView } from '@/components/HistoryView'
import { Scoreboard } from '@/components/Scoreboard'
import { SettingsView } from '@/components/SettingsView'
import { useMatch } from '@/hooks/useMatch'
import { useMatchHistory } from '@/hooks/useMatchHistory'
import { useWakeLock } from '@/hooks/useWakeLock'

type View = 'board' | 'settings' | 'history'

export default function App() {
  const [{ state }, dispatch] = useMatch()
  const { records, clear } = useMatchHistory(state)
  const [view, setView] = useState<View>('board')

  useWakeLock(view === 'board')

  // Push a history entry while a panel is open so Android's back gesture
  // returns to the board instead of leaving the app.
  useEffect(() => {
    if (view === 'board') return

    history.pushState({ panel: view }, '')
    const onPop = () => setView('board')
    window.addEventListener('popstate', onPop)

    return () => {
      window.removeEventListener('popstate', onPop)
      if (history.state?.panel) history.back()
    }
  }, [view])

  const close = () => setView('board')

  if (view === 'settings') {
    return <SettingsView state={state} dispatch={dispatch} onClose={close} />
  }

  if (view === 'history') {
    return <HistoryView records={records} onClear={clear} onClose={close} />
  }

  return (
    <Scoreboard
      state={state}
      dispatch={dispatch}
      onOpenSettings={() => setView('settings')}
      onOpenHistory={() => setView('history')}
    />
  )
}
