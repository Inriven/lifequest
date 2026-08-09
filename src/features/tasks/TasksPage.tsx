import { ChevronDown, ChevronRight, Clock3, Play, Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTaskStore, type TaskGroupId } from './taskStore'
import { ClockTimerModal } from '../../components/ClockTimerModal'

const groups: { id: TaskGroupId; label: string; kicker: string }[] = [
  { id: 'main', label: 'Главная миссия', kicker: 'MAIN QUEST' },
  { id: 'daily', label: 'Ежедневные поручения', kicker: 'DAILY' },
  { id: 'world', label: 'Задания мира', kicker: 'WORLD' },
  { id: 'side', label: 'Побочные задания', kicker: 'SIDE QUESTS' },
]

export function TasksPage() {
  const { tasks, collapsed, toggleGroup, toggleTask } = useTaskStore()
  const [timerFor, setTimerFor] = useState<string | null>(null)
  const activeTask = tasks.find((task) => task.id === timerFor)

  return <>
    <div className="page-header">
      <div><small>ВОСКРЕСЕНЬЕ · 9 АВГУСТА</small><h1>Сегодня</h1><p>Система держит в фокусе только то, что двигает тебя сегодня.</p></div>
      <button className="primary"><Plus size={18}/> Быстрое задание</button>
    </div>

    <div className="today-layout">
      <main className="quest-stack">
        {groups.map((group) => {
          const groupTasks = tasks.filter((task) => task.group === group.id)
          const completed = groupTasks.filter((task) => task.done).length
          return <section className="quest-group" key={group.id}>
            <button className="group-header" onClick={() => toggleGroup(group.id)}>
              <div><small>{group.kicker}</small><strong>{group.label}</strong></div>
              <span>{completed}/{groupTasks.length} {collapsed[group.id] ? <ChevronRight size={20}/> : <ChevronDown size={20}/>}</span>
            </button>
            {!collapsed[group.id] && <div className="group-body">
              {groupTasks.map((task) => <article className={`quest-row ${task.done ? 'done' : ''}`} key={task.id}>
                <button className="quest-check" onClick={() => toggleTask(task.id)} aria-label="Выполнить">{task.done ? '✓' : ''}</button>
                <div className="quest-main"><strong>{task.title}</strong><span>{task.time && `${task.time} · `}{task.minutes} мин · +{task.xp} XP</span></div>
                <button className="timer-button" onClick={() => setTimerFor(task.id)}><Clock3 size={17}/><span>Таймер</span></button>
                <button className="start-button" onClick={() => setTimerFor(task.id)}><Play size={17}/></button>
              </article>)}
            </div>}
          </section>
        })}
      </main>

      <aside className="next-panel">
        <div className="panel-kicker"><Sparkles size={18}/> NEXT BEST QUEST</div>
        <h2>{tasks.find((task) => !task.done)?.title ?? 'Все задания закрыты'}</h2>
        <p>45 минут фокуса. После завершения система пересчитает следующий лучший шаг.</p>
        <button className="primary wide" onClick={() => setTimerFor(tasks.find((task) => !task.done)?.id ?? null)}><Play size={18}/> Начать миссию</button>
      </aside>
    </div>

    {activeTask && <ClockTimerModal taskId={activeTask.id} taskTitle={activeTask.title} onClose={() => setTimerFor(null)}/>} 
  </>
}
