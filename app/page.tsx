"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { AlertCircle, ChevronDown, Info, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import DetectionTool from "@/components/detection-tool"
import ParallaxSection from "@/components/parallax-section"
import CustomCursor from "@/components/custom-cursor"
import FloatingElements from "@/components/floating-elements"
import BeforeAfterExamples from "@/components/before-after-examples"
import EducationalTooltip from "@/components/educational-tooltip"
import HeroBeams from "@/components/hero-beams"
import SiteHeader from "@/components/site-header"

export default function Home() {
  const { theme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50])

  // Check if on mobile device
  useEffect(() => {
    setIsMounted(true)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile) {
      setShowCursor(false)
    }
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {showCursor && <CustomCursor />}

      {/* Header - replaced with SiteHeader component */}
      <SiteHeader />

      {/* Hero Section */}
      <section ref={ref} className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <motion.div style={{ opacity, scale, y }} className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
          >
            AI-Powered Deepfake Detection
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500"
          >
            Uncover the Truth Behind Every Image
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Our advanced AI technology helps you detect manipulated images with precision. Protect yourself from
            misinformation in the digital age.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="rounded-full">
              <Link href="#tool">Try It Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link href="#education">Learn How It Works</Link>
            </Button>
          </motion.div>
        </motion.div>

        <FloatingElements />
        <HeroBeams />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <ChevronDown className="h-8 w-8 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Parallax Section */}
      <ParallaxSection />

      {/* Detection Tool Section */}
      <section id="tool" className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Advanced Deepfake Detection</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload any image and our AI will analyze it for signs of manipulation. Get detailed insights into what makes
            an image authentic or fake.
          </p>
        </div>

        <DetectionTool />
      </section>

      {/* Examples Section */}
      <section id="examples" className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">See It In Action</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our interactive examples to understand how deepfakes are created and detected.
            </p>
          </div>

          <BeforeAfterExamples />
        </div>
      </section>

      {/* Educational Section */}
      <section id="education" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Understanding Deepfakes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn about the technology behind deepfakes and how our detection tools work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">What Are Deepfakes?</h3>
              <p className="text-muted-foreground mb-4">
                Deepfakes use artificial intelligence to create or manipulate visual and audio content with a high
                potential to deceive.
              </p>
              <EducationalTooltip content="Deepfakes are created using deep learning techniques, specifically generative adversarial networks (GANs) that can swap faces, alter expressions, and create entirely new synthetic media.">
                <Button variant="ghost" className="text-primary">
                  Learn more
                </Button>
              </EducationalTooltip>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Detection Methods</h3>
              <p className="text-muted-foreground mb-4">
                Our technology analyzes pixel inconsistencies, facial abnormalities, and metadata to identify
                manipulated images.
              </p>
              <EducationalTooltip content="We use a combination of frequency domain analysis, facial landmark detection, and deep learning models trained on thousands of real and fake images to identify manipulations.">
                <Button variant="ghost" className="text-primary">
                  Learn more
                </Button>
              </EducationalTooltip>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Protecting Yourself</h3>
              <p className="text-muted-foreground mb-4">
                Learn practical tips to identify potential deepfakes and protect yourself from misinformation.
              </p>
              <EducationalTooltip content="Always verify images from multiple sources, check for inconsistencies in lighting, blurring around facial features, and unnatural skin textures. Use our tool to analyze suspicious images.">
                <Button variant="ghost" className="text-primary">
                  Learn more
                </Button>
              </EducationalTooltip>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                In an era where digital content can be easily manipulated, we're committed to providing tools that help
                people distinguish fact from fiction.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Our team of AI researchers and digital forensics experts have developed cutting-edge technology to
                detect even the most sophisticated deepfakes.
              </p>
              <Button asChild className="rounded-full">
                <Link href="#tool">Try Our Tool</Link>
              </Button>
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/placeholder.svg?height=600&width=600"
                alt="Our team"
                width={600}
                height={600}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-background border-t">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">DeepDetect</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-6">
              <Link href="#tool" className="text-sm hover:text-primary transition-colors">
                Detection Tool
              </Link>
              <Link href="#examples" className="text-sm hover:text-primary transition-colors">
                Examples
              </Link>
              <Link href="#about" className="text-sm hover:text-primary transition-colors">
                About
              </Link>
              <Link href="#education" className="text-sm hover:text-primary transition-colors">
                Learn
              </Link>
            </nav>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © {new Date().getFullYear()} DeepDetect. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm">
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm">
                Terms of Service
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

