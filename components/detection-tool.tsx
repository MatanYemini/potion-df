"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { useDropzone } from "react-dropzone"
import {
  Upload,
  X,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Share2,
  Download,
  Info,
  FileAudio,
  ImageIcon,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import AnalysisVisualizer from "./analysis-visualizer"
import EducationalTooltip from "./educational-tooltip"
import { Waveform } from "./waveform"

// Mock image detection results
const mockImageResults = {
  authenticity: 0.23, // 0-1 where 0 is fake, 1 is authentic
  confidence: 0.89, // 0-1 confidence in the result
  manipulatedAreas: [
    { x: 0.3, y: 0.4, width: 0.2, height: 0.1, confidence: 0.92, type: "face_swap" },
    { x: 0.5, y: 0.5, width: 0.1, height: 0.1, confidence: 0.78, type: "texture" },
  ],
  metadata: {
    inconsistencies: ["lighting", "shadows", "noise_patterns"],
    techniquesDetected: ["gan_generated", "face_swap"],
    originalDetected: false,
  },
}

// Mock audio detection results
const mockAudioResults = {
  authenticity: 0.18, // 0-1 where 0 is fake, 1 is authentic
  confidence: 0.92, // 0-1 confidence in the result
  manipulatedSegments: [
    { start: 2.4, end: 5.7, confidence: 0.95, type: "voice_synthesis" },
    { start: 10.2, end: 12.8, confidence: 0.88, type: "content_splicing" },
  ],
  metadata: {
    inconsistencies: ["frequency_artifacts", "unnatural_pauses", "voice_timbre"],
    techniquesDetected: ["neural_voice", "audio_splicing"],
    originalDetected: false,
  },
}

type FileType = "image" | "audio" | null

export default function DetectionTool() {
  const [file, setFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState<FileType | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [results, setResults] = useState<any | null>(null)
  const [showOverlay, setShowOverlay] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const { theme } = useTheme()

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Handle audio playback
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((e) => {
          console.error("Audio playback error:", e)
          setIsPlaying(false)
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  // Handle audio time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  // Handle audio loaded metadata
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  // Handle audio ended
  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)

      // Determine file type
      const isAudio = file.type.startsWith("audio/")
      setFileType(isAudio ? "audio" : "image")

      // Create preview
      if (isAudio) {
        // For audio, we just set the URL for the audio element
        const audioUrl = URL.createObjectURL(file)
        setPreview(audioUrl)
      } else {
        // For images, create a preview
        const reader = new FileReader()
        reader.onload = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }

      // Reset states
      setResults(null)
      setIsAnalyzing(false)
      setAnalysisProgress(0)
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".flac"],
    },
    maxFiles: 1,
    maxSize: 52428800, // 50MB
  })

  const handleAnalyze = () => {
    if (!preview) return

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsAnalyzing(false)
            // Set appropriate results based on file type
            setResults(fileType === "audio" ? mockAudioResults : mockImageResults)
          }, 500)
          return 100
        }
        return newProgress
      })
    }, 200)
  }

  const handleReset = () => {
    setFile(null)
    setFileType(null)
    setPreview(null)
    setResults(null)
    setIsAnalyzing(false)
    setAnalysisProgress(0)
    setZoomLevel(1)
    setIsPlaying(false)
    setCurrentTime(0)

    // Revoke object URL if it exists
    if (preview && fileType === "audio") {
      URL.revokeObjectURL(preview)
    }
  }

  const handleCameraCapture = () => {
    // This would typically open the device camera
    alert("Camera functionality would be implemented here")
  }

  const handleVoiceCommand = () => {
    // This would typically start voice recognition
    alert("Voice command functionality would be implemented here")
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const handleSeek = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div
        className={cn(
          "relative rounded-3xl overflow-hidden transition-all duration-500",
          preview ? "bg-card shadow-2xl" : "bg-muted/50",
          results ? "min-h-[600px]" : "min-h-[400px]",
        )}
      >
        {!preview ? (
          <motion.div
            className={cn(
              "flex flex-col items-center justify-center w-full h-[400px] p-8 border-2 border-dashed rounded-3xl transition-colors relative overflow-hidden",
              isDragActive ? "border-primary" : "border-muted-foreground/20",
            )}
            {...getRootProps()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input {...getInputProps()} />

            {/* Background design elements */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Hexagon grid pattern */}
              <svg width="100%" height="100%" className="opacity-10">
                <defs>
                  <pattern
                    id="hexagons"
                    width="50"
                    height="43.4"
                    patternUnits="userSpaceOnUse"
                    patternTransform="scale(2)"
                  >
                    <path
                      d="M25,0 L50,14.4 L50,43.4 L25,57.8 L0,43.4 L0,14.4 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hexagons)" />
              </svg>

              {/* Animated circles */}
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-primary/10"
                  style={{
                    width: `${Math.random() * 200 + 100}px`,
                    height: `${Math.random() * 200 + 100}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 5 + i * 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            <motion.div
              className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative z-10"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Upload className="h-12 w-12 text-primary" />
            </motion.div>

            <h3 className="text-xl font-bold mb-2 relative z-10">Drop your file here</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6 relative z-10">
              Upload any image or audio file (up to 50MB) to analyze it for signs of manipulation or AI generation
            </p>

            <Button
              onClick={(e) => {
                e.stopPropagation()
              }}
              className="rounded-full relative z-10"
            >
              Select File
            </Button>

            <div className="flex gap-2 mt-6 relative z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Images</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                <FileAudio className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Audio (up to 50MB)</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="relative">
            {/* File Preview */}
            <div className="relative overflow-hidden" style={{ height: results ? "400px" : "400px" }}>
              {fileType === "image" ? (
                // Image Preview
                <div
                  className="relative w-full h-full overflow-hidden"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transition: "transform 0.3s ease",
                  }}
                >
                  <Image src={preview || "/placeholder.svg"} alt="Uploaded image" fill className="object-contain" />

                  {/* Analysis Overlay */}
                  {results && showOverlay && (
                    <div className="absolute inset-0 pointer-events-none">
                      {results.manipulatedAreas?.map((area: any, index: number) => (
                        <div
                          key={index}
                          className="absolute border-2 border-red-500 bg-red-500/20 flex items-center justify-center"
                          style={{
                            left: `${area.x * 100}%`,
                            top: `${area.y * 100}%`,
                            width: `${area.width * 100}%`,
                            height: `${area.height * 100}%`,
                          }}
                        >
                          <span className="text-xs font-bold text-white bg-red-500 px-1 rounded">
                            {Math.round(area.confidence * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Audio Preview
                <div className="w-full h-full flex flex-col items-center justify-center p-6">
                  <div className="w-full max-w-2xl">
                    <div className="mb-8 flex justify-center">
                      <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileAudio className="h-16 w-16 text-primary" />
                      </div>
                    </div>

                    {/* Audio element (hidden) */}
                    <audio
                      ref={audioRef}
                      src={preview || ""}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={handleEnded}
                      muted={isMuted}
                      className="hidden"
                    />

                    {/* Waveform visualization */}
                    <div className="mb-4 h-24 bg-muted/30 rounded-xl overflow-hidden">
                      <Waveform audioUrl={preview || ""} progress={currentTime / (duration || 1)} results={results} />
                    </div>

                    {/* Audio controls */}
                    <div className="flex items-center gap-4 mb-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="rounded-full"
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>

                      <div className="text-sm font-medium">
                        {formatTime(currentTime)} / {formatTime(duration || 0)}
                      </div>

                      <div className="flex-1">
                        <Slider
                          value={[currentTime]}
                          min={0}
                          max={duration || 100}
                          step={0.1}
                          onValueChange={handleSeek}
                        />
                      </div>

                      <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} className="rounded-full">
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      {file?.name} ({file?.size ? (file.size / 1024 / 1024).toFixed(2) : 0} MB)
                    </div>

                    {/* Analysis Overlay for Audio */}
                    {results && (
                      <div className="mt-6 p-4 bg-muted/30 rounded-xl">
                        <h4 className="font-medium mb-2">Detected Manipulations:</h4>
                        <div className="space-y-2">
                          {results.manipulatedSegments?.map((segment: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                <span className="text-sm">
                                  {formatTime(segment.start)} - {formatTime(segment.end)}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">{segment.type.replace("_", " ")}</span>
                                <span className="ml-2 text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
                                  {Math.round(segment.confidence * 100)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Image Controls - only show for images */}
              {preview && fileType === "image" && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-full">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))}
                    className="rounded-full"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>

                  <Slider
                    value={[zoomLevel]}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onValueChange={(value) => setZoomLevel(value[0])}
                    className="w-24"
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 2))}
                    className="rounded-full"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>

                  {results && (
                    <Toggle pressed={showOverlay} onPressedChange={setShowOverlay} className="rounded-full">
                      {showOverlay ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Toggle>
                  )}
                </div>
              )}

              {/* Analysis Progress */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center">
                  <AnalysisVisualizer progress={analysisProgress} />
                  <div className="w-64 mt-8">
                    <Progress value={analysisProgress} className="h-2" />
                  </div>
                  <p className="mt-4 text-sm font-medium">
                    Analyzing {fileType}... {Math.round(analysisProgress)}%
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="rounded-full bg-background/80 backdrop-blur-sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Analysis Actions */}
            {!isAnalyzing && !results && (
              <div className="p-6 flex justify-center">
                <Button onClick={handleAnalyze} className="rounded-full">
                  Analyze {fileType || "File"}
                </Button>
              </div>
            )}

            {/* Results Section */}
            {results && (
              <div className="p-6">
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="details">Technical Details</TabsTrigger>
                    <TabsTrigger value="share">Share & Export</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-muted/30 rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4">Analysis Result</h3>

                        <div className="mb-6">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Authenticity Score</span>
                            <span className="text-sm font-bold">{Math.round(results.authenticity * 100)}%</span>
                          </div>
                          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                results.authenticity < 0.3
                                  ? "bg-red-500"
                                  : results.authenticity < 0.7
                                    ? "bg-yellow-500"
                                    : "bg-green-500",
                              )}
                              style={{ width: `${results.authenticity * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-muted-foreground">Likely Fake</span>
                            <span className="text-xs text-muted-foreground">Likely Authentic</span>
                          </div>
                        </div>

                        <div className="mb-6">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Confidence in Result</span>
                            <span className="text-sm font-bold">{Math.round(results.confidence * 100)}%</span>
                          </div>
                          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${results.confidence * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-card rounded-lg border border-border">
                          <h4 className="text-sm font-bold mb-2">Verdict</h4>
                          <p className="text-sm">
                            {results.authenticity < 0.3
                              ? `This ${fileType} shows strong signs of manipulation or AI generation.`
                              : results.authenticity < 0.7
                                ? `This ${fileType} shows some signs of potential manipulation.`
                                : `This ${fileType} appears to be authentic.`}
                          </p>
                        </div>
                      </div>

                      <div className="bg-muted/30 rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4">Detected Issues</h3>

                        <ul className="space-y-3">
                          {results.metadata.inconsistencies.map((issue: string, index: number) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="mt-0.5 h-5 w-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                              </div>
                              <div>
                                <p className="font-medium capitalize">{issue.replace(/_/g, " ")}</p>
                                <p className="text-sm text-muted-foreground">
                                  {fileType === "image" ? (
                                    <>
                                      {issue === "lighting" &&
                                        "Inconsistent lighting patterns detected across the image."}
                                      {issue === "shadows" &&
                                        "Shadow directions don't match the light sources in the image."}
                                      {issue === "noise_patterns" &&
                                        "Unusual noise patterns detected that differ from natural camera noise."}
                                    </>
                                  ) : (
                                    <>
                                      {issue === "frequency_artifacts" &&
                                        "Unusual frequency patterns detected that are typical of AI-generated audio."}
                                      {issue === "unnatural_pauses" &&
                                        "Speech rhythm contains unnatural pauses or transitions between words."}
                                      {issue === "voice_timbre" &&
                                        "Voice characteristics show inconsistencies in timbre and resonance."}
                                    </>
                                  )}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-6">
                          <h4 className="text-sm font-bold mb-2">Techniques Detected</h4>
                          <div className="flex flex-wrap gap-2">
                            {results.metadata.techniquesDetected.map((technique: string, index: number) => (
                              <div
                                key={index}
                                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                              >
                                {technique.replace(/_/g, " ")}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="pt-6">
                    <div className="bg-muted/30 rounded-xl p-6">
                      <h3 className="text-lg font-bold mb-4">Technical Analysis</h3>

                      <div className="space-y-6">
                        {fileType === "image" ? (
                          <>
                            <div>
                              <h4 className="text-sm font-bold mb-2 flex items-center">
                                Frequency Domain Analysis
                                <EducationalTooltip content="We analyze the image in the frequency domain using Fourier transforms to detect inconsistencies that are invisible to the human eye but reveal manipulation.">
                                  <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                                </EducationalTooltip>
                              </h4>
                              <div className="p-4 bg-card rounded-lg border border-border">
                                <p className="text-sm">
                                  Analysis detected unusual frequency patterns consistent with GAN-generated content.
                                  Specific artifacts in high-frequency components suggest image manipulation.
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold mb-2 flex items-center">
                                Facial Analysis
                                <EducationalTooltip content="Our system analyzes facial landmarks, skin texture, and eye reflections to detect inconsistencies that occur in manipulated faces.">
                                  <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                                </EducationalTooltip>
                              </h4>
                              <div className="p-4 bg-card rounded-lg border border-border">
                                <p className="text-sm">
                                  Facial landmark analysis shows inconsistencies in eye alignment and skin texture.
                                  Unnatural blending detected around facial boundaries.
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold mb-2 flex items-center">
                                Metadata Analysis
                                <EducationalTooltip content="We examine the image's metadata for signs of editing software, inconsistent timestamps, or missing camera information.">
                                  <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                                </EducationalTooltip>
                              </h4>
                              <div className="p-4 bg-card rounded-lg border border-border">
                                <p className="text-sm">
                                  Image metadata shows signs of processing through multiple software applications.
                                  Original camera EXIF data is missing or has been modified.
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <h4 className="text-sm font-bold mb-2 flex items-center">
                                Spectral Analysis
                                <EducationalTooltip content="We analyze the audio spectrum to detect artifacts and patterns that are characteristic of AI-generated or manipulated audio.">
                                  <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                                </EducationalTooltip>
                              </h4>
                              <div className="p-4 bg-card rounded-lg border border-border">
                                <p className="text-sm">
                                  Spectral analysis revealed unusual frequency patterns in the 8-12kHz range typical of
                                  neural voice synthesis. Missing or artificial harmonics detected in voiced segments.
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold mb-2 flex items-center">
                                Prosody Analysis
                                <EducationalTooltip content="Our system examines speech rhythm, intonation, and stress patterns to identify unnatural variations that occur in synthetic speech."></EducationalTooltip>
                              </h4>
                              <div className="p-4 bg-card rounded-lg border border-border">
                                <p className="text-sm">
                                  Analysis detected unnatural pauses between words and inconsistent intonation patterns.
                                  Speech rhythm shows mechanical regularities not present in natural human speech.
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold mb-2 flex items-center">
                                Voice Consistency Analysis
                                <EducationalTooltip content="We examine voice characteristics across the entire audio sample to detect inconsistencies that would indicate splicing or voice cloning.">
                                  <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                                </EducationalTooltip>
                              </h4>
                              <div className="p-4 bg-card rounded-lg border border-border">
                                <p className="text-sm">
                                  Voice characteristics show subtle inconsistencies in timbre and resonance across
                                  different segments. Formant transitions between phonemes exhibit patterns consistent
                                  with neural voice synthesis.
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="share" className="pt-6">
                    <div className="bg-muted/30 rounded-xl p-6">
                      <h3 className="text-lg font-bold mb-4">Share Results</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-bold mb-4">Share Analysis</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Share these results to help others identify manipulated content.
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <Button variant="outline" className="rounded-full">
                              <Share2 className="mr-2 h-4 w-4" />
                              Share Link
                            </Button>
                            <Button variant="outline" className="rounded-full">
                              <Download className="mr-2 h-4 w-4" />
                              Download Report
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold mb-4">Report Content</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Help combat misinformation by reporting manipulated content.
                          </p>
                          <Button variant="destructive" className="rounded-full">
                            Report Deepfake
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

