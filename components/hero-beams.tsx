"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

export default function HeroBeams() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Animation variables
    let animationFrameId: number
    const beams: Beam[] = []

    // Create beams
    for (let i = 0; i < 8; i++) {
      beams.push(new Beam(canvas.width / 2, canvas.height / 2, Math.random() * Math.PI * 2, isDark))
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw beams
      beams.forEach((beam) => {
        beam.update()
        beam.draw(ctx)
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [theme])

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      transition={{ duration: 1, delay: 0.5 }}
    />
  )
}

class Beam {
  x: number
  y: number
  angle: number
  length: number
  width: number
  speed: number
  opacity: number
  targetOpacity: number
  color: string
  isDark: boolean

  constructor(x: number, y: number, angle: number, isDark: boolean) {
    this.x = x
    this.y = y
    this.angle = angle
    this.length = Math.random() * 300 + 200
    this.width = Math.random() * 2 + 1
    this.speed = Math.random() * 0.005 + 0.002
    this.opacity = 0
    this.targetOpacity = Math.random() * 0.2 + 0.1
    this.isDark = isDark
    this.color = isDark ? "rgba(139, 92, 246, " : "rgba(124, 58, 237, "
  }

  update() {
    // Update angle
    this.angle += this.speed

    // Update opacity with smooth transition
    if (Math.random() < 0.01) {
      this.targetOpacity = Math.random() * 0.2 + 0.1
    }
    this.opacity += (this.targetOpacity - this.opacity) * 0.02
  }

  draw(ctx: CanvasRenderingContext2D) {
    const endX = this.x + Math.cos(this.angle) * this.length
    const endY = this.y + Math.sin(this.angle) * this.length

    // Create gradient
    const gradient = ctx.createLinearGradient(this.x, this.y, endX, endY)
    gradient.addColorStop(0, this.color + "0)")
    gradient.addColorStop(0.5, this.color + this.opacity + ")")
    gradient.addColorStop(1, this.color + "0)")

    // Draw beam
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(endX, endY)
    ctx.strokeStyle = gradient
    ctx.lineWidth = this.width
    ctx.stroke()

    // Draw glow effect
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(endX, endY)
    ctx.strokeStyle = gradient
    ctx.lineWidth = this.width * 3
    ctx.globalAlpha = this.opacity * 0.3
    ctx.stroke()
    ctx.globalAlpha = 1
  }
}

