'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  FileText,
  Download,
  Upload,
  Calendar,
  DollarSign,
  Filter,
  Package,
  Send,
  Trash2,
  Edit,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  FileBarChart
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import {
  TaxDocumentCategory,
  TaxDocument,
  TaxYear,
  TaxQuarter,
  suggestCategory,
  getTotalByCategory,
  getQuarterDateRange
} from '@/lib/tax-documents'

const TAX_CATEGORIES: TaxDocumentCategory[] = [
  'Income',
  'Expenses',
  'Receipts',
  'Mileage',
  'Equipment Purchases',
  'Materials',
  'Subcontractor Payments',
  'Vehicle Expenses',
  'Office Expenses',
  'Insurance',
  'Taxes & Licenses',
  'Bank Statements',
  'Credit Card Statements',
  '1099s Received',
  '1099s Sent',
  'W2s',
  'Invoices Sent',
  'Invoices Received',
  'Permits & Fees',
  'Other'
]

const QUARTERS: TaxQuarter[] = ['Q1', 'Q2', 'Q3', 'Q4']

export default function TaxManager() {
  const {
    taxDocuments,
    taxPackages,
    addTaxDocument,
    updateTaxDocument,
    deleteTaxDocument,
    getTaxDocumentsByYear,
    getTaxDocumentsByQuarter,
    createTaxPackage,
    markPackageSubmitted,
    saveSettings
  } = useAppStore()

  const [view, setView] = useState<'documents' | 'packages' | 'reports'>('documents')
  const [selectedYear, setSelectedYear] = useState<TaxYear>(new Date().getFullYear())
  const [selectedQuarter, setSelectedQuarter] = useState<TaxQuarter | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<TaxDocumentCategory | 'all'>('all')
  const [showAddDocument, setShowAddDocument] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<TaxDocument>>({
    name: '',
    category: 'Income',
    date: Date.now(),
    amount: 0,
    description: ''
  })

  // Get available years from documents
  const availableYears = useMemo(() => {
    const years = new Set(taxDocuments.map(doc => doc.year))
    const currentYear = new Date().getFullYear()
    if (!years.has(currentYear)) years.add(currentYear)
    return Array.from(years).sort((a, b) => b - a)
  }, [taxDocuments])

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let docs = taxDocuments

    // Filter by year
    docs = docs.filter(doc => doc.year === selectedYear)

    // Filter by quarter
    if (selectedQuarter !== 'all') {
      docs = docs.filter(doc => doc.quarter === selectedQuarter)
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      docs = docs.filter(doc => doc.category === selectedCategory)
    }

    return docs.sort((a, b) => b.date - a.date)
  }, [taxDocuments, selectedYear, selectedQuarter, selectedCategory])

  // Calculate totals
  const totals = useMemo(() => {
    const income = getTotalByCategory(filteredDocuments, 'Income')
    const expenses = filteredDocuments
      .filter(doc => doc.category !== 'Income' && doc.amount)
      .reduce((sum, doc) => sum + (doc.amount || 0), 0)

    return {
      income,
      expenses,
      profit: income - expenses
    }
  }, [filteredDocuments])

  const handleAddDocument = () => {
    if (!formData.name || !formData.category) {
      alert('Please enter document name and category')
      return
    }

    const docToAdd = {
      name: formData.name!,
      category: formData.category!,
      description: formData.description,
      amount: formData.amount || 0,
      date: formData.date || Date.now(),
      linkedEntityId: formData.linkedEntityId,
      linkedEntityType: formData.linkedEntityType,
      tags: formData.tags || [],
      notes: formData.notes,
      submittedToAccountant: false,
      year: selectedYear,
      quarter: selectedQuarter !== 'all' ? selectedQuarter : 'Q1'
    }

    addTaxDocument(docToAdd)
    saveSettings()

    setFormData({
      name: '',
      category: 'Income',
      date: Date.now(),
      amount: 0,
      description: ''
    })
    setShowAddDocument(false)
  }

  const handleEditDocument = (doc: TaxDocument) => {
    setFormData(doc)
    setEditingId(doc.id)
    setShowAddDocument(true)
  }

  const handleUpdateDocument = () => {
    if (!editingId) return

    updateTaxDocument(editingId, formData)
    saveSettings()

    setFormData({
      name: '',
      category: 'Income',
      date: Date.now(),
      amount: 0,
      description: ''
    })
    setEditingId(null)
    setShowAddDocument(false)
  }

  const handleDeleteDocument = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteTaxDocument(id)
      saveSettings()
    }
  }

  const handleCreatePackage = (type: 'quarterly' | 'annual') => {
    const quarter = type === 'quarterly' && selectedQuarter !== 'all' ? selectedQuarter : undefined
    const packageId = createTaxPackage(selectedYear, quarter, type)
    saveSettings()
    alert(`${type === 'quarterly' ? 'Quarterly' : 'Annual'} package created! You can now export and send to your accountant.`)
    setView('packages')
  }

  const handleMarkSubmitted = (packageId: string) => {
    const email = prompt('Enter accountant email (optional):')
    markPackageSubmitted(packageId, email || undefined)
    saveSettings()
  }

  const handleAutoSuggestCategory = () => {
    if (formData.name || formData.description) {
      const suggested = suggestCategory(formData.name || '', formData.description)
      setFormData({ ...formData, category: suggested })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tax Documents Manager</h1>
          <p className="text-muted-foreground mt-1">
            Organize everything for your accountant - quarterly or annually
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'documents' ? 'default' : 'outline'}
            onClick={() => setView('documents')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Documents
          </Button>
          <Button
            variant={view === 'packages' ? 'default' : 'outline'}
            onClick={() => setView('packages')}
          >
            <Package className="w-4 h-4 mr-2" />
            Packages
          </Button>
          <Button
            variant={view === 'reports' ? 'default' : 'outline'}
            onClick={() => setView('reports')}
          >
            <FileBarChart className="w-4 h-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Year Filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Tax Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Quarter Filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Quarter</label>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value as TaxQuarter | 'all')}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All Quarters</option>
                {QUARTERS.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as TaxDocumentCategory | 'all')}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All Categories</option>
                {TAX_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex gap-2">
              <Button onClick={() => setShowAddDocument(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Document
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600">${totals.income.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">${totals.expenses.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Profit/Loss</p>
                <p className={`text-2xl font-bold ${totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${totals.profit.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {view === 'documents' && (
        <div className="space-y-4">
          {/* Add/Edit Form */}
          {showAddDocument && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle>{editingId ? 'Edit' : 'Add'} Tax Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Document Name *</label>
                    <Input
                      placeholder="e.g., Invoice #1234, Receipt for tools"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onBlur={handleAutoSuggestCategory}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block flex items-center justify-between">
                      <span>Category *</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAutoSuggestCategory}
                        className="h-6 text-xs"
                      >
                        Auto-Suggest
                      </Button>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as TaxDocumentCategory })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      {TAX_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Amount</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Date</label>
                    <Input
                      type="date"
                      value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value).getTime() })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Input
                    placeholder="Additional details"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    onBlur={handleAutoSuggestCategory}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Notes</label>
                  <Input
                    placeholder="Internal notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddDocument(false)
                      setEditingId(null)
                      setFormData({
                        name: '',
                        category: 'Income',
                        date: Date.now(),
                        amount: 0,
                        description: ''
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={editingId ? handleUpdateDocument : handleAddDocument}>
                    {editingId ? 'Update' : 'Add'} Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Documents ({filteredDocuments.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreatePackage('quarterly')}
                    disabled={selectedQuarter === 'all'}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Package Quarter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreatePackage('annual')}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Package Year
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No documents found for selected filters</p>
                  <Button className="mt-4" onClick={() => setShowAddDocument(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDocuments.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{doc.name}</p>
                          {doc.submittedToAccountant && (
                            <Badge variant="outline" className="text-green-600">
                              <Check className="w-3 h-3 mr-1" />
                              Submitted
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary">{doc.category}</Badge>
                          <span>{doc.quarter} {doc.year}</span>
                          <span>{new Date(doc.date).toLocaleDateString()}</span>
                          {doc.amount && doc.amount > 0 && (
                            <span className="font-medium">${doc.amount.toLocaleString()}</span>
                          )}
                        </div>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditDocument(doc)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {view === 'packages' && (
        <Card>
          <CardHeader>
            <CardTitle>Tax Packages for Accountant</CardTitle>
            <CardDescription>
              Generated packages ready to send to your accountant
            </CardDescription>
          </CardHeader>
          <CardContent>
            {taxPackages.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No packages created yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Go to Documents tab and create a quarterly or annual package
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {taxPackages.sort((a, b) => b.generatedAt - a.generatedAt).map(pkg => (
                  <div key={pkg.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {pkg.type === 'quarterly' ? `${pkg.quarter} ${pkg.year}` : `${pkg.year} Annual`} Package
                          </h3>
                          {pkg.submittedAt && (
                            <Badge variant="outline" className="text-green-600">
                              <Check className="w-3 h-3 mr-1" />
                              Submitted
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{pkg.documents.length} documents included</p>
                          <p>Generated: {new Date(pkg.generatedAt).toLocaleString()}</p>
                          {pkg.submittedAt && (
                            <p>Submitted: {new Date(pkg.submittedAt).toLocaleString()}</p>
                          )}
                          {pkg.accountantEmail && (
                            <p>Sent to: {pkg.accountantEmail}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                        {!pkg.submittedAt && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleMarkSubmitted(pkg.id)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Mark Submitted
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {view === 'reports' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Report</CardTitle>
              <CardDescription>
                {selectedQuarter !== 'all' ? `${selectedQuarter} ${selectedYear}` : `Full Year ${selectedYear}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Income Section */}
                <div>
                  <h3 className="font-semibold text-green-600 mb-2">Income</h3>
                  <div className="pl-4 space-y-1">
                    {TAX_CATEGORIES.filter(cat => cat === 'Income').map(cat => {
                      const total = getTotalByCategory(filteredDocuments, cat)
                      if (total === 0) return null
                      return (
                        <div key={cat} className="flex justify-between text-sm">
                          <span>{cat}</span>
                          <span className="font-medium">${total.toLocaleString()}</span>
                        </div>
                      )
                    })}
                    <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                      <span>Total Income</span>
                      <span className="text-green-600">${totals.income.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Expenses Section */}
                <div>
                  <h3 className="font-semibold text-red-600 mb-2">Expenses</h3>
                  <div className="pl-4 space-y-1">
                    {TAX_CATEGORIES.filter(cat => cat !== 'Income').map(cat => {
                      const total = getTotalByCategory(filteredDocuments, cat)
                      if (total === 0) return null
                      return (
                        <div key={cat} className="flex justify-between text-sm">
                          <span>{cat}</span>
                          <span className="font-medium">${total.toLocaleString()}</span>
                        </div>
                      )
                    })}
                    <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                      <span>Total Expenses</span>
                      <span className="text-red-600">${totals.expenses.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Net Profit */}
                <div className="border-t-2 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Net Profit/Loss</span>
                    <span className={totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${totals.profit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
