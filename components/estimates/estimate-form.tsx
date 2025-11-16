'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDocumentStore } from '@/lib/stores/document-store'
import { useCustomerStore } from '@/lib/stores/customer-store'
import { LineItemEditor } from '@/components/documents/line-item-editor'
import { EstimateDocument, LineItem } from '@/lib/types/documents'
import { calculateTotals } from '@/lib/utils/document-utils'

interface EstimateFormProps {
  estimateId?: string
}

export function EstimateForm({ estimateId }: EstimateFormProps) {
  const router = useRouter()
  const { addEstimate, updateEstimate, getEstimate } = useDocumentStore()
  const { customers } = useCustomerStore()

  const existingEstimate = estimateId ? getEstimate(estimateId) : undefined

  const [customerId, setCustomerId] = useState(existingEstimate?.customerId || '')
  const [customerName, setCustomerName] = useState(existingEstimate?.customerName || '')
  const [customerEmail, setCustomerEmail] = useState(existingEstimate?.customerEmail || '')
  const [customerPhone, setCustomerPhone] = useState(existingEstimate?.customerPhone || '')
  const [serviceAddress, setServiceAddress] = useState(existingEstimate?.serviceAddress || '')
  const [billingAddress, setBillingAddress] = useState(existingEstimate?.billingAddress || '')
  const [lineItems, setLineItems] = useState<LineItem[]>(existingEstimate?.lineItems || [])
  const [taxRate, setTaxRate] = useState(existingEstimate?.taxRate || 6)
  const [notes, setNotes] = useState(existingEstimate?.notes || '')
  const [termsAndConditions, setTermsAndConditions] = useState(
    existingEstimate?.termsAndConditions || 'Payment due within 30 days. All work guaranteed for 1 year.'
  )
  const [validUntil, setValidUntil] = useState(
    existingEstimate?.validUntil
      ? existingEstimate.validUntil.toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )

  useEffect(() => {
    if (customerId) {
      const customer = customers.find((c) => c.id === customerId)
      if (customer) {
        setCustomerName(customer.name)
        setCustomerEmail(customer.email)
        setCustomerPhone(customer.phone)
        if (customer.addresses.length > 0) {
          const primaryAddress = customer.addresses.find((a) => a.isPrimary) || customer.addresses[0]
          const addressStr = `${primaryAddress.street}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.zip}`
          setServiceAddress(addressStr)
        }
      }
    }
  }, [customerId, customers])

  const handleSave = (status: 'draft' | 'sent' = 'draft') => {
    const totals = calculateTotals(lineItems, taxRate)

    const estimateData = {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      serviceAddress,
      billingAddress: billingAddress || undefined,
      lineItems,
      status,
      taxRate,
      totals,
      notes: notes || undefined,
      termsAndConditions: termsAndConditions || undefined,
      validUntil: new Date(validUntil),
      createdBy: 'current-user', // TODO: Get from auth
    }

    if (estimateId) {
      updateEstimate(estimateId, estimateData)
      router.push(`/estimates/${estimateId}`)
    } else {
      const newId = addEstimate(estimateData)
      router.push(`/estimates/${newId}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {estimateId ? 'Edit Estimate' : 'New Estimate'}
          </h2>
          <p className="text-muted-foreground">
            {estimateId ? 'Update estimate details' : 'Create a new estimate for your customer'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleSave('draft')}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave('sent')}>
            <Save className="h-4 w-4 mr-2" />
            Save & Send
          </Button>
        </div>
      </div>

      {/* Customer Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Select Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email</Label>
            <Input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">Phone</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="(555) 123-4567"
              required
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="serviceAddress">Service Address</Label>
            <Input
              id="serviceAddress"
              value={serviceAddress}
              onChange={(e) => setServiceAddress(e.target.value)}
              placeholder="123 Main St, City, State 12345"
              required
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="billingAddress">Billing Address (if different)</Label>
            <Input
              id="billingAddress"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder="Optional billing address"
            />
          </div>
        </div>
      </Card>

      {/* Line Items */}
      <Card className="p-6">
        <LineItemEditor
          lineItems={lineItems}
          onChange={setLineItems}
          taxRate={taxRate}
        />
      </Card>

      {/* Additional Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="validUntil">Valid Until</Label>
            <Input
              id="validUntil"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes for the customer..."
              rows={3}
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="terms">Terms and Conditions</Label>
            <Textarea
              id="terms"
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              placeholder="Payment terms, warranties, etc..."
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button variant="outline" onClick={() => handleSave('draft')}>
          Save Draft
        </Button>
        <Button onClick={() => handleSave('sent')}>
          Save & Send
        </Button>
      </div>
    </div>
  )
}
