'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Trash2,
  Search,
  ShoppingCart,
  Wrench,
  Users,
  DollarSign,
  X
} from 'lucide-react'
import {
  LineItem,
  LineItemType,
  createLineItem,
  calculateLineItemSubtotal,
  COMMON_UNITS,
  LABOR_TYPES,
  MATERIAL_SOURCES,
  searchMaterials,
  MaterialPrice
} from '@/lib/line-items'

interface LineItemEditorProps {
  lineItems: LineItem[]
  onChange: (items: LineItem[]) => void
  taxRate?: number
}

export default function LineItemEditor({ lineItems, onChange, taxRate = 6 }: LineItemEditorProps) {
  const [showAddItem, setShowAddItem] = useState(false)
  const [selectedType, setSelectedType] = useState<LineItemType>('material')
  const [searchQuery, setSearchQuery] = useState('')
  const [materialResults, setMaterialResults] = useState<MaterialPrice[]>([])
  const [showMaterialSearch, setShowMaterialSearch] = useState(false)

  const [itemForm, setItemForm] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0,
    unit: 'ea',
    taxable: true,
    materialSource: '',
    partNumber: '',
    laborType: '',
    subcontractorName: ''
  })

  const handleAddItem = () => {
    if (!itemForm.description) {
      alert('Please enter a description')
      return
    }

    const newItem = createLineItem(
      selectedType,
      itemForm.description,
      itemForm.quantity,
      itemForm.unitPrice,
      itemForm.unit
    )

    // Add type-specific fields
    if (selectedType === 'material') {
      newItem.materialSource = itemForm.materialSource
      newItem.partNumber = itemForm.partNumber
    } else if (selectedType === 'labor') {
      newItem.laborType = itemForm.laborType
      newItem.taxable = false // Labor is always non-taxable
    } else if (selectedType === 'subcontractor') {
      newItem.subcontractorName = itemForm.subcontractorName
    }

    newItem.taxable = itemForm.taxable
    newItem.subtotal = calculateLineItemSubtotal(newItem)

    onChange([...lineItems, newItem])

    // Reset form
    setItemForm({
      description: '',
      quantity: 1,
      unitPrice: 0,
      unit: 'ea',
      taxable: selectedType !== 'labor',
      materialSource: '',
      partNumber: '',
      laborType: '',
      subcontractorName: ''
    })
    setShowAddItem(false)
  }

  const handleDeleteItem = (id: string) => {
    onChange(lineItems.filter(item => item.id !== id))
  }

  const handleUpdateItem = (id: string, field: keyof LineItem, value: any) => {
    const updated = lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        // Recalculate subtotal if quantity or unitPrice changed
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.subtotal = calculateLineItemSubtotal(updatedItem)
        }
        return updatedItem
      }
      return item
    })
    onChange(updated)
  }

  const handleMaterialSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length >= 2) {
      const results = searchMaterials(query)
      setMaterialResults(results)
      setShowMaterialSearch(true)
    } else {
      setMaterialResults([])
      setShowMaterialSearch(false)
    }
  }

  const handleSelectMaterial = (material: MaterialPrice) => {
    setItemForm({
      ...itemForm,
      description: material.description,
      unitPrice: material.price,
      unit: material.unit,
      materialSource: material.source,
      partNumber: material.partNumber || ''
    })
    setSearchQuery('')
    setShowMaterialSearch(false)
    setMaterialResults([])
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0)
  const taxableAmount = lineItems.filter(item => item.taxable).reduce((sum, item) => sum + item.subtotal, 0)
  const taxAmount = (taxableAmount * taxRate) / 100
  const total = subtotal + taxAmount

  const getTypeIcon = (type: LineItemType) => {
    switch (type) {
      case 'material':
        return <ShoppingCart className="w-4 h-4" />
      case 'labor':
        return <Wrench className="w-4 h-4" />
      case 'subcontractor':
        return <Users className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Line Items</CardTitle>
          {!showAddItem && (
            <Button size="sm" onClick={() => setShowAddItem(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Item Form */}
        {showAddItem && (
          <Card className="border-primary/50">
            <CardContent className="p-4 space-y-4">
              {/* Type Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Item Type</label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedType === 'material' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedType('material')
                      setItemForm({ ...itemForm, taxable: true })
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Material
                  </Button>
                  <Button
                    variant={selectedType === 'labor' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedType('labor')
                      setItemForm({ ...itemForm, taxable: false, unit: 'hr' })
                    }}
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Labor
                  </Button>
                  <Button
                    variant={selectedType === 'subcontractor' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedType('subcontractor')
                      setItemForm({ ...itemForm, taxable: false, unit: 'lump sum' })
                    }}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Subcontractor
                  </Button>
                </div>
              </div>

              {/* Material Search (only for materials) */}
              {selectedType === 'material' && (
                <div className="relative">
                  <label className="text-sm font-medium mb-1 block">Quick Material Lookup</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search Lowes, Home Depot..."
                      value={searchQuery}
                      onChange={(e) => handleMaterialSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Search Results */}
                  {showMaterialSearch && materialResults.length > 0 && (
                    <Card className="absolute z-10 w-full mt-1 max-h-64 overflow-y-auto">
                      <CardContent className="p-2">
                        {materialResults.map((material, idx) => (
                          <div
                            key={idx}
                            className="p-2 hover:bg-muted rounded cursor-pointer"
                            onClick={() => handleSelectMaterial(material)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{material.description}</p>
                                <p className="text-xs text-muted-foreground">{material.source}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">${material.price.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">/{material.unit}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-1 block">Description *</label>
                <Input
                  placeholder={
                    selectedType === 'material' ? 'e.g., 12/2 Romex Wire' :
                    selectedType === 'labor' ? 'e.g., Install outlets' :
                    'e.g., Plumbing rough-in'
                  }
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                />
              </div>

              {/* Type-specific fields */}
              {selectedType === 'labor' && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Labor Type</label>
                  <select
                    value={itemForm.laborType}
                    onChange={(e) => setItemForm({ ...itemForm, laborType: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Select type...</option>
                    {LABOR_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedType === 'material' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Source</label>
                    <select
                      value={itemForm.materialSource}
                      onChange={(e) => setItemForm({ ...itemForm, materialSource: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select source...</option>
                      {MATERIAL_SOURCES.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Part #</label>
                    <Input
                      placeholder="Optional"
                      value={itemForm.partNumber}
                      onChange={(e) => setItemForm({ ...itemForm, partNumber: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {selectedType === 'subcontractor' && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Subcontractor Name</label>
                  <Input
                    placeholder="e.g., ABC Plumbing"
                    value={itemForm.subcontractorName}
                    onChange={(e) => setItemForm({ ...itemForm, subcontractorName: e.target.value })}
                  />
                </div>
              )}

              {/* Quantity, Price, Unit */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Quantity</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Unit Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={itemForm.unitPrice}
                    onChange={(e) => setItemForm({ ...itemForm, unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Unit</label>
                  <select
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    {COMMON_UNITS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Taxable (not shown for labor as it's always non-taxable) */}
              {selectedType !== 'labor' && (
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemForm.taxable}
                      onChange={(e) => setItemForm({ ...itemForm, taxable: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Taxable</span>
                  </label>
                </div>
              )}

              {selectedType === 'labor' && (
                <p className="text-xs text-muted-foreground">
                  Labor is automatically marked as non-taxable
                </p>
              )}

              {/* Subtotal Preview */}
              <div className="bg-muted p-3 rounded">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">
                    ${(itemForm.quantity * itemForm.unitPrice).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddItem(false)
                    setItemForm({
                      description: '',
                      quantity: 1,
                      unitPrice: 0,
                      unit: 'ea',
                      taxable: true,
                      materialSource: '',
                      partNumber: '',
                      laborType: '',
                      subcontractorName: ''
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddItem}>
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Line Items List */}
        {lineItems.length === 0 && !showAddItem ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No items added yet</p>
            <Button className="mt-4" size="sm" onClick={() => setShowAddItem(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {lineItems.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">#{index + 1}</span>
                      {getTypeIcon(item.type)}
                      <span className="font-medium">{item.description}</span>
                      {!item.taxable && (
                        <Badge variant="outline" className="text-xs">Non-Taxable</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>{item.quantity} {item.unit} × ${item.unitPrice.toFixed(2)}</span>
                      {item.materialSource && <span>({item.materialSource})</span>}
                      {item.laborType && <span>({item.laborType})</span>}
                      {item.subcontractorName && <span>({item.subcontractorName})</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Totals */}
        {lineItems.length > 0 && (
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Taxable Amount:</span>
              <span>${taxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax ({taxRate}%):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
