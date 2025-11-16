'use client'

import { useCompanyStore } from '@/lib/stores/company-store'
import { getDisplayName } from '@/lib/types/company'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Building2, Check, ChevronDown } from 'lucide-react'

interface CompanySwitcherProps {
  className?: string
}

export function CompanySwitcher({ className }: CompanySwitcherProps) {
  const { companies, activeCompanyId, setActiveCompany, getActiveCompany } = useCompanyStore()
  const activeCompany = getActiveCompany()

  if (companies.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <Building2 className="h-4 w-4 mr-2" />
          <span className="max-w-[150px] truncate">
            {activeCompany ? getDisplayName(activeCompany) : 'Select Company'}
          </span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[250px]">
        <DropdownMenuLabel>Switch Company</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => setActiveCompany(company.id)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <span className="font-medium">{company.name}</span>
                {company.dba && (
                  <span className="text-xs text-muted-foreground">DBA: {company.dba}</span>
                )}
              </div>
              {activeCompanyId === company.id && <Check className="h-4 w-4 ml-2" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
