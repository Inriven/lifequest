import { selectTimelineTasks, isDone } from './taskModel'
import { useTaskStore } from './taskStore'
import { useUiStore } from '../ui/uiStore'
import { DifficultyDots } from './DifficultyDots'
import { Play } from 'lucide-react'
import { useTimerStore } from '../timer/timerStore'

export function TimelineView() {
  const tasks = useTaskStore((s) => s.tasks)
  const setTaskActive = useTaskStore((s) => s.setTaskActive)
  const openTaskDetails = useUiStore((s) => s.openTaskDetails)
  const openClock = useUiStore((s) => s.openClock)
  const startTimer = useTimerStore((s) => s.start)
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
                  onClick={() => {
                    setTaskActive(task.id)
                    startTimer(task.id, task.title, task.estimatedMinutes * 60_000)
                    openClock({ id: task.id, title: task.title })
                  }}
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
