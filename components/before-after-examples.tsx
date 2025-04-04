"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

const examples = [
  {
    id: 1,
    title: "Face Swap Detection",
    description: "This example shows how our tool detects face swapping techniques commonly used in deepfakes.",
    beforeImage: "/placeholder.svg?height=400&width=600",
    afterImage: "/placeholder.svg?height=400&width=600",
    highlights: [
      { x: 30, y: 40, size: 20, label: "Inconsistent lighting" },
      { x: 60, y: 45, size: 15, label: "Blurry edges" },
    ],
  },
  {
    id: 2,
    title: "AI-Generated Content",
    description: "Learn how to identify completely AI-generated images that never existed in reality.",
    beforeImage: "/placeholder.svg?height=400&width=600",
    afterImage: "/placeholder.svg?height=400&width=600",
    highlights: [
      { x: 25, y: 60, size: 18, label: "Unnatural textures" },
      { x: 70, y: 30, size: 22, label: "Symmetry errors" },
    ],
  },
  {
    id: 3,
    title: "Object Manipulation",
    description: "See how our tool detects when objects have been added, removed, or modified in an image.",
    beforeImage: "/placeholder.svg?height=400&width=600",
    afterImage: "/placeholder.svg?height=400&width=600",
    highlights: [
      { x: 40, y: 50, size: 25, label: "Shadow inconsistency" },
      { x: 65, y: 70, size: 20, label: "Perspective error" },
    ],
  },
]

export default function BeforeAfterExamples() {
  const [activeExample, setActiveExample] = useState(examples[0])
  const [sliderValue, setSliderValue] = useState(50)

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        {examples.map((example) => (
          <Button
            key={example.id}
            variant={activeExample.id === example.id ? "default" : "outline"}
            onClick={() => setActiveExample(example)}
            className="rounded-full"
          >
            {example.title}
          </Button>
        ))}
      </div>

      <div className="bg-card rounded-xl overflow-hidden shadow-xl">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{activeExample.title}</h3>
          <p className="text-muted-foreground">{activeExample.description}</p>
        </div>

        <div className="relative h-[400px] w-full">
          {/* Before Image (Background) */}
          <Image src={activeExample.beforeImage || "/placeholder.svg"} alt="Before" fill className="object-cover" />

          {/* After Image (Foreground with clip) */}
          <div className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: `${sliderValue}%` }}>
            <Image
              src={activeExample.afterImage || "/placeholder.svg"}
              alt="After"
              fill
              className="object-cover"
              style={{ width: "100vw" }}
            />

            {/* Highlights on the after image */}
            {activeExample.highlights.map((highlight, index) => (
              <motion.div
                key={index}
                className="absolute"
                style={{
                  left: `${highlight.x}%`,
                  top: `${highlight.y}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.2 }}
              >
                <div
                  className={cn(
                    "rounded-full border-2 border-primary flex items-center justify-center",
                    "w-8 h-8 text-xs font-bold text-primary bg-background",
                  )}
                >
                  {index + 1}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap">
                  <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">{highlight.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Slider control */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full px-8 pointer-events-auto">
              <Slider
                value={[sliderValue]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => setSliderValue(value[0])}
              />
            </div>
          </div>

          {/* Divider line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-primary"
            style={{ left: `${sliderValue}%`, transform: "translateX(-50%)" }}
          />

          {/* Labels */}
          <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
            Original
          </div>
          <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
            Analysis
          </div>
        </div>
      </div>
    </div>
  )
}

