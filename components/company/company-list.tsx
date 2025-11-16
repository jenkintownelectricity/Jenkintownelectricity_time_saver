'use client'

import { useState } from 'react'
import { useCompanyStore } from '@/lib/stores/company-store'
import { CompanyProfile, COMPANY_TYPE_LABELS, getDaysUntilInsuranceExpiration } from '@/lib/types/company'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Star,
  CheckCircle,
  AlertTriangle,
  Building2,
  X,
  Filter,
} from 'lucide-react'

interface CompanyListProps {
  onCompanyClick?: (company: CompanyProfile) => void
  onCreateCompany?: () => void
  onEditCompany?: (company: CompanyProfile) => void
  onDeleteCompany?: (company: CompanyProfile) => void
}

export function CompanyList({
  onCompanyClick,
  onCreateCompany,
  onEditCompany,
  onDeleteCompany,
}: CompanyListProps) {
  const {
    getFilteredCompanies,
    filters,
    setFilters,
    clearFilters,
    deleteCompany,
    duplicateCompany,
    setDefaultCompany,
    setActiveCompany,
  } = useCompanyStore()

  const [searchQuery, setSearchQuery] = useState(filters.search || '')
  const filteredCompanies = getFilteredCompanies()

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setFilters({ search: value })
  }

  const handleDelete = (company: CompanyProfile) => {
    if (onDeleteCompany) {
      onDeleteCompany(company)
    } else {
      if (
        confirm(
          `Are you sure you want to delete ${company.name}? This action cannot be undone.`
        )
      ) {
        deleteCompany(company.id)
      }
    }
  }

  const handleDuplicate = (company: CompanyProfile) => {
    const newId = duplicateCompany(company.id)
    if (newId) {
      console.log('Company duplicated:', newId)
    }
  }

  const handleSetDefault = (company: CompanyProfile) => {
    setDefaultCompany(company.id)
  }

  const handleSwitchTo = (company: CompanyProfile) => {
    setActiveCompany(company.id)
  }

  const getInsuranceStatus = (company: CompanyProfile) => {
    const daysUntilExpiration = getDaysUntilInsuranceExpiration(company)

    if (daysUntilExpiration < 0) {
      return {
        status: 'expired',
        color: 'text-destructive',
        icon: AlertTriangle,
        label: 'Expired',
      }
    } else if (daysUntilExpiration <= 30) {
      return {
        status: 'expiring',
        color: 'text-yellow-600',
        icon: AlertTriangle,
        label: `${daysUntilExpiration} days`,
      }
    } else {
      return {
        status: 'valid',
        color: 'text-green-600',
        icon: CheckCircle,
        label: 'Valid',
      }
    }
  }

  const hasActiveFilters = filters.search || (filters.types && filters.types.length > 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Companies</h2>
          <p className="text-muted-foreground">
            Manage your company profiles and DBAs
          </p>
        </div>
        <Button onClick={onCreateCompany}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  clearFilters()
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Companies ({filteredCompanies.length})</CardTitle>
          <CardDescription>
            {filteredCompanies.length === 0
              ? 'No companies found'
              : `Showing ${filteredCompanies.length} compan${
                  filteredCompanies.length === 1 ? 'y' : 'ies'
                }`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No companies found. Add your first company to get started.
              </p>
              <Button onClick={onCreateCompany}>
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Insurance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => {
                    const insuranceStatus = getInsuranceStatus(company)
                    const Icon = insuranceStatus.icon

                    return (
                      <TableRow
                        key={company.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => onCompanyClick?.(company)}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{company.name}</div>
                              {company.isDefault && (
                                <Badge variant="default" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            {company.dba && (
                              <div className="text-sm text-muted-foreground">
                                DBA: {company.dba}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {COMPANY_TYPE_LABELS[company.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="text-muted-foreground">{company.email}</div>
                            <div className="text-muted-foreground">{company.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{company.licenseNumber}</div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${insuranceStatus.color}`}>
                            <Icon className="h-4 w-4" />
                            <span className="text-sm">{insuranceStatus.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSwitchTo(company)
                                }}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Switch to this company
                              </DropdownMenuItem>
                              {!company.isDefault && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSetDefault(company)
                                  }}
                                >
                                  <Star className="mr-2 h-4 w-4" />
                                  Set as default
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEditCompany?.(company)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDuplicate(company)
                                }}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(company)
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
