import { Plus } from 'lucide-react'
import { useUiStore, type TasksTab } from '../ui/uiStore'
import { TodayView } from './TodayView'
import { TimelineView } from './TimelineView'
import { InboxView } from './InboxView'
import { AllQuestsView } from './AllQuestsView'
import { TaskDetails } from './TaskDetails'
import { selectInboxTasks } from './taskModel'
import { useTaskStore } from './taskStore'

const tabs: { id: TasksTab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'all', label: 'All Quests' },
]

export function TasksPage() {
  const tasksTab = useUiStore((s) => s.tasksTab)
  const setTasksTab = useUiStore((s) => s.setTasksTab)
  const requestQuickAddFocus = useUiStore((s) => s.requestQuickAddFocus)
  const inboxCount = useTaskStore((s) => selectInboxTasks(s.tasks).length)

  return (
    <div className="tasks-page">
      <nav className="tasks-tabs" aria-label="Разделы задач">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tasksTab === tab.id ? 'active' : ''}
            onClick={() => setTasksTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'inbox' && inboxCount > 0 ? <em>{inboxCount}</em> : null}
          </button>
        ))}
      </nav>

      {tasksTab === 'today' && <TodayView />}
      {tasksTab === 'timeline' && <TimelineView />}
      {tasksTab === 'inbox' && <InboxView />}
      {tasksTab === 'all' && <AllQuestsView />}

      <button
        type="button"
        className="fab-quick-add"
        onClick={() => {
          setTasksTab('today')
          requestQuickAddFocus()
        }}
        aria-label="Быстро добавить задачу"
      >
        <Plus size={24} />
      </button>

      <TaskDetails />
    </div>
  )
}
