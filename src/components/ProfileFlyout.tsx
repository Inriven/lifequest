import { Compass, LogOut, Settings, Sparkles, UserRound, Users, X } from 'lucide-react'
import type { OverlayId } from '../features/ui/uiStore'
import { useUiStore } from '../features/ui/uiStore'
import { useProfileStore } from '../features/profile/profileStore'
import type { ReactNode } from 'react'

const flyoutItems: { id: Exclude<OverlayId, null> | 'logout'; label: string; icon: ReactNode }[] = [
  { id: 'profile', label: 'Профиль', icon: <UserRound size={18} /> },
  { id: 'achievements', label: 'Достижения', icon: <Sparkles size={18} /> },
  { id: 'worlds', label: 'Миры', icon: <Compass size={18} /> },
  { id: 'friends', label: 'Друзья', icon: <Users size={18} /> },
  { id: 'settings', label: 'Настройки', icon: <Settings size={18} /> },
  { id: 'logout', label: 'Выйти', icon: <LogOut size={18} /> },
]

export function ProfileFlyout({ placement = 'sidebar' }: { placement?: 'sidebar' | 'mobile' }) {
  const setProfileOpen = useProfileStore((s) => s.setProfileOpen)
  const setOverlay = useUiStore((s) => s.setOverlay)

  return (
    <div className={`profile-flyout profile-flyout--${placement}`} role="menu" aria-label="Меню профиля">
      <div className="profile-flyout-head">
        <strong>Святослав</strong>
        <button type="button" className="icon-button" onClick={() => setProfileOpen(false)} aria-label="Закрыть меню">
          <X size={16} />
        </button>
      </div>
      {flyoutItems.map((item) => (
        <button
          key={item.id}
          type="button"
          role="menuitem"
          onClick={() => {
            setProfileOpen(false)
            if (item.id === 'logout') {
              setOverlay(null)
              return
            }
            setOverlay(item.id)
          }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  )
}
