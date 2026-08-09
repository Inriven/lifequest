import { Play, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { GROUP_META, todayISO, type TaskDifficulty, type TaskGroupId, type TaskStatus } from './taskModel'
import { useTaskStore } from './taskStore'
import { useTimerStore } from '../timer/timerStore'
import { useUiStore } from '../ui/uiStore'

export function TaskDetails() {
  const selectedTaskId = useUiStore((s) => s.selectedTaskId)
  const closeTaskDetails = useUiStore((s) => s.closeTaskDetails)
  const openClock = useUiStore((s) => s.openClock)
  const tasks = useTaskStore((s) => s.tasks)
  const updateTask = useTaskStore((s) => s.updateTask)
  const deleteTask = useTaskStore((s) => s.deleteTask)
  const assignToToday = useTaskStore((s) => s.assignToToday)
  const setTaskActive = useTaskStore((s) => s.setTaskActive)
  const startTimer = useTimerStore((s) => s.start)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const task = useMemo(
    () => tasks.find((item) => item.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (task && !dialog.open) dialog.showModal()
    if (!task && dialog.open) dialog.close()
    const onCancel = (event: Event) => {
      event.preventDefault()
      closeTaskDetails()
    }
    dialog.addEventListener('cancel', onCancel)
    return () => dialog.removeEventListener('cancel', onCancel)
  }, [task, closeTaskDetails])

  if (!task) return null

  const start = () => {
    setTaskActive(task.id)
    startTimer(task.id, task.title, task.estimatedMinutes * 60_000)
    openClock({ id: task.id, title: task.title })
  }

  return (
    <dialog
      ref={dialogRef}
      className="task-details-layer"
      aria-label="Детали задачи"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeTaskDetails()
      }}
    >
      <section className="task-details">
        <header className="task-details-head">
          <div>
            <small>{GROUP_META[task.group].kicker}</small>
            <h2>Детали квеста</h2>
          </div>
          <button type="button" className="icon-button" onClick={closeTaskDetails} aria-label="Закрыть">
            <X size={18} />
          </button>
        </header>

        <label className="field">
          <span>Название</span>
          <input
            value={task.title}
            onChange={(e) => updateTask(task.id, { title: e.target.value })}
          />
        </label>

        <label className="field">
          <span>Описание</span>
          <textarea
            rows={4}
            value={task.description}
            onChange={(e) => updateTask(task.id, { description: e.target.value })}
            placeholder="Что должно получиться в итоге"
          />
        </label>

        <div className="field-grid">
          <label className="field">
            <span>Дата</span>
            <input
              type="date"
              value={task.date ?? ''}
              onChange={(e) => updateTask(task.id, { date: e.target.value || null, time: e.target.value ? task.time : null })}
            />
          </label>
          <label className="field">
            <span>Время</span>
            <input
              type="time"
              value={task.time ?? ''}
              onChange={(e) => updateTask(task.id, {
                time: e.target.value || null,
                date: e.target.value ? (task.date ?? todayISO()) : task.date,
              })}
            />
          </label>
          <label className="field">
            <span>Длительность, мин</span>
            <input
              type="number"
              min={5}
              step={5}
              value={task.estimatedMinutes}
              onChange={(e) => updateTask(task.id, { estimatedMinutes: Math.max(5, Number(e.target.value) || 5) })}
            />
          </label>
          <label className="field">
            <span>Сложность</span>
            <select
              value={task.difficulty}
              onChange={(e) => updateTask(task.id, { difficulty: Number(e.target.value) as TaskDifficulty })}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="field-grid">
          <label className="field">
            <span>Категория</span>
            <select
              value={task.group}
              onChange={(e) => updateTask(task.id, { group: e.target.value as TaskGroupId })}
            >
              {(Object.keys(GROUP_META) as TaskGroupId[]).map((group) => (
                <option key={group} value={group}>{GROUP_META[group].label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Статус</span>
            <select
              value={task.status}
              onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
            >
              <option value="open">Открыт</option>
              <option value="active">В фокусе</option>
              <option value="done">Готово</option>
            </select>
          </label>
          <label className="field">
            <span>Цель</span>
            <input
              value={task.goalTitle ?? ''}
              onChange={(e) => updateTask(task.id, { goalTitle: e.target.value || null })}
              placeholder="Связанная цель"
            />
          </label>
          <label className="field">
            <span>Навык</span>
            <input
              value={task.skillName ?? ''}
              onChange={(e) => updateTask(task.id, { skillName: e.target.value || null })}
              placeholder="Связанный skill"
            />
          </label>
        </div>

        <div className="task-details-actions">
          <button type="button" className="primary" onClick={start}>
            <Play size={18} /> Старт таймера
          </button>
          {!task.date && (
            <button type="button" className="secondary" onClick={() => assignToToday(task.id)}>
              На сегодня
            </button>
          )}
          <button
            type="button"
            className="secondary danger-quiet"
            onClick={() => {
              deleteTask(task.id)
              closeTaskDetails()
            }}
          >
            <Trash2 size={17} /> Удалить
          </button>
        </div>
      </section>
    </dialog>
  )
}
