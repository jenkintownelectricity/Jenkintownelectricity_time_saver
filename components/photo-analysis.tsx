'use client'

import { useState, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Camera, Upload, Loader2, X } from 'lucide-react'
import Image from 'next/image'

export default function PhotoAnalysis() {
  const { setCurrentSection, photos, addPhoto, updatePhotoAnalysis, removePhoto, apiKeys, ownerSettings } = useAppStore()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Create local URL for preview
    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)
    setIsAnalyzing(true)

    // Add to store
    addPhoto(imageUrl)
    const photoId = Date.now().toString()

    try {
      // Get API key from user settings or fallback to owner's default key
      const anthropicKey = apiKeys.anthropic ||
        (ownerSettings.provideDefaultKeys ? ownerSettings.defaultAnthropicKey : null)

      // Call API for analysis
      const response = await fetch('/api/photo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          apiKey: anthropicKey,
        }),
      })

      const data = await response.json()
      updatePhotoAnalysis(photoId, data.analysis)
    } catch (error) {
      updatePhotoAnalysis(photoId, 'Failed to analyze image. Please try again.')
    } finally {
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
    setIsAnalyzing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentSection('home')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Photo Analysis</h1>
              <p className="text-xs text-muted-foreground">AI-powered construction analysis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
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

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    What can AppIo.AI analyze?
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>Wire gauge and type identification</li>
                    <li>Electrical panel reading and labeling</li>
                    <li>Code compliance verification</li>
                    <li>Safety concern detection</li>
                    <li>Installation quality assessment</li>
                    <li>Material identification and recommendations</li>
                  </ul>
                </CardContent>
              </Card>
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
                        AppIo.AI is examining your photo
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Analysis Results</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {photos[photos.length - 1]?.analysis || 'No analysis available'}
                      </p>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border">
                      <Button onClick={handleRemoveImage} variant="outline">
                        Analyze Another Photo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
