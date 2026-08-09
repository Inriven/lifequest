import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  buildTask,
  todayISO,
  type Task,
  type TaskDraft,
  type TaskGroupId,
  type TaskStatus,
} from './taskModel'

type TaskState = {
  collapsed: Record<TaskGroupId, boolean>
  tasks: Task[]
  lastAddedId: string | null
  toggleGroup: (group: TaskGroupId) => void
  toggleTask: (id: string) => void
  completeTask: (id: string) => void
  setTaskActive: (id: string) => void
  addTask: (draft: TaskDraft) => string
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  setTaskTime: (id: string, time: string) => void
  assignToToday: (id: string) => void
  assignDate: (id: string, date: string | null) => void
  undoLastAdd: () => void
}

const seed: Task[] = [
  {
    id: 'q1',
    title: 'Собрать первый экран LifeQuest V1',
    description: 'Собрать Today так, чтобы за 2–3 секунды было понятно, что делать дальше.',
    group: 'main',
    status: 'open',
    date: todayISO(),
    time: '10:00',
    estimatedMinutes: 45,
    xpReward: 90,
    difficulty: 4,
    goalId: 'g1',
    goalTitle: 'LifeQuest V1',
    skillId: 's1',
    skillName: 'Продуктовый крафт',
    completedAt: null,
    isMainQuest: true,
  },
  {
    id: 'q2',
    title: 'Проверить мобильную навигацию',
    description: 'Пройти 390×844: bottom nav, FAB, details sheet.',
    group: 'daily',
    status: 'open',
    date: todayISO(),
    time: '12:00',
    estimatedMinutes: 20,
    xpReward: 25,
    difficulty: 2,
    goalId: 'g1',
    goalTitle: 'LifeQuest V1',
    skillId: 's2',
    skillName: 'UX',
    completedAt: null,
    isMainQuest: false,
  },
  {
    id: 'q3',
    title: 'Разобрать фоновые ассеты',
    description: '',
    group: 'world',
    status: 'open',
    date: todayISO(),
    time: '14:30',
    estimatedMinutes: 30,
    xpReward: 35,
    difficulty: 3,
    goalId: null,
    goalTitle: null,
    skillId: null,
    skillName: null,
    completedAt: null,
    isMainQuest: false,
  },
  {
    id: 'q4',
    title: 'Собрать идеи для мира Skyhold',
    description: 'Черновые образы и тон мира, без полного редизайна.',
    group: 'side',
    status: 'open',
    date: todayISO(),
    time: null,
    estimatedMinutes: 25,
    xpReward: 20,
    difficulty: 2,
    goalId: 'g2',
    goalTitle: 'Миры',
    skillId: 's3',
    skillName: 'Нарратив',
    completedAt: null,
    isMainQuest: false,
  },
  {
    id: 'q5',
    title: 'Идеи для AI Inbox',
    description: 'Сырые заметки без даты.',
    group: 'side',
    status: 'open',
    date: null,
    time: null,
    estimatedMinutes: 15,
    xpReward: 15,
    difficulty: 1,
    goalId: null,
    goalTitle: null,
    skillId: null,
    skillName: null,
    completedAt: null,
    isMainQuest: false,
  },
  {
    id: 'q6',
    title: 'Список звуков для reward',
    description: '',
    group: 'world',
    status: 'open',
    date: null,
    time: null,
    estimatedMinutes: 20,
    xpReward: 18,
    difficulty: 2,
    goalId: null,
    goalTitle: null,
    skillId: null,
    skillName: null,
    completedAt: null,
    isMainQuest: false,
  },
]

function patchStatus(task: Task, status: TaskStatus): Task {
  if (status === 'done') {
    return { ...task, status, completedAt: new Date().toISOString() }
  }
  return { ...task, status, completedAt: null }
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      collapsed: { main: false, daily: false, world: true, side: true },
      tasks: seed,
      lastAddedId: null,
      toggleGroup: (group) => set((state) => ({
        collapsed: { ...state.collapsed, [group]: !state.collapsed[group] },
      })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) => {
          if (task.id !== id) return task
          return patchStatus(task, task.status === 'done' ? 'open' : 'done')
        }),
      })),
      completeTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? patchStatus(task, 'done') : task)),
      })),
      setTaskActive: (id) => set((state) => ({
        tasks: state.tasks.map((task) => {
          if (task.id === id) return { ...task, status: 'active' as const, completedAt: null }
          if (task.status === 'active') return { ...task, status: 'open' as const }
          return task
        }),
      })),
      addTask: (draft) => {
        const task = buildTask(draft)
        set((state) => ({ tasks: [task, ...state.tasks], lastAddedId: task.id }))
        return task.id
      },
      updateTask: (id, patch) => set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...patch, id: task.id } : task)),
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        lastAddedId: state.lastAddedId === id ? null : state.lastAddedId,
      })),
      setTaskTime: (id, time) => set((state) => ({
        tasks: state.tasks.map((task) => {
          if (task.id !== id) return task
          return {
            ...task,
            time,
            date: task.date ?? todayISO(),
          }
        }),
      })),
      assignToToday: (id) => set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? { ...task, date: todayISO() } : task)),
      })),
      assignDate: (id, date) => set((state) => ({
        tasks: state.tasks.map((task) => (
          task.id === id
            ? { ...task, date, time: date == null ? null : task.time }
            : task
        )),
      })),
      undoLastAdd: () => {
        const id = get().lastAddedId
        if (!id) return
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          lastAddedId: null,
        }))
      },
    }),
    { name: 'lifequest-task-state-v2' },
  ),
)
