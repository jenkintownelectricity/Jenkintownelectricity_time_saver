'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Plus,
  Edit,
  Star,
  Trash2,
  Upload,
  X,
  Check,
  ArrowLeft
} from 'lucide-react'
import type { CompanyProfile } from '@/lib/company-profiles'
import { createDefaultCompanyProfile } from '@/lib/company-profiles'

export default function CompanyManagement() {
  const {
    companyProfiles,
    currentCompanyId,
    addCompanyProfile,
    updateCompanyProfile,
    deleteCompanyProfile,
    setDefaultCompany,
    setCurrentCompany,
    setCurrentSection
  } = useAppStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<CompanyProfile | null>(null)
  const [formData, setFormData] = useState<Partial<CompanyProfile>>(createDefaultCompanyProfile())

  const handleAddCompany = () => {
    const newCompany = {
      ...createDefaultCompanyProfile(),
      ...formData
    }
    addCompanyProfile(newCompany)
    setShowAddModal(false)
    setFormData(createDefaultCompanyProfile())
  }

  const handleUpdateCompany = () => {
    if (editingCompany) {
      updateCompanyProfile(editingCompany.id, formData)
      setEditingCompany(null)
      setFormData(createDefaultCompanyProfile())
    }
  }

  const handleEditClick = (company: CompanyProfile) => {
    setEditingCompany(company)
    setFormData(company)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData({ ...formData, logo: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const renderForm = () => (
    <div className="space-y-4">
      {/* Logo Upload */}
      <div>
        <label className="text-sm font-medium mb-2 block">Company Logo</label>
        <div className="flex items-center gap-4">
          {formData.logo && (
            <div className="relative w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50">
              <img
                src={formData.logo}
                alt="Logo"
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={() => setFormData({ ...formData, logo: undefined })}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />
            <label htmlFor="logo-upload">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {formData.logo ? 'Change Logo' : 'Upload Logo'}
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, or SVG (recommended 200x200px)
            </p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm font-medium mb-2 block">Company Name *</label>
          <Input
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ABC Electrical Services"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">DBA Name</label>
          <Input
            value={formData.dbaName || ''}
            onChange={(e) => setFormData({ ...formData, dbaName: e.target.value })}
            placeholder="Doing Business As"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Legal Name</label>
          <Input
            value={formData.legalName || ''}
            onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
            placeholder="ABC Electrical LLC"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Email *</label>
          <Input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="info@company.com"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Phone *</label>
          <Input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium mb-2 block">Website</label>
          <Input
            value={formData.website || ''}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://www.company.com"
          />
        </div>
      </div>

      {/* Address */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-3">Address</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              value={formData.address?.street1 || ''}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address!, street1: e.target.value }
              })}
              placeholder="Street Address"
            />
          </div>
          <div className="col-span-2">
            <Input
              value={formData.address?.street2 || ''}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address!, street2: e.target.value }
              })}
              placeholder="Suite, Unit, Building (optional)"
            />
          </div>
          <div>
            <Input
              value={formData.address?.city || ''}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address!, city: e.target.value }
              })}
              placeholder="City"
            />
          </div>
          <div>
            <Input
              value={formData.address?.state || ''}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address!, state: e.target.value }
              })}
              placeholder="State"
            />
          </div>
          <div>
            <Input
              value={formData.address?.zip || ''}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address!, zip: e.target.value }
              })}
              placeholder="ZIP Code"
            />
          </div>
          <div>
            <Input
              value={formData.address?.country || 'USA'}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address!, country: e.target.value }
              })}
              placeholder="Country"
            />
          </div>
        </div>
      </div>

      {/* License & Tax */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-3">License & Tax Information</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">License Number</label>
            <Input
              value={formData.licenseNumber || ''}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              placeholder="12345"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">License State</label>
            <Input
              value={formData.licenseState || ''}
              onChange={(e) => setFormData({ ...formData, licenseState: e.target.value })}
              placeholder="PA"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-muted-foreground mb-2 block">Tax ID (EIN)</label>
            <Input
              value={formData.taxId || ''}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              placeholder="12-3456789"
            />
          </div>
        </div>
      </div>

      {/* Branding Colors */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-3">Brand Colors</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Primary Color</label>
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
            <label className="text-sm text-muted-foreground mb-2 block">Secondary Color</label>
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

      {/* Document Settings */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-3">Document Defaults</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Default Tax Rate (%)</label>
            <Input
              type="number"
              step="0.1"
              value={formData.defaultTaxRate || 0}
              onChange={(e) => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Payment Terms</label>
            <Input
              value={formData.defaultPaymentTerms || 'Net 30'}
              onChange={(e) => setFormData({ ...formData, defaultPaymentTerms: e.target.value })}
              placeholder="Net 30"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => {
            setShowAddModal(false)
            setEditingCompany(null)
            setFormData(createDefaultCompanyProfile())
          }}
        >
          Cancel
        </Button>
        <Button onClick={editingCompany ? handleUpdateCompany : handleAddCompany}>
          {editingCompany ? 'Update Company' : 'Add Company'}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentSection('settings')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">Company Management</h2>
            <p className="text-muted-foreground">
              Manage your companies and DBAs
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Company/DBA
        </Button>
      </div>

      {/* Company List */}
      <div className="grid gap-4 md:grid-cols-2">
        {companyProfiles.filter(c => c.isActive).map((company) => (
          <Card key={company.id} className={currentCompanyId === company.id ? 'border-2 border-primary' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-12 h-12 object-contain border rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {company.name}
                      {company.isDefault && (
                        <Badge variant="outline">
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      {currentCompanyId === company.id && (
                        <Badge>Current</Badge>
                      )}
                    </CardTitle>
                    {company.dbaName && (
                      <p className="text-sm text-muted-foreground">DBA: {company.dbaName}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="text-muted-foreground">Email: {company.email}</p>
                <p className="text-muted-foreground">Phone: {company.phone}</p>
                {company.licenseNumber && (
                  <p className="text-muted-foreground">License: {company.licenseNumber}</p>
                )}
              </div>

              <div className="flex gap-2">
                {currentCompanyId !== company.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentCompany(company.id)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Set Current
                  </Button>
                )}
                {!company.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDefaultCompany(company.id)}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Set Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(company)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                {companyProfiles.length > 1 && !company.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete ${company.name}?`)) {
                        deleteCompanyProfile(company.id)
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingCompany) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle>
                {editingCompany ? `Edit ${editingCompany.name}` : 'Add New Company/DBA'}
              </CardTitle>
              <CardDescription>
                {editingCompany
                  ? 'Update company information and branding'
                  : 'Create a new company profile or DBA for document generation'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderForm()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
