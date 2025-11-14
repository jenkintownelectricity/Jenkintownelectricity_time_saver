'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { User, Building2, Copy, Check, Plus, Link2, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function AccountMenu() {
  const {
    userAccount,
    companies,
    currentCompanyCode,
    createAccount,
    createCompany,
    switchCompany,
    linkCompany,
  } = useAppStore()

  const [isOpen, setIsOpen] = useState(false)
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [showCreateCompany, setShowCreateCompany] = useState(false)
  const [showLinkCompany, setShowLinkCompany] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [linkCode, setLinkCode] = useState('')

  const [copiedMember, setCopiedMember] = useState(false)
  const [copiedCompany, setCopiedCompany] = useState(false)

  const currentCompany = companies.find((c) => c.code === currentCompanyCode)

  const handleCreateAccount = () => {
    if (name && email && phone && jobTitle) {
      createAccount(name, email, phone, jobTitle)
      setShowCreateAccount(false)
      setName('')
      setEmail('')
      setPhone('')
      setJobTitle('')
    }
  }

  const handleCreateCompany = () => {
    if (companyName) {
      createCompany(companyName)
      setShowCreateCompany(false)
      setCompanyName('')
    }
  }

  const handleLinkCompany = () => {
    if (linkCode) {
      linkCompany(linkCode)
      setShowLinkCompany(false)
      setLinkCode('')
    }
  }

  const copyToClipboard = (text: string, type: 'member' | 'company') => {
    navigator.clipboard.writeText(text)
    if (type === 'member') {
      setCopiedMember(true)
      setTimeout(() => setCopiedMember(false), 2000)
    } else {
      setCopiedCompany(true)
      setTimeout(() => setCopiedCompany(false), 2000)
    }
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <User className="w-4 h-4" />
        {userAccount ? (
          <span className="hidden md:inline">{userAccount.name}</span>
        ) : (
          <span className="hidden md:inline">Account</span>
        )}
        <ChevronDown className="w-4 h-4" />
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-0">
      <div className="bg-background border border-border rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto mt-16 mr-4">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Account</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* No Account - Create Account */}
          {!userAccount && !showCreateAccount && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Create Your Profile
                </CardTitle>
                <CardDescription>
                  Get your unique 8-digit member number
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => setShowCreateAccount(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Account
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Create Account Form */}
          {showCreateAccount && (
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="tel"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  placeholder="Job Title (e.g., Electrician, Owner)"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleCreateAccount}
                  >
                    Create
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateAccount(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Account Info */}
          {userAccount && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {userAccount.name}
                  </span>
                  <Badge variant="outline">{userAccount.memberNumber}</Badge>
                </CardTitle>
                <CardDescription>
                  {userAccount.jobTitle} • {userAccount.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => copyToClipboard(userAccount.memberNumber, 'member')}
                >
                  {copiedMember ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Member Number
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Current Company */}
          {userAccount && currentCompany && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {currentCompany.name}
                  </span>
                  <Badge>{currentCompany.code}</Badge>
                </CardTitle>
                <CardDescription>
                  {currentCompany.members.length} member{currentCompany.members.length !== 1 ? 's' : ''} •{' '}
                  {currentCompany.linkedCompanies.length} linked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => copyToClipboard(currentCompany.code, 'company')}
                >
                  {copiedCompany ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Company Code
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Other Companies */}
          {userAccount && companies.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Switch Company</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {companies.filter((c) => c.code !== currentCompanyCode).map((company) => (
                  <Button
                    key={company.code}
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => switchCompany(company.code)}
                  >
                    <span>{company.name}</span>
                    <Badge variant="outline">{company.code}</Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Create Company */}
          {userAccount && !showCreateCompany && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCreateCompany(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Company
            </Button>
          )}

          {/* Create Company Form */}
          {showCreateCompany && (
            <Card>
              <CardHeader>
                <CardTitle>Create Company</CardTitle>
                <CardDescription>
                  You'll get a unique 6-character code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleCreateCompany}
                  >
                    Create
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateCompany(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Link Company */}
          {userAccount && currentCompany && !showLinkCompany && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowLinkCompany(true)}
            >
              <Link2 className="w-4 h-4 mr-2" />
              Link to Another Company
            </Button>
          )}

          {/* Link Company Form */}
          {showLinkCompany && (
            <Card>
              <CardHeader>
                <CardTitle>Link Company</CardTitle>
                <CardDescription>
                  Enter a company code to join their network
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Company Code (e.g., ELX-A3B)"
                  value={linkCode}
                  onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleLinkCompany}
                  >
                    Link
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowLinkCompany(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
