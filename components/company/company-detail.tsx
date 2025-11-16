'use client'

import { useState } from 'react'
import { CompanyProfile, COMPANY_TYPE_LABELS, getDaysUntilInsuranceExpiration, getNextDocumentNumber } from '@/lib/types/company'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit,
  Building2,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  Star,
  Palette,
} from 'lucide-react'
import { useTeamStore } from '@/lib/stores/team-store'

interface CompanyDetailProps {
  company: CompanyProfile
  onEdit?: (company: CompanyProfile) => void
}

export function CompanyDetail({ company, onEdit }: CompanyDetailProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const { teamMembers } = useTeamStore()
  const companyTeamMembers = teamMembers.filter((m) => m.companyId === company.id)
  const daysUntilExpiration = getDaysUntilInsuranceExpiration(company)

  const insuranceStatus =
    daysUntilExpiration < 0
      ? { color: 'text-destructive', icon: AlertTriangle, label: 'Expired' }
      : daysUntilExpiration <= 30
      ? { color: 'text-yellow-600', icon: AlertTriangle, label: `Expires in ${daysUntilExpiration} days` }
      : { color: 'text-green-600', icon: CheckCircle, label: 'Active' }

  const StatusIcon = insuranceStatus.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {company.logo ? (
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="h-16 w-16 object-contain border rounded"
            />
          ) : (
            <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">{company.name}</h2>
              {company.isDefault && (
                <Badge variant="default">
                  <Star className="h-3 w-3 mr-1" />
                  Default
                </Badge>
              )}
            </div>
            {company.dba && (
              <p className="text-muted-foreground">DBA: {company.dba}</p>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{COMPANY_TYPE_LABELS[company.type]}</Badge>
            </div>
          </div>
        </div>
        {onEdit && (
          <Button onClick={() => onEdit(company)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="legal">Legal & Insurance</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${company.email}`} className="text-sm hover:underline">
                  {company.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${company.phone}`} className="text-sm hover:underline">
                  {company.phone}
                </a>
              </div>
              {company.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              )}
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <div>{company.address.street}</div>
                  {company.address.street2 && <div>{company.address.street2}</div>}
                  <div>
                    {company.address.city}, {company.address.state} {company.address.zip}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Counters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Document Counters
              </CardTitle>
              <CardDescription>Next document numbers for this company</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Next Estimate</div>
                  <div className="text-2xl font-bold">
                    {getNextDocumentNumber(company, 'estimate')}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Next Work Order</div>
                  <div className="text-2xl font-bold">
                    {getNextDocumentNumber(company, 'workOrder')}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Next Invoice</div>
                  <div className="text-2xl font-bold">
                    {getNextDocumentNumber(company, 'invoice')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Payment Terms</div>
                  <div className="text-sm">{company.settings.defaultPaymentTerms}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Default Tax Rate</div>
                  <div className="text-sm">{company.settings.defaultTaxRate}%</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Online Booking</div>
                  <div className="text-sm">
                    {company.settings.allowOnlineBooking ? (
                      <Badge variant="default" className="bg-green-600">
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Logo on Documents</div>
                  <div className="text-sm">
                    {company.settings.includeLogoOnDocuments ? (
                      <Badge variant="default" className="bg-green-600">
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal & Insurance Tab */}
        <TabsContent value="legal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Business Type</div>
                  <div className="text-sm">{COMPANY_TYPE_LABELS[company.type]}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Tax ID (EIN)</div>
                  <div className="text-sm">{company.taxId}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">License Number</div>
                  <div className="text-sm">{company.licenseNumber}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Insurance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div className={`flex items-center gap-2 ${insuranceStatus.color}`}>
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{insuranceStatus.label}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Expiration Date</div>
                    <div className="text-sm">
                      {new Date(company.insuranceExpiration).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Policy Number</div>
                  <div className="text-sm">{company.insurancePolicyNumber}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Brand Colors
              </CardTitle>
              <CardDescription>Colors used in documents and branding materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Primary Color</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-10 w-10 rounded border"
                      style={{ backgroundColor: company.branding.primaryColor }}
                    />
                    <span className="text-sm font-mono">{company.branding.primaryColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Secondary Color</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-10 w-10 rounded border"
                      style={{ backgroundColor: company.branding.secondaryColor }}
                    />
                    <span className="text-sm font-mono">{company.branding.secondaryColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Accent Color</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-10 w-10 rounded border"
                      style={{ backgroundColor: company.branding.accentColor }}
                    />
                    <span className="text-sm font-mono">{company.branding.accentColor}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {company.logo && (
            <Card>
              <CardHeader>
                <CardTitle>Company Logo</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  className="max-h-32 object-contain border rounded p-4"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Team members associated with this company
              </CardDescription>
            </CardHeader>
            <CardContent>
              {companyTeamMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No team members assigned to this company
                </div>
              ) : (
                <div className="space-y-2">
                  {companyTeamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                      <Badge variant="secondary">{member.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
