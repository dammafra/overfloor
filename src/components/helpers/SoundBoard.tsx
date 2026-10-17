import { GameLoopPhase } from '@schema'
import { useRoomState, useSoundBoard, type ReturnedValue } from '@stores'
import { Howler } from 'howler'
import { useEffect, useRef, useState } from 'react'
import useSound from 'use-sound'

const parse = ([play, data]: ReturnedValue) => ({ play, ...data })

export function SoundBoard() {
  const countdown = useRoomState(s => s.countdown)
  const loopPhase = useRoomState(s => s.phase)

  const setContext = useSoundBoard(state => state.setContext)
  const setSounds = useSoundBoard(state => state.setSounds)
  const muted = useSoundBoard(state => state.muted)

  const [loaded, setLoaded] = useState(0)
  const onload = () => setLoaded(loaded => loaded + 1)

  const sounds = {
    gameCountdown: parse(useSound('/sounds/game-countdown.mp3', { onload })),
    gameStart: parse(useSound('/sounds/game-start.mp3', { onload })),
    step: parse(useSound('/sounds/step.wav', { volume: 0.25, onload })),
    warning: parse(useSound('/sounds/warning.mp3', { volume: 0.5, onload })),
    warning2: parse(useSound('/sounds/warning-2.mp3', { volume: 0.5, onload })),
    drop: parse(useSound('/sounds/drop.mp3', { volume: 0.5, onload })),
    fall: parse(useSound('/sounds/fall.mp3', { volume: 0.5, onload })),
  }

  const toLoad = Object.keys(sounds).length

  useEffect(() => {
    if (loaded < toLoad) return

    setContext(Howler.ctx)
    setSounds(sounds)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, toLoad])

  // match countdown: 3, 2, 1, then GO! at 0
  useEffect(() => {
    if (countdown === null || countdown < 0) return
    if (countdown > 0) sounds.gameCountdown.play()
    else sounds.gameStart.play()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown])

  // targeted tiles turning green and red: warning, yellow: warning 2, then dropping. On the changes only, not when joining
  const loopPhaseRef = useRef(loopPhase)
  useEffect(() => {
    if (loopPhase === loopPhaseRef.current) return
    loopPhaseRef.current = loopPhase

    if (loopPhase === GameLoopPhase.COUNTDOWN_3 || loopPhase === GameLoopPhase.COUNTDOWN_1) {
      sounds.warning.play()
    } else if (loopPhase === GameLoopPhase.COUNTDOWN_2) sounds.warning2.play()
    else if (loopPhase === GameLoopPhase.FALLING) sounds.drop.play()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loopPhase])

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
