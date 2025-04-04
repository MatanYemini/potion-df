"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface WaveformProps {
  audioUrl: string
  progress: number
  results?: any
}

export function Waveform({ audioUrl, progress, results }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!audioUrl) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.clientWidth * dpr
    canvas.height = canvas.clientHeight * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Generate mock waveform data (in a real app, this would analyze the actual audio)
    const waveformData = generateMockWaveform(100)

    // Draw waveform
    const isDark = theme === "dark"
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const barWidth = width / waveformData.length
    const progressPosition = width * progress

    // Draw background
    ctx.fillStyle = isDark ? "rgba(30, 30, 30, 0.5)" : "rgba(240, 240, 240, 0.5)"
    ctx.fillRect(0, 0, width, height)

    // Draw waveform bars
    for (let i = 0; i < waveformData.length; i++) {
      const x = i * barWidth
      const barHeight = waveformData[i] * (height * 0.8)

      // Determine if this part of the waveform is "played" or not
      const isPlayed = x < progressPosition

      // Draw bar
      ctx.fillStyle = isPlayed
        ? isDark
          ? "rgba(139, 92, 246, 0.8)"
          : "rgba(124, 58, 237, 0.8)"
        : isDark
          ? "rgba(139, 92, 246, 0.3)"
          : "rgba(124, 58, 237, 0.3)"

      ctx.fillRect(x, (height - barHeight) / 2, barWidth * 0.8, barHeight)
    }

    // Draw manipulated segments if results exist
    if (results && results.manipulatedSegments) {
      results.manipulatedSegments.forEach((segment: any) => {
        const startX = (segment.start / (results.duration || 30)) * width
        const endX = (segment.end / (results.duration || 30)) * width
        const segmentWidth = endX - startX

        // Draw highlight for manipulated segment
        ctx.fillStyle = "rgba(239, 68, 68, 0.2)"
        ctx.fillRect(startX, 0, segmentWidth, height)

        // Draw border
        ctx.strokeStyle = "rgba(239, 68, 68, 0.5)"
        ctx.lineWidth = 1
        ctx.strokeRect(startX, 0, segmentWidth, height)
      })
    }

    // Draw progress line
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(progressPosition, 0)
    ctx.lineTo(progressPosition, height)
    ctx.stroke()
  }, [audioUrl, progress, results, theme])

  // Generate mock waveform data
  const generateMockWaveform = (numBars: number) => {
    const data = []
    for (let i = 0; i < numBars; i++) {
      // Create a more interesting pattern with some variations
      const baseHeight = 0.2 + Math.random() * 0.3

      // Add some peaks and valleys
      const variation = i % 8 === 0 ? 0.7 + Math.random() * 0.3 : i % 4 === 0 ? 0.5 + Math.random() * 0.3 : baseHeight

      data.push(variation)
    }
    return data
  }

  return <canvas ref={canvasRef} className="w-full h-full" />
}

