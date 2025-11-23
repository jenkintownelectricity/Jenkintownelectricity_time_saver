'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Building2,
  ChevronDown,
  Plus,
  Link,
  Settings,
  LogOut,
  Check,
  Copy,
  Users,
  Zap
} from 'lucide-react'

export default function AccountMenu() {
  const {
    userProfile,
    companyAccounts,
    currentCompanyCode,
    createUserProfile,
    updateUserProfile,
    createCompanyAccount,
    setCurrentCompanyCode,
    linkCompanyToUser,
    connectCompanies
  } = useAppStore()

  const [showDropdown, setShowDropdown] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showCompanySetup, setShowCompanySetup] = useState(false)
  const [showLinkCompany, setShowLinkCompany] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    businessType: 'Electrical',
    address: '',
    phone: '',
    email: ''
  })

  const [linkCode, setLinkCode] = useState('')

  const currentCompany = companyAccounts.find(c => c.companyCode === currentCompanyCode)

  const handleCreateProfile = () => {
    if (!profileForm.name || !profileForm.email) {
      alert('Please enter name and email')
      return
    }
    createUserProfile({
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      linkedCompanies: []
    })
    setShowProfileSetup(false)
    setProfileForm({ name: '', email: '', phone: '' })
  }

  const handleCreateCompany = () => {
    if (!companyForm.companyName) {
      alert('Please enter company name')
      return
    }
    if (!userProfile) {
      alert('Please create your profile first')
      return
    }
    const companyCode = createCompanyAccount({
      companyName: companyForm.companyName,
      businessType: companyForm.businessType,
      address: companyForm.address,
      phone: companyForm.phone,
      email: companyForm.email,
      ownerMemberNumber: userProfile.memberNumber,
      members: [userProfile.memberNumber],
      connectedCompanies: [],
      settings: {
        allowExternalBidding: true,
        requireBidApproval: false,
        defaultCallBonus: 50,
        daytimeCallBonus: 25,
        emergencyCallBonus: 100
      }
    })
    linkCompanyToUser(companyCode)
    setShowCompanySetup(false)
    setCompanyForm({ companyName: '', businessType: 'Electrical', address: '', phone: '', email: '' })
  }

  const handleLinkCompany = () => {
    if (!linkCode.trim()) {
      alert('Please enter a company code')
      return
    }
    linkCompanyToUser(linkCode.trim())
    setLinkCode('')
    setShowLinkCompany(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (!userProfile) {
    // First-time setup
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowProfileSetup(true)}
          className="flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          Create Account
        </Button>

        {/* Profile Setup Modal */}
        {showProfileSetup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Create Your Account
                </CardTitle>
                <CardDescription>
                  Set up your personal profile to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name *</label>
                  <Input
                    placeholder="John Smith"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Email *</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowProfileSetup(false)
                      setProfileForm({ name: '', email: '', phone: '' })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProfile}>
                    Create Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="relative">
      {/* Account Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2"
      >
        <User className="w-4 h-4" />
        <span className="hidden md:inline">{userProfile.name}</span>
        <Badge variant="secondary" className="text-xs hidden lg:inline">
          {userProfile.memberNumber}
        </Badge>
        <ChevronDown className="w-3 h-3" />
      </Button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50">
          <Card className="border-0">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{userProfile.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    Member #{userProfile.memberNumber}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => copyToClipboard(userProfile.memberNumber)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-3 space-y-2">
              {/* Current Company */}
              {currentCompany && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold">{currentCompany.companyName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Code: {currentCompany.companyCode}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => copyToClipboard(currentCompany.companyCode)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Company Switcher */}
              {companyAccounts.length > 1 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground px-2">Switch Company</p>
                  {companyAccounts.map(company => (
                    <Button
                      key={company.companyCode}
                      variant={company.companyCode === currentCompanyCode ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setCurrentCompanyCode(company.companyCode)
                        setShowDropdown(false)
                      }}
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      {company.companyName}
                      {company.companyCode === currentCompanyCode && (
                        <Check className="w-4 h-4 ml-auto" />
                      )}
                    </Button>
                  ))}
                </div>
              )}

              <div className="border-t pt-2 space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setShowCompanySetup(true)
                    setShowDropdown(false)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setShowLinkCompany(true)
                    setShowDropdown(false)
                  }}
                >
                  <Link className="w-4 h-4 mr-2" />
                  Link to Company
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    // Navigate to connected companies management
                    setShowDropdown(false)
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Connected Network
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Company Setup Modal */}
      {showCompanySetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-green-500" />
                Add New Company
              </CardTitle>
              <CardDescription>
                Register a new business/company to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Company Name *</label>
                <Input
                  placeholder="ABC Electric"
                  value={companyForm.companyName}
                  onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Business Type</label>
                <select
                  value={companyForm.businessType}
                  onChange={(e) => setCompanyForm({ ...companyForm, businessType: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="HVAC">HVAC</option>
                  <option value="General Contractor">General Contractor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Address</label>
                <Input
                  placeholder="123 Main St, City, ST 12345"
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Phone</label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  placeholder="info@abcelectric.com"
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCompanySetup(false)
                    setCompanyForm({ companyName: '', businessType: 'Electrical', address: '', phone: '', email: '' })
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateCompany}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Company
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Link Company Modal */}
      {showLinkCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5 text-purple-500" />
                Link to Company
              </CardTitle>
              <CardDescription>
                Enter a company code to link your account to another business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Company Code</label>
                <Input
                  placeholder="ABC-123"
                  value={linkCode}
                  onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Ask the company owner for their 6-character company code
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLinkCompany(false)
                    setLinkCode('')
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleLinkCompany}>
                  <Link className="w-4 h-4 mr-2" />
                  Link Company
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
