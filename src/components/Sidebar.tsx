import { Backpack, BookOpen, Compass, ListTodo, Sparkles } from 'lucide-react'
import { type ReactNode } from 'react'
import { useProfileStore } from '../features/profile/profileStore'
import { useUiStore } from '../features/ui/uiStore'
import { ProfileFlyout } from './ProfileFlyout'

export type SectionId = 'tasks' | 'status' | 'path' | 'artifacts' | 'handbook'

const nav: { id: SectionId; label: string; icon: ReactNode }[] = [
  { id: 'tasks', label: 'Задачи', icon: <ListTodo size={28} strokeWidth={1.75} /> },
  { id: 'status', label: 'Статус', icon: <Sparkles size={28} strokeWidth={1.75} /> },
  { id: 'path', label: 'Путь', icon: <Compass size={28} strokeWidth={1.75} /> },
  { id: 'artifacts', label: 'Артефакты', icon: <Backpack size={28} strokeWidth={1.75} /> },
  { id: 'handbook', label: 'Handbook', icon: <BookOpen size={28} strokeWidth={1.75} /> },
]

export function Sidebar({
  section,
  onSection,
}: {
  section: SectionId
  onSection: (id: SectionId) => void
}) {
  const { profileOpen, setProfileOpen } = useProfileStore()
  const setOverlay = useUiStore((s) => s.setOverlay)

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">✦</span>
        <span>LIFEQUEST</span>
      </div>

      <nav className="side-nav" aria-label="Главная навигация">
        {nav.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${section === item.id ? 'active' : ''}`}
            onClick={() => {
              setOverlay(null)
              onSection(item.id)
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="profile-zone" onMouseLeave={() => setProfileOpen(false)}>
        {profileOpen && <ProfileFlyout placement="sidebar" />}
        <button
          type="button"
          className="profile-button"
          onMouseEnter={() => setProfileOpen(true)}
          onClick={() => setProfileOpen(!profileOpen)}
          aria-expanded={profileOpen}
          aria-haspopup="menu"
        >
          <div className="avatar-placeholder" aria-hidden="true">С</div>
          <div>
            <strong>Святослав</strong>
            <span>Искатель IV · Lv. 12</span>
          </div>
        </button>
      </div>
    </aside>
  )
}
