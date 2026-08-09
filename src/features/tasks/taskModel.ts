/** Task domain types aligned with public.tasks (Supabase) + local UI fields. */

export type TaskGroupId = 'main' | 'daily' | 'world' | 'side'
export type TaskStatus = 'open' | 'active' | 'done'
export type TaskDifficulty = 1 | 2 | 3 | 4 | 5

export type Task = {
  id: string
  title: string
  description: string
  /** Maps to tasks.group_key */
  group: TaskGroupId
  /** Maps to tasks.status */
  status: TaskStatus
  /** Local calendar day YYYY-MM-DD from scheduled_at; null = Inbox */
  date: string | null
  /** HH:MM portion of scheduled_at */
  time: string | null
  /** Maps to estimated_minutes */
  estimatedMinutes: number
  /** Maps to xp_reward */
  xpReward: number
  difficulty: TaskDifficulty
  goalId: string | null
  goalTitle: string | null
  skillId: string | null
  skillName: string | null
  completedAt: string | null
  isMainQuest: boolean
}

export type TaskDraft = {
  title: string
  date?: string | null
  time?: string | null
  group?: TaskGroupId
  estimatedMinutes?: number
  xpReward?: number
  difficulty?: TaskDifficulty
  description?: string
  goalTitle?: string | null
  skillName?: string | null
  isMainQuest?: boolean
}

export const GROUP_META: Record<TaskGroupId, { label: string; kicker: string }> = {
  main: { label: 'Главная миссия', kicker: 'MAIN QUEST' },
  daily: { label: 'Ежедневные поручения', kicker: 'DAILY' },
  world: { label: 'Задания мира', kicker: 'WORLD' },
  side: { label: 'Побочные задания', kicker: 'SIDE QUESTS' },
}

export function todayISO(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const ruLongDate = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function formatRuLongDate(now = new Date()): string {
  const raw = ruLongDate.format(now)
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export function isDone(task: Task): boolean {
  return task.status === 'done'
}

export function isInboxTask(task: Task): boolean {
  return task.date == null
}

export function isTodayTask(task: Task, day = todayISO()): boolean {
  return task.date === day
}

export function compareByTime(a: Task, b: Task): number {
  if (a.time && b.time) return a.time.localeCompare(b.time)
  if (a.time) return -1
  if (b.time) return 1
  return a.title.localeCompare(b.title, 'ru')
}

export function selectTodayTasks(tasks: Task[], day = todayISO()): Task[] {
  return tasks.filter((task) => isTodayTask(task, day)).sort((a, b) => {
    if (isDone(a) !== isDone(b)) return isDone(a) ? 1 : -1
    return compareByTime(a, b)
  })
}

export function selectInboxTasks(tasks: Task[]): Task[] {
  return tasks.filter(isInboxTask).sort((a, b) => a.title.localeCompare(b.title, 'ru'))
}

export function selectTimelineTasks(tasks: Task[], day = todayISO()): Task[] {
  return tasks
    .filter((task) => isTodayTask(task, day) && Boolean(task.time))
    .sort(compareByTime)
}

export function selectMainQuest(tasks: Task[], day = todayISO()): Task | null {
  const today = selectTodayTasks(tasks, day).filter((task) => !isDone(task))
  return today.find((task) => task.isMainQuest) ?? today.find((task) => task.group === 'main') ?? today[0] ?? null
}

export function selectNearestTimed(tasks: Task[], day = todayISO(), now = new Date()): Task | null {
  const nowHm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const timed = selectTimelineTasks(tasks, day).filter((task) => !isDone(task))
  return timed.find((task) => (task.time ?? '') >= nowHm) ?? timed[0] ?? null
}

export function createTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `task_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function buildTask(draft: TaskDraft): Task {
  const title = draft.title.trim()
  return {
    id: createTaskId(),
    title,
    description: draft.description?.trim() ?? '',
    group: draft.group ?? 'daily',
    status: 'open',
    date: draft.date === undefined ? todayISO() : draft.date,
    time: draft.time ?? null,
    estimatedMinutes: draft.estimatedMinutes ?? 25,
    xpReward: draft.xpReward ?? 20,
    difficulty: draft.difficulty ?? 2,
    goalId: null,
    goalTitle: draft.goalTitle ?? null,
    skillId: null,
    skillName: draft.skillName ?? null,
    completedAt: null,
    isMainQuest: draft.isMainQuest ?? false,
  }
}
