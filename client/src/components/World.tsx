import { Controller, Floor, Player, Walls } from '@components'
import { randomColor } from '@utils'
import { button, useControls } from 'leva'
import { useState } from 'react'

export function World() {
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
