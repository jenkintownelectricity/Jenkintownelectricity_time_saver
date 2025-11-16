'use client'

import { useRouter } from 'next/navigation'
import { Edit, Copy, Send, FileDown, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useDocumentStore } from '@/lib/stores/document-store'
import { ESTIMATE_STATUS_LABELS } from '@/lib/types/documents'
import { formatCurrency, formatDate } from '@/lib/utils/document-utils'
import { LineItemEditor } from '@/components/documents/line-item-editor'

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
}

interface EstimateDetailProps {
  estimateId: string
}

export function EstimateDetail({ estimateId }: EstimateDetailProps) {
  const router = useRouter()
  const {
    getEstimate,
    duplicateEstimate,
    sendEstimate,
    acceptEstimate,
    declineEstimate,
    convertEstimateToWorkOrder,
  } = useDocumentStore()

  const estimate = getEstimate(estimateId)

  if (!estimate) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Estimate not found</p>
        <Button onClick={() => router.push('/estimates')} className="mt-4">
          Back to Estimates
        </Button>
      </div>
    )
  }

  const handleDuplicate = () => {
    const newId = duplicateEstimate(estimateId)
    if (newId) {
      router.push(`/estimates/${newId}/edit`)
    }
  }

  const handleConvertToWorkOrder = () => {
    const woId = convertEstimateToWorkOrder(estimateId)
    if (woId) {
      router.push(`/work-orders/${woId}`)
    }
  }

  const handleSend = () => {
    sendEstimate(estimateId)
  }

  const handleAccept = () => {
    acceptEstimate(estimateId)
  }

  const handleDecline = () => {
    declineEstimate(estimateId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{estimate.documentNumber}</h2>
            <Badge className={STATUS_COLORS[estimate.status]}>
              {ESTIMATE_STATUS_LABELS[estimate.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Created on {formatDate(estimate.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/estimates/${estimateId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          {estimate.status === 'draft' && (
            <Button onClick={handleSend}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          )}
          {['sent', 'viewed'].includes(estimate.status) && (
            <>
              <Button onClick={handleAccept} variant="default">
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept
              </Button>
              <Button onClick={handleDecline} variant="outline">
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>
            </>
          )}
          {estimate.status === 'accepted' && !estimate.convertedToWorkOrderId && (
            <Button onClick={handleConvertToWorkOrder}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Convert to Work Order
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
            <div className="font-medium">{estimate.customerName}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium">{estimate.customerEmail}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Phone</div>
            <div className="font-medium">{estimate.customerPhone}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Valid Until</div>
            <div className="font-medium">{formatDate(estimate.validUntil)}</div>
          </div>
          <div className="col-span-2">
            <div className="text-sm text-muted-foreground">Service Address</div>
            <div className="font-medium">{estimate.serviceAddress}</div>
          </div>
          {estimate.billingAddress && (
            <div className="col-span-2">
              <div className="text-sm text-muted-foreground">Billing Address</div>
              <div className="font-medium">{estimate.billingAddress}</div>
            </div>
          )}
        </div>
      </Card>

      {/* Line Items */}
      <Card className="p-6">
        <LineItemEditor
          lineItems={estimate.lineItems}
          onChange={() => {}}
          taxRate={estimate.taxRate}
          readOnly
        />
      </Card>

      {/* Notes and Terms */}
      {(estimate.notes || estimate.termsAndConditions) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
          {estimate.notes && (
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-1">Notes</div>
              <p className="text-sm whitespace-pre-wrap">{estimate.notes}</p>
            </div>
          )}
          {estimate.termsAndConditions && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Terms and Conditions</div>
              <p className="text-sm whitespace-pre-wrap">{estimate.termsAndConditions}</p>
            </div>
          )}
        </Card>
      )}

      {/* Activity Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <div className="flex-1">
              <div className="text-sm">Estimate created</div>
              <div className="text-xs text-muted-foreground">{formatDate(estimate.createdAt)}</div>
            </div>
          </div>
          {estimate.sentAt && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <div className="flex-1">
                <div className="text-sm">Sent to customer</div>
                <div className="text-xs text-muted-foreground">{formatDate(estimate.sentAt)}</div>
              </div>
            </div>
          )}
          {estimate.viewedAt && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <div className="flex-1">
                <div className="text-sm">Viewed by customer</div>
                <div className="text-xs text-muted-foreground">{formatDate(estimate.viewedAt)}</div>
              </div>
            </div>
          )}
          {estimate.acceptedAt && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <div className="text-sm">Accepted by customer</div>
                <div className="text-xs text-muted-foreground">{formatDate(estimate.acceptedAt)}</div>
              </div>
            </div>
          )}
          {estimate.declinedAt && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="flex-1">
                <div className="text-sm">Declined by customer</div>
                <div className="text-xs text-muted-foreground">{formatDate(estimate.declinedAt)}</div>
              </div>
            </div>
          )}
          {estimate.convertedToWorkOrderId && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="flex-1">
                <div className="text-sm">Converted to work order</div>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={() => router.push(`/work-orders/${estimate.convertedToWorkOrderId}`)}
                >
                  View work order
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
