import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type TimerStatus = 'idle' | 'running' | 'paused'

type TimerState = {
  taskId: string | null
  taskTitle: string
  durationMs: number
  startedAt: number | null
  pausedAt: number | null
  accumulatedPauseMs: number
  status: TimerStatus
  start: (taskId: string, taskTitle: string, durationMs: number) => void
  pause: () => void
  resume: () => void
  stop: () => void
  remainingMs: (now?: number) => number
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      taskId: null,
      taskTitle: '',
      durationMs: 0,
      startedAt: null,
      pausedAt: null,
      accumulatedPauseMs: 0,
      status: 'idle',
      start: (taskId, taskTitle, durationMs) => set({
        taskId,
        taskTitle,
        durationMs,
        startedAt: Date.now(),
        pausedAt: null,
        accumulatedPauseMs: 0,
        status: 'running',
      }),
      pause: () => {
        if (get().status !== 'running') return
        set({ status: 'paused', pausedAt: Date.now() })
      },
      resume: () => {
        const state = get()
        if (state.status !== 'paused' || state.pausedAt == null) return
        set({
          status: 'running',
          accumulatedPauseMs: state.accumulatedPauseMs + (Date.now() - state.pausedAt),
          pausedAt: null,
        })
      },
      stop: () => set({
        taskId: null,
        taskTitle: '',
        durationMs: 0,
        startedAt: null,
        pausedAt: null,
        accumulatedPauseMs: 0,
        status: 'idle',
      }),
      remainingMs: (now = Date.now()) => {
        const state = get()
        if (!state.startedAt || state.status === 'idle') return 0
        const effectiveNow = state.status === 'paused' && state.pausedAt ? state.pausedAt : now
        const elapsed = effectiveNow - state.startedAt - state.accumulatedPauseMs
        return Math.max(0, state.durationMs - elapsed)
      },
    }),
    { name: 'lifequest-active-timer-v1' },
  ),
)
