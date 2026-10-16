import { decodeLobbyOptions, ROUTES } from '@utils'
import { useParams, useRoute } from 'wouter'

// whether a menu modal page (room, credits, how to play, profile) is open
export function useModalRoute() {
  const [room] = useRoute(ROUTES.room)
  const [credits] = useRoute(ROUTES.credits)
  const [howToPlay] = useRoute(ROUTES.howToPlay)
  const [profile] = useRoute(ROUTES.profile)
  return room || credits || howToPlay || profile
}

// options of the current lobby route, undefined if missing or malformed
export function useLobbyOptions() {
  const { options } = useParams<{ options?: string }>()
  return decodeLobbyOptions(options)
}
