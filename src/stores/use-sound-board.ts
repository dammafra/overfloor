import { create } from 'zustand'

interface PlayOptions {
  id?: string
  forceSoundEnabled?: boolean
  playbackRate?: number
}

declare type PlayFunction = (options?: PlayOptions) => void

interface ExposedData {
  sound: Howl | null
  stop: (id?: string) => void
  pause: (id?: string) => void
  duration: number | null
}

export declare type ReturnedValue = [PlayFunction, ExposedData]

declare type Sound = ExposedData & {
  play: PlayFunction
}

declare type SoundMap = { [key: string]: Sound }

// for every play of a sound: `pan` from left (-1) to right (1), `volume` and `rate` scale its own
interface SoundOptions {
  pan?: number
  volume?: number
  rate?: number
}

type SoundBoardStore = {
  context?: AudioContext
  setContext: (context: AudioContext) => void

  sounds?: SoundMap
  setSounds: (sounds: SoundMap) => void
  play: (name: string, options?: SoundOptions) => void

  muted: boolean
  toggleMuted: () => void
}

export const useSoundBoard = create<SoundBoardStore>()((set, get) => ({
  setContext: context => set(() => ({ context })),
  setSounds: sounds => set(() => ({ sounds })),
  play: (name, { pan, volume, rate } = {}) => {
    const sound = get().sounds?.[name]?.sound
    if (!sound) return

    const id = sound.play()
    if (volume !== undefined) sound.volume(sound.volume() * volume, id)
    if (rate !== undefined) sound.rate(rate, id)
    if (pan !== undefined) sound.stereo(Math.max(-1, Math.min(1, pan)), id)
  },

  muted: JSON.parse(localStorage.getItem('overfloor-muted') || 'false'),
  toggleMuted: () => {
    set(state => {
      const muted = !state.muted
      localStorage.setItem('overfloor-muted', JSON.stringify(muted))

      if (muted) state.context?.suspend()
      else state.context?.resume()

      return { muted }
    })
  },
}))
