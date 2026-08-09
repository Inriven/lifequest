import { useEffect, useState } from 'react'
import { audio } from '../../lib/audio'

export function SettingsPage() {
  const [soundOn, setSoundOn] = useState(() => audio.enabled)
  const [volume, setVolume] = useState(() => Math.round(audio.volume * 100))

  useEffect(() => {
    audio.setEnabled(soundOn)
  }, [soundOn])

  useEffect(() => {
    audio.setVolume(volume / 100)
  }, [volume])

  return (
    <div className="settings-page">
      <small>SYSTEM</small>
      <h1>Настройки</h1>
      <p>Звук, уведомления и комфорт интерфейса. Технические детали сборки здесь не показываем.</p>

      <section className="settings-card">
        <h2>Звук</h2>
        <label className="settings-row">
          <span>Звуковые сигналы</span>
          <input
            type="checkbox"
            checked={soundOn}
            onChange={(e) => setSoundOn(e.target.checked)}
            aria-label="Включить звук"
          />
        </label>
        <label className="settings-row">
          <span>Громкость</span>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            disabled={!soundOn}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Громкость"
          />
        </label>
        <button
          type="button"
          className="secondary"
          disabled={!soundOn}
          onClick={() => audio.play('timer.tick')}
        >
          Проверить tick
        </button>
      </section>
    </div>
  )
}
