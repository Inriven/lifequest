import { selectTimelineTasks, isDone } from './taskModel'
import { useTaskStore } from './taskStore'
import { useUiStore } from '../ui/uiStore'
import { DifficultyDots } from './DifficultyDots'
import { Play } from 'lucide-react'
import { startTaskTimer } from '../timer/startTaskTimer'

export function TimelineView() {
  const tasks = useTaskStore((s) => s.tasks)
  const openTaskDetails = useUiStore((s) => s.openTaskDetails)
  const timed = selectTimelineTasks(tasks)

  return (
    <div className="timeline-view">
      <header className="page-header compact">
        <div>
          <small>DAY FLOW</small>
          <h1>Timeline</h1>
          <p>Только задачи с временем на сегодня. Календарь появится позже.</p>
        </div>
      </header>

      {timed.length === 0 ? (
        <p className="muted-copy">Нет задач с назначенным временем. Открой детали и поставь час.</p>
      ) : (
        <ol className="timeline-rail">
          {timed.map((task) => (
            <li key={task.id} className={isDone(task) ? 'done' : ''}>
              <div className="timeline-time">{task.time}</div>
              <div className="timeline-card">
                <button type="button" className="timeline-main" onClick={() => openTaskDetails(task.id)}>
                  <strong>{task.title}</strong>
                  <span>
                    {task.estimatedMinutes} мин
                    {task.goalTitle ? ` · ${task.goalTitle}` : ''}
                  </span>
                </button>
                <DifficultyDots value={task.difficulty} />
                <button
                  type="button"
                  className="start-button"
                  aria-label="Запустить таймер"
                  disabled={isDone(task)}
                  onClick={() => startTaskTimer(task.id, task.title, task.estimatedMinutes * 60_000)}
                >
                  <Play size={17} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
