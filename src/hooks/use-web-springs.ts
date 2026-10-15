import { useSpring, type SpringConfig } from '@react-spring/web'
import { POP_CONFIG } from '@utils'

interface PopInOptions {
  config?: SpringConfig
  onRest?: () => void
}

// scale and fade in an overlay element
export function usePopIn({ config = POP_CONFIG, onRest }: PopInOptions = {}) {
  return useSpring({
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config,
    onRest,
  })
}

// fade in a page
export function useFadeIn(delay = 0) {
  return useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay,
  })
}
