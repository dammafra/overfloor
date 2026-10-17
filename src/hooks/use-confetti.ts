// see https://confettijs.org/
import { useEffect, useRef } from 'react'

type Vector = { x: number; y: number }

interface ConfettiOptions {
  gravity?: number
  particleCount?: number
  particleSize?: number
  explosionPower?: number
  fade?: boolean
}

type ConfettiConfig = Required<ConfettiOptions>

const DEFAULT_CONFIG: ConfettiConfig = {
  gravity: 10,
  particleCount: 75,
  particleSize: 1,
  explosionPower: 25,
  fade: false,
}

class Particle {
  config: ConfettiConfig
  position: Vector
  velocity: Vector
  size: Vector
  rotation: number
  rotationSpeed: number
  hue: number
  opacity: number
  lifetime: number

  constructor(center: Vector, config: ConfettiConfig) {
    this.config = config
    this.size = {
      x: (16 * Math.random() + 4) * config.particleSize,
      y: (4 * Math.random() + 4) * config.particleSize,
    }
    this.position = { x: center.x - this.size.x / 2, y: center.y - this.size.y / 2 }
    this.velocity = Particle.generateVelocity(config.explosionPower)
    this.rotation = Math.random() * 360
    this.rotationSpeed = (Math.random() - 0.5) * 10
    this.hue = Math.random() * 360
    this.opacity = 100
    this.lifetime = Math.random() + 0.25
  }

  static generateVelocity(power: number): Vector {
    let x = Math.random() - 0.5
    let y = Math.random() - 0.7
    const len = Math.sqrt(x * x + y * y)
    x /= len
    y /= len
    return {
      x: x * Math.random() * power,
      y: y * Math.random() * power,
    }
  }

  update(dt: number) {
    const { gravity, particleSize, fade } = this.config
    this.velocity.y += gravity * (this.size.y / (10 * particleSize)) * dt
    this.velocity.x += (Math.random() - 0.5) * 25 * dt
    this.velocity.x *= 0.98
    this.velocity.y *= 0.98
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    this.rotation += this.rotationSpeed
    if (fade) this.opacity -= this.lifetime
  }

  isOutOfBounds(): boolean {
    return this.position.y - 2 * this.size.x > 2 * window.innerHeight
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2)
    ctx.rotate((this.rotation * Math.PI) / 180)
    ctx.fillStyle = `hsla(${this.hue},90%,65%,${this.opacity}%)`
    ctx.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y)
    ctx.restore()
  }
}

class Burst {
  particles: Particle[]

  constructor(center: Vector, config: ConfettiConfig) {
    this.particles = Array.from(
      { length: config.particleCount },
      () => new Particle(center, config),
    )
  }

  update(dt: number) {
    for (const p of this.particles) p.update(dt)
    this.particles = this.particles.filter(p => !p.isOutOfBounds())
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(p => p.draw(ctx))
  }
}

export function useConfetti(options: ConfettiOptions = {}) {
  const burstsRef = useRef<Burst[]>([])
  // starts the animation, which stops once the bursts are over
  const startRef = useRef<() => void>(undefined)
  const config = { ...DEFAULT_CONFIG, ...options }

  useEffect(() => {
    const canvas = document.createElement('canvas')
    Object.assign(canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '999999999',
      pointerEvents: 'none',
    })
    document.body.appendChild(canvas)

    const ctx = canvas.getContext('2d')
    if (!ctx) return () => document.body.removeChild(canvas)

    const resize = () => {
      canvas.width = window.innerWidth * 2
      canvas.height = window.innerHeight * 2
    }
    window.addEventListener('resize', resize)
    resize()

    // same clock as requestAnimationFrame timestamps
    let time = 0
    let animation = 0

    const animate = (t: number) => {
      const dt = (t - time) / 1000
      time = t

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      burstsRef.current.forEach(b => {
        b.update(dt)
        b.draw(ctx)
      })
      burstsRef.current = burstsRef.current.filter(b => b.particles.length > 0)

      animation = burstsRef.current.length ? requestAnimationFrame(animate) : 0
    }

    startRef.current = () => {
      if (animation) return
      time = performance.now()
      animation = requestAnimationFrame(animate)
    }

    return () => {
      startRef.current = undefined
      cancelAnimationFrame(animation)
      window.removeEventListener('resize', resize)
      document.body.removeChild(canvas)
    }
  }, [])

  return () => {
    const center = { x: window.innerWidth, y: window.innerHeight }
    burstsRef.current.push(new Burst(center, config))
    startRef.current?.()
  }
}
