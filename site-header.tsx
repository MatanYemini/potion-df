"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Shield, Menu, Moon, Sun, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function SiteHeader() {
  const { setTheme, theme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  // Smooth scroll to section
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-md py-3 shadow-md" : "bg-transparent py-5",
      )}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-primary/20 blur-sm group-hover:bg-primary/30 transition-colors"></div>
            <div className="relative bg-background/80 backdrop-blur-sm rounded-full p-2 border border-primary/20 group-hover:border-primary/40 transition-colors">
              <Shield className="h-5 w-5 text-primary" />
            </div>
          </div>
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              DeepDetect
            </span>
            <div className="h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-300"></div>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="#tool" onClick={(e) => scrollToSection(e, "tool")}>
            Detection Tool
          </NavLink>
          <NavLink href="#examples" onClick={(e) => scrollToSection(e, "examples")}>
            Examples
          </NavLink>
          <NavLink href="#about" onClick={(e) => scrollToSection(e, "about")}>
            About
          </NavLink>
          <NavLink href="#education" onClick={(e) => scrollToSection(e, "education")}>
            Learn
          </NavLink>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "rounded-full relative overflow-hidden",
              scrolled ? "bg-muted/50" : "bg-background/50 backdrop-blur-sm",
            )}
          >
            {theme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button
            size="sm"
            className={cn(
              "rounded-full hidden md:flex",
              scrolled
                ? ""
                : "bg-background/50 backdrop-blur-sm hover:bg-background/70 text-foreground border border-primary/20",
            )}
            onClick={(e) => {
              e.preventDefault()
              const element = document.getElementById("tool")
              if (element) {
                element.scrollIntoView({ behavior: "smooth" })
              }
            }}
          >
            Try It Now
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("md:hidden rounded-full", scrolled ? "bg-muted/50" : "bg-background/50 backdrop-blur-sm")}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    DeepDetect
                  </span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4">
                <MobileNavLink href="#tool" onClick={(e) => scrollToSection(e, "tool")}>
                  Detection Tool
                </MobileNavLink>
                <MobileNavLink href="#examples" onClick={(e) => scrollToSection(e, "examples")}>
                  Examples
                </MobileNavLink>
                <MobileNavLink href="#about" onClick={(e) => scrollToSection(e, "about")}>
                  About
                </MobileNavLink>
                <MobileNavLink href="#education" onClick={(e) => scrollToSection(e, "education")}>
                  Learn
                </MobileNavLink>
                <div className="h-px bg-border my-2" />
                <Button
                  className="rounded-full w-full"
                  onClick={(e) => {
                    e.preventDefault()
                    const element = document.getElementById("tool")
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" })
                    }
                  }}
                >
                  Try It Now
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function NavLink({
  href,
  onClick,
  children,
}: { href: string; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary group"
    >
      {children}
      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform" />
    </Link>
  )
}

function MobileNavLink({
  href,
  onClick,
  children,
}: { href: string; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-3 text-lg font-medium transition-colors hover:text-primary hover:bg-muted/50 rounded-md"
    >
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
      {children}
    </Link>
  )
}

