'use client'

import { useAppStore } from '@/lib/store'
import { getCompanyDisplayName } from '@/lib/company-profiles'
import { Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CompanySelectorProps {
  selectedCompanyId?: string
  onSelect?: (companyId: string) => void
  className?: string
  showLabel?: boolean
}

export default function CompanySelector({
  selectedCompanyId,
  onSelect,
  className = '',
  showLabel = true
}: CompanySelectorProps) {
  const {
    companyProfiles,
    currentCompanyId,
    setCurrentCompany,
    saveSettings
  } = useAppStore()

  // Use provided selectedCompanyId or fall back to current company
  const activeCompanyId = selectedCompanyId || currentCompanyId
  const activeCompany = companyProfiles.find(p => p.id === activeCompanyId) || companyProfiles[0]

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value
    if (onSelect) {
      onSelect(companyId)
    } else {
      setCurrentCompany(companyId)
      saveSettings()
    }
  }

  if (companyProfiles.length === 0) {
    return (
      <div className={className}>
        {showLabel && <label className="text-sm font-medium mb-1 block">Company</label>}
        <div className="flex items-center gap-2 p-2 border rounded text-sm text-muted-foreground">
          <Building2 className="w-4 h-4" />
          <span>No companies configured</span>
        </div>
      </div>
    )
  }

  if (companyProfiles.length === 1) {
    const company = companyProfiles[0]
    return (
      <div className={className}>
        {showLabel && <label className="text-sm font-medium mb-1 block">Company</label>}
        <div className="flex items-center gap-2 p-2 border rounded">
          {company.logo && (
            <img src={company.logo} alt="" className="w-5 h-5 object-contain" />
          )}
          {!company.logo && <Building2 className="w-4 h-4" />}
          <span className="text-sm font-medium">{getCompanyDisplayName(company)}</span>
          {company.isDefault && (
            <Badge variant="secondary" className="text-xs ml-auto">Default</Badge>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {showLabel && <label className="text-sm font-medium mb-1 block">Company</label>}
      <select
        value={activeCompanyId || ''}
        onChange={handleSelect}
        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
      >
        {!activeCompanyId && <option value="">Select company...</option>}
        {companyProfiles.map(profile => (
          <option key={profile.id} value={profile.id}>
            {getCompanyDisplayName(profile)}
            {profile.isDefault ? ' (Default)' : ''}
            {profile.address.city ? ` - ${profile.address.city}, ${profile.address.state}` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
