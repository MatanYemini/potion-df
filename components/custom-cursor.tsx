"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })

      // Check if cursor is over a clickable element
      const target = e.target as HTMLElement
      const isClickable =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        window.getComputedStyle(target).cursor === "pointer"

      setIsPointer(isClickable)
    }

    const handleMouseDown = () => setIsActive(true)
    const handleMouseUp = () => setIsActive(false)

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)

    // Hide default cursor
    document.body.style.cursor = "none"

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)

      // Restore default cursor
      document.body.style.cursor = "auto"
    }
  }, [])

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: position.x - 16,
          y: position.y - 16,
          scale: isActive ? 0.8 : 1,
          opacity: 1,
          borderColor: isPointer ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.3)",
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 300,
          mass: 0.5,
        }}
        style={{
          backgroundColor: isPointer ? "rgba(255, 255, 255, 1)" : "transparent",
          border: "2px solid rgba(255, 255, 255, 0.3)",
        }}
      />

      {/* Dot cursor */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: position.x - 1,
          y: position.y - 1,
          opacity: 1,
          scale: isActive ? 1.5 : 1,
        }}
        transition={{
          type: "spring",
          damping: 50,
          stiffness: 500,
        }}
      />
    </>
  )
}

