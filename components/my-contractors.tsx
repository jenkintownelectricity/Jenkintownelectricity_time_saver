'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Users,
  FileText,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp
} from 'lucide-react'

interface Contractor {
  id: string
  name: string
  company: string
  email: string
  phone: string
  paymentTerms: string
  createdAt: number
}

interface SubEstimate {
  id: string
  contractorId: string
  number: string
  amount: number
  estimateFee: number // Fee charged to create estimate
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired'
  description: string
  date: number
  expiryDate: number
  termsAndConditions: string
  includeTerms: boolean
  estimateFeeInvoiceId?: string // Link to invoice for estimate fee
  estimateFeePaid: boolean
}

interface SubInvoice {
  id: string
  contractorId: string
  number: string
  amount: number
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled'
  description: string
  date: number
  dueDate: number
  termsAndConditions: string
  includeTerms: boolean
  relatedEstimateId?: string // Link to estimate
  isEstimateFeeInvoice: boolean // True if this is for estimate fee
}

interface WorkItem {
  id: string
  contractorId: string
  jobNumber: string
  description: string
  amount: number
  status: 'In Progress' | 'Completed' | 'Paid' | 'Unpaid'
  startDate: number
  completionDate?: number
  paymentDate?: number
  relatedEstimateId?: string
  relatedInvoiceId?: string
}

