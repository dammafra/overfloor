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

export function useConfetti(options: ConfettiOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const burstsRef = useRef<Burst[]>([])
  const timeRef = useRef<number>(Date.now())
  const animationRef = useRef<number | null>(null)

  const CONFIG = {
    gravity: 10,
    particleCount: 75,
    particleSize: 1,
    explosionPower: 25,
    fade: false,
    ...options,
  }

  class Particle {
    position: Vector
    velocity: Vector
    size: Vector
    rotation: number
    rotationSpeed: number
    hue: number
    opacity: number
    lifetime: number

    constructor(center: Vector) {
      this.size = {
        x: (16 * Math.random() + 4) * CONFIG.particleSize,
        y: (4 * Math.random() + 4) * CONFIG.particleSize,
      }
      this.position = { x: center.x - this.size.x / 2, y: center.y - this.size.y / 2 }
      this.velocity = Particle.generateVelocity()
      this.rotation = Math.random() * 360
      this.rotationSpeed = (Math.random() - 0.5) * 10
      this.hue = Math.random() * 360
      this.opacity = 100
      this.lifetime = Math.random() + 0.25
    }

    static generateVelocity(): Vector {
      let x = Math.random() - 0.5
      let y = Math.random() - 0.7
      const len = Math.sqrt(x * x + y * y)
      x /= len
      y /= len
      return {
        x: x * Math.random() * CONFIG.explosionPower,
        y: y * Math.random() * CONFIG.explosionPower,
      }
    }

    update(dt: number) {
      this.velocity.y += CONFIG.gravity * (this.size.y / (10 * CONFIG.particleSize)) * dt
      this.velocity.x += (Math.random() - 0.5) * 25 * dt
      this.velocity.x *= 0.98
      this.velocity.y *= 0.98
      this.position.x += this.velocity.x
      this.position.y += this.velocity.y
      this.rotation += this.rotationSpeed
      if (CONFIG.fade) this.opacity -= this.lifetime
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
    constructor(center: Vector) {
      this.particles = Array.from({ length: CONFIG.particleCount }, () => new Particle(center))
    }

    update(dt: number) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        this.particles[i].update(dt)
        if (this.particles[i].isOutOfBounds()) this.particles.splice(i, 1)
      }
    }

    draw(ctx: CanvasRenderingContext2D) {
      this.particles.forEach(p => p.draw(ctx))
    }
  }

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.zIndex = '999999999'
    canvas.style.pointerEvents = 'none'
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvasRef.current = canvas

    const resize = () => {
      canvas.width = window.innerWidth * 2
      canvas.height = window.innerHeight * 2
    }
    window.addEventListener('resize', resize)
    resize()

    const animate = (t: number) => {
      const dt = (t - timeRef.current) / 1000
      timeRef.current = t

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      burstsRef.current.forEach((b, idx) => {
        b.update(dt)
        b.draw(ctx)
        if (b.particles.length === 0) burstsRef.current.splice(idx, 1)
      })

      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resize)
      document.body.removeChild(canvas)
    }
  }, [])

  return () => {
    const center = { x: window.innerWidth, y: window.innerHeight }
    burstsRef.current.push(new Burst(center))
  }
}
