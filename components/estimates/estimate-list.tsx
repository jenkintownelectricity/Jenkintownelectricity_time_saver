'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Search, Filter, Plus, Eye, Edit, Copy, FileDown, Send, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDocumentStore } from '@/lib/stores/document-store'
import { EstimateStatus, ESTIMATE_STATUS_LABELS } from '@/lib/types/documents'
import { formatCurrency, formatDate, exportEstimatesToCSV, downloadCSV } from '@/lib/utils/document-utils'

const STATUS_COLORS: Record<EstimateStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
}

export function EstimateList() {
  const router = useRouter()
  const {
    getFilteredEstimates,
    setEstimateFilters,
    clearEstimateFilters,
    setEstimateSort,
    estimateSort,
    estimateFilters,
    duplicateEstimate,
    convertEstimateToWorkOrder,
  } = useDocumentStore()

  const estimates = getFilteredEstimates()
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setEstimateFilters({ search: value || undefined })
  }

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setEstimateFilters({ status: undefined })
    } else {
      setEstimateFilters({ status: [status as EstimateStatus] })
    }
  }

  const handleSort = (field: string) => {
    setEstimateSort({
      field: field as any,
      direction: estimateSort.field === field && estimateSort.direction === 'asc' ? 'desc' : 'asc',
    })
  }

  const handleViewEstimate = (id: string) => {
    router.push(`/estimates/${id}`)
  }

  const handleEditEstimate = (id: string) => {
    router.push(`/estimates/${id}/edit`)
  }

  const handleDuplicate = (id: string) => {
    const newId = duplicateEstimate(id)
    if (newId) {
      router.push(`/estimates/${newId}/edit`)
    }
  }

  const handleConvertToWorkOrder = (id: string) => {
    const woId = convertEstimateToWorkOrder(id)
    if (woId) {
      router.push(`/work-orders/${woId}/edit`)
    }
  }

  const handleExportCSV = () => {
    const csv = exportEstimatesToCSV(estimates)
    downloadCSV(csv, `estimates-${new Date().toISOString().split('T')[0]}.csv`)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Estimates</h2>
          <p className="text-muted-foreground">
            Manage and track all your project estimates
          </p>
        </div>
        <Button onClick={() => router.push('/estimates/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Estimate
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search estimates..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={estimateFilters.status?.[0] || 'all'}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(ESTIMATE_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExportCSV}>
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          {(searchTerm || estimateFilters.status) && (
            <Button variant="ghost" onClick={() => {
              setSearchTerm('')
              clearEstimateFilters()
            }}>
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Estimates Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('documentNumber')}
              >
                Number {estimateSort.field === 'documentNumber' && (estimateSort.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('customerName')}
              >
                Customer {estimateSort.field === 'customerName' && (estimateSort.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('createdAt')}
              >
                Date {estimateSort.field === 'createdAt' && (estimateSort.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead
                className="text-right cursor-pointer"
                onClick={() => handleSort('total')}
              >
                Total {estimateSort.field === 'total' && (estimateSort.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {estimates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No estimates found</p>
                  <Button
                    variant="link"
                    onClick={() => router.push('/estimates/new')}
                    className="mt-2"
                  >
                    Create your first estimate
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              estimates.map((estimate) => (
                <TableRow key={estimate.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell
                    className="font-medium"
                    onClick={() => handleViewEstimate(estimate.id)}
                  >
                    {estimate.documentNumber}
                  </TableCell>
                  <TableCell onClick={() => handleViewEstimate(estimate.id)}>
                    <div>
                      <div className="font-medium">{estimate.customerName}</div>
                      <div className="text-sm text-muted-foreground">{estimate.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => handleViewEstimate(estimate.id)}>
                    <Badge className={STATUS_COLORS[estimate.status]}>
                      {ESTIMATE_STATUS_LABELS[estimate.status]}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={() => handleViewEstimate(estimate.id)}>
                    {formatDate(estimate.createdAt)}
                  </TableCell>
                  <TableCell onClick={() => handleViewEstimate(estimate.id)}>
                    {formatDate(estimate.validUntil)}
                  </TableCell>
                  <TableCell
                    className="text-right font-medium"
                    onClick={() => handleViewEstimate(estimate.id)}
                  >
                    {formatCurrency(estimate.totals.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewEstimate(estimate.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditEstimate(estimate.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(estimate.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {estimate.status === 'accepted' && !estimate.convertedToWorkOrderId && (
                          <DropdownMenuItem onClick={() => handleConvertToWorkOrder(estimate.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Convert to Work Order
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <FileDown className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="h-4 w-4 mr-2" />
                          Send to Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Summary Stats */}
      {estimates.length > 0 && (
        <Card className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Estimates</div>
              <div className="text-2xl font-bold">{estimates.length}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Value</div>
              <div className="text-2xl font-bold">
                {formatCurrency(estimates.reduce((sum, e) => sum + e.totals.total, 0))}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Accepted</div>
              <div className="text-2xl font-bold text-green-600">
                {estimates.filter((e) => e.status === 'accepted').length}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="text-2xl font-bold text-blue-600">
                {estimates.filter((e) => ['sent', 'viewed'].includes(e.status)).length}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
