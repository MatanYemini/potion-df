"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

interface AnalysisVisualizerProps {
  progress: number
}

export default function AnalysisVisualizer({ progress }: AnalysisVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const isDark = theme === "dark"

    // Set canvas dimensions
    canvas.width = 300
    canvas.height = 300

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw scanning effect
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 120

    // Draw outer circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw progress arc
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + (progress / 100) * (Math.PI * 2)

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.strokeStyle = isDark ? "#10b981" : "#059669" // Green color
    ctx.lineWidth = 4
    ctx.stroke()

    // Draw scanning lines
    const scanAngle = startAngle + (progress / 100) * (Math.PI * 2)
    const scanX = centerX + Math.cos(scanAngle) * radius
    const scanY = centerY + Math.sin(scanAngle) * radius

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(scanX, scanY)
    ctx.strokeStyle = isDark ? "#10b981" : "#059669"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw particles along the scanning line
    for (let i = 0; i < 10; i++) {
      const particleDistance = Math.random() * radius
      const particleX = centerX + Math.cos(scanAngle) * particleDistance
      const particleY = centerY + Math.sin(scanAngle) * particleDistance
      const particleSize = Math.random() * 3 + 1

      ctx.beginPath()
      ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2)
      ctx.fillStyle = isDark ? "#10b981" : "#059669"
      ctx.fill()
    }

    // Draw grid pattern
    const gridSize = 20
    const gridOpacity = 0.1

    ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${gridOpacity})` : `rgba(0, 0, 0, ${gridOpacity})`
    ctx.lineWidth = 1

    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2)
    ctx.fillStyle = isDark ? "rgba(16, 185, 129, 0.2)" : "rgba(5, 150, 105, 0.2)"
    ctx.fill()

    ctx.beginPath()
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2)
    ctx.fillStyle = isDark ? "rgba(16, 185, 129, 0.4)" : "rgba(5, 150, 105, 0.4)"
    ctx.fill()

    ctx.beginPath()
    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2)
    ctx.fillStyle = isDark ? "#10b981" : "#059669"
    ctx.fill()
  }, [progress, theme])

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={300} height={300} className="opacity-80" />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0.2, 0.8, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}

