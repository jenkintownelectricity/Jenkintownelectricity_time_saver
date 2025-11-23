'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Users2, Star } from 'lucide-react'
import { LinkedContact, ContactRole } from '@/lib/entities'

interface LinkedContactsManagerProps {
  linkedContacts: LinkedContact[]
  onChange: (contacts: LinkedContact[]) => void
}

const CONTACT_ROLES: ContactRole[] = [
  'Primary Contact',
  'Billing Contact',
  'Payment Contact',
  'On-Site Contact',
  'Project Manager',
  'Facilities Manager',
  'Property Manager',
  'Tenant',
  'Landlord',
  'Owner',
  'Authorized Representative',
  'Emergency Contact',
  'Other'
]

export default function LinkedContactsManager({ linkedContacts, onChange }: LinkedContactsManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<LinkedContact>>({
    name: '',
    role: 'Primary Contact',
    isPrimary: linkedContacts.length === 0
  })

  const handleAdd = () => {
    if (!formData.name || !formData.role) {
      alert('Please fill in name and role')
      return
    }

    const newContact: LinkedContact = {
      id: `contact_${Date.now()}`,
      name: formData.name!,
      role: formData.role!,
      email: formData.email,
      phone: formData.phone,
      title: formData.title,
      notes: formData.notes,
      isPrimary: formData.isPrimary || linkedContacts.length === 0
    }

    // If setting as primary, unset other primaries
    let updatedContacts = linkedContacts
    if (newContact.isPrimary) {
      updatedContacts = linkedContacts.map(c => ({ ...c, isPrimary: false }))
    }

    onChange([...updatedContacts, newContact])
    setFormData({
      name: '',
      role: 'Primary Contact',
      isPrimary: false
    })
    setIsAdding(false)
  }

  const handleUpdate = () => {
    if (!editingId || !formData.name || !formData.role) {
      alert('Please fill in name and role')
      return
    }

    let updatedContacts = linkedContacts.map(c =>
      c.id === editingId
        ? { ...c, ...formData, id: c.id }
        : c
    )

    // If setting as primary, unset other primaries
    if (formData.isPrimary) {
      updatedContacts = updatedContacts.map(c =>
        c.id === editingId ? c : { ...c, isPrimary: false }
      )
    }

    onChange(updatedContacts)
    setEditingId(null)
    setFormData({
      name: '',
      role: 'Primary Contact',
      isPrimary: false
    })
    setIsAdding(false)
  }

  const handleEdit = (contact: LinkedContact) => {
    setFormData(contact)
    setEditingId(contact.id)
    setIsAdding(true)
  }

  const handleDelete = (id: string) => {
    onChange(linkedContacts.filter(c => c.id !== id))
  }

  const handleSetPrimary = (id: string) => {
    onChange(linkedContacts.map(c => ({ ...c, isPrimary: c.id === id })))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users2 className="w-5 h-5" />
            Additional Contacts
          </CardTitle>
          {!isAdding && (
            <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
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
                  <label className="text-sm font-medium mb-1 block">Contact Name *</label>
                  <Input
                    placeholder="Full Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as ContactRole })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    {CONTACT_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Title/Position</label>
                <Input
                  placeholder="e.g., Property Manager, Tenant, etc."
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Notes</label>
                <Input
                  placeholder="Additional information"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPrimary || false}
                    onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Primary Contact</span>
                </label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false)
                    setEditingId(null)
                    setFormData({
                      name: '',
                      role: 'Primary Contact',
                      isPrimary: false
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={editingId ? handleUpdate : handleAdd}>
                  {editingId ? 'Update' : 'Add'} Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contacts List */}
        {linkedContacts.length === 0 && !isAdding ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No additional contacts added yet
          </p>
        ) : (
          <div className="space-y-3">
            {linkedContacts.map(contact => (
              <Card key={contact.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-semibold text-foreground">{contact.name}</p>
                        {contact.isPrimary && (
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="secondary">{contact.role}</Badge>
                        {contact.title && (
                          <Badge variant="outline">{contact.title}</Badge>
                        )}
                      </div>
                      {contact.email && (
                        <p className="text-sm text-muted-foreground">
                          📧 {contact.email}
                        </p>
                      )}
                      {contact.phone && (
                        <p className="text-sm text-muted-foreground">
                          📞 {contact.phone}
                        </p>
                      )}
                      {contact.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{contact.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-4">
                      {!contact.isPrimary && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSetPrimary(contact.id)}
                          title="Set as primary"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(contact)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(contact.id)}
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
