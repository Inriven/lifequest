import { Backpack, BookOpen, Compass, ListTodo, Settings, Sparkles, UserRound, X } from 'lucide-react'
import { type ReactNode } from 'react'
import { useProfileStore } from '../features/profile/profileStore'

export type SectionId = 'tasks' | 'status' | 'path' | 'artifacts' | 'handbook'

const nav: { id: SectionId; label: string; icon: ReactNode }[] = [
  { id: 'tasks', label: 'Задачи', icon: <ListTodo size={26}/> },
  { id: 'status', label: 'Статус', icon: <Sparkles size={26}/> },
  { id: 'path', label: 'Путь', icon: <Compass size={26}/> },
  { id: 'artifacts', label: 'Артефакты', icon: <Backpack size={26}/> },
  { id: 'handbook', label: 'Handbook', icon: <BookOpen size={26}/> },
]

export function Sidebar({ section, onSection }: { section: SectionId; onSection: (id: SectionId) => void }) {
  const { profileOpen, setProfileOpen } = useProfileStore()
  return (
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">✦</span><span>LIFEQUEST</span></div>
      <nav className="side-nav" aria-label="Главная навигация">
        {nav.map((item) => (
          <button key={item.id} className={`nav-item ${section === item.id ? 'active' : ''}`} onClick={() => onSection(item.id)}>
            <span className="nav-icon">{item.icon}</span><span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="profile-zone" onMouseLeave={() => setProfileOpen(false)}>
        {profileOpen && (
          <div className="profile-flyout">
            <div className="profile-flyout-head"><strong>Святослав</strong><button className="icon-button" onClick={() => setProfileOpen(false)}><X size={16}/></button></div>
            <button><UserRound size={18}/> Профиль</button>
            <button><Sparkles size={18}/> Достижения</button>
            <button><Compass size={18}/> Миры</button>
            <div className="menu-separator"/>
            <button><Settings size={18}/> Настройки</button>
          </div>
        )}
        <button className="profile-button" onMouseEnter={() => setProfileOpen(true)} onClick={() => setProfileOpen(!profileOpen)}>
          <div className="avatar-placeholder">С</div>
          <div><strong>Святослав</strong><span>Искатель IV · Lv. 12</span></div>
        </button>
      </div>
    </aside>
  )
}
