"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

export default function FloatingElements() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  // Generate random elements
  const elements = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute rounded-full opacity-20"
          style={{
            width: element.size,
            height: element.size,
            left: `${element.x}%`,
            top: `${element.y}%`,
            background: `radial-gradient(circle at center, ${theme === "dark" ? "rgba(124, 58, 237, 0.8)" : "rgba(124, 58, 237, 0.5)"}, transparent)`,
          }}
          animate={{
            x: [Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50],
            y: [Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: element.duration,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: element.delay,
          }}
        />
      ))}
    </div>
  )
}

