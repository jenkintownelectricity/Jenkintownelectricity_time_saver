'use client'

import { useState, useEffect } from 'react'
import { Customer, Address, Contact, isValidEmail, isValidPhone, isValidZip } from '@/lib/types/customers'
import { useCustomerStore } from '@/lib/stores/customer-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { X, Plus, MapPin, User, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CustomerFormProps {
  customer?: Customer
  onSave?: (customer: Customer) => void
  onCancel?: () => void
}

export function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    type: 'residential',
    status: 'active',
    source: 'manual',
    notes: '',
    tags: [],
    addresses: [],
    contacts: [],
    communicationHistory: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tagInput, setTagInput] = useState('')
  const allTags = useCustomerStore((state) => state.getAllTags())

  useEffect(() => {
    if (customer) {
      setFormData(customer)
    }
  }, [customer])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required'
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone is required'
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Invalid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const store = useCustomerStore.getState()

    if (customer) {
      store.updateCustomer(customer.id, formData)
      onSave?.({ ...customer, ...formData } as Customer)
    } else {
      const id = store.addCustomer({
        companyId: '', // Will be set based on current user
        name: formData.name!,
        email: formData.email!,
        phone: formData.phone!,
        company: formData.company,
        type: formData.type!,
        status: formData.status!,
        source: formData.source!,
        notes: formData.notes || '',
        tags: formData.tags || [],
        addresses: formData.addresses || [],
        contacts: formData.contacts || [],
        communicationHistory: formData.communicationHistory || [],
      })
      const newCustomer = store.getCustomer(id)
      if (newCustomer) {
        onSave?.(newCustomer)
      }
    }
  }

  const addAddress = () => {
    const newAddress: Address = {
      id: `temp_${Date.now()}`,
      type: 'service',
      street: '',
      city: '',
      state: '',
      zip: '',
      isPrimary: (formData.addresses?.length || 0) === 0,
    }
    setFormData({
      ...formData,
      addresses: [...(formData.addresses || []), newAddress],
    })
  }

  const updateAddress = (index: number, updates: Partial<Address>) => {
    const newAddresses = [...(formData.addresses || [])]
    newAddresses[index] = { ...newAddresses[index], ...updates }
    setFormData({ ...formData, addresses: newAddresses })
  }

  const removeAddress = (index: number) => {
    const newAddresses = formData.addresses?.filter((_, i) => i !== index) || []
    setFormData({ ...formData, addresses: newAddresses })
  }

  const setPrimaryAddress = (index: number) => {
    const newAddresses = formData.addresses?.map((addr, i) => ({
      ...addr,
      isPrimary: i === index,
    })) || []
    setFormData({ ...formData, addresses: newAddresses })
  }

  const addContact = () => {
    const newContact: Contact = {
      id: `temp_${Date.now()}`,
      name: '',
      role: '',
      email: '',
      phone: '',
      isPrimary: (formData.contacts?.length || 0) === 0,
    }
    setFormData({
      ...formData,
      contacts: [...(formData.contacts || []), newContact],
    })
  }

  const updateContact = (index: number, updates: Partial<Contact>) => {
    const newContacts = [...(formData.contacts || [])]
    newContacts[index] = { ...newContacts[index], ...updates }
    setFormData({ ...formData, contacts: newContacts })
  }

  const removeContact = (index: number) => {
    const newContacts = formData.contacts?.filter((_, i) => i !== index) || []
    setFormData({ ...formData, contacts: newContacts })
  }

  const setPrimaryContact = (index: number) => {
    const newContacts = formData.contacts?.map((contact, i) => ({
      ...contact,
      isPrimary: i === index,
    })) || []
    setFormData({ ...formData, contacts: newContacts })
  }

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !formData.tags?.includes(trimmedTag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), trimmedTag],
      })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Primary customer details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company Name (Optional)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Customer Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: Customer['type']) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Customer['status']) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="potential">Potential</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value: Customer['source']) =>
                  setFormData({ ...formData, source: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vapi">VAPI Call</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the customer..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag(tagInput)
                  }
                }}
                placeholder="Add tags..."
                list="tag-suggestions"
              />
              <datalist id="tag-suggestions">
                {allTags.map((tag) => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
              <Button type="button" onClick={() => addTag(tagInput)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Addresses
              </CardTitle>
              <CardDescription>Customer service and billing addresses</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addAddress}>
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.addresses && formData.addresses.length > 0 ? (
            formData.addresses.map((address, index) => (
              <div key={address.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Select
                      value={address.type}
                      onValueChange={(value: Address['type']) =>
                        updateAddress(index, { type: value })
                      }
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="mailing">Mailing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={address.isPrimary}
                        onCheckedChange={() => setPrimaryAddress(index)}
                      />
                      <Label className="text-sm">Primary</Label>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAddress(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    value={address.street}
                    onChange={(e) => updateAddress(index, { street: e.target.value })}
                    placeholder="Street Address"
                  />
                  <Input
                    value={address.street2}
                    onChange={(e) => updateAddress(index, { street2: e.target.value })}
                    placeholder="Apt, Suite, etc. (Optional)"
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      value={address.city}
                      onChange={(e) => updateAddress(index, { city: e.target.value })}
                      placeholder="City"
                    />
                    <Input
                      value={address.state}
                      onChange={(e) => updateAddress(index, { state: e.target.value })}
                      placeholder="State"
                      maxLength={2}
                    />
                    <Input
                      value={address.zip}
                      onChange={(e) => updateAddress(index, { zip: e.target.value })}
                      placeholder="ZIP"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No addresses added yet. Click "Add Address" to get started.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Additional Contacts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Additional Contacts
              </CardTitle>
              <CardDescription>
                Secondary contacts for this customer
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addContact}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.contacts && formData.contacts.length > 0 ? (
            formData.contacts.map((contact, index) => (
              <div key={contact.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={contact.isPrimary}
                      onCheckedChange={() => setPrimaryContact(index)}
                    />
                    <Label className="text-sm">Primary Contact</Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContact(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={contact.name}
                    onChange={(e) => updateContact(index, { name: e.target.value })}
                    placeholder="Contact Name"
                  />
                  <Input
                    value={contact.role}
                    onChange={(e) => updateContact(index, { role: e.target.value })}
                    placeholder="Role/Title"
                  />
                  <Input
                    value={contact.email}
                    onChange={(e) => updateContact(index, { email: e.target.value })}
                    placeholder="Email"
                    type="email"
                  />
                  <Input
                    value={contact.phone}
                    onChange={(e) => updateContact(index, { phone: e.target.value })}
                    placeholder="Phone"
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No additional contacts added yet. Click "Add Contact" to get started.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {customer ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  )
}
