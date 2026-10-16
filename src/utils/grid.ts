import { GRID_STEP, gridConfig, type GridDimension } from '@schema'
import type { Vector3Tuple } from 'three'

// world size of the grid along x and z
export function getGridSize(dimension?: GridDimension) {
  if (!dimension) return { x: 0, z: 0 }
  const { width, height } = gridConfig[dimension]
  return { x: width * GRID_STEP, z: height * GRID_STEP }
}

export function getGridCoordinates(width: number, height: number): [number, number][] {
  const offsetX = (width - 1) * GRID_STEP * 0.5
  const offsetZ = (height - 1) * GRID_STEP * 0.5

  const coordinates: [number, number][] = []
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      coordinates.push([i * GRID_STEP - offsetX, j * GRID_STEP - offsetZ])
    }
  }

  return coordinates
}

// players spread over balanced rows, each row and the whole block centered on the grid
export function getPlayersInitialPositions(count: number, dimension: GridDimension): Vector3Tuple[] {
  const spacingX = 2
  const spacingZ = 2.5
  const y = 10

  const rows = Math.ceil(count / gridConfig[dimension].playersPerRow)
  const positions: Vector3Tuple[] = []
  for (let row = 0; row < rows; row++) {
    // the first rows take the remainder, one more player each
    const rowSize = Math.floor(count / rows) + (row < count % rows ? 1 : 0)
    const z = (row - (rows - 1) / 2) * spacingZ
    for (let i = 0; i < rowSize; i++) {
      positions.push([(i - (rowSize - 1) / 2) * spacingX, y, z])
    }
  }

  return positions
}
