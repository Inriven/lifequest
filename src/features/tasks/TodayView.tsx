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

  return (
    <div className="today-view">
      <header className="today-hero">
        <div>
          <small>{formatRuLongDate()}</small>
          <h1>Сегодня</h1>
          <p>Следующий шаг виден сразу. Остальное можно разобрать позже.</p>
        </div>
        <div className="today-status" aria-label="Краткий статус">
          <div><span>Streak</span><strong>7 дней</strong></div>
          <div><span>Ранг</span><strong>Искатель IV</strong></div>
          <div><span>Открыто</span><strong>{openCount}</strong></div>
        </div>
      </header>

      <div className="quick-add-desktop">
        <QuickAdd mode="today" />
      </div>

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
            <strong>Ближайшее · {nearest.time}</strong>
            <span>{nearest.title}</span>
          </div>
        </button>
      )}

      <section className="today-list">
        <div className="section-head">
          <h2>Задачи дня</h2>
          <span>{todayTasks.length}</span>
        </div>
        {todayTasks.length === 0 ? (
          <p className="muted-copy">Пока нет задач с датой «сегодня».</p>
        ) : (
          <div className="quest-list-panel">
            {todayTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
