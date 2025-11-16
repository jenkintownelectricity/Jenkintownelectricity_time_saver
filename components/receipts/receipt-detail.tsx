"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  X,
  Edit,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Receipt, formatCurrency, getCategoryLabel } from "@/lib/types/receipts"
import { useReceiptStore } from "@/lib/stores/receipt-store"

interface ReceiptDetailProps {
  receipt: Receipt
  onClose?: () => void
  onEdit?: (receipt: Receipt) => void
  className?: string
}

export function ReceiptDetail({
  receipt,
  onClose,
  onEdit,
  className,
}: ReceiptDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

  const { deleteReceipt } = useReceiptStore()

  const handleDelete = () => {
    deleteReceipt(receipt.id)
    setDeleteDialogOpen(false)
    onClose?.()
  }

  const nextImage = () => {
    if (receipt.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === receipt.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const previousImage = () => {
    if (receipt.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? receipt.images.length - 1 : prev - 1
      )
    }
  }

  const downloadImage = () => {
    if (receipt.images[currentImageIndex]) {
      const link = document.createElement('a')
      link.href = receipt.images[currentImageIndex]
      link.download = `${receipt.vendor}_${format(new Date(receipt.date), 'yyyy-MM-dd')}.jpg`
      link.click()
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{receipt.vendor}</h2>
          <p className="text-muted-foreground">
            {format(new Date(receipt.date), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit?.(receipt)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2 text-destructive" />
            Delete
          </Button>
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Amount */}
      <Card className="p-6 bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-3xl font-bold">{formatCurrency(receipt.amount)}</p>
          </div>
        </div>
      </Card>

      {/* Images */}
      {receipt.images.length > 0 && (
        <Card className="overflow-hidden">
          <div className="relative aspect-video bg-muted">
            <img
              src={receipt.images[currentImageIndex]}
              alt={`Receipt ${currentImageIndex + 1}`}
              className="object-contain w-full h-full"
            />
            {receipt.images.length > 1 && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute left-2 top-1/2 -translate-y-1/2"
                  onClick={previousImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {receipt.images.length}
                </div>
              </>
            )}
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={downloadImage}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Tag className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{getCategoryLabel(receipt.category)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-medium capitalize">
                {receipt.paymentMethod.replace('_', ' ')}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Tax Year / Quarter</p>
              <p className="font-medium">
                {receipt.taxYear} Q{receipt.taxQuarter}
              </p>
            </div>
          </div>
        </Card>

        {receipt.jobId && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <LinkIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Linked Job</p>
                <p className="font-medium">{receipt.jobId}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Description */}
      {receipt.description && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground">{receipt.description}</p>
        </Card>
      )}

      {/* Notes */}
      {receipt.notes && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {receipt.notes}
          </p>
        </Card>
      )}

      {/* Tags */}
      {receipt.tags.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {receipt.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Flags */}
      <div className="flex gap-4">
        {receipt.isTaxDeductible && (
          <Card className="p-4 flex items-center gap-3 flex-1">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium">Tax Deductible</span>
          </Card>
        )}
        {receipt.isPersonal && (
          <Card className="p-4 flex items-center gap-3 flex-1">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Personal Expense</span>
          </Card>
        )}
      </div>

      {/* OCR Text */}
      {receipt.ocrText && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">OCR Text</h3>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-muted p-3 rounded">
            {receipt.ocrText}
          </pre>
        </Card>
      )}

      {/* Metadata */}
      <Card className="p-4 bg-muted/50">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Receipt ID: {receipt.id}</p>
          <p>Created: {format(new Date(receipt.createdAt), 'PPpp')}</p>
          <p>Last Updated: {format(new Date(receipt.updatedAt), 'PPpp')}</p>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Receipt</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the receipt from {receipt.vendor} for{' '}
              {formatCurrency(receipt.amount)}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
