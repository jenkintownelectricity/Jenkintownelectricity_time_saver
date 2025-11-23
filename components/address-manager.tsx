'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, MapPin, Check } from 'lucide-react'
import { ContactAddress, AddressType } from '@/lib/entities'

interface AddressManagerProps {
  addresses: ContactAddress[]
  onChange: (addresses: ContactAddress[]) => void
}

const ADDRESS_TYPES: AddressType[] = ['Billing', 'Shipping', 'Project Site', 'Office', 'Home', 'Other']

export default function AddressManager({ addresses, onChange }: AddressManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<ContactAddress>>({
    type: 'Billing',
    isPrimary: addresses.length === 0,
    street1: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA'
  })

  const handleAdd = () => {
    if (!formData.street1 || !formData.city || !formData.state || !formData.zip) {
      alert('Please fill in all required fields')
      return
    }

    const newAddress: ContactAddress = {
      id: `addr_${Date.now()}`,
      type: formData.type!,
      isPrimary: formData.isPrimary || addresses.length === 0,
      street1: formData.street1!,
      street2: formData.street2,
      city: formData.city!,
      state: formData.state!,
      zip: formData.zip!,
      country: formData.country || 'USA',
      notes: formData.notes
    }

    // If setting as primary, unset other primaries
    let updatedAddresses = addresses
    if (newAddress.isPrimary) {
      updatedAddresses = addresses.map(a => ({ ...a, isPrimary: false }))
    }

    onChange([...updatedAddresses, newAddress])
    setFormData({
      type: 'Billing',
      isPrimary: false,
      street1: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA'
    })
    setIsAdding(false)
  }

  const handleUpdate = () => {
    if (!editingId || !formData.street1 || !formData.city || !formData.state || !formData.zip) {
      alert('Please fill in all required fields')
      return
    }

    let updatedAddresses = addresses.map(a =>
      a.id === editingId
        ? { ...a, ...formData, id: a.id }
        : a
    )

    // If setting as primary, unset other primaries
    if (formData.isPrimary) {
      updatedAddresses = updatedAddresses.map(a =>
        a.id === editingId ? a : { ...a, isPrimary: false }
      )
    }

    onChange(updatedAddresses)
    setEditingId(null)
    setFormData({
      type: 'Billing',
      isPrimary: false,
      street1: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA'
    })
    setIsAdding(false)
  }

  const handleEdit = (address: ContactAddress) => {
    setFormData(address)
    setEditingId(address.id)
    setIsAdding(true)
  }

  const handleDelete = (id: string) => {
    onChange(addresses.filter(a => a.id !== id))
  }

  const handleSetPrimary = (id: string) => {
    onChange(addresses.map(a => ({ ...a, isPrimary: a.id === id })))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Addresses
          </CardTitle>
          {!isAdding && (
            <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add/Edit Form */}
        {isAdding && (
          <Card className="border-primary/50">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Address Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AddressType })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    {ADDRESS_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPrimary || false}
                      onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Primary Address</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Street Address *</label>
                <Input
                  placeholder="123 Main St"
                  value={formData.street1 || ''}
                  onChange={(e) => setFormData({ ...formData, street1: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Street Address 2</label>
                <Input
                  placeholder="Apt, Suite, Building"
                  value={formData.street2 || ''}
                  onChange={(e) => setFormData({ ...formData, street2: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">City *</label>
                  <Input
                    placeholder="City"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">State *</label>
                  <Input
                    placeholder="State"
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">ZIP *</label>
                  <Input
                    placeholder="ZIP"
                    value={formData.zip || ''}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Notes</label>
                <Input
                  placeholder="Special instructions, gate codes, etc."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false)
                    setEditingId(null)
                    setFormData({
                      type: 'Billing',
                      isPrimary: false,
                      street1: '',
                      city: '',
                      state: '',
                      zip: '',
                      country: 'USA'
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={editingId ? handleUpdate : handleAdd}>
                  {editingId ? 'Update' : 'Add'} Address
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Addresses List */}
        {addresses.length === 0 && !isAdding ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No addresses added yet
          </p>
        ) : (
          <div className="space-y-3">
            {addresses.map(address => (
              <Card key={address.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{address.type}</Badge>
                        {address.isPrimary && (
                          <Badge variant="default" className="bg-green-600">Primary</Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground">{address.street1}</p>
                      {address.street2 && (
                        <p className="text-sm text-muted-foreground">{address.street2}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state} {address.zip}
                      </p>
                      {address.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{address.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-4">
                      {!address.isPrimary && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSetPrimary(address.id)}
                          title="Set as primary"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(address)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(address.id)}
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
      </CardContent>
    </Card>
  )
}
