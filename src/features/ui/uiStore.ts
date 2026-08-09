import { create } from 'zustand'

export type OverlayId = 'settings' | 'profile' | 'achievements' | 'worlds' | 'friends' | null
export type TasksTab = 'today' | 'timeline' | 'inbox' | 'all'

type ClockTarget = { id: string; title: string } | null

type UiState = {
  overlay: OverlayId
  clockTask: ClockTarget
  tasksTab: TasksTab
  selectedTaskId: string | null
  quickAddFocusToken: number
  setOverlay: (overlay: OverlayId) => void
  openClock: (task: { id: string; title: string }) => void
  closeClock: () => void
  setTasksTab: (tab: TasksTab) => void
  openTaskDetails: (id: string) => void
  closeTaskDetails: () => void
  requestQuickAddFocus: () => void
}

export const useUiStore = create<UiState>((set) => ({
  overlay: null,
  clockTask: null,
  tasksTab: 'today',
  selectedTaskId: null,
  quickAddFocusToken: 0,
  setOverlay: (overlay) => set({ overlay }),
  openClock: (task) => set({ clockTask: task }),
  closeClock: () => set({ clockTask: null }),
  setTasksTab: (tasksTab) => set({ tasksTab }),
  openTaskDetails: (selectedTaskId) => set({ selectedTaskId }),
  closeTaskDetails: () => set({ selectedTaskId: null }),
  requestQuickAddFocus: () => set((state) => ({
    quickAddFocusToken: state.quickAddFocusToken + 1,
    tasksTab: 'today',
  })),
}))
