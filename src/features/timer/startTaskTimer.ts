import { useTaskStore } from '../tasks/taskStore'
import { useTimerStore } from './timerStore'
import { useUiStore } from '../ui/uiStore'

/**
 * Start a focus timer for a task. If another timer is running, ask before replace.
 * Returns false when the user cancels replacement.
 */
export function startTaskTimer(taskId: string, taskTitle: string, durationMs: number, opts?: { openClock?: boolean }): boolean {
  const timer = useTimerStore.getState()
  if (timer.status !== 'idle' && timer.taskId && timer.taskId !== taskId) {
    const replace = window.confirm(
      `Сейчас идёт таймер «${timer.taskTitle}». Заменить его на «${taskTitle}»?`,
    )
    if (!replace) return false
    timer.stop()
  }

  useTaskStore.getState().setTaskActive(taskId)
  timer.start(taskId, taskTitle, Math.max(0, durationMs))
  if (opts?.openClock !== false) {
    useUiStore.getState().openClock({ id: taskId, title: taskTitle })
  }
  return true
}

export function finishActiveTimer() {
  const timer = useTimerStore.getState()
  if (timer.taskId) useTaskStore.getState().completeTask(timer.taskId)
  timer.finish()
}
