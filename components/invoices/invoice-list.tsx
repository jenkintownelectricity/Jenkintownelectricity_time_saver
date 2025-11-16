'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Search, Plus, Eye, DollarSign, AlertCircle } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDocumentStore } from '@/lib/stores/document-store'
import { InvoiceStatus, INVOICE_STATUS_LABELS } from '@/lib/types/documents'
import { formatCurrency, formatDate } from '@/lib/utils/document-utils'

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-purple-100 text-purple-800',
  partial: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export function InvoiceList() {
  const router = useRouter()
  const {
    getFilteredInvoices,
    setInvoiceFilters,
    clearInvoiceFilters,
    setInvoiceSort,
    invoiceSort,
    invoiceFilters,
  } = useDocumentStore()

  const invoices = getFilteredInvoices()
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setInvoiceFilters({ search: value || undefined })
  }

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setInvoiceFilters({ status: undefined })
    } else {
      setInvoiceFilters({ status: [status as InvoiceStatus] })
    }
  }

  const handleSort = (field: string) => {
    setInvoiceSort({
      field: field as any,
      direction: invoiceSort.field === field && invoiceSort.direction === 'asc' ? 'desc' : 'asc',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoices</h2>
          <p className="text-muted-foreground">Track payments and outstanding invoices</p>
        </div>
        <Button onClick={() => router.push('/invoices/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={invoiceFilters.status?.[0] || 'all'}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => (
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
                Number
              </TableHead>
              <TableHead onClick={() => handleSort('customerName')} className="cursor-pointer">
                Customer
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead onClick={() => handleSort('dueDate')} className="cursor-pointer">
                Due Date
              </TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No invoices found</p>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium" onClick={() => router.push(`/invoices/${invoice.id}`)}>
                    {invoice.documentNumber}
                  </TableCell>
                  <TableCell onClick={() => router.push(`/invoices/${invoice.id}`)}>
                    <div>
                      <div className="font-medium">{invoice.customerName}</div>
                      <div className="text-sm text-muted-foreground">{invoice.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => router.push(`/invoices/${invoice.id}`)}>
                    <Badge className={STATUS_COLORS[invoice.status]}>
                      {INVOICE_STATUS_LABELS[invoice.status]}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={() => router.push(`/invoices/${invoice.id}`)}>
                    <div className="flex items-center gap-2">
                      {formatDate(invoice.dueDate)}
                      {invoice.status === 'overdue' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium" onClick={() => router.push(`/invoices/${invoice.id}`)}>
                    {formatCurrency(invoice.totals.total)}
                  </TableCell>
                  <TableCell className="text-right text-green-600" onClick={() => router.push(`/invoices/${invoice.id}`)}>
                    {formatCurrency(invoice.totals.amountPaid || 0)}
                  </TableCell>
                  <TableCell className="text-right font-medium" onClick={() => router.push(`/invoices/${invoice.id}`)}>
                    {formatCurrency(invoice.totals.balance || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/invoices/${invoice.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {invoices.length > 0 && (
        <Card className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Value</div>
              <div className="text-2xl font-bold">
                {formatCurrency(invoices.reduce((sum, inv) => sum + inv.totals.total, 0))}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Paid</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.totals.amountPaid || 0), 0))}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Outstanding</div>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.totals.balance || 0), 0))}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Overdue</div>
              <div className="text-2xl font-bold text-red-600">
                {invoices.filter((inv) => inv.status === 'overdue').length}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
