import { decodeLobbyOptions, ROUTES } from '@utils'
import { useParams, useRoute } from 'wouter'

// whether a menu modal page (join, credits, profile) is open
export function useModalRoute() {
  const [join] = useRoute(ROUTES.join)
  const [credits] = useRoute(ROUTES.credits)
  const [profile] = useRoute(ROUTES.profile)
  return join || credits || profile
}

// options of the current lobby route, undefined if missing or malformed
export function useLobbyOptions() {
  const { options } = useParams()
  return decodeLobbyOptions(options)
}
