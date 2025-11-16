'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, Search, Plus, Eye, Edit, ArrowRight } from 'lucide-react'
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
import { WorkOrderStatus, WORK_ORDER_STATUS_LABELS } from '@/lib/types/documents'
import { formatCurrency, formatDate } from '@/lib/utils/document-utils'

const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  on_hold: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

export function WorkOrderList() {
  const router = useRouter()
  const {
    getFilteredWorkOrders,
    setWorkOrderFilters,
    clearWorkOrderFilters,
    setWorkOrderSort,
    workOrderSort,
    workOrderFilters,
    convertWorkOrderToInvoice,
  } = useDocumentStore()

  const workOrders = getFilteredWorkOrders()
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setWorkOrderFilters({ search: value || undefined })
  }

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setWorkOrderFilters({ status: undefined })
    } else {
      setWorkOrderFilters({ status: [status as WorkOrderStatus] })
    }
  }

  const handleSort = (field: string) => {
    setWorkOrderSort({
      field: field as any,
      direction: workOrderSort.field === field && workOrderSort.direction === 'asc' ? 'desc' : 'asc',
    })
  }

  const handleConvertToInvoice = (id: string) => {
    const invId = convertWorkOrderToInvoice(id)
    if (invId) {
      router.push(`/invoices/${invId}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Work Orders</h2>
          <p className="text-muted-foreground">Manage and track all work orders</p>
        </div>
        <Button onClick={() => router.push('/work-orders/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Work Order
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={workOrderFilters.status?.[0] || 'all'}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(WORK_ORDER_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('documentNumber')} className="cursor-pointer">
                Number {workOrderSort.field === 'documentNumber' && (workOrderSort.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('customerName')} className="cursor-pointer">
                Customer {workOrderSort.field === 'customerName' && (workOrderSort.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No work orders found</p>
                  <Button
                    variant="link"
                    onClick={() => router.push('/work-orders/new')}
                    className="mt-2"
                  >
                    Create your first work order
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              workOrders.map((wo) => (
                <TableRow key={wo.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium" onClick={() => router.push(`/work-orders/${wo.id}`)}>
                    {wo.documentNumber}
                  </TableCell>
                  <TableCell onClick={() => router.push(`/work-orders/${wo.id}`)}>
                    <div>
                      <div className="font-medium">{wo.customerName}</div>
                      <div className="text-sm text-muted-foreground">{wo.serviceAddress}</div>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => router.push(`/work-orders/${wo.id}`)}>
                    <Badge className={STATUS_COLORS[wo.status]}>
                      {WORK_ORDER_STATUS_LABELS[wo.status]}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={() => router.push(`/work-orders/${wo.id}`)}>
                    <Badge className={PRIORITY_COLORS[wo.priority]} variant="outline">
                      {wo.priority.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={() => router.push(`/work-orders/${wo.id}`)}>
                    {wo.scheduledDate ? formatDate(wo.scheduledDate) : 'Not scheduled'}
                  </TableCell>
                  <TableCell className="text-right font-medium" onClick={() => router.push(`/work-orders/${wo.id}`)}>
                    {formatCurrency(wo.totals.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/work-orders/${wo.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/work-orders/${wo.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {wo.status === 'completed' && !wo.convertedToInvoiceId && (
                          <DropdownMenuItem onClick={() => handleConvertToInvoice(wo.id)}>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Convert to Invoice
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {workOrders.length > 0 && (
        <Card className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{workOrders.length}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
              <div className="text-2xl font-bold text-blue-600">
                {workOrders.filter((w) => w.status === 'scheduled').length}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">In Progress</div>
              <div className="text-2xl font-bold text-yellow-600">
                {workOrders.filter((w) => w.status === 'in_progress').length}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="text-2xl font-bold text-green-600">
                {workOrders.filter((w) => w.status === 'completed').length}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
