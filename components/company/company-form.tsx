'use client'

import { useState, useRef } from 'react'
import { useCompanyStore } from '@/lib/stores/company-store'
import {
  CompanyProfile,
  COMPANY_TYPE_LABELS,
  DEFAULT_BRANDING,
  DEFAULT_COMPANY_SETTINGS,
  DEFAULT_DOCUMENT_COUNTERS,
} from '@/lib/types/company'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, X, Building2 } from 'lucide-react'

interface CompanyFormProps {
  company?: CompanyProfile
  onSave?: (company: CompanyProfile) => void
  onCancel?: () => void
}

export function CompanyForm({ company, onSave, onCancel }: CompanyFormProps) {
  const { addCompany, updateCompany, getCompany } = useCompanyStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState({
    name: company?.name || '',
    dba: company?.dba || '',
    type: company?.type || ('llc' as CompanyProfile['type']),
    logo: company?.logo || '',
    street: company?.address.street || '',
    street2: company?.address.street2 || '',
    city: company?.address.city || '',
    state: company?.address.state || '',
    zip: company?.address.zip || '',
    phone: company?.phone || '',
    email: company?.email || '',
    website: company?.website || '',
    taxId: company?.taxId || '',
    licenseNumber: company?.licenseNumber || '',
    insurancePolicyNumber: company?.insurancePolicyNumber || '',
    insuranceExpiration: company?.insuranceExpiration
      ? new Date(company.insuranceExpiration).toISOString().split('T')[0]
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isDefault: company?.isDefault ?? false,
    branding: company?.branding || DEFAULT_BRANDING,
    settings: company?.settings || DEFAULT_COMPANY_SETTINGS,
    documentCounters: company?.documentCounters || DEFAULT_DOCUMENT_COUNTERS,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    }

    if (!formData.taxId.trim()) {
      newErrors.taxId = 'Tax ID (EIN) is required'
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required'
    }

    if (!formData.insurancePolicyNumber.trim()) {
      newErrors.insurancePolicyNumber = 'Insurance policy number is required'
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    }

    if (!formData.zip.trim()) {
      newErrors.zip = 'ZIP code is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const companyData = {
      name: formData.name,
      dba: formData.dba || undefined,
      type: formData.type,
      logo: formData.logo || undefined,
      address: {
        id: company?.address.id || `addr_${Date.now()}`,
        type: 'billing' as const,
        street: formData.street,
        street2: formData.street2 || undefined,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        isPrimary: true,
      },
      phone: formData.phone,
      email: formData.email,
      website: formData.website || undefined,
      taxId: formData.taxId,
      licenseNumber: formData.licenseNumber,
      insurancePolicyNumber: formData.insurancePolicyNumber,
      insuranceExpiration: new Date(formData.insuranceExpiration),
      isDefault: formData.isDefault,
      branding: formData.branding,
      settings: formData.settings,
      documentCounters: formData.documentCounters,
    }

    if (company) {
      // Update existing company
      updateCompany(company.id, companyData)
      const updatedCompany = getCompany(company.id)
      if (updatedCompany && onSave) {
        onSave(updatedCompany)
      }
    } else {
      // Create new company
      const id = addCompany(companyData)
      const newCompany = getCompany(id)
      if (newCompany && onSave) {
        onSave(newCompany)
      }
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logo: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Enter your company's basic information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  {formData.logo ? (
                    <div className="relative">
                      <img
                        src={formData.logo}
                        alt="Company logo"
                        className="h-24 w-24 object-contain border rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-24 w-24 border-2 border-dashed rounded flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Recommended: Square image, at least 200x200px
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jenkintown Electricity"
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dba">DBA (Doing Business As)</Label>
                  <Input
                    id="dba"
                    value={formData.dba}
                    onChange={(e) => setFormData({ ...formData, dba: e.target.value })}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Business Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as CompanyProfile['type'] })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(COMPANY_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@company.com"
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Business Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="street">
                      Street Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="123 Main St"
                    />
                    {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="street2">Street Address 2</Label>
                    <Input
                      id="street2"
                      value={formData.street2}
                      onChange={(e) => setFormData({ ...formData, street2: e.target.value })}
                      placeholder="Suite, Floor, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Jenkintown"
                    />
                    {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">
                      State <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="PA"
                      maxLength={2}
                    />
                    {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip">
                      ZIP Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="zip"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      placeholder="19046"
                    />
                    {errors.zip && <p className="text-sm text-destructive">{errors.zip}</p>}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isDefault: checked as boolean })
                  }
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Set as default company
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Information Tab */}
        <TabsContent value="legal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Legal & Licensing Information</CardTitle>
              <CardDescription>
                Enter your business licenses and insurance information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">
                    Tax ID (EIN) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="12-3456789"
                  />
                  {errors.taxId && <p className="text-sm text-destructive">{errors.taxId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">
                    License Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="PA-12345"
                  />
                  {errors.licenseNumber && (
                    <p className="text-sm text-destructive">{errors.licenseNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurancePolicyNumber">
                    Insurance Policy Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="insurancePolicyNumber"
                    value={formData.insurancePolicyNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, insurancePolicyNumber: e.target.value })
                    }
                    placeholder="POL-123456"
                  />
                  {errors.insurancePolicyNumber && (
                    <p className="text-sm text-destructive">{errors.insurancePolicyNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceExpiration">
                    Insurance Expiration <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="insuranceExpiration"
                    type="date"
                    value={formData.insuranceExpiration}
                    onChange={(e) =>
                      setFormData({ ...formData, insuranceExpiration: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Document Counters */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium">Document Counters</h3>
                <p className="text-sm text-muted-foreground">
                  Starting numbers for estimates, work orders, and invoices
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimateCounter">Estimate Counter</Label>
                    <Input
                      id="estimateCounter"
                      type="number"
                      value={formData.documentCounters.estimateCounter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          documentCounters: {
                            ...formData.documentCounters,
                            estimateCounter: parseInt(e.target.value) || 1000,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workOrderCounter">Work Order Counter</Label>
                    <Input
                      id="workOrderCounter"
                      type="number"
                      value={formData.documentCounters.workOrderCounter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          documentCounters: {
                            ...formData.documentCounters,
                            workOrderCounter: parseInt(e.target.value) || 1000,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoiceCounter">Invoice Counter</Label>
                    <Input
                      id="invoiceCounter"
                      type="number"
                      value={formData.documentCounters.invoiceCounter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          documentCounters: {
                            ...formData.documentCounters,
                            invoiceCounter: parseInt(e.target.value) || 1000,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>
                Customize the colors used in your documents and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.branding.primaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, primaryColor: e.target.value },
                        })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.branding.primaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, primaryColor: e.target.value },
                        })
                      }
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.branding.secondaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, secondaryColor: e.target.value },
                        })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.branding.secondaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, secondaryColor: e.target.value },
                        })
                      }
                      placeholder="#64748b"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={formData.branding.accentColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, accentColor: e.target.value },
                        })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.branding.accentColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, accentColor: e.target.value },
                        })
                      }
                      placeholder="#10b981"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Settings</CardTitle>
              <CardDescription>Configure default settings for this company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeLogoOnDocuments"
                    checked={formData.settings.includeLogoOnDocuments}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          includeLogoOnDocuments: checked as boolean,
                        },
                      })
                    }
                  />
                  <label
                    htmlFor="includeLogoOnDocuments"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include logo on documents
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeTaxInEstimates"
                    checked={formData.settings.includeTaxInEstimates}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          includeTaxInEstimates: checked as boolean,
                        },
                      })
                    }
                  />
                  <label
                    htmlFor="includeTaxInEstimates"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include tax in estimates
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowOnlineBooking"
                    checked={formData.settings.allowOnlineBooking}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          allowOnlineBooking: checked as boolean,
                        },
                      })
                    }
                  />
                  <label
                    htmlFor="allowOnlineBooking"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Allow online booking
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultPaymentTerms">Default Payment Terms</Label>
                  <Input
                    id="defaultPaymentTerms"
                    value={formData.settings.defaultPaymentTerms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: { ...formData.settings, defaultPaymentTerms: e.target.value },
                      })
                    }
                    placeholder="Net 30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                  <Input
                    id="defaultTaxRate"
                    type="number"
                    step="0.01"
                    value={formData.settings.defaultTaxRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          defaultTaxRate: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    placeholder="6.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{company ? 'Update' : 'Create'} Company</Button>
      </div>
    </form>
  )
}
