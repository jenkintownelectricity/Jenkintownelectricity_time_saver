"use client"

import * as React from "react"
import { Upload, Camera, X, Loader2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { OCRResult } from "@/lib/types/receipts"

interface ReceiptUploadProps {
  onFilesSelected: (files: File[]) => void
  onOCRComplete?: (result: OCRResult, file: File) => void
  maxFiles?: number
  className?: string
}

export function ReceiptUpload({
  onFilesSelected,
  onOCRComplete,
  maxFiles = 10,
  className,
}: ReceiptUploadProps) {
  const [files, setFiles] = React.useState<File[]>([])
  const [previews, setPreviews] = React.useState<string[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const cameraInputRef = React.useRef<HTMLInputElement>(null)

  const processFiles = async (newFiles: File[]) => {
    const imageFiles = newFiles.filter((file) =>
      file.type.startsWith("image/")
    )

    if (files.length + imageFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    setFiles((prev) => [...prev, ...imageFiles])
    onFilesSelected(imageFiles)

    // Create previews
    const newPreviews = await Promise.all(
      imageFiles.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
      })
    )

    setPreviews((prev) => [...prev, ...newPreviews])

    // Process OCR if handler provided
    if (onOCRComplete) {
      setIsProcessing(true)
      for (const file of imageFiles) {
        try {
          const formData = new FormData()
          formData.append("image", file)

          const response = await fetch("/api/receipts/ocr", {
            method: "POST",
            body: formData,
          })

          if (response.ok) {
            const result: OCRResult = await response.json()
            onOCRComplete(result, file)
          }
        } catch (error) {
          console.error("OCR processing failed:", error)
        }
      }
      setIsProcessing(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      processFiles(selectedFiles)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openCamera = () => {
    cameraInputRef.current?.click()
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2">
            Upload Receipt Images
          </h3>

          <p className="text-sm text-muted-foreground mb-6">
            Drag and drop images here, or click to browse
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={openFileDialog} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Choose Files
            </Button>

            <Button onClick={openCamera} variant="outline">
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Supports: JPG, PNG, WebP (Max {maxFiles} files)
          </p>

          {isProcessing && (
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing OCR...
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </Card>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <Card key={index} className="relative overflow-hidden group">
              <div className="aspect-square relative">
                <img
                  src={preview}
                  alt={`Receipt ${index + 1}`}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-2 bg-muted">
                <p className="text-xs truncate">{files[index]?.name}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
