export const random = (min: number, max: number, precision = 3) => {
  const factor = Math.pow(10, precision)
  return Math.round((Math.random() * (max - min) + min) * factor) / factor
}

export const randomInt = (min: number, max: number) => random(min, max, 0)

export const randomColor = (saturation = random(10, 90), lightness = random(20, 80)) =>
  `hsl(${Math.random() * 360}, ${saturation}%, ${lightness}%)`

export const randomAngle = () => random(0, Math.PI * 2)

export const randomOneOf = <T>(array: T[]) => array[Math.floor(Math.random() * array.length)]
