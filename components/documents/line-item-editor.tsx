'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { LineItem, LineItemType, LINE_ITEM_TYPE_LABELS } from '@/lib/types/documents'
import { formatCurrency } from '@/lib/utils/document-utils'

interface LineItemEditorProps {
  lineItems: LineItem[]
  onChange: (lineItems: LineItem[]) => void
  taxRate: number
  readOnly?: boolean
}

export function LineItemEditor({ lineItems, onChange, taxRate, readOnly = false }: LineItemEditorProps) {
  const [editingItem, setEditingItem] = useState<Partial<LineItem> | null>(null)

  const handleAddItem = () => {
    if (!editingItem) {
      setEditingItem({
        type: 'labor',
        description: '',
        quantity: 1,
        rate: 0,
        taxable: true,
        order: lineItems.length,
      })
    }
  }

  const handleSaveItem = () => {
    if (!editingItem) return

    const newItem: LineItem = {
      id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: editingItem.type as LineItemType,
      description: editingItem.description || '',
      quantity: editingItem.quantity || 1,
      rate: editingItem.rate || 0,
      amount: (editingItem.quantity || 1) * (editingItem.rate || 0),
      taxable: editingItem.taxable ?? true,
      order: editingItem.order ?? lineItems.length,
    }

    onChange([...lineItems, newItem])
    setEditingItem(null)
  }

  const handleUpdateItem = (id: string, updates: Partial<LineItem>) => {
    const updatedItems = lineItems.map((item) => {
      if (item.id !== id) return item
      const updated = { ...item, ...updates }
      return {
        ...updated,
        amount: updated.quantity * updated.rate,
      }
    })
    onChange(updatedItems)
  }

  const handleDeleteItem = (id: string) => {
    onChange(lineItems.filter((item) => item.id !== id))
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newItems = [...lineItems]
    ;[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
    onChange(newItems.map((item, i) => ({ ...item, order: i })))
  }

  const handleMoveDown = (index: number) => {
    if (index === lineItems.length - 1) return
    const newItems = [...lineItems]
    ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    onChange(newItems.map((item, i) => ({ ...item, order: i })))
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0)
  }

  const calculateTaxableAmount = () => {
    return lineItems.filter((item) => item.taxable).reduce((sum, item) => sum + item.amount, 0)
  }

  const calculateTax = () => {
    return calculateTaxableAmount() * (taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Line Items</h3>
        {!readOnly && (
          <Button onClick={handleAddItem} disabled={editingItem !== null}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-2 py-1 text-sm font-medium text-muted-foreground border-b">
          <div className="col-span-1"></div>
          <div className="col-span-2">Type</div>
          <div className="col-span-3">Description</div>
          <div className="col-span-1 text-right">Qty</div>
          <div className="col-span-2 text-right">Rate</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-1 text-center">Tax</div>
        </div>

        {/* Line Items */}
        {lineItems.map((item, index) => (
          <Card key={item.id} className="p-3">
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-1 flex flex-col gap-1">
                {!readOnly && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === lineItems.length - 1}
                    >
                      ↓
                    </Button>
                  </>
                )}
              </div>

              <div className="col-span-2">
                {readOnly ? (
                  <span className="text-sm">{LINE_ITEM_TYPE_LABELS[item.type]}</span>
                ) : (
                  <Select
                    value={item.type}
                    onValueChange={(value) => handleUpdateItem(item.id, { type: value as LineItemType })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LINE_ITEM_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="col-span-3">
                {readOnly ? (
                  <span className="text-sm">{item.description}</span>
                ) : (
                  <Input
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                    placeholder="Description"
                    className="h-9"
                  />
                )}
              </div>

              <div className="col-span-1">
                {readOnly ? (
                  <span className="text-sm text-right block">{item.quantity}</span>
                ) : (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                    className="h-9 text-right"
                  />
                )}
              </div>

              <div className="col-span-2">
                {readOnly ? (
                  <span className="text-sm text-right block">{formatCurrency(item.rate)}</span>
                ) : (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => handleUpdateItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                    className="h-9 text-right"
                  />
                )}
              </div>

              <div className="col-span-2 text-right font-medium">
                {formatCurrency(item.amount)}
              </div>

              <div className="col-span-1 flex items-center justify-center gap-2">
                {readOnly ? (
                  item.taxable ? '✓' : ''
                ) : (
                  <Checkbox
                    checked={item.taxable}
                    onCheckedChange={(checked) => handleUpdateItem(item.id, { taxable: checked as boolean })}
                  />
                )}
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {/* Add New Item Form */}
        {editingItem && (
          <Card className="p-3 border-dashed border-2">
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-1"></div>

              <div className="col-span-2">
                <Select
                  value={editingItem.type}
                  onValueChange={(value) => setEditingItem({ ...editingItem, type: value as LineItemType })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LINE_ITEM_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3">
                <Input
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Description"
                  className="h-9"
                  autoFocus
                />
              </div>

              <div className="col-span-1">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingItem.quantity || 1}
                  onChange={(e) => setEditingItem({ ...editingItem, quantity: parseFloat(e.target.value) || 1 })}
                  className="h-9 text-right"
                />
              </div>

              <div className="col-span-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingItem.rate || 0}
                  onChange={(e) => setEditingItem({ ...editingItem, rate: parseFloat(e.target.value) || 0 })}
                  className="h-9 text-right"
                />
              </div>

              <div className="col-span-2 text-right font-medium">
                {formatCurrency((editingItem.quantity || 1) * (editingItem.rate || 0))}
              </div>

              <div className="col-span-1 flex items-center justify-center gap-2">
                <Checkbox
                  checked={editingItem.taxable ?? true}
                  onCheckedChange={(checked) => setEditingItem({ ...editingItem, taxable: checked as boolean })}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button onClick={handleSaveItem} size="sm">
                Add Item
              </Button>
              <Button onClick={() => setEditingItem(null)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Totals */}
      <Card className="p-4 bg-muted/50">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax ({taxRate}%):</span>
            <span className="font-medium">{formatCurrency(calculateTax())}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>{formatCurrency(calculateTotal())}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
