"use client"

import { type ReactNode, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface EducationalTooltipProps {
  children: ReactNode
  content: string
}

export default function EducationalTooltip({ children, content }: EducationalTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-64 p-4 bg-card rounded-lg shadow-lg border border-border"
            style={{ bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }}
          >
            <div className="text-sm">{content}</div>
            <div
              className="absolute w-3 h-3 bg-card border-r border-b border-border rotate-45"
              style={{ bottom: "-7px", left: "calc(50% - 6px)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

