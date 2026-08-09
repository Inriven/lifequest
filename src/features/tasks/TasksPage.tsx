import { ChevronDown, ChevronRight, Clock3, Play, Plus, Sparkles } from 'lucide-react'
import { useTaskStore, type TaskGroupId } from './taskStore'
import { useUiStore } from '../ui/uiStore'

const groups: { id: TaskGroupId; label: string; kicker: string }[] = [
  { id: 'main', label: 'Главная миссия', kicker: 'MAIN QUEST' },
  { id: 'daily', label: 'Ежедневные поручения', kicker: 'DAILY' },
  { id: 'world', label: 'Задания мира', kicker: 'WORLD' },
  { id: 'side', label: 'Побочные задания', kicker: 'SIDE QUESTS' },
]

export function TasksPage() {
  const { tasks, collapsed, toggleGroup, toggleTask } = useTaskStore()
  const openClock = useUiStore((s) => s.openClock)
  const next = tasks.find((task) => !task.done)

  return (
    <>
      <div className="page-header">
        <div>
          <small>ВОСКРЕСЕНЬЕ · 9 АВГУСТА</small>
          <h1>Сегодня</h1>
          <p>Система держит в фокусе только то, что двигает тебя сегодня.</p>
        </div>
        <button type="button" className="primary">
          <Plus size={18} /> Быстрое задание
        </button>
      </div>

      <div className="today-layout">
        <main className="quest-stack">
          {groups.map((group) => {
            const groupTasks = tasks.filter((task) => task.group === group.id)
            const completed = groupTasks.filter((task) => task.done).length
            const isCollapsed = collapsed[group.id]
            return (
              <section className={`quest-group ${isCollapsed ? 'is-collapsed' : ''}`} key={group.id}>
                <button
                  type="button"
                  className="group-header"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={!isCollapsed}
                >
                  <div>
                    <small>{group.kicker}</small>
                    <strong>{group.label}</strong>
                  </div>
                  <span className="group-meta">
                    <span>{completed}/{groupTasks.length}</span>
                    {isCollapsed ? <ChevronRight size={22} aria-hidden="true" /> : <ChevronDown size={22} aria-hidden="true" />}
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="group-body">
                    {groupTasks.map((task) => (
                      <article className={`quest-row ${task.done ? 'done' : ''}`} key={task.id}>
                        <button
                          type="button"
                          className="quest-check"
                          onClick={() => toggleTask(task.id)}
                          aria-label={task.done ? 'Снять выполнение' : 'Отметить выполненным'}
                        >
                          {task.done ? '✓' : ''}
                        </button>
                        <div className="quest-main">
                          <strong>{task.title}</strong>
                          <span>
                            {task.time ? `${task.time} · ` : ''}
                            {task.minutes} мин · +{task.xp} XP
                          </span>
                        </div>
                        <button
                          type="button"
                          className="timer-button"
                          onClick={() => openClock({ id: task.id, title: task.title })}
                        >
                          <Clock3 size={17} />
                          <span>Таймер</span>
                        </button>
                        <button
                          type="button"
                          className="start-button"
                          onClick={() => openClock({ id: task.id, title: task.title })}
                          aria-label="Открыть таймер"
                        >
                          <Play size={17} />
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </main>

        <aside className="next-panel">
          <div className="panel-kicker">
            <Sparkles size={18} /> NEXT BEST QUEST
          </div>
          <h2>{next?.title ?? 'Все задания закрыты'}</h2>
          <p>45 минут фокуса. После завершения система пересчитает следующий лучший шаг.</p>
          <button
            type="button"
            className="primary wide"
            disabled={!next}
            onClick={() => {
              if (next) openClock({ id: next.id, title: next.title })
            }}
          >
            <Play size={18} /> Начать миссию
          </button>
        </aside>
      </div>
    </>
  )
}
