import type { GameLobbySchema, GameSchema } from '@schema'
import clsx from 'clsx'
import { Client, Room } from 'colyseus.js'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'wouter'

interface FakePlayer {
  id: string
  username: string
  lobbyRoom?: Room<GameLobbySchema>
  gameRoom?: Room<GameSchema>
  movementInterval?: NodeJS.Timeout
  position: [number, number, number]
  rotation: [number, number, number, number]
  walking: boolean
  circleAngle?: number
  circleRadius?: number
  circleCenter?: [number, number]
  targetRadius?: number
}

export function LoadTest() {
  const [, navigate] = useLocation()
  const [fakePlayers, setFakePlayers] = useState<FakePlayer[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [playerCount, setPlayerCount] = useState(5)
  const [roomId, setRoomId] = useState('test')
  const [movementRate, setMovementRate] = useState(1.0)
  const [maxRadius, setMaxRadius] = useState(5.0)
  const clientRef = useRef<Client | null>(null)

  // Initialize Colyseus client
  useEffect(() => {
    clientRef.current = new Client(import.meta.env.VITE_COLYSEUS_URL)
    return () => {
      // Client cleanup is handled by individual room disconnections
    }
  }, [])

  // Start fake players movement
  const startPlayerMovement = (player: FakePlayer) => {
    if (player.movementInterval) return

    // Initialize player's circular movement properties
    if (!player.circleAngle) player.circleAngle = Math.random() * Math.PI * 2
    if (!player.circleRadius) player.circleRadius = 1 + Math.random() * (maxRadius - 1)
    if (!player.circleCenter) player.circleCenter = [0, 0]

    const interval = setInterval(
      () => {
        if (!player.gameRoom) return

        // Update angle for circular motion
        player.circleAngle! += movementRate * 0.1

        // Dynamically adjust radius based on current maxRadius setting
        // This allows radius changes during testing to take effect
        if (!player.targetRadius) {
          player.targetRadius = player.circleRadius!
        }

        // Update target radius when maxRadius changes
        if (player.targetRadius! > maxRadius) {
          // Shrink target radius if it exceeds new maximum
          player.targetRadius = maxRadius
        } else if (player.targetRadius! < 1) {
          // Ensure minimum target radius of 1
          player.targetRadius = 1
        } else if (maxRadius > player.targetRadius!) {
          // Allow expansion when maxRadius increases
          // Randomly decide if this player should expand (50% chance)
          if (Math.random() > 0.5) {
            player.targetRadius = 1 + Math.random() * (maxRadius - 1)
          }
        }

        // Smoothly transition to target radius
        const radiusDiff = player.targetRadius! - player.circleRadius!
        if (Math.abs(radiusDiff) > 0.01) {
          player.circleRadius! += radiusDiff * 0.1 // Smooth transition
        } else {
          player.circleRadius = player.targetRadius!
        }

        // Calculate position on circle
        const newX = player.circleCenter![0] + Math.cos(player.circleAngle!) * player.circleRadius!
        const newZ = player.circleCenter![1] + Math.sin(player.circleAngle!) * player.circleRadius!

        const newPosition: [number, number, number] = [
          newX,
          0.7225, // Correct player height
          newZ,
        ]

        // Calculate rotation based on movement direction
        // Calculate the movement vector (tangent to the circle)
        const movementX = -Math.sin(player.circleAngle!) // Tangent direction X
        const movementZ = Math.cos(player.circleAngle!) // Tangent direction Z

        // Use the same angle calculation as LocalPlayer: Math.atan2(target.x, target.z)
        const angle = Math.atan2(movementX, movementZ)

        // Convert angle to quaternion (x, y, z, w format)
        const newRotation: [number, number, number, number] = [
          0, // x
          Math.sin(angle / 2), // y
          0, // z
          Math.cos(angle / 2), // w
        ]

        player.position = newPosition
        player.rotation = newRotation
        player.walking = true // Always walking in circles

        // Send movement data to game room
        player.gameRoom.send('set-walking', player.walking)
        player.gameRoom.send('set-position', player.position)
        player.gameRoom.send('set-rotation', player.rotation)
      },
      Math.max(100, 300 - movementRate * 100),
    ) // More dramatic interval change

    player.movementInterval = interval
  }

  // Stop fake players movement
  const stopPlayerMovement = (player: FakePlayer) => {
    if (player.movementInterval) {
      clearInterval(player.movementInterval)
      player.movementInterval = undefined
    }
  }

  // Connect fake player to lobby or game room
  const connectPlayer = async (player: FakePlayer) => {
    if (!clientRef.current) return

    try {
      // Check if roomId ends with '-game' to determine if it's a game room
      const isGameRoom = roomId.endsWith('-game')

      if (isGameRoom) {
        // Connect directly to game room
        const gameRoom = await clientRef.current.joinById<GameSchema>(roomId, {
          username: player.username,
        })

        player.gameRoom = gameRoom

        // Start movement simulation immediately
        startPlayerMovement(player)

        console.log(`[LoadTest] Player ${player.username} connected directly to game room`)
      } else {
        // Connect to lobby
        const lobbyRoom = await clientRef.current.joinById<GameLobbySchema>(roomId, {
          username: player.username,
        })

        player.lobbyRoom = lobbyRoom

        // Listen for start message
        lobbyRoom.onMessage('start', async reservation => {
          console.log(`[LoadTest] Player ${player.username} received start message`)

          // Leave lobby and join game room
          await lobbyRoom.leave()

          const gameRoom = await clientRef.current!.consumeSeatReservation<GameSchema>(reservation)
          player.gameRoom = gameRoom

          // Start movement simulation
          startPlayerMovement(player)

          console.log(`[LoadTest] Player ${player.username} joined game room`)
        })

        console.log(`[LoadTest] Player ${player.username} connected to lobby`)
      }
    } catch (error) {
      console.error(`[LoadTest] Failed to connect player ${player.username}:`, error)
    }
  }

  // Disconnect fake player
  const disconnectPlayer = async (player: FakePlayer) => {
    stopPlayerMovement(player)

    if (player.gameRoom) {
      await player.gameRoom.leave()
    }
    if (player.lobbyRoom) {
      await player.lobbyRoom.leave()
    }
  }

  // Start load test
  const startLoadTest = async () => {
    if (isRunning || !clientRef.current) return

    setIsRunning(true)
    const newPlayers: FakePlayer[] = []

    for (let i = 0; i < playerCount; i++) {
      const player: FakePlayer = {
        id: `fake-player-${i}`,
        username: `Bot${i + 1}`,
        position: [0, 0.7225, 0], // Start at correct player height
        rotation: [0, 0, 0, 1],
        walking: false,
      }

      newPlayers.push(player)
      await connectPlayer(player)

      // Small delay between connections to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setFakePlayers(newPlayers)
  }

  // Stop load test
  const stopLoadTest = async () => {
    if (!isRunning) return

    setIsRunning(false)

    // Disconnect all players
    await Promise.all(fakePlayers.map(disconnectPlayer))
    setFakePlayers([])
  }

  // Restart movement when rate or radius changes
  useEffect(() => {
    if (!isRunning) return

    fakePlayers.forEach(player => {
      if (player.gameRoom) {
        stopPlayerMovement(player)
        startPlayerMovement(player)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movementRate, maxRadius])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      fakePlayers.forEach(disconnectPlayer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="page bg-black/90 text-white p-5 font-mono">
      <div className="w-full mx-20 max-w-4xl">
        <h3 className="text-lg font-bold mb-3">Load Test</h3>

        {/* Configuration Inputs */}
        <div className="mb-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Room ID</label>
            <input
              type="text"
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm disabled:opacity-50"
              placeholder="Enter room ID (add '-game' for direct game connection)"
            />
            <div className="text-xs text-gray-400 mt-1">
              {roomId.endsWith('-game') ? 'Direct Game Connection' : 'Lobby Connection'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Player Count</label>
            <input
              type="number"
              value={playerCount}
              onChange={e =>
                setPlayerCount(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))
              }
              disabled={isRunning}
              min="1"
              max="200"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Movement Rate</label>
            <input
              type="range"
              value={movementRate}
              onChange={e => setMovementRate(parseFloat(e.target.value))}
              min="0.1"
              max="3.0"
              step="0.1"
              className="w-full"
            />
            <div className="text-xs text-gray-400 mt-1">
              Rate: {movementRate.toFixed(1)} | Speed: {(movementRate * 0.1).toFixed(2)} | Interval:{' '}
              {Math.max(100, 300 - movementRate * 100)}ms
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Max Radius</label>
            <input
              type="range"
              value={maxRadius}
              onChange={e => setMaxRadius(parseFloat(e.target.value))}
              min="1.0"
              max="10.0"
              step="0.5"
              className="w-full"
            />
            <div className="text-xs text-gray-400 mt-1">
              Max Radius: {maxRadius.toFixed(1)} units (min: 1.0)
            </div>
          </div>
        </div>

        <div className="mb-3">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-white border-none rounded cursor-pointer mr-2 font-medium transition-colors bg-slate-500 hover:bg-slate-600"
          >
            Back
          </button>
          <button
            onClick={isRunning ? stopLoadTest : startLoadTest}
            className={clsx(
              'px-4 py-2 text-white border-none rounded cursor-pointer mr-2 font-medium transition-colors',
              isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600',
            )}
          >
            {isRunning ? 'Stop Test' : 'Start Test'}
          </button>
        </div>

        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>Players:</span>
            <span className="font-semibold">{fakePlayers.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Room ID:</span>
            <span className="font-semibold">{roomId}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={clsx('font-semibold', isRunning ? 'text-green-400' : 'text-gray-400')}>
              {isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>

          {fakePlayers.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-600">
              <div className="font-semibold mb-2">Connected Players:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {fakePlayers.map(player => (
                  <div key={player.id} className="ml-2 text-xs flex justify-between">
                    <span className="font-medium">{player.username}:</span>
                    <span
                      className={clsx(
                        'px-2 py-0.5 rounded text-xs',
                        player.gameRoom
                          ? 'bg-green-500/20 text-green-400'
                          : player.lobbyRoom
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400',
                      )}
                    >
                      {player.gameRoom ? 'In Game' : player.lobbyRoom ? 'In Lobby' : 'Disconnected'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
