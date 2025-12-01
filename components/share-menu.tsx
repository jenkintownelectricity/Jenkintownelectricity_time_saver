'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Share2,
  Mail,
  MessageSquare,
  Copy,
  Download,
  X,
  Check
} from 'lucide-react'

interface ShareMenuProps {
  entityType: string
  entityData: any
  onClose: () => void
}

export default function ShareMenu({ entityType, entityData, onClose }: ShareMenuProps) {
  const [copied, setCopied] = useState(false)

  const generateShareText = () => {
    // Generate a formatted text for sharing
    let text = `${entityType} Details:\n\n`

    Object.entries(entityData.data).forEach(([key, value]) => {
      if (value) {
        text += `${key}: ${value}\n`
      }
    })

    return text
  }

  const generateShareHTML = () => {
    // Generate HTML for email
    let html = `<h2>${entityType} Details</h2><table style="border-collapse: collapse; width: 100%;">`

    Object.entries(entityData.data).forEach(([key, value]) => {
      if (value) {
        html += `<tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>${key}:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">${value}</td></tr>`
      }
    })

    html += '</table>'
    return html
  }

  const handleEmail = () => {
    const subject = encodeURIComponent(`${entityType} - ${entityData.data.name || entityData.data.title || entityData.id}`)
    const body = encodeURIComponent(generateShareText())
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const handleSMS = () => {
    const text = encodeURIComponent(generateShareText())
    window.location.href = `sms:?&body=${text}`
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const text = generateShareText()
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${entityType}-${entityData.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share {entityType}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleEmail}
          >
            <Mail className="w-4 h-4 mr-3" />
            Share via Email
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleSMS}
          >
            <MessageSquare className="w-4 h-4 mr-3" />
            Share via Text/SMS
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-3 text-green-500" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-3" />
                Copy to Clipboard
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-3" />
            Download as Text File
          </Button>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Share with customers, team members, or save for your records
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
