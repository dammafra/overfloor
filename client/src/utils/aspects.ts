// TODO improve, I don't like having this file
export const aspects = {
  ui: {
    camera: {
      distance: (aspect: number) => Math.max(5.5, (aspect > 1 ? 10 : 12) - Math.pow(aspect, 2)),
    },
    tile: {
      button: {
        position: (aspect: number) => [0, Math.max(aspect > 2 ? 4.7 : 3.5, aspects.ui.camera.distance(aspect) - 2), 0], //prettier-ignore
        indices: (size: number, aspect: number) => {
          const center = Math.floor((size * size) / 2)

          const index0 = aspect > 1 ? center + 2 * size - 2 : center - 2 - 2 * size
          const index1 = aspect > 1 ? index0 + 1 : index0 + 1
          const index2 = aspect > 1 ? index0 - size : index0 + size
          const index3 = index2 - 1

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
