import type { CameraControls } from '@react-three/drei'

// seconds for the camera to reach its target (`CameraControls.smoothTime`)
const SMOOTH_TIME = 0.25 // camera-controls default
const SLOW_SMOOTH_TIME = 0.8

// set by every camera rig before moving the camera: the controls are shared by all the pages
export function setCameraSmoothTime(controls: CameraControls, slow = false) {
  controls.smoothTime = slow ? SLOW_SMOOTH_TIME : SMOOTH_TIME
}
