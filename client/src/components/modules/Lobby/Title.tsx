import { Html } from '@react-three/drei'
import { useParams } from 'wouter'

export function Title() {
  const { options } = useParams()
  const { id, training } = JSON.parse(atob(options!))

  return (
    <Html center wrapperClass="fixed inset-0 pointer-events-none" className="h-[100dvh] w-screen">
      <h1 className="text-center text-white font-extrabold text-stroke-black text-4xl md:text-6xl pt-4">
        {training ? 'TRAINING' : id}
      </h1>
    </Html>
  )
}
