import { create } from 'zustand'

export type OverlayId = 'settings' | 'profile' | 'achievements' | 'worlds' | 'friends' | null

type ClockTarget = { id: string; title: string } | null

type UiState = {
  overlay: OverlayId
  clockTask: ClockTarget
  setOverlay: (overlay: OverlayId) => void
  openClock: (task: { id: string; title: string }) => void
  closeClock: () => void
}

export const useUiStore = create<UiState>((set) => ({
  overlay: null,
  clockTask: null,
  setOverlay: (overlay) => set({ overlay }),
  openClock: (task) => set({ clockTask: task }),
  closeClock: () => set({ clockTask: null }),
}))
