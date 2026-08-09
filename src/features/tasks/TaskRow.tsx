import { Play } from 'lucide-react'
import { DifficultyDots } from './DifficultyDots'
import { isDone, type Task } from './taskModel'
import { useUiStore } from '../ui/uiStore'
import { useTaskStore } from './taskStore'
import { useTimerStore } from '../timer/timerStore'

export function TaskRow({ task }: { task: Task }) {
  const toggleTask = useTaskStore((s) => s.toggleTask)
  const setTaskActive = useTaskStore((s) => s.setTaskActive)
  const openTaskDetails = useUiStore((s) => s.openTaskDetails)
  const openClock = useUiStore((s) => s.openClock)
  const startTimer = useTimerStore((s) => s.start)
  const done = isDone(task)

  return (
    <article className={`quest-row ${done ? 'done' : ''} ${task.status === 'active' ? 'is-active' : ''}`}>
      <button
        type="button"
        className="quest-check"
        onClick={() => toggleTask(task.id)}
        aria-label={done ? 'Снять выполнение' : 'Отметить выполненным'}
      >
        {done ? '✓' : ''}
      </button>

      <button
        type="button"
        className="quest-main quest-main-hit"
        onClick={() => openTaskDetails(task.id)}
      >
        <strong>{task.title}</strong>
        <span>
          {task.time ? `${task.time} · ` : ''}
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
    </article>
  )
}
