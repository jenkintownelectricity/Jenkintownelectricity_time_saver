'use client'

import { useState } from 'react'
import { Customer } from '@/lib/types/customers'
import { useCustomerStore } from '@/lib/stores/customer-store'
import { CustomerCard } from './customer-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Search,
  Filter,
  Grid3x3,
  List,
  Plus,
  Download,
  Upload,
  Trash,
  Tag,
  Archive,
  SortAsc,
  SortDesc,
  Phone,
  Mail,
  MapPin,
  Building2,
} from 'lucide-react'
import { formatPhoneNumber, getPrimaryAddress, getLastCommunication } from '@/lib/types/customers'
import { formatDistanceToNow } from 'date-fns'

interface CustomerListProps {
  onCustomerClick?: (customer: Customer) => void
  onCreateCustomer?: () => void
  onEditCustomer?: (customer: Customer) => void
  onDeleteCustomer?: (customer: Customer) => void
  onCreateEstimate?: (customer: Customer) => void
  onScheduleAppointment?: (customer: Customer) => void
}

export function CustomerList({
  onCustomerClick,
  onCreateCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onCreateEstimate,
  onScheduleAppointment,
}: CustomerListProps) {
  const customers = useCustomerStore((state) => state.getFilteredCustomers())
  const filters = useCustomerStore((state) => state.filters)
  const setFilters = useCustomerStore((state) => state.setFilters)
  const clearFilters = useCustomerStore((state) => state.clearFilters)
  const sort = useCustomerStore((state) => state.sort)
  const setSort = useCustomerStore((state) => state.setSort)
  const viewMode = useCustomerStore((state) => state.viewMode)
  const setViewMode = useCustomerStore((state) => state.setViewMode)
  const selectedCustomers = useCustomerStore((state) => state.selectedCustomers)
  const selectCustomer = useCustomerStore((state) => state.selectCustomer)
  const unselectCustomer = useCustomerStore((state) => state.unselectCustomer)
  const selectAllCustomers = useCustomerStore((state) => state.selectAllCustomers)
  const clearSelection = useCustomerStore((state) => state.clearSelection)
  const deleteCustomers = useCustomerStore((state) => state.deleteCustomers)
  const bulkUpdateStatus = useCustomerStore((state) => state.bulkUpdateStatus)
  const bulkAddTags = useCustomerStore((state) => state.bulkAddTags)
  const exportToCSV = useCustomerStore((state) => state.exportToCSV)
  const allTags = useCustomerStore((state) => state.getAllTags())

  const [showFilters, setShowFilters] = useState(false)

  const handleExport = () => {
    const csv = exportToCSV()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedCustomers.length} customer(s)?`)) {
      deleteCustomers(selectedCustomers)
      clearSelection()
    }
  }

  const handleBulkArchive = () => {
    bulkUpdateStatus(selectedCustomers, 'inactive')
    clearSelection()
  }

  const toggleSort = (field: typeof sort.field) => {
    if (sort.field === field) {
      setSort({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' })
    } else {
      setSort({ field, direction: 'asc' })
    }
  }

  const activeFilterCount = [
    filters.types?.length || 0,
    filters.statuses?.length || 0,
    filters.sources?.length || 0,
    filters.tags?.length || 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customers</h2>
          <p className="text-muted-foreground">
            {customers.length} customer{customers.length !== 1 ? 's' : ''}
            {selectedCustomers.length > 0 && ` (${selectedCustomers.length} selected)`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={onCreateCustomer}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, email, phone, company, or tags..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    Type {filters.types?.length ? `(${filters.types.length})` : ''}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuCheckboxItem
                    checked={filters.types?.includes('residential')}
                    onCheckedChange={(checked) => {
                      const newTypes = checked
                        ? [...(filters.types || []), 'residential' as const]
                        : filters.types?.filter((t) => t !== 'residential')
                      setFilters({ types: newTypes as ('commercial' | 'residential')[] | undefined })
                    }}
                  >
                    Residential
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.types?.includes('commercial')}
                    onCheckedChange={(checked) => {
                      const newTypes = checked
                        ? [...(filters.types || []), 'commercial' as const]
                        : filters.types?.filter((t) => t !== 'commercial')
                      setFilters({ types: newTypes as ('commercial' | 'residential')[] | undefined })
                    }}
                  >
                    Commercial
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    Status {filters.statuses?.length ? `(${filters.statuses.length})` : ''}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {(['active', 'inactive', 'potential'] as const).map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={filters.statuses?.includes(status)}
                      onCheckedChange={(checked) => {
                        const newStatuses = checked
                          ? [...(filters.statuses || []), status]
                          : filters.statuses?.filter((s) => s !== status)
                        setFilters({ statuses: newStatuses })
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    Source {filters.sources?.length ? `(${filters.sources.length})` : ''}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {(['vapi', 'referral', 'website', 'manual', 'other'] as const).map((source) => (
                    <DropdownMenuCheckboxItem
                      key={source}
                      checked={filters.sources?.includes(source)}
                      onCheckedChange={(checked) => {
                        const newSources = checked
                          ? [...(filters.sources || []), source]
                          : filters.sources?.filter((s) => s !== source)
                        setFilters({ sources: newSources })
                      }}
                    >
                      {source.charAt(0).toUpperCase() + source.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    Tags {filters.tags?.length ? `(${filters.tags.length})` : ''}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {allTags.map((tag) => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={filters.tags?.includes(tag)}
                      onCheckedChange={(checked) => {
                        const newTags = checked
                          ? [...(filters.tags || []), tag]
                          : filters.tags?.filter((t) => t !== tag)
                        setFilters({ tags: newTags })
                      }}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedCustomers.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg">
          <Checkbox
            checked={selectedCustomers.length === customers.length}
            onCheckedChange={(checked) => {
              if (checked) {
                selectAllCustomers()
              } else {
                clearSelection()
              }
            }}
          />
          <span className="text-sm font-medium">
            {selectedCustomers.length} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handleBulkArchive}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Customer List/Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onView={onCustomerClick}
              onEdit={onEditCustomer}
              onDelete={onDeleteCustomer}
              onCreateEstimate={onCreateEstimate}
              onScheduleAppointment={onScheduleAppointment}
              onCall={(c) => window.open(`tel:${c.phone}`)}
              onEmail={(c) => window.open(`mailto:${c.email}`)}
            />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedCustomers.length === customers.length && customers.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAllCustomers()
                      } else {
                        clearSelection()
                      }
                    }}
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort('name')}
                    className="h-8 px-2"
                  >
                    Name
                    {sort.field === 'name' && (
                      sort.direction === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort('lastContact')}
                    className="h-8 px-2"
                  >
                    Last Contact
                    {sort.field === 'lastContact' && (
                      sort.direction === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => {
                const lastComm = getLastCommunication(customer)
                const primaryAddress = getPrimaryAddress(customer)
                return (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer"
                    onClick={() => onCustomerClick?.(customer)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            selectCustomer(customer.id)
                          } else {
                            unselectCustomer(customer.id)
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        {customer.company && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {customer.company}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {formatPhoneNumber(customer.phone)}
                        </div>
                        <div className="text-sm flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {customer.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {primaryAddress ? (
                        <div className="text-sm flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {primaryAddress.city}, {primaryAddress.state}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lastComm ? (
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(lastComm.date, { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="sr-only">Actions</span>
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {/* Add action items here */}
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

      {customers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No customers found</p>
        </div>
      )}
    </div>
  )
}
