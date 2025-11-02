import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type JSX, type PropsWithChildren } from 'react'
import { Object3D, Plane, Quaternion, Vector2, Vector3, type Vector3Tuple } from 'three'

type PointerControlsProps = JSX.IntrinsicElements['object3D'] &
  PropsWithChildren & {
    enabled?: boolean
    lockPositionYAt?: number
    positionOffset?: Vector3Tuple
    rotationYOffset?: number
    hideCursor?: boolean
    type?: 'billboard' | 'target' | 'fixed'
    target?: Vector3Tuple
    onMove?: (position: Vector3, quaternion: Quaternion) => void
  }

export default function PointerControls({
  children,
  enabled = true,
  lockPositionYAt = 0,
  positionOffset = [0, 0, 0],
  rotationYOffset = 0,
  hideCursor = false,
  type = 'fixed',
  target = [0, 0, 0],
  onMove,
  ...props
}: PointerControlsProps) {
  const { camera, gl, raycaster } = useThree()

  const ref = useRef<Object3D>(null!)

  const mouse = useMemo(() => new Vector2(), [])
  const plane = useMemo(() => new Plane(new Vector3(0, 1, 0), -lockPositionYAt), [lockPositionYAt])

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!enabled || !ref.current) return

      const rect = gl.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      const position = new Vector3()
      raycaster.setFromCamera(mouse, camera)
      raycaster.ray.intersectPlane(plane, position)
      ref.current.position.copy(position.add(new Vector3().fromArray(positionOffset)))

      if (type !== 'fixed') {
        const _target = type === 'billboard' ? camera.position : new Vector3().fromArray(target)
        const dir = new Vector3().subVectors(_target, position).setY(0).normalize()
        const angle = Math.atan2(dir.x, dir.z)
        const rotationY = angle + Math.PI * (type === 'billboard' ? 1.5 : 0.5)
        ref.current.rotation.y = rotationY + rotationYOffset
      }

      onMove?.(ref.current.position, ref.current.quaternion)
    }

    gl.domElement.addEventListener('pointermove', handleMove)
    if (hideCursor) gl.domElement.classList.add('cursor-none')

    return () => {
      gl.domElement.removeEventListener('pointermove', handleMove)
      gl.domElement.classList.remove('cursor-none')
    }
  }, [
    positionOffset,
    target,
    camera,
    enabled,
    gl,
    hideCursor,
    lockPositionYAt,
    mouse,
    onMove,
    plane,
    raycaster,
    rotationYOffset,
    type,
  ])

  return (
    <group {...props} ref={ref}>
      {children}
    </group>
  )
}
