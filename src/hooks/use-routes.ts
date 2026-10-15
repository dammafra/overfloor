import { decodeLobbyOptions, ROUTES } from '@utils'
import { useParams, useRoute } from 'wouter'

// whether a menu modal page (create, join, credits) is open
export function useModalRoute() {
  const [create] = useRoute(ROUTES.create)
  const [join] = useRoute(ROUTES.join)
  const [credits] = useRoute(ROUTES.credits)
  return create || join || credits
}

// options of the current lobby route, undefined if missing or malformed
export function useLobbyOptions() {
  const { options } = useParams<{ options?: string }>()
  return decodeLobbyOptions(options)
}
