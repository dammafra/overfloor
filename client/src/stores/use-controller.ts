import { create } from 'zustand'

type ControllerStore = {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  strength: number

  setUp: (up: boolean) => void
  setDown: (down: boolean) => void
  setLeft: (left: boolean) => void
  setRight: (right: boolean) => void
  setStrength: (strength: number) => void
}

export const useController = create<ControllerStore>()(set => ({
  up: false,
  down: false,
  left: false,
  right: false,

  strength: 30,

  setUp: up => set(() => ({ up })),
  setDown: down => set(() => ({ down })),
  setLeft: left => set(() => ({ left })),
  setRight: right => set(() => ({ right })),
  setStrength: strength => set(() => ({ strength: Math.min(30, strength) })),
}))
