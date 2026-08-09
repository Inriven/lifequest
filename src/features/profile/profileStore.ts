import { create } from 'zustand'

type ProfileState = { profileOpen: boolean; setProfileOpen: (value: boolean) => void }
export const useProfileStore = create<ProfileState>((set) => ({ profileOpen: false, setProfileOpen: (profileOpen) => set({ profileOpen }) }))
