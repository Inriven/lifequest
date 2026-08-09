import { CalendarPlus, Trash2 } from 'lucide-react'
import { selectInboxTasks } from './taskModel'
import { useTaskStore } from './taskStore'
import { useUiStore } from '../ui/uiStore'
import { QuickAdd } from './QuickAdd'

export function InboxView() {
  const tasks = useTaskStore((s) => s.tasks)
  const assignToToday = useTaskStore((s) => s.assignToToday)
  const assignDate = useTaskStore((s) => s.assignDate)
  const deleteTask = useTaskStore((s) => s.deleteTask)
  const openTaskDetails = useUiStore((s) => s.openTaskDetails)
  const inbox = selectInboxTasks(tasks)

  return (
    <div className="inbox-view">
      <header className="page-header compact">
        <div>
          <small>UNSORTED</small>
          <h1>Inbox</h1>
          <p>Сюда падают задачи без даты. Разбери их, когда будет минута.</p>
        </div>
      </header>

      <QuickAdd mode="inbox" />

      {inbox.length === 0 ? (
        <p className="muted-copy">Inbox пуст. Новые неразобранные появятся здесь.</p>
      ) : (
        <div className="inbox-list">
          {inbox.map((task) => (
            <article key={task.id} className="inbox-row">
              <button type="button" className="inbox-main" onClick={() => openTaskDetails(task.id)}>
                <strong>{task.title}</strong>
                <span>{task.estimatedMinutes} мин · +{task.xpReward} XP</span>
              </button>
              <button type="button" className="secondary" onClick={() => assignToToday(task.id)}>
                <CalendarPlus size={17} /> Сегодня
              </button>
              <label className="inbox-date">
                <span className="sr-only">Назначить дату</span>
                <input
                  type="date"
                  onChange={(e) => {
                    if (e.target.value) assignDate(task.id, e.target.value)
                  }}
                  aria-label="Назначить дату"
                />
              </label>
              <button
                type="button"
                className="icon-button"
                aria-label="Удалить"
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 size={17} />
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