export default function MyContractors() {
  const { setCurrentSection } = useAppStore()

  // Load data from localStorage
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [estimates, setEstimates] = useState<SubEstimate[]>([])
  const [invoices, setSubInvoices] = useState<SubInvoice[]>([])
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [selectedContractorId, setSelectedContractorId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'list' | 'contractor'>('list')
  const [showAddContractor, setShowAddContractor] = useState(false)
  const [contractorFormData, setContractorFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    paymentTerms: 'Net 30'
  })

  // Default terms and conditions
  const [defaultTerms, setDefaultTerms] = useState(`Payment Terms: Net 30 days from invoice date
Late payments subject to 1.5% monthly interest
Estimate fees are non-refundable
If estimate is approved, estimate fee will be deducted from final invoice
Materials and labor guaranteed for 1 year
Change orders require written approval`)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    if (typeof window !== 'undefined') {
      const savedContractors = localStorage.getItem('my_contractors')
      const savedEstimates = localStorage.getItem('my_contractor_estimates')
      const savedInvoices = localStorage.getItem('my_contractor_invoices')
      const savedWork = localStorage.getItem('my_contractor_work')
      const savedTerms = localStorage.getItem('my_contractor_default_terms')

      if (savedContractors) setContractors(JSON.parse(savedContractors))
      if (savedEstimates) setEstimates(JSON.parse(savedEstimates))
      if (savedInvoices) setSubInvoices(JSON.parse(savedInvoices))
      if (savedWork) setWorkItems(JSON.parse(savedWork))
      if (savedTerms) setDefaultTerms(savedTerms)
    }
  }

  const saveData = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('my_contractors', JSON.stringify(contractors))
      localStorage.setItem('my_contractor_estimates', JSON.stringify(estimates))
      localStorage.setItem('my_contractor_invoices', JSON.stringify(invoices))
      localStorage.setItem('my_contractor_work', JSON.stringify(workItems))
      localStorage.setItem('my_contractor_default_terms', defaultTerms)
    }
  }

  useEffect(() => {
    saveData()
  }, [contractors, estimates, invoices, workItems, defaultTerms])

  const handleAddContractor = () => {
    if (!contractorFormData.name || !contractorFormData.company) {
      alert('Please enter contractor name and company')
      return
    }

    const newContractor: Contractor = {
      id: `contractor_${Date.now()}`,
      name: contractorFormData.name,
      company: contractorFormData.company,
      email: contractorFormData.email,
      phone: contractorFormData.phone,
      paymentTerms: contractorFormData.paymentTerms,
      createdAt: Date.now()
    }

    setContractors([...contractors, newContractor])
    setContractorFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      paymentTerms: 'Net 30'
    })
    setShowAddContractor(false)
  }

  const handleApproveEstimate = (estimateId: string) => {
    const estimate = estimates.find(e => e.id === estimateId)
    if (!estimate) return

    // Update estimate status
    const updatedEstimates = estimates.map(e =>
      e.id === estimateId ? { ...e, status: 'Approved' as const } : e
    )
    setEstimates(updatedEstimates)

    // Create work item
    const newWorkItem: WorkItem = {
      id: `work_${Date.now()}`,
      contractorId: estimate.contractorId,
      jobNumber: estimate.number,
      description: estimate.description,
      amount: estimate.amount,
      status: 'In Progress',
      startDate: Date.now(),
      relatedEstimateId: estimateId
    }
    setWorkItems([...workItems, newWorkItem])

    // If there was an estimate fee that was paid, we'll track it for later deduction
    alert('Estimate approved! Estimate fee will be deducted from final invoice.')
  }

  const handleCreateInvoiceFromWork = (workItemId: string) => {
    const work = workItems.find(w => w.id === workItemId)
    if (!work) return

    // Check if there's an estimate fee that was paid
    let finalAmount = work.amount
    let estimateFeeDeduction = 0

    if (work.relatedEstimateId) {
      const estimate = estimates.find(e => e.id === work.relatedEstimateId)
      if (estimate && estimate.estimateFeePaid && estimate.estimateFee > 0) {
        estimateFeeDeduction = estimate.estimateFee
        finalAmount = work.amount - estimateFeeDeduction
      }
    }

    const newInvoice: SubInvoice = {
      id: `invoice_${Date.now()}`,
      contractorId: work.contractorId,
      number: `INV-${Date.now()}`,
      amount: finalAmount,
      status: 'Draft',
      description: `${work.description}${estimateFeeDeduction > 0 ? `\n\nOriginal amount: $${work.amount.toLocaleString()}\nEstimate fee deduction: -$${estimateFeeDeduction.toLocaleString()}\nTotal due: $${finalAmount.toLocaleString()}` : ''}`,
      date: Date.now(),
      dueDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
      termsAndConditions: defaultTerms,
      includeTerms: true,
      relatedEstimateId: work.relatedEstimateId,
      isEstimateFeeInvoice: false
    }

    setSubInvoices([...invoices, newInvoice])

    // Update work item with invoice link
    setWorkItems(workItems.map(w =>
      w.id === workItemId ? { ...w, relatedInvoiceId: newInvoice.id } : w
    ))

    alert(`Invoice created! ${estimateFeeDeduction > 0 ? `Estimate fee of $${estimateFeeDeduction} has been deducted.` : ''}`)
  }

  const getContractorStats = (contractorId: string) => {
    const contractorEstimates = estimates.filter(e => e.contractorId === contractorId)
    const contractorInvoices = invoices.filter(i => i.contractorId === contractorId)
    const contractorWork = workItems.filter(w => w.contractorId === contractorId)

    return {
      totalEstimates: contractorEstimates.length,
      approvedEstimates: contractorEstimates.filter(e => e.status === 'Approved').length,
      totalInvoices: contractorInvoices.length,
      paidInvoices: contractorInvoices.filter(i => i.status === 'Paid').length,
      totalWork: contractorWork.length,
      paidWork: contractorWork.filter(w => w.status === 'Paid').length,
      totalEarned: contractorInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0),
      totalPending: contractorInvoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').reduce((sum, i) => sum + i.amount, 0)
    }
  }

  if (currentView === 'contractor' && selectedContractorId) {
    const contractor = contractors.find(c => c.id === selectedContractorId)
    if (!contractor) {
      setCurrentView('list')
      return null
    }

    const contractorEstimates = estimates.filter(e => e.contractorId === selectedContractorId)
    const contractorInvoices = invoices.filter(i => i.contractorId === selectedContractorId)
    const contractorWork = workItems.filter(w => w.contractorId === selectedContractorId)
    const stats = getContractorStats(selectedContractorId)

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentView('list')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-foreground">{contractor.company}</h1>
                <p className="text-xs text-muted-foreground">{contractor.name} • {contractor.email}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earned</p>
                      <p className="text-2xl font-bold text-green-600">${stats.totalEarned.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Payment</p>
                      <p className="text-2xl font-bold text-orange-600">${stats.totalPending.toLocaleString()}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Approved Estimates</p>
                      <p className="text-2xl font-bold text-foreground">{stats.approvedEstimates}/{stats.totalEstimates}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Jobs Completed</p>
                      <p className="text-2xl font-bold text-foreground">{stats.paidWork}/{stats.totalWork}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estimates Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Estimates</CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Estimate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {contractorEstimates.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No estimates yet</p>
                ) : (
                  <div className="space-y-3">
                    {contractorEstimates.map(estimate => (
                      <div key={estimate.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-semibold">{estimate.number}</p>
                            <Badge className={
                              estimate.status === 'Approved' ? 'bg-green-500' :
                              estimate.status === 'Rejected' ? 'bg-red-500' :
                              estimate.status === 'Sent' ? 'bg-blue-500' :
                              'bg-gray-500'
                            }>
                              {estimate.status}
                            </Badge>
                            {estimate.estimateFee > 0 && (
                              <Badge variant="outline">
                                Fee: ${estimate.estimateFee} {estimate.estimateFeePaid && '✓ Paid'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{estimate.description}</p>
                          <p className="text-sm font-medium mt-1">${estimate.amount.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          {estimate.status === 'Sent' && (
                            <Button size="sm" onClick={() => handleApproveEstimate(estimate.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Approved
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Work Items Section */}
            <Card>
              <CardHeader>
                <CardTitle>Work History</CardTitle>
              </CardHeader>
              <CardContent>
                {contractorWork.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No work items yet</p>
                ) : (
                  <div className="space-y-3">
                    {contractorWork.map(work => (
                      <div key={work.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-semibold">{work.jobNumber}</p>
                            <Badge className={
                              work.status === 'Paid' ? 'bg-green-500' :
                              work.status === 'Completed' ? 'bg-blue-500' :
                              work.status === 'In Progress' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }>
                              {work.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{work.description}</p>
                          <p className="text-sm font-medium mt-1">${work.amount.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          {work.status === 'Completed' && !work.relatedInvoiceId && (
                            <Button size="sm" onClick={() => handleCreateInvoiceFromWork(work.id)}>
                              <FileText className="w-4 h-4 mr-2" />
                              Create Invoice
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoices Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Invoices</CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Invoice
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {contractorInvoices.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No invoices yet</p>
                ) : (
                  <div className="space-y-3">
                    {contractorInvoices.map(invoice => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-semibold">{invoice.number}</p>
                            <Badge className={
                              invoice.status === 'Paid' ? 'bg-green-500' :
                              invoice.status === 'Overdue' ? 'bg-red-500' :
                              invoice.status === 'Sent' ? 'bg-blue-500' :
                              'bg-gray-500'
                            }>
                              {invoice.status}
                            </Badge>
                            {invoice.isEstimateFeeInvoice && (
                              <Badge variant="outline">Estimate Fee</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{invoice.description}</p>
                          <p className="text-sm font-medium mt-1">${invoice.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // Main List View
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentSection('home')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                My Contractors
              </h1>
              <p className="text-xs text-muted-foreground">
                Contractors I subcontract for
              </p>
            </div>
            <Button onClick={() => setShowAddContractor(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contractor
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {contractors.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No contractors yet
                </p>
                <Button onClick={() => setShowAddContractor(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Contractor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contractors.map(contractor => {
                const stats = getContractorStats(contractor.id)
                return (
                  <Card
                    key={contractor.id}
                    className="hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedContractorId(contractor.id)
                      setCurrentView('contractor')
                    }}
                  >
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {contractor.company}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">{contractor.name}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Earned:</span>
                          <span className="font-semibold text-green-600">${stats.totalEarned.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pending:</span>
                          <span className="font-semibold text-orange-600">${stats.totalPending.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Jobs:</span>
                          <span className="font-semibold">{stats.totalWork}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Info Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-2">
                Subcontractor Management
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Track estimates sent to general contractors</li>
                <li>• Manage invoices with automatic estimate fee deduction</li>
                <li>• Keep work history with payment status</li>
                <li>• Toggle terms & conditions on/off for each document</li>
                <li>• When estimate is approved, fee is automatically deducted from final invoice</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add Contractor Modal */}
      {showAddContractor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Contractor</CardTitle>
              <CardDescription>Add a contractor you subcontract for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Contractor Name *</label>
                <Input
                  placeholder="John Smith"
                  value={contractorFormData.name}
                  onChange={(e) => setContractorFormData({ ...contractorFormData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Company *</label>
                <Input
                  placeholder="ABC Construction"
                  value={contractorFormData.company}
                  onChange={(e) => setContractorFormData({ ...contractorFormData, company: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={contractorFormData.email}
                  onChange={(e) => setContractorFormData({ ...contractorFormData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Phone</label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={contractorFormData.phone}
                  onChange={(e) => setContractorFormData({ ...contractorFormData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Payment Terms</label>
                <select
                  value={contractorFormData.paymentTerms}
                  onChange={(e) => setContractorFormData({ ...contractorFormData, paymentTerms: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="COD">COD</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddContractor(false)
                    setContractorFormData({
                      name: '',
                      company: '',
                      email: '',
                      phone: '',
                      paymentTerms: 'Net 30'
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddContractor}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contractor
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
