'use client'

import { useState, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Upload, Loader2, X, Image as ImageIcon, CheckCircle, AlertCircle, Wrench, Shield, Eye } from 'lucide-react'

interface AnalysisResult {
  wireGauge?: string
  panelReading?: string
  compliance?: string
  safety?: string
  quality?: string
  recommendations?: string[]
}

export default function PhotoAnalysis() {
  const { apiKeys, ownerSettings } = useAppStore()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [photoLibrary, setPhotoLibrary] = useState<Array<{ id: string; url: string; analysis: string; timestamp: number }>>([])
  const [showLibrary, setShowLibrary] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Create local URL for preview
    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)
    setAnalysisResult(null)
    setIsAnalyzing(true)

    try {
      // Get API key from user settings or fallback to owner's default key
      const anthropicKey = apiKeys.anthropic ||
        (ownerSettings.provideDefaultKeys ? ownerSettings.defaultAnthropicKey : null)

      if (!anthropicKey) {
        setAnalysisResult('Please configure your Anthropic API key in Settings to use photo analysis.')
        setIsAnalyzing(false)
        return
      }

      // Convert file to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string

        // Call API for analysis
        const response = await fetch('/api/photo/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData: base64String,
            apiKey: anthropicKey,
          }),
        })

        const data = await response.json()

        if (data.error) {
          setAnalysisResult(`Error: ${data.error}`)
        } else {
          setAnalysisResult(data.analysis)

          // Save to library
          const newPhoto = {
            id: `photo_${Date.now()}`,
            url: imageUrl,
            analysis: data.analysis,
            timestamp: Date.now()
          }
          const updatedLibrary = [newPhoto, ...photoLibrary].slice(0, 20) // Keep last 20
          setPhotoLibrary(updatedLibrary)
          localStorage.setItem('photo-library', JSON.stringify(updatedLibrary))
        }

        setIsAnalyzing(false)
      }

      reader.readAsDataURL(file)

    } catch (error) {
      setAnalysisResult('Failed to analyze image. Please try again.')
      setIsAnalyzing(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleCameraClick = () => {
    // On mobile, this will open the camera
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment')
      fileInputRef.current.click()
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setAnalysisResult(null)
    setIsAnalyzing(false)
  }

  const handleNewAnalysis = () => {
    setSelectedImage(null)
    setAnalysisResult(null)
    setIsAnalyzing(false)
  }

  // Load library on mount
  useState(() => {
    const saved = localStorage.getItem('photo-library')
    if (saved) {
      try {
        setPhotoLibrary(JSON.parse(saved))
      } catch (e) {
        // Invalid data
      }
    }
  })

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!selectedImage ? (
        <>
          <Card className="p-12 border-dashed border-2 hover:border-primary/50 transition-colors">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Capture or Upload Photo
                </h3>
                <p className="text-sm text-muted-foreground">
                  Take a photo of wiring, panels, or installations for instant AI analysis
                </p>
              </div>
              <div className="flex gap-4 mt-4">
                <Button size="lg" onClick={handleCameraClick}>
                  <Camera className="w-5 h-5 mr-2" />
                  Take Photo
                </Button>
                <Button size="lg" variant="outline" onClick={handleUploadClick}>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Image
                </Button>
              </div>
            </div>
          </Card>

          {/* Analysis Categories */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">
                What can AppIo.AI analyze?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3">
                  <Wrench className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Wire Gauge Identification</h4>
                    <p className="text-xs text-muted-foreground">Identify wire types and gauges</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Panel Reading</h4>
                    <p className="text-xs text-muted-foreground">Read and label electrical panels</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Code Compliance</h4>
                    <p className="text-xs text-muted-foreground">Verify NEC compliance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Safety Concerns</h4>
                    <p className="text-xs text-muted-foreground">Detect potential hazards</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Installation Quality</h4>
                    <p className="text-xs text-muted-foreground">Assess workmanship</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ImageIcon className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Material ID</h4>
                    <p className="text-xs text-muted-foreground">Identify materials used</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Library */}
          {photoLibrary.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Photo Library ({photoLibrary.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLibrary(!showLibrary)}
                  >
                    {showLibrary ? 'Hide' : 'Show'}
                  </Button>
                </div>

                {showLibrary && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photoLibrary.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors"
                        onClick={() => {
                          setSelectedImage(photo.url)
                          setAnalysisResult(photo.analysis)
                        }}
                      >
                        <img
                          src={photo.url}
                          alt="Analysis photo"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                          {new Date(photo.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10"
                  onClick={handleRemoveImage}
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="Selected construction photo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {isAnalyzing ? (
            <Card>
              <CardContent className="p-12 flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <div className="text-center">
                  <h3 className="font-semibold text-foreground mb-1">
                    Analyzing Image...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    AppIo.AI is examining your photo with Claude Vision
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : analysisResult ? (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Analysis Results
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                    {analysisResult}
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-border flex gap-3">
                  <Button onClick={handleNewAnalysis} variant="outline">
                    Analyze Another Photo
                  </Button>
                  <Button onClick={handleUploadClick}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  )
}
