import { ChevronDown, ChevronRight } from 'lucide-react'
import { GROUP_META, type TaskGroupId } from './taskModel'
import { useTaskStore } from './taskStore'
import { TaskRow } from './TaskRow'

const groups = Object.keys(GROUP_META) as TaskGroupId[]

export function AllQuestsView() {
  const tasks = useTaskStore((s) => s.tasks)
  const collapsed = useTaskStore((s) => s.collapsed)
  const toggleGroup = useTaskStore((s) => s.toggleGroup)

  return (
    <div className="all-quests-view">
      <header className="page-header compact">
        <div>
          <small>QUEST LOG</small>
          <h1>Все квесты</h1>
          <p>Группы сворачиваются. Состояние accordion сохраняется после reload.</p>
        </div>
      </header>

      <div className="quest-stack">
        {groups.map((groupId) => {
          const groupTasks = tasks.filter((task) => task.group === groupId)
          const completed = groupTasks.filter((task) => task.status === 'done').length
          const isCollapsed = collapsed[groupId]
          return (
            <section className={`quest-group ${isCollapsed ? 'is-collapsed' : ''}`} key={groupId}>
              <button
                type="button"
                className="group-header"
                onClick={() => toggleGroup(groupId)}
                aria-expanded={!isCollapsed}
              >
                <div>
                  <small>{GROUP_META[groupId].kicker}</small>
                  <strong>{GROUP_META[groupId].label}</strong>
                </div>
                <span className="group-meta">
                  <span>{completed}/{groupTasks.length}</span>
                  {isCollapsed
                    ? <ChevronRight size={22} aria-hidden="true" />
                    : <ChevronDown size={22} aria-hidden="true" />}
                </span>
              </button>
              {!isCollapsed && (
                <div className="group-body">
                  {groupTasks.length === 0 ? (
                    <p className="group-empty">В этой группе пока пусто.</p>
                  ) : (
                    groupTasks.map((task) => <TaskRow key={task.id} task={task} />)
                  )}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
