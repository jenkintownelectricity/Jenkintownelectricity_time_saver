"use client"

import * as React from "react"
import { Plus, Upload, BarChart3, Settings, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ReceiptUpload } from "@/components/receipts/receipt-upload"
import { ReceiptForm } from "@/components/receipts/receipt-form"
import { ReceiptList } from "@/components/receipts/receipt-list"
import { ReceiptDetail } from "@/components/receipts/receipt-detail"
import { ReceiptFilters } from "@/components/receipts/receipt-filters"
import { ReceiptStats } from "@/components/receipts/receipt-stats"
import { CategoryManager } from "@/components/receipts/category-manager"
import { useReceiptStore } from "@/lib/stores/receipt-store"
import { Receipt, OCRResult, ReceiptCategory, PaymentMethod } from "@/lib/types/receipts"

export default function ReceiptsPage() {
  const [activeTab, setActiveTab] = React.useState("receipts")
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false)
  const [newReceiptDialogOpen, setNewReceiptDialogOpen] = React.useState(false)
  const [viewReceiptDialogOpen, setViewReceiptDialogOpen] = React.useState(false)
  const [editReceiptDialogOpen, setEditReceiptDialogOpen] = React.useState(false)
  const [selectedReceipt, setSelectedReceipt] = React.useState<Receipt | null>(null)
  const [ocrData, setOcrData] = React.useState<Partial<Receipt>>({})

  const { addReceipt, updateReceipt } = useReceiptStore()

  const handleFilesSelected = (files: File[]) => {
    console.log("Files selected:", files)
  }

  const handleOCRComplete = (result: OCRResult, file: File) => {
    console.log("OCR complete:", result)

    // Convert OCR result to partial receipt data
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string

      setOcrData({
        vendor: result.vendor || "",
        amount: result.amount || 0,
        date: result.date ? new Date(result.date) : new Date(),
        category: result.category || ReceiptCategory.OTHER,
        description: result.description || "",
        images: [imageUrl],
        ocrText: result.rawText,
      })

      setUploadDialogOpen(false)
      setNewReceiptDialogOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCreateReceipt = (data: any) => {
    addReceipt({
      userId: "demo-user",
      companyId: "demo-company",
      vendor: data.vendor,
      amount: data.amount,
      date: data.date,
      category: data.category,
      paymentMethod: data.paymentMethod,
      description: data.description,
      notes: data.notes || "",
      tags: data.tags || [],
      jobId: data.jobId,
      images: ocrData.images || [],
      ocrText: ocrData.ocrText,
      isTaxDeductible: data.isTaxDeductible,
      isPersonal: data.isPersonal,
    })

    setNewReceiptDialogOpen(false)
    setOcrData({})
  }

  const handleUpdateReceipt = (data: any) => {
    if (selectedReceipt) {
      updateReceipt(selectedReceipt.id, {
        vendor: data.vendor,
        amount: data.amount,
        date: data.date,
        category: data.category,
        paymentMethod: data.paymentMethod,
        description: data.description,
        notes: data.notes || "",
        tags: data.tags || [],
        jobId: data.jobId,
        isTaxDeductible: data.isTaxDeductible,
        isPersonal: data.isPersonal,
      })

      setEditReceiptDialogOpen(false)
      setSelectedReceipt(null)
    }
  }

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt)
    setViewReceiptDialogOpen(true)
  }

  const handleEditReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt)
    setEditReceiptDialogOpen(true)
    setViewReceiptDialogOpen(false)
  }

  const handleEditFromView = (receipt: Receipt) => {
    setViewReceiptDialogOpen(false)
    setEditReceiptDialogOpen(true)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Receipt Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your business expenses
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setNewReceiptDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Receipt
          </Button>
          <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="receipts" className="gap-2">
            <FileText className="h-4 w-4" />
            Receipts
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Settings className="h-4 w-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receipts" className="space-y-6">
          <ReceiptFilters />
          <ReceiptList
            onViewReceipt={handleViewReceipt}
            onEditReceipt={handleEditReceipt}
          />
        </TabsContent>

        <TabsContent value="stats">
          <ReceiptStats />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Upload Receipts</DialogTitle>
            <DialogDescription>
              Upload receipt images. We'll automatically extract information using OCR.
            </DialogDescription>
          </DialogHeader>
          <ReceiptUpload
            onFilesSelected={handleFilesSelected}
            onOCRComplete={handleOCRComplete}
          />
        </DialogContent>
      </Dialog>

      {/* New Receipt Dialog */}
      <Dialog open={newReceiptDialogOpen} onOpenChange={setNewReceiptDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Receipt</DialogTitle>
            <DialogDescription>
              Enter receipt details. OCR data has been pre-filled where available.
            </DialogDescription>
          </DialogHeader>
          <ReceiptForm
            receipt={ocrData}
            onSubmit={handleCreateReceipt}
            onCancel={() => {
              setNewReceiptDialogOpen(false)
              setOcrData({})
            }}
            submitLabel="Create Receipt"
          />
        </DialogContent>
      </Dialog>

      {/* View Receipt Dialog */}
      <Dialog open={viewReceiptDialogOpen} onOpenChange={setViewReceiptDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReceipt && (
            <ReceiptDetail
              receipt={selectedReceipt}
              onClose={() => setViewReceiptDialogOpen(false)}
              onEdit={handleEditFromView}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Receipt Dialog */}
      <Dialog open={editReceiptDialogOpen} onOpenChange={setEditReceiptDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Receipt</DialogTitle>
            <DialogDescription>
              Update receipt information.
            </DialogDescription>
          </DialogHeader>
          {selectedReceipt && (
            <ReceiptForm
              receipt={selectedReceipt}
              onSubmit={handleUpdateReceipt}
              onCancel={() => {
                setEditReceiptDialogOpen(false)
                setSelectedReceipt(null)
              }}
              submitLabel="Update Receipt"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
