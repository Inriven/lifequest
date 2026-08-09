import { Pause, Play, Square } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTimerStore } from '../features/timer/timerStore'
import { useUiStore } from '../features/ui/uiStore'
import { useTaskStore } from '../features/tasks/taskStore'

function format(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const mm = Math.floor(total / 60).toString().padStart(2, '0')
  const ss = (total % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}

export function TimerTopbar() {
  const status = useTimerStore((s) => s.status)
  const taskId = useTimerStore((s) => s.taskId)
  const taskTitle = useTimerStore((s) => s.taskTitle)
  const pause = useTimerStore((s) => s.pause)
  const resume = useTimerStore((s) => s.resume)
  const stop = useTimerStore((s) => s.stop)
  const finish = useTimerStore((s) => s.finish)
  const remainingMs = useTimerStore((s) => s.remainingMs)
  const openClock = useUiStore((s) => s.openClock)
  const completeTask = useTaskStore((s) => s.completeTask)
  const [, setTick] = useState(0)

  useEffect(() => {
    if (status === 'idle') return
    const id = window.setInterval(() => {
      setTick((v) => v + 1)
      const store = useTimerStore.getState()
      if (store.status === 'idle') return
      if (store.remainingMs() > 0) return
      if (store.taskId) completeTask(store.taskId)
      finish()
    }, 250)
    return () => window.clearInterval(id)
  }, [status, completeTask, finish])

  if (status === 'idle' || !taskId) return null
  const remaining = remainingMs()

  return (
    <div className="top-timer">
      <button
        type="button"
        className="top-timer-hit"
        onClick={() => openClock({ id: taskId, title: taskTitle })}
        aria-label={`Открыть таймер: ${taskTitle}`}
      >
        <strong>{format(remaining)}</strong>
        <span>{taskTitle}</span>
      </button>
      <button
        type="button"
        className="icon-button"
        onClick={status === 'running' ? pause : resume}
        aria-label={status === 'running' ? 'Пауза' : 'Продолжить'}
      >
        {status === 'running' ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <button type="button" className="icon-button" onClick={stop} aria-label="Остановить таймер">
        <Square size={17} />
      </button>
    </div>
  )
}
