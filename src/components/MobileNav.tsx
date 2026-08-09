import { Backpack, BookOpen, Compass, ListTodo, Sparkles } from 'lucide-react'
import type { SectionId } from './Sidebar'
import { useUiStore } from '../features/ui/uiStore'

const items = [
  ['tasks', 'Задачи', ListTodo],
  ['status', 'Статус', Sparkles],
  ['path', 'Путь', Compass],
  ['artifacts', 'Артефакты', Backpack],
  ['handbook', 'Handbook', BookOpen],
] as const

export function MobileNav({
  section,
  onSection,
}: {
  section: SectionId
  onSection: (id: SectionId) => void
}) {
  const setOverlay = useUiStore((s) => s.setOverlay)
  return (
    <nav className="mobile-nav" aria-label="Мобильная навигация">
      {items.map(([id, label, Icon]) => (
        <button
          key={id}
          type="button"
          className={section === id ? 'active' : ''}
          onClick={() => {
            setOverlay(null)
            onSection(id)
          }}
        >
          <Icon size={24} strokeWidth={1.75} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
