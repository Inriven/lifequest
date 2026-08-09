import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TaskGroupId = 'main' | 'daily' | 'world' | 'side'
export type Task = {
  id: string
  title: string
  group: TaskGroupId
  time?: string
  minutes: number
  xp: number
  done: boolean
}

type TaskState = {
  collapsed: Record<TaskGroupId, boolean>
  tasks: Task[]
  toggleGroup: (group: TaskGroupId) => void
  toggleTask: (id: string) => void
  setTaskTime: (id: string, time: string) => void
  completeTask: (id: string) => void
}

const seed: Task[] = [
  { id: 'q1', title: 'Собрать первый экран LifeQuest V1', group: 'main', time: '10:00', minutes: 45, xp: 90, done: false },
  { id: 'q2', title: 'Проверить мобильную навигацию', group: 'daily', time: '12:00', minutes: 20, xp: 25, done: false },
  { id: 'q3', title: 'Разобрать фоновые ассеты', group: 'world', time: '14:30', minutes: 30, xp: 35, done: false },
  { id: 'q4', title: 'Собрать идеи для мира Skyhold', group: 'side', minutes: 25, xp: 20, done: false },
]

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      collapsed: { main: false, daily: false, world: true, side: true },
      tasks: seed,
      toggleGroup: (group) => set((state) => ({
        collapsed: { ...state.collapsed, [group]: !state.collapsed[group] },
      })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
      })),
      setTaskTime: (id, time) => set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? { ...task, time } : task)),
      })),
      completeTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? { ...task, done: true } : task)),
      })),
    }),
    { name: 'lifequest-task-state-v1' },
  ),
)
