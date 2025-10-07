import { create } from 'zustand'

type GridStore = {
  unit: number
  width: number
  height: number
  gap: number
}

const useGrid = create<GridStore>()(() => ({
  unit: 2,
  width: 9,
  height: 7,
  gap: 0.1,
}))

export default useGrid
