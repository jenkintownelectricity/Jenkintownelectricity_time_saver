'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit,
  Trash2,
  Check,
  Star,
  Building2,
  Upload,
  X
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import {
  CompanyProfile,
  createDefaultCompanyProfile,
  getCompanyDisplayName,
  isCompanyConfigured
} from '@/lib/company-profiles'

export default function CompanyProfileManager() {
  const {
    companyProfiles,
    addCompanyProfile,
    updateCompanyProfile,
    deleteCompanyProfile,
    setDefaultCompany,
    saveSettings
  } = useAppStore()

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(createDefaultCompanyProfile())

  const handleAdd = () => {
    addCompanyProfile(formData)
    saveSettings()
    setFormData(createDefaultCompanyProfile())
    setIsAdding(false)
  }

  const handleUpdate = () => {
    if (!editingId) return

    updateCompanyProfile(editingId, formData)
    saveSettings()
    setFormData(createDefaultCompanyProfile())
    setEditingId(null)
    setIsAdding(false)
  }

  const handleEdit = (profile: CompanyProfile) => {
    setFormData(profile)
    setEditingId(profile.id)
    setIsAdding(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this company profile?')) {
      deleteCompanyProfile(id)
      saveSettings()
    }
  }

  const handleSetDefault = (id: string) => {
    setDefaultCompany(id)
    saveSettings()
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData({ ...formData, logo: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Company Profiles</h2>
          <p className="text-muted-foreground mt-1">
            Manage multiple companies and DBAs
          </p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Company/DBA
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit' : 'Add'} Company Profile</CardTitle>
            <CardDescription>
              Add your business information, logo, and branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Upload */}
            <div>
              <label className="text-sm font-medium mb-2 block">Company Logo</label>
              <div className="flex items-center gap-4">
                {formData.logo && (
                  <div className="relative w-24 h-24 rounded border">
                    <img
                      src={formData.logo}
                      alt="Logo"
                      className="w-full h-full object-contain p-2"
                    />
                    <button
                      onClick={() => setFormData({ ...formData, logo: undefined })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Company Name *</label>
                <Input
                  placeholder="ABC Electric"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">DBA Name</label>
                <Input
                  placeholder="Doing Business As (optional)"
                  value={formData.dbaName || ''}
                  onChange={(e) => setFormData({ ...formData, dbaName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Legal Name</label>
                <Input
                  placeholder="Full legal name (optional)"
                  value={formData.legalName || ''}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email *</label>
                <Input
                  type="email"
                  placeholder="contact@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Phone *</label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Website</label>
                <Input
                  placeholder="www.company.com"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-3">
              <h3 className="font-semibold">Address</h3>
              <div>
                <label className="text-sm font-medium mb-1 block">Street Address *</label>
                <Input
                  placeholder="123 Main St"
                  value={formData.address.street1}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, street1: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Suite/Unit</label>
                <Input
                  placeholder="Suite 100"
                  value={formData.address.street2 || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, street2: e.target.value }
                  })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">City *</label>
                  <Input
                    placeholder="City"
                    value={formData.address.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">State *</label>
                  <Input
                    placeholder="PA"
                    value={formData.address.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">ZIP *</label>
                  <Input
                    placeholder="19144"
                    value={formData.address.zip}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, zip: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Tax & Legal */}
            <div className="space-y-3">
              <h3 className="font-semibold">Tax & Legal</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Tax ID (EIN)</label>
                  <Input
                    placeholder="12-3456789"
                    value={formData.taxId || ''}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">License Number</label>
                  <Input
                    placeholder="PA123456"
                    value={formData.licenseNumber || ''}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">License State</label>
                  <Input
                    placeholder="PA"
                    value={formData.licenseState || ''}
                    onChange={(e) => setFormData({ ...formData, licenseState: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Branding */}
            <div className="space-y-3">
              <h3 className="font-semibold">Branding</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Primary Color</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.primaryColor || '#3b82f6'}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.primaryColor || '#3b82f6'}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Secondary Color</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.secondaryColor || '#10b981'}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.secondaryColor || '#10b981'}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      placeholder="#10b981"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Default Settings */}
            <div className="space-y-3">
              <h3 className="font-semibold">Default Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Default Tax Rate (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.defaultTaxRate || 6}
                    onChange={(e) => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Default Payment Terms</label>
                  <Input
                    placeholder="Net 30"
                    value={formData.defaultPaymentTerms || ''}
                    onChange={(e) => setFormData({ ...formData, defaultPaymentTerms: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Default Terms & Conditions</label>
                <textarea
                  value={formData.defaultTermsAndConditions || ''}
                  onChange={(e) => setFormData({ ...formData, defaultTermsAndConditions: e.target.value })}
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                  placeholder="Default terms that will appear on estimates and invoices..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false)
                  setEditingId(null)
                  setFormData(createDefaultCompanyProfile())
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingId ? handleUpdate : handleAdd}>
                {editingId ? 'Update' : 'Add'} Company
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Companies List */}
      <div className="space-y-3">
        {companyProfiles.length === 0 && !isAdding ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No company profiles yet</p>
              <Button className="mt-4" onClick={() => setIsAdding(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Company
              </Button>
            </CardContent>
          </Card>
        ) : (
          companyProfiles.map(profile => (
            <Card key={profile.id} className={profile.isDefault ? 'border-primary' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {/* Logo */}
                    {profile.logo ? (
                      <div className="w-16 h-16 rounded border">
                        <img
                          src={profile.logo}
                          alt={profile.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded border flex items-center justify-center bg-muted">
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{getCompanyDisplayName(profile)}</h3>
                        {profile.isDefault && (
                          <Badge variant="default">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Default
                          </Badge>
                        )}
                        {!isCompanyConfigured(profile) && (
                          <Badge variant="outline" className="text-yellow-600">
                            Incomplete
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {profile.legalName && profile.legalName !== profile.name && (
                          <p>Legal: {profile.legalName}</p>
                        )}
                        <p>{profile.email} • {profile.phone}</p>
                        <p>{profile.address.city}, {profile.address.state}</p>
                        {profile.licenseNumber && (
                          <p>License: {profile.licenseNumber}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!profile.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(profile.id)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(profile)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(profile.id)}
                      disabled={companyProfiles.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
