import { decodeLobbyOptions, ROUTES } from '@utils'
import { useParams, useRoute } from 'wouter'

// whether a menu modal page (room, credits, how to play) is open
export function useModalRoute() {
  const [room] = useRoute(ROUTES.room)
  const [credits] = useRoute(ROUTES.credits)
  const [howToPlay] = useRoute(ROUTES.howToPlay)
  return room || credits || howToPlay
}

// options of the current lobby route, undefined if missing or malformed
export function useLobbyOptions() {
  const { options } = useParams<{ options?: string }>()
  return decodeLobbyOptions(options)
}
