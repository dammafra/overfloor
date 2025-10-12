import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema'

function spiralPosition(index: number) {
  const r = 1.5
  const angle = (index * 30 * Math.PI) / 180 // spacing
  const x = r * Math.cos(angle)
  const z = r * Math.sin(angle)
  const y = 3 // constant height
  return [x, y, z]
}

export class PlayerState extends Schema {
  @type('string') username: string
  @type('string') sessionId: string

  @type({ array: 'float64' }) initialPosition = new ArraySchema<number>(0, 0, 0)
  @type({ array: 'float64' }) position = new ArraySchema<number>(0, 0, 0)
  @type({ array: 'float64' }) rotation = new ArraySchema<number>(0, 0, 0, 0)

  @type({ array: 'float64' }) impulse = new ArraySchema<number>(0, 0, 0)

  constructor(username: string, sessionId: string, index: number) {
    super()

    this.username = username
    this.sessionId = sessionId

    const [x, y, z] = spiralPosition(index)

    this.initialPosition[0] = x
    this.initialPosition[1] = y
    this.initialPosition[2] = z
  }
}

export class GameState extends Schema {
  @type('string') id: string
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>()
}
