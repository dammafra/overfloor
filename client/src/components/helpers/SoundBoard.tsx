import { Howler } from 'howler'
import { useEffect, useState } from 'react'
import useGame from '../../stores/use-game'
import useSoundBoard from '../../stores/use-sound-board'

// const parse = ([play, data]: ReturnedValue) => ({ play, ...data })

export default function SoundBoard() {
  const phase = useGame(state => state.phase)

  const setContext = useSoundBoard(state => state.setContext)
  const setSounds = useSoundBoard(state => state.setSounds)
  const muted = useSoundBoard(state => state.muted)

  const [loaded /* setLoaded */] = useState(0)
  // const onload = () => setLoaded(loaded => loaded + 1)

  const sounds = {}

  const toLoad = Object.keys(sounds).length

  useEffect(() => {
    if (loaded < toLoad) return

    setContext(Howler.ctx)
    setSounds(sounds)

    // switch (phase) {
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, toLoad, phase])

  useEffect(() => {
    Howler.volume(muted ? 0 : 1)
  }, [muted])

  /**
   * This helps resume AudioContext when the tab is suspended (e.g., when switching apps or locking the phone) and later resumed,
   * especially on mobile where browsers often suspend audio contexts to save resources;
   * by listening to user interactions (touchstart, touchend, mousedown, keydown), it ensures audio resumes reliably after the tab becomes active again.
   */
  // useEffect(() => {
  //   if (!context) return

  //   const events = ['touchstart', 'touchend', 'mousedown', 'keydown', 'visibilitychange']
  //   const resume = () => context.resume()
  //   const suspend = () => document.hidden && context.suspend()

  //   events.forEach(e => document.body.addEventListener(e, resume, false))
  //   document.addEventListener('visibilitychange', suspend)

  //   return () => {
  //     events.forEach(e => document.body.removeEventListener(e, resume, false))
  //     document.removeEventListener('visibilitychange', suspend)
  //   }
  // }, [context])

  return <></>
}
