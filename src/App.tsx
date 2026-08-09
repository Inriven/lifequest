import { Flame, Gem } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Sidebar, type SectionId } from './components/Sidebar'
import { MobileNav } from './components/MobileNav'
import { TimerTopbar } from './components/TimerTopbar'
import { ClockTimerModal } from './components/ClockTimerModal'
import { ProfileFlyout } from './components/ProfileFlyout'
import { TasksPage } from './features/tasks/TasksPage'
import { PlaceholderPage } from './components/PlaceholderPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { useProfileStore } from './features/profile/profileStore'
import { useUiStore, type OverlayId } from './features/ui/uiStore'

const pages: Record<Exclude<SectionId, 'tasks'>, { kicker: string; title: string; text: string }> = {
  status: {
    kicker: 'CHARACTER',
    title: 'Статус игрока',
    text: 'Ранг, навыки и характеристики будут расти из реальных действий, а не ручных кликов.',
  },
  path: {
    kicker: 'QUEST PATH',
    title: 'Путь',
    text: 'Миссия → главы → квесты. Здесь будет AI-декомпозиция больших целей в игровую карту.',
  },
  artifacts: {
    kicker: 'RESOURCE GRAPH',
    title: 'Артефакты',
    text: 'Ресурсы человека будут предлагаться системой автоматически и подтверждаться одним действием.',
  },
  handbook: {
    kicker: 'GUIDE',
    title: 'Handbook',
    text: 'Ежедневная активность, неделя, рост и подсказка следующего полезного действия.',
  },
}

const overlayCopy: Record<Exclude<OverlayId, 'settings' | null>, { kicker: string; title: string; text: string }> = {
  profile: {
    kicker: 'ACCOUNT',
    title: 'Профиль',
    text: 'Карточка игрока, ранг и публичные данные появятся после подключения аккаунта.',
  },
  achievements: {
    kicker: 'TROPHIES',
    title: 'Достижения',
    text: 'Награды за серии действий и закрытые квесты.',
  },
  worlds: {
    kicker: 'WORLDS',
    title: 'Миры',
    text: 'Темы и визуальные миры меняют оболочку, не ломая игровую логику.',
  },
  friends: {
    kicker: 'PARTY',
    title: 'Друзья',
    text: 'Совместные квесты и лёгкая социальная петля.',
  },
}

export default function App() {
  const [section, setSection] = useState<SectionId>('tasks')
  const overlay = useUiStore((s) => s.overlay)
  const clockTask = useUiStore((s) => s.clockTask)
  const closeClock = useUiStore((s) => s.closeClock)
  const { profileOpen, setProfileOpen } = useProfileStore()
  const mobileProfileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!profileOpen) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (mobileProfileRef.current?.contains(target)) return
      if ((target as Element).closest?.('.profile-zone')) return
      setProfileOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [profileOpen, setProfileOpen])

  return (
    <div className="app-shell">
      <div className="world-backdrop" aria-hidden="true" />
      <Sidebar section={section} onSection={setSection} />
      <div className="app-main">
        <header className="topbar">
          <div className="mobile-profile" ref={mobileProfileRef}>
            <button
              type="button"
              className="mobile-avatar"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label="Профиль"
              aria-expanded={profileOpen}
            >
              <span className="avatar-placeholder">С</span>
            </button>
            {profileOpen && <ProfileFlyout placement="mobile" />}
          </div>
          <TimerTopbar />
          <div className="topbar-spacer" />
          <div className="resource-pill"><Gem size={18} /><strong>1 240</strong></div>
          <div className="resource-pill"><strong>860 XP</strong></div>
          <div className="resource-pill"><Flame size={18} /><strong>7</strong></div>
        </header>
        <main className="page-scroll">
          {overlay === 'settings' ? (
            <SettingsPage />
          ) : overlay ? (
            <PlaceholderPage {...overlayCopy[overlay]} />
          ) : section === 'tasks' ? (
            <TasksPage />
          ) : (
            <PlaceholderPage {...pages[section]} />
          )}
        </main>
      </div>
      <MobileNav section={section} onSection={setSection} />
      {clockTask && (
        <ClockTimerModal
          taskId={clockTask.id}
          taskTitle={clockTask.title}
          onClose={closeClock}
        />
      )}
    </div>
  )
}
