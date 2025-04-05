"use client";

import type React from "react";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, Zap, Lock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export default function ParallaxSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const { theme } = useTheme();

  return (
    <section
      ref={ref}
      className="relative h-[60vh] md:h-[80vh] overflow-hidden"
    >
      {/* Background with beams */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <Beams />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full max-w-6xl mx-auto px-4">
          {/* Center hexagon */}
          <motion.div style={{ scale, opacity }} className="z-10">
            <div className="relative flex items-center justify-center">
              <HexagonBackground size={400} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-6">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    Trusted Technology
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground max-w-[200px] mx-auto">
                    Advanced AI that respects your privacy while delivering
                    accurate results
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating cards - positioned in a circle around the center */}
          <motion.div
            style={{ opacity }}
            className="absolute left-1/2 -translate-x-1/2 z-20"
          >
            <FeatureCard
              icon={<Lock className="h-6 w-6 text-primary" />}
              title="Privacy First"
              description="Your uploads are analyzed securely and never stored without permission"
            />
          </motion.div>

          {/* Right card (90 degrees) */}
          <motion.div
            style={{ opacity }}
            className="absolute top-1/2 right-[10%] -translate-y-1/2 z-20"
          >
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-primary" />}
              title="Instant Analysis"
              description="Get real-time results with our advanced AI-powered detection algorithms"
            />
          </motion.div>

          <motion.div
            style={{ opacity }}
            className="absolute left-1/2 bottom-[100%] -translate-x-1/2 z-20"
          >
            <FeatureCard
              icon={<CheckCircle className="h-6 w-6 text-primary" />}
              title="Verified Results"
              description="Our detection models are trained on thousands of real and fake images"
            />
          </motion.div>

          {/* Left card (270 degrees) */}
          <motion.div
            style={{ opacity }}
            className="absolute top-1/2 left-[10%] -translate-y-1/2 z-20"
          >
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-primary" />}
              title="Protect Truth"
              description="Our technology helps identify manipulated images to combat misinformation"
            />
          </motion.div>
        </div>
      </div>

      {/* Connecting lines */}
      <motion.div
        style={{ opacity }}
        className="absolute inset-0 pointer-events-none z-0"
      >
        <svg width="100%" height="100%" className="absolute inset-0">
          <ConnectingLines />
        </svg>
      </motion.div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-card/80 backdrop-blur-md p-6 rounded-xl shadow-xl border border-border/50 w-64"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-primary/10 rounded-full">{icon}</div>
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  );
}

function HexagonBackground({ size = 300 }: { size?: number }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stopColor={
                isDark ? "rgba(124, 58, 237, 0.3)" : "rgba(124, 58, 237, 0.2)"
              }
            />
            <stop
              offset="100%"
              stopColor={
                isDark ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.2)"
              }
            />
          </linearGradient>
        </defs>
        <polygon
          points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25"
          fill="url(#hexGradient)"
          stroke={
            isDark ? "rgba(139, 92, 246, 0.6)" : "rgba(139, 92, 246, 0.4)"
          }
          strokeWidth="1"
        />
      </svg>

      {/* Simplified animation with slower rotation */}
      <motion.div
        className="absolute inset-0"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 60, // Much slower rotation
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="absolute inset-0"
        >
          <polygon
            points="50,5 88.3,27.5 88.3,72.5 50,95 11.7,72.5 11.7,27.5"
            fill="none"
            stroke={
              isDark ? "rgba(139, 92, 246, 0.2)" : "rgba(139, 92, 246, 0.1)"
            }
            strokeWidth="0.5"
            strokeDasharray="5,5"
          />
        </svg>
      </motion.div>

      {/* Removed second rotation animation for better performance */}
    </div>
  );
}

function ConnectingLines() {
  return (
    <g className="stroke-primary/20">
      {/* Top line (0 degrees) */}
      <motion.path
        d="M 50 50 L 50 20"
        strokeWidth="1"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      />

      {/* Right line (90 degrees) */}
      <motion.path
        d="M 50 50 L 80 50"
        strokeWidth="1"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 0.7 }}
      />

      {/* Bottom line (180 degrees) */}
      <motion.path
        d="M 50 50 L 50 80"
        strokeWidth="1"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 0.9 }}
      />

      {/* Left line (270 degrees) */}
      <motion.path
        d="M 50 50 L 20 50"
        strokeWidth="1"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1.1 }}
      />
    </g>
  );
}

function Beams() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Simplified animated beams - reduced count and animation complexity */}
      <div className="absolute inset-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute top-1/2 left-1/2 origin-center",
              "bg-gradient-to-r from-transparent via-primary/10 to-transparent"
            )}
            style={{
              height: "2px",
              width: "100%",
              rotate: `${i * 90}deg`,
              translateX: "-50%",
              translateY: "-50%",
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, transparent 0%, ${
            isDark ? "#09090b" : "#ffffff"
          } 70%)`,
        }}
      />

      {/* Simplified particles - reduced count and complexity */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/30"
            style={{
              width: 3,
              height: 3,
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 15,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 2,
              ease: "linear",
            }}
          />
        ))}
      </div>
    </div>
  );
}
