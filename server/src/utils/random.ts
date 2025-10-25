export function oneOf<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)]
}

export function maybe() {
  return Math.random() < 0.5
}
