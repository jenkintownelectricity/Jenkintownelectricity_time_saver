'use client'

import { useState } from 'react'
import { Plus, Trash2, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Payment, PaymentMethod, PAYMENT_METHOD_LABELS } from '@/lib/types/documents'
import { formatCurrency, formatDate } from '@/lib/utils/document-utils'

interface PaymentTrackerProps {
  payments: Payment[]
  onAddPayment: (payment: Omit<Payment, 'id'>) => void
  onDeletePayment: (paymentId: string) => void
  totalAmount: number
  balance: number
}

export function PaymentTracker({
  payments,
  onAddPayment,
  onDeletePayment,
  totalAmount,
  balance,
}: PaymentTrackerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')

  const handleAddPayment = () => {
    if (!amount || parseFloat(amount) <= 0) return

    onAddPayment({
      amount: parseFloat(amount),
      date: new Date(date),
      method,
      reference: reference || undefined,
      notes: notes || undefined,
    })

    // Reset form
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setMethod('cash')
    setReference('')
    setNotes('')
    setIsDialogOpen(false)
  }

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Payment History</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Remaining balance: {formatCurrency(balance)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Payment Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
                  <SelectTrigger id="method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number (Optional)</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Check number, transaction ID, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional payment notes..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPayment}>
                  Record Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payment Summary */}
      <div className="bg-muted/50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Amount</div>
            <div className="text-xl font-bold">{formatCurrency(totalAmount)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Amount Paid</div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Balance Due</div>
            <div className="text-xl font-bold text-orange-600">{formatCurrency(balance)}</div>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="space-y-2">
        {payments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No payments recorded</p>
          </div>
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                  <div className="text-sm text-muted-foreground">
                    {PAYMENT_METHOD_LABELS[payment.method]}
                  </div>
                  {payment.reference && (
                    <div className="text-sm text-muted-foreground">
                      Ref: {payment.reference}
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {formatDate(payment.date)}
                  {payment.notes && ` - ${payment.notes}`}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeletePayment(payment.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
