import { Clock3 } from 'lucide-react'
import {
  formatRuLongDate,
  selectMainQuest,
  selectNearestTimed,
  selectTodayTasks,
} from './taskModel'
import { useTaskStore } from './taskStore'
import { MainQuestCard } from './MainQuestCard'
import { QuickAdd } from './QuickAdd'
import { TaskRow } from './TaskRow'
import { useUiStore } from '../ui/uiStore'

export function TodayView() {
  const tasks = useTaskStore((s) => s.tasks)
  const openTaskDetails = useUiStore((s) => s.openTaskDetails)
  const todayTasks = selectTodayTasks(tasks)
  const mainQuest = selectMainQuest(tasks)
  const nearest = selectNearestTimed(tasks)
  const openCount = todayTasks.filter((task) => task.status !== 'done').length
  const listTasks = todayTasks.filter((task) => task.id !== mainQuest?.id)

  return (
    <div className="today-view">
      <header className="today-hero">
        <div>
          <small>{formatRuLongDate()}</small>
          <h1>Сегодня</h1>
        </div>
        <p className="today-status-line" aria-label="Краткий статус">
          <span>Streak 7</span>
          <span aria-hidden="true">·</span>
          <span>Искатель IV</span>
          <span aria-hidden="true">·</span>
          <span>Открыто {openCount}</span>
        </p>
      </header>

      <QuickAdd mode="today" />

      {mainQuest ? (
        <MainQuestCard task={mainQuest} />
      ) : (
        <section className="empty-today">
          <h2>На сегодня пусто</h2>
          <p>Добавь первое задание строкой выше или забери что-то из Inbox.</p>
        </section>
      )}

      {nearest && nearest.id !== mainQuest?.id && (
        <button type="button" className="nearest-event" onClick={() => openTaskDetails(nearest.id)}>
          <Clock3 size={18} />
          <div>
            <strong>Далее · {nearest.time}</strong>
            <span>{nearest.title}</span>
          </div>
        </button>
      )}

      <section className="today-list">
        <div className="section-head">
          <h2>Задачи дня</h2>
          <span>{listTasks.length}</span>
        </div>
        {listTasks.length === 0 ? (
          <p className="muted-copy">Кроме главного квеста на сегодня больше ничего нет.</p>
        ) : (
          <div className="quest-list-panel">
            {listTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
