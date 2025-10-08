import { BlockCharacter } from '@components/models'
import { useColyseus } from '@hooks'
import { Float } from '@react-three/drei'
import { GameState, Player } from '@server/schema'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { MathUtils } from 'three'
import { useLocation, useParams } from 'wouter'

export function Lobby() {
  const { from, options } = useParams()
  const [, navigate] = useLocation()
  const { id, username } = JSON.parse(atob(options!))

  const { state, error } = useColyseus<GameState>({
    roomId: id,
    roomName: 'game-room',
    method: from === 'new' ? 'create' : 'joinById',
    options: { id, username },
  })

  const [players, setPlayers] = useState<Player[]>([])

  useEffect(() => {
    if (!state || !state.players) return
    setPlayers(Array.from(state.players.values()))
  }, [state])

  useEffect(() => {
    if (!error || !from) return
    toast.error(error.message)
    navigate(`/${from}`, { replace: true })
  }, [error, from, navigate])

  function spiralPosition(index: number): [number, number, number] {
    const angle = index + MathUtils.degToRad(90) // adjust spacing
    const r = 1 - index * 0.01 // radius shrinks inward
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    const z = index * -1 // step inward
    return [x, y, z]
  }

  function stringToHslColor(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }

    const h = hash % 360
    return `hsl(${h}, ${70}%, ${50}%)`
  }

  return (
    <>
      {players.map((player, i) => (
        <Float
          floatIntensity={2}
          rotationIntensity={2}
          key={player.username}
          scale={0.5}
          position={spiralPosition(i)}
        >
          <BlockCharacter color={stringToHslColor(player.username)} />
        </Float>
      ))}
    </>
  )
}
