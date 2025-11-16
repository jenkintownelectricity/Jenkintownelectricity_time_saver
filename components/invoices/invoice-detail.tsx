'use client'

import { useRouter } from 'next/navigation'
import { Edit, Send, FileDown, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDocumentStore } from '@/lib/stores/document-store'
import { INVOICE_STATUS_LABELS } from '@/lib/types/documents'
import { formatCurrency, formatDate } from '@/lib/utils/document-utils'
import { LineItemEditor } from '@/components/documents/line-item-editor'
import { PaymentTracker } from './payment-tracker'

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-purple-100 text-purple-800',
  partial: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

interface InvoiceDetailProps {
  invoiceId: string
}

export function InvoiceDetail({ invoiceId }: InvoiceDetailProps) {
  const router = useRouter()
  const {
    getInvoice,
    sendInvoice,
    addPayment,
    deletePayment,
  } = useDocumentStore()

  const invoice = getInvoice(invoiceId)

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Invoice not found</p>
        <Button onClick={() => router.push('/invoices')} className="mt-4">
          Back to Invoices
        </Button>
      </div>
    )
  }

  const handleSend = () => {
    sendInvoice(invoiceId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{invoice.documentNumber}</h2>
            <Badge className={STATUS_COLORS[invoice.status]}>
              {INVOICE_STATUS_LABELS[invoice.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Created on {formatDate(invoice.createdAt)} • Due {formatDate(invoice.dueDate)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/invoices/${invoiceId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {invoice.status === 'draft' && (
            <Button onClick={handleSend}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          )}
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Customer Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-muted-foreground">Customer Name</div>
            <div className="font-medium">{invoice.customerName}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium">{invoice.customerEmail}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Phone</div>
            <div className="font-medium">{invoice.customerPhone}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Payment Terms</div>
            <div className="font-medium">{invoice.paymentTerms}</div>
          </div>
          <div className="col-span-2">
            <div className="text-sm text-muted-foreground">Service Address</div>
            <div className="font-medium">{invoice.serviceAddress}</div>
          </div>
        </div>
      </Card>

      {/* Line Items */}
      <Card className="p-6">
        <LineItemEditor
          lineItems={invoice.lineItems}
          onChange={() => {}}
          taxRate={invoice.taxRate}
          readOnly
        />
      </Card>

      {/* Payment Tracker */}
      <PaymentTracker
        payments={invoice.payments}
        onAddPayment={(payment) => addPayment(invoiceId, payment)}
        onDeletePayment={(paymentId) => deletePayment(invoiceId, paymentId)}
        totalAmount={invoice.totals.total}
        balance={invoice.totals.balance || 0}
      />

      {/* Notes */}
      {invoice.notes && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Notes</h3>
          <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
        </Card>
      )}
    </div>
  )
}
