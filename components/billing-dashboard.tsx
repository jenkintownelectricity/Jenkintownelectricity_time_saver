'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  CreditCard,
  FileText,
  TrendingUp,
  Calendar,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

export default function BillingDashboard() {
  const {
    ownerSettings,
    currentCompanyCode,
    companyAccounts,
    billingEvents,
    billingInvoices,
    paymentMethods,
    getBillingEventsForCompany,
    getCompanyBalance,
    generateBillingInvoice,
    markBillingInvoicePaid
  } = useAppStore()

  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const currentCompany = companyAccounts.find(c => c.companyCode === currentCompanyCode)

  // Calculate date range
  const dateRange = useMemo(() => {
    const now = Date.now()
    const periods = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      'all': 0
    }
    const period = periods[selectedPeriod]
    return {
      start: period > 0 ? now - period : 0,
      end: now
    }
  }, [selectedPeriod])

  // Get events for current company and period
  const events = useMemo(() => {
    if (!currentCompanyCode) return []
    return getBillingEventsForCompany(currentCompanyCode, dateRange.start || undefined, dateRange.end)
  }, [currentCompanyCode, dateRange, getBillingEventsForCompany])

  // Get invoices for current company
  const companyInvoices = useMemo(() => {
    if (!currentCompanyCode) return []
    return billingInvoices.filter(inv => inv.companyCode === currentCompanyCode)
  }, [currentCompanyCode, billingInvoices])

  // Calculate totals
  const totals = useMemo(() => {
    const pending = events
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0)

    const completed = events
      .filter(e => e.status === 'completed')
      .reduce((sum, e) => sum + e.amount, 0)

    const failed = events
      .filter(e => e.status === 'failed')
      .reduce((sum, e) => sum + e.amount, 0)

    return { pending, completed, failed, total: pending + completed }
  }, [events])

  // Group events by type
  const eventsByType = useMemo(() => {
    const groups = new Map<string, { count: number, total: number }>()
    events.forEach(event => {
      const existing = groups.get(event.type) || { count: 0, total: 0 }
      groups.set(event.type, {
        count: existing.count + 1,
        total: existing.total + event.amount
      })
    })
    return Array.from(groups.entries()).map(([type, data]) => ({
      type,
      ...data
    }))
  }, [events])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'processing': return 'bg-blue-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'processing': return <TrendingUp className="w-4 h-4 animate-pulse" />
      case 'failed': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const handleGenerateInvoice = () => {
    if (!currentCompanyCode) return
    const startDate = dateRange.start || Date.now() - (30 * 24 * 60 * 60 * 1000)
    const endDate = dateRange.end
    generateBillingInvoice(currentCompanyCode, startDate, endDate)
    alert('Invoice generated successfully!')
  }

  if (!ownerSettings.monetization.enabled) {
    return (
      <Card className="border-2 border-green-500/20 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-500" />
            Billing Dashboard
          </CardTitle>
          <CardDescription>
            Track your usage and fees (when monetization is enabled)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-lg font-medium text-green-600 mb-2">
              🎉 Beta Mode - All Features Free!
            </p>
            <p className="text-muted-foreground">
              You're using the app during our beta testing phase. All features are completely free with no fees or limits.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              This dashboard will show your usage and fees when monetization is enabled in the future.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentCompanyCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing Dashboard</CardTitle>
          <CardDescription>
            Create a company account to view billing information
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Billing Dashboard</h2>
          <p className="text-muted-foreground">
            {currentCompany?.companyName || 'Company Billing'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateInvoice}>
            <FileText className="w-4 h-4 mr-2" />
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d', 'all'] as const).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
          >
            {period === 'all' ? 'All Time' : period.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.pending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {events.filter(e => e.status === 'pending').length} pending charges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Paid
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.completed.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {events.filter(e => e.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Usage
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {events.length} total events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companyInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              {companyInvoices.filter(inv => inv.status === 'paid').length} paid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Events by Type */}
      {eventsByType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usage by Type</CardTitle>
            <CardDescription>
              Breakdown of charges by event type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eventsByType.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {item.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.count} {item.count === 1 ? 'event' : 'events'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${item.total.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      ${(item.total / item.count).toFixed(2)} avg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Billing Events</CardTitle>
          <CardDescription>
            Your recent charges and usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No billing events in this period
            </div>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getStatusColor(event.status)} text-white`}>
                      {getStatusIcon(event.status)}
                    </div>
                    <div>
                      <p className="font-medium">{event.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${event.amount.toFixed(2)}</p>
                    <Badge variant="outline" className={getStatusColor(event.status) + ' text-white'}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      {companyInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              Your billing invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companyInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.billingPeriodStart).toLocaleDateString()} - {new Date(invoice.billingPeriodEnd).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {invoice.items.length} items
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-bold text-lg">${invoice.total.toFixed(2)}</p>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'outline'}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
