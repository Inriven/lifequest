import { Play } from 'lucide-react'
import { DifficultyDots } from './DifficultyDots'
import { GROUP_META, type Task } from './taskModel'
import { useUiStore } from '../ui/uiStore'
import { startTaskTimer } from '../timer/startTaskTimer'

export function MainQuestCard({ task }: { task: Task }) {
  const openTaskDetails = useUiStore((s) => s.openTaskDetails)

  return (
    <section className="main-quest">
      <div className="main-quest-kicker">MAIN QUEST · {GROUP_META[task.group].label}</div>
      <button type="button" className="main-quest-title" onClick={() => openTaskDetails(task.id)}>
        <h2>{task.title}</h2>
      </button>
      <div className="main-quest-meta">
        <span>{task.estimatedMinutes} мин</span>
        <span>+{task.xpReward} XP</span>
        {task.skillName && <span>{task.skillName}</span>}
        <DifficultyDots value={task.difficulty} />
      </div>
      {task.description && <p className="main-quest-copy">{task.description}</p>}
      <button
        type="button"
        className="primary main-quest-cta"
        onClick={() => startTaskTimer(task.id, task.title, task.estimatedMinutes * 60_000)}
      >
        <Play size={18} /> Начать
      </button>
    </section>
  )
}
