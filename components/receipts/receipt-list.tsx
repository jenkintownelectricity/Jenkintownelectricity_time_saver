"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  Grid3x3,
  List,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Download,
  CheckSquare,
  Square,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useReceiptStore } from "@/lib/stores/receipt-store"
import {
  Receipt,
  formatCurrency,
  getCategoryLabel,
  SortField,
} from "@/lib/types/receipts"

interface ReceiptListProps {
  onViewReceipt?: (receipt: Receipt) => void
  onEditReceipt?: (receipt: Receipt) => void
  className?: string
}

export function ReceiptList({
  onViewReceipt,
  onEditReceipt,
  className,
}: ReceiptListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [receiptToDelete, setReceiptToDelete] = React.useState<string | null>(null)

  const {
    viewMode,
    setViewMode,
    sort,
    setSort,
    selectedReceipts,
    selectReceipt,
    unselectReceipt,
    selectAllReceipts,
    clearSelection,
    getFilteredReceipts,
    deleteReceipt,
    deleteReceipts,
  } = useReceiptStore()

  const receipts = getFilteredReceipts()
  const allSelected = receipts.length > 0 && selectedReceipts.length === receipts.length

  const handleSort = (field: SortField) => {
    if (sort.field === field) {
      setSort({ ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' })
    } else {
      setSort({ field, direction: 'desc' })
    }
  }

  const handleToggleSelectAll = () => {
    if (allSelected) {
      clearSelection()
    } else {
      selectAllReceipts()
    }
  }

  const handleToggleSelect = (id: string) => {
    if (selectedReceipts.includes(id)) {
      unselectReceipt(id)
    } else {
      selectReceipt(id)
    }
  }

  const handleDeleteSelected = () => {
    if (selectedReceipts.length > 0) {
      deleteReceipts(selectedReceipts)
      clearSelection()
    }
  }

  const handleDeleteSingle = (id: string) => {
    setReceiptToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (receiptToDelete) {
      deleteReceipt(receiptToDelete)
      setReceiptToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  if (receipts.length === 0) {
    return (
      <Card className={cn("p-12 text-center", className)}>
        <p className="text-muted-foreground">
          No receipts found. Upload your first receipt to get started.
        </p>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleToggleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedReceipts.length > 0
              ? `${selectedReceipts.length} selected`
              : `${receipts.length} receipts`}
          </span>
          {selectedReceipts.length > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left w-12"></th>
                <th
                  className="p-3 text-left cursor-pointer hover:bg-muted-foreground/10"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="p-3 text-left cursor-pointer hover:bg-muted-foreground/10"
                  onClick={() => handleSort('vendor')}
                >
                  <div className="flex items-center gap-1">
                    Vendor
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="p-3 text-left cursor-pointer hover:bg-muted-foreground/10"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-1">
                    Category
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="p-3 text-right cursor-pointer hover:bg-muted-foreground/10"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Amount
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="p-3 text-center">Tax Deductible</th>
                <th className="p-3 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt) => (
                <tr
                  key={receipt.id}
                  className={cn(
                    "border-t hover:bg-muted/50 transition-colors",
                    selectedReceipts.includes(receipt.id) && "bg-primary/5"
                  )}
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedReceipts.includes(receipt.id)}
                      onCheckedChange={() => handleToggleSelect(receipt.id)}
                    />
                  </td>
                  <td className="p-3 text-sm">
                    {format(new Date(receipt.date), 'MMM d, yyyy')}
                  </td>
                  <td className="p-3 font-medium">{receipt.vendor}</td>
                  <td className="p-3">
                    <Badge variant="outline">
                      {getCategoryLabel(receipt.category)}
                    </Badge>
                  </td>
                  <td className="p-3 text-right font-medium">
                    {formatCurrency(receipt.amount)}
                  </td>
                  <td className="p-3 text-center">
                    {receipt.isTaxDeductible ? (
                      <CheckSquare className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground mx-auto" />
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewReceipt?.(receipt)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditReceipt?.(receipt)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSingle(receipt.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {receipts.map((receipt) => (
            <Card
              key={receipt.id}
              className={cn(
                "overflow-hidden cursor-pointer hover:shadow-lg transition-shadow",
                selectedReceipts.includes(receipt.id) && "ring-2 ring-primary"
              )}
              onClick={() => onViewReceipt?.(receipt)}
            >
              {receipt.images.length > 0 && (
                <div className="aspect-video relative bg-muted">
                  <img
                    src={receipt.images[0]}
                    alt={receipt.vendor}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedReceipts.includes(receipt.id)}
                      onCheckedChange={() => handleToggleSelect(receipt.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{receipt.vendor}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(receipt.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {getCategoryLabel(receipt.category)}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(receipt.amount)}
                </p>
                {receipt.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {receipt.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2">
                  {receipt.isTaxDeductible && (
                    <Badge variant="secondary">Tax Deductible</Badge>
                  )}
                  <div className="flex gap-1 ml-auto">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditReceipt?.(receipt)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteSingle(receipt.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Receipt</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this receipt? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
