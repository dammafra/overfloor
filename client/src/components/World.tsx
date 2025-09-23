import { button, useControls } from 'leva'
import { useState } from 'react'
import { randomColor } from '../utils/random'
import Floor from './Floor'
import Player from './Player'
import Walls from './Walls'
import Controller from './controller'

export default function World() {
  const [, setPlayerKey] = useState(Math.random())

  useControls('game', {
    reset: button(() => setPlayerKey(Math.random())),
  })

  return (
    <>
      <Controller>
        <Player name="dammafra" color={randomColor()} />
      </Controller>

      <Floor />
      <Walls />
    </>
  )
}
