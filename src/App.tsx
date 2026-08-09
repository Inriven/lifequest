import { useState } from 'react'
import { Gem, Flame } from 'lucide-react'
import { Sidebar, type SectionId } from './components/Sidebar'
import { MobileNav } from './components/MobileNav'
import { TimerTopbar } from './components/TimerTopbar'
import { TasksPage } from './features/tasks/TasksPage'
import { PlaceholderPage } from './components/PlaceholderPage'

const pages: Record<Exclude<SectionId, 'tasks'>, { kicker: string; title: string; text: string }> = {
  status: { kicker: 'CHARACTER', title: 'Статус игрока', text: 'Ранг, навыки и характеристики будут расти из реальных действий, а не ручных кликов.' },
  path: { kicker: 'QUEST PATH', title: 'Путь', text: 'Миссия → главы → квесты. Здесь будет AI-декомпозиция больших целей в игровую карту.' },
  artifacts: { kicker: 'RESOURCE GRAPH', title: 'Артефакты', text: 'Ресурсы человека будут предлагаться системой автоматически и подтверждаться одним действием.' },
  handbook: { kicker: 'GUIDE', title: 'Handbook', text: 'Ежедневная активность, неделя, рост и подсказка следующего полезного действия.' },
}

export default function App() {
  const [section, setSection] = useState<SectionId>('tasks')
  return (
    <div className="app-shell">
      <div className="world-backdrop" aria-hidden="true" />
      <Sidebar section={section} onSection={setSection}/>
      <div className="app-main">
        <header className="topbar">
          <TimerTopbar/>
          <div className="topbar-spacer"/>
          <div className="resource-pill"><Gem size={18}/><strong>1 240</strong></div>
          <div className="resource-pill"><strong>860 XP</strong></div>
          <div className="resource-pill"><Flame size={18}/><strong>7</strong></div>
        </header>
        <main className="page-scroll">
          {section === 'tasks' ? <TasksPage/> : <PlaceholderPage {...pages[section]}/>} 
        </main>
      </div>
      <MobileNav section={section} onSection={setSection}/>
    </div>
  )
}
