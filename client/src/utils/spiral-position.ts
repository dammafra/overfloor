import { MathUtils, type Vector3Tuple } from 'three'

// TODO*: move to server or find a better way to implement `CameraRig`
export function spiralPositionLobby(index: number): Vector3Tuple {
  const r = 1.5
  const angle = MathUtils.degToRad(index * 30) // adjust spacing
  const x = r * Math.sin(angle)
  const y = r * Math.cos(angle)
  const z = index * 0.5 // step outward
  return [x, y, z]
}

// TODO**: improve, duplicate
export function spiralPositionGame(index: number): Vector3Tuple {
  const r = 1.5
  const angle = MathUtils.degToRad(index * 60) // spacing
  const x = r * Math.cos(angle)
  const z = r * Math.sin(angle)
  const y = 4 // constant height
  return [x, y, z]
}
