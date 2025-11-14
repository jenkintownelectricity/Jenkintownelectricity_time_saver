'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  DollarSign,
  QrCode,
  Plus,
  Edit,
  Trash2,
  Share2,
  Copy,
  Check,
  Mail,
  MessageSquare,
  Download,
  ExternalLink,
  Upload
} from 'lucide-react'

interface PaymentMethod {
  id: string
  name: string
  type: 'link' | 'qr'
  value: string
  createdAt: number
}

export default function GetPaidNow() {
  const { setCurrentSection } = useAppStore()

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('payment_methods')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', type: 'link' as 'link' | 'qr', value: '' })
  const [showShareMenu, setShowShareMenu] = useState<PaymentMethod | null>(null)
  const [copied, setCopied] = useState(false)

  const saveToStorage = (methods: PaymentMethod[]) => {
    localStorage.setItem('payment_methods', JSON.stringify(methods))
    setPaymentMethods(methods)
  }

  const handleAdd = () => {
    if (!formData.name || !formData.value) return

    const newMethod: PaymentMethod = {
      id: `payment_${Date.now()}`,
      name: formData.name,
      type: formData.type,
      value: formData.value,
      createdAt: Date.now()
    }

    saveToStorage([...paymentMethods, newMethod])
    setFormData({ name: '', type: 'link', value: '' })
    setIsAdding(false)
  }

  const handleUpdate = () => {
    if (!editingId || !formData.name || !formData.value) return

    const updated = paymentMethods.map(m =>
      m.id === editingId
        ? { ...m, name: formData.name, type: formData.type, value: formData.value }
        : m
    )

    saveToStorage(updated)
    setFormData({ name: '', type: 'link', value: '' })
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    saveToStorage(paymentMethods.filter(m => m.id !== id))
  }

  const handleEdit = (method: PaymentMethod) => {
    setFormData({ name: method.name, type: method.type, value: method.value })
    setEditingId(method.id)
    setIsAdding(true)
  }

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = (method: PaymentMethod) => {
    setShowShareMenu(method)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Convert to data URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData({ ...formData, value: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const ShareMenu = ({ method, onClose }: { method: PaymentMethod; onClose: () => void }) => {
    const shareText = `Payment for services:\n${method.name}\n${method.value}`

    const handleEmail = () => {
      window.location.href = `mailto:?subject=Payment Link - ${method.name}&body=${encodeURIComponent(shareText)}`
    }

    const handleSMS = () => {
      window.location.href = `sms:?&body=${encodeURIComponent(shareText)}`
    }

    const handleCopyShare = async () => {
      await handleCopy(shareText)
    }

    const handleDownloadQR = () => {
      // For QR codes, we'll open the link which should be a QR code image
      window.open(method.value, '_blank')
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share {method.name}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="w-4 h-4" />
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
              onClick={handleCopyShare}
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

            {method.type === 'qr' && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleDownloadQR}
              >
                <Download className="w-4 h-4 mr-3" />
                View QR Code
              </Button>
            )}

            {method.type === 'link' && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open(method.value, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-3" />
                Open Payment Link
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
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
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                Get Paid Now
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage payment links and QR codes
              </p>
            </div>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Add/Edit Form */}
          {isAdding && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle>{editingId ? 'Edit' : 'Add'} Payment Method</CardTitle>
                <CardDescription>
                  Add a payment link (Venmo, PayPal, Zelle, etc.) or QR code image URL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <Input
                    placeholder="e.g., Venmo, PayPal, Zelle"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'link' | 'qr' })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="link">Payment Link</option>
                    <option value="qr">QR Code Image URL</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {formData.type === 'link' ? 'Payment Link' : 'QR Code Image'}
                  </label>
                  {formData.type === 'qr' && (
                    <div className="mb-2">
                      <input
                        type="file"
                        id="qr-upload"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('qr-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload QR Code Image
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1 text-center">or paste URL below</p>
                    </div>
                  )}
                  <Input
                    placeholder={formData.type === 'link'
                      ? 'https://venmo.com/u/yourname'
                      : 'https://example.com/qr-code.png'}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  />
                  {formData.type === 'qr' && formData.value && (
                    <div className="mt-3 p-4 border rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-2 text-center">Preview:</p>
                      <img
                        src={formData.value}
                        alt="QR Code Preview"
                        className="w-48 h-48 mx-auto object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false)
                      setEditingId(null)
                      setFormData({ name: '', type: 'link', value: '' })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={editingId ? handleUpdate : handleAdd}>
                    {editingId ? 'Update' : 'Add'} Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Methods List */}
          {paymentMethods.length === 0 && !isAdding ? (
            <Card>
              <CardContent className="p-12 text-center">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No payment methods yet
                </p>
                <Button onClick={() => setIsAdding(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Payment Method
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <Card key={method.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {method.name}
                          </h3>
                          <Badge variant={method.type === 'link' ? 'default' : 'secondary'}>
                            {method.type === 'link' ? 'Link' : 'QR Code'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground break-all">
                          {method.value}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Added {new Date(method.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(method.value)}
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleShare(method)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(method)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(method.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Info Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                How to use
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Add your payment links (Venmo, PayPal, Zelle, Cash App, etc.)</li>
                <li>• Upload QR code images to a public URL and paste the link here</li>
                <li>• Share payment methods with customers via email, text, or any app</li>
                <li>• Keep all your payment options in one place for quick access</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Share Menu */}
      {showShareMenu && (
        <ShareMenu
          method={showShareMenu}
          onClose={() => setShowShareMenu(null)}
        />
      )}
    </div>
  )
}
