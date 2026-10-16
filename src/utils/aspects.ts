import { MathUtils } from 'three'
import { CAMERA_FOV } from './constants'

// TODO improve, I don't like having this file
export const aspects = {
  ui: {
    camera: {
      distance: (aspect: number) => Math.max(5.5, (aspect > 1 ? 10 : 12) - Math.pow(aspect, 2)),
    },
    tile: {
      button: {
        // open modal tile, in front of the camera
        position: (aspect: number, height: number) => {
          const distance = aspects.ui.camera.distance(aspect)
          const y = Math.max(aspect > 2 ? 4.7 : 3.5, distance - 1.5)
          if (aspect <= 1) return [0, y, 0]

          // short landscape screens: closer to the camera to still frame the page
          const visibleHeight = (0.55 / 410) * height // ~410px of page half-extents
          const viewGap = visibleHeight / (2 * Math.tan(MathUtils.degToRad(CAMERA_FOV / 2)))
          const gap = Math.max(0.8, viewGap + 0.125) // 0.125: tile half-thickness
          return [0, Math.max(y, distance - gap), 0]
        },
        indices: (size: number, aspect: number) => {
          const center = Math.floor((size * size) / 2)

          const index0 = aspect > 1 ? center + 2 * size - 2 : center - 2 - 2 * size
          const index1 = aspect > 1 ? index0 - size : index0 + size
          // top left of the start button, as seen by the menu camera
          const index2 = index0 + 1
          // bottom right of `index1`
          const index3 = index1 - 1

          return [index0, index1, index2, index3]
        },
      },
      letter: {
        indices: (size: number, aspect: number) => {
          const center = Math.floor((size * size) / 2)

          const index0 = aspect > 1 ? center - size * 2 + 2 : center + 2
          const index1 = index0 + size
          const index2 = index1 + size
          const index3 = index0 - 1
          const index4 = index3 + size
          const index5 = index4 + size
          const index6 = index3 - 1
          const index7 = index6 + size
          const index8 = index7 + size

          return [index0, index1, index2, index3, index4, index5, index6, index7, index8]
        },
      },
    },
  },
  lobby: {
    camera: {
      distance: (aspect: number) => (aspect > 1 ? 7 : 10),
    },
  },
}
