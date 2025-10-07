import { create } from 'zustand'

type ControllerStore = {
  up: boolean
  down: boolean
  left: boolean
  right: boolean

  setUp: (up: boolean) => void
  setDown: (down: boolean) => void
  setLeft: (left: boolean) => void
  setRight: (right: boolean) => void
}

export const useController = create<ControllerStore>()(set => ({
  up: false,
  down: false,
  left: false,
  right: false,

  setUp: (up: boolean) => set(() => ({ up })),
  setDown: (down: boolean) => set(() => ({ down })),
  setLeft: (left: boolean) => set(() => ({ left })),
  setRight: (right: boolean) => set(() => ({ right })),
}))
