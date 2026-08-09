import { Play } from 'lucide-react'
import { DifficultyDots } from './DifficultyDots'
import { isDone, type Task } from './taskModel'
import { useUiStore } from '../ui/uiStore'
import { useTaskStore } from './taskStore'
import { startTaskTimer } from '../timer/startTaskTimer'

export function TaskRow({ task }: { task: Task }) {
  const toggleTask = useTaskStore((s) => s.toggleTask)
  const openTaskDetails = useUiStore((s) => s.openTaskDetails)
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
        disabled={done}
        onClick={() => {
          startTaskTimer(task.id, task.title, task.estimatedMinutes * 60_000)
        }}
      >
        <Play size={17} />
      </button>
    </article>
  )
}
