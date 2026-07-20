import { useEffect, useState } from 'react'
import { Scoreboard } from '@/components/Scoreboard'
import { SettingsView } from '@/components/SettingsView'
import { useMatch } from '@/hooks/useMatch'
import { useWakeLock } from '@/hooks/useWakeLock'

export default function App() {
  const [{ state }, dispatch] = useMatch()
  const [showSettings, setShowSettings] = useState(false)

  useWakeLock(!showSettings)

  // Push a history entry while settings is open so Android's back gesture
  // closes it instead of leaving the app.
  useEffect(() => {
    if (!showSettings) return

    history.pushState({ settings: true }, '')
    const onPop = () => setShowSettings(false)
    window.addEventListener('popstate', onPop)

    return () => {
      window.removeEventListener('popstate', onPop)
      if (history.state?.settings) history.back()
    }
  }, [showSettings])

  if (showSettings) {
    return (
      <SettingsView state={state} dispatch={dispatch} onClose={() => setShowSettings(false)} />
    )
  }

  return (
    <Scoreboard state={state} dispatch={dispatch} onOpenSettings={() => setShowSettings(true)} />
  )
}
