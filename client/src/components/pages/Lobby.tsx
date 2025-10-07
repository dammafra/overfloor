import { Float } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { MathUtils } from 'three'
import { useLocation, useParams } from 'wouter'
import { useColyseus } from '../../hooks/use-colyseus'
import Environment from '../Environment'
import Canvas from '../helpers/Canvas'
import BlockCharacter from '../models/BlockCharacter'

export default function Lobby() {
  const { from, options } = useParams()
  const [, navigate] = useLocation()
  const { id, username } = JSON.parse(atob(options!))

  const { state, error } = useColyseus({
    roomId: id,
    roomName: 'game-room',
    method: from === 'new' ? 'create' : 'joinById',
    options: { id, username },
  })

  const [players, setPlayers] = useState<any[]>([])

  useEffect(() => {
    if (!state || !state.players) return
    setPlayers(Array.from(state.players.values()))
  }, [state])

  useEffect(() => {
    if (!error || !from) return
    toast.error(error.message)
    navigate(`/${from}`)
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
    <Canvas
      shadows
      camera={{
        fov: 45,
        near: 0.1,
        far: 100,
      }}
    >
      {players.map((player, i) => (
        <Float
          speed={Math.random()}
          floatIntensity={3}
          rotationIntensity={3}
          key={player.username}
          scale={0.5}
          position={spiralPosition(i)}
        >
          <BlockCharacter color={stringToHslColor(player.username)} />
        </Float>
      ))}

      <Environment />
    </Canvas>
  )
}
