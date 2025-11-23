'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  ChevronDown,
  Plus,
  Check,
  Star,
  Settings
} from 'lucide-react'

export default function CompanySwitcher() {
  const {
    companyProfiles,
    currentCompanyId,
    setCurrentCompany,
    getDefaultCompany,
    getCurrentCompany
  } = useAppStore()

  const [showDropdown, setShowDropdown] = useState(false)
  const currentCompany = getCurrentCompany()
  const defaultCompany = getDefaultCompany()

  const activeCompanies = companyProfiles.filter(c => c.isActive)

  if (activeCompanies.length === 0) {
    return null
  }

  // If only one company, show simple display
  if (activeCompanies.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{activeCompanies[0].name}</p>
          {activeCompanies[0].dbaName && (
            <p className="text-xs text-muted-foreground">DBA: {activeCompanies[0].dbaName}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <div className="text-left">
            <p className="text-sm font-medium">
              {currentCompany?.name || 'Select Company'}
            </p>
            {currentCompany?.dbaName && (
              <p className="text-xs text-muted-foreground">DBA: {currentCompany.dbaName}</p>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </Button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute top-full mt-2 left-0 w-[320px] bg-card border rounded-lg shadow-lg z-50 max-h-[400px] overflow-auto">
            <div className="p-2">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                YOUR COMPANIES
              </p>

              {activeCompanies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => {
                    setCurrentCompany(company.id)
                    setShowDropdown(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors ${
                    currentCompanyId === company.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{company.name}</p>
                        {company.isDefault && (
                          <Badge variant="outline" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                        {currentCompanyId === company.id && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      {company.dbaName && (
                        <p className="text-xs text-muted-foreground">DBA: {company.dbaName}</p>
                      )}
                      {company.legalName && company.legalName !== company.name && (
                        <p className="text-xs text-muted-foreground">Legal: {company.legalName}</p>
                      )}
                      {company.licenseNumber && (
                        <p className="text-xs text-muted-foreground">Lic: {company.licenseNumber}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}

              <div className="border-t my-2" />

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setShowDropdown(false)
                  // Navigate to company management
                  useAppStore.getState().setCurrentSection('settings')
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Company/DBA
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setShowDropdown(false)
                  // Navigate to company management
                  useAppStore.getState().setCurrentSection('settings')
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Companies
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
