import { create } from 'zustand'

export type Direction = {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

export const IDLE_DIRECTION: Direction = { up: false, down: false, left: false, right: false }

type ControllerStore = Direction & {
  strength: number

  setDirection: (direction: Direction) => void
  setStrength: (strength: number) => void
}

export const useController = create<ControllerStore>()(set => ({
  ...IDLE_DIRECTION,

  strength: 30,

  setDirection: direction => set(direction),
  setStrength: strength => set({ strength: Math.min(30, strength) }),
}))
