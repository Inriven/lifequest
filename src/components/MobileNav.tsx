import { Backpack, BookOpen, Compass, ListTodo, Sparkles } from 'lucide-react'
import type { SectionId } from './Sidebar'

const items = [
  ['tasks', 'Задачи', ListTodo],
  ['status', 'Статус', Sparkles],
  ['path', 'Путь', Compass],
  ['artifacts', 'Арт.', Backpack],
  ['handbook', 'Гайд', BookOpen],
] as const

export function MobileNav({ section, onSection }: { section: SectionId; onSection: (id: SectionId) => void }) {
  return <nav className="mobile-nav">{items.map(([id, label, Icon]) => <button key={id} className={section === id ? 'active' : ''} onClick={() => onSection(id)}><Icon size={23}/><span>{label}</span></button>)}</nav>
}
