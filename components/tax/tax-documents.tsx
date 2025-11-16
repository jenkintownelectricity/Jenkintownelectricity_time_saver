'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useTaxStore } from '@/lib/stores/tax-store';
import { TaxDocument, DeductionCategory } from '@/lib/types/tax';
import { formatCurrency, formatDate, getTaxYearOptions } from '@/lib/tax-utils';
import { Plus, Upload, Download, Trash2, FileText, Search, X, Check } from 'lucide-react';

interface TaxDocumentsProps {
  userId: string;
}

export function TaxDocumentsComponent({ userId }: TaxDocumentsProps) {
  const { taxDocuments, addTaxDocument, updateTaxDocument, deleteTaxDocument, getTaxDocumentsForYear } =
    useTaxStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    document_type: 'RECEIPT' as TaxDocument['document_type'],
    title: '',
    description: '',
    tax_year: new Date().getFullYear(),
    amount: '',
    category: DeductionCategory.OTHER,
    tags: '',
    date_received: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Filter and search documents
  const filteredDocs = useMemo(() => {
    let docs = getTaxDocumentsForYear(filterYear).filter(doc => doc.user_id === userId);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      docs = docs.filter(
        (doc) =>
          doc.title.toLowerCase().includes(term) ||
          doc.description?.toLowerCase().includes(term) ||
          doc.document_type.toLowerCase().includes(term)
      );
    }

    return docs.sort((a, b) => new Date(b.date_uploaded).getTime() - new Date(a.date_uploaded).getTime());
  }, [taxDocuments, filterYear, searchTerm, userId, getTaxDocumentsForYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const docData = {
      user_id: userId,
      document_type: formData.document_type,
      title: formData.title,
      description: formData.description || undefined,
      tax_year: formData.tax_year,
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
      category: formData.category,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
      date_received: formData.date_received || undefined,
      date_uploaded: new Date().toISOString(),
      notes: formData.notes || undefined,
    };

    if (editingId) {
      updateTaxDocument(editingId, docData);
      setEditingId(null);
    } else {
      addTaxDocument(docData);
    }

    // Reset form
    setFormData({
      document_type: 'RECEIPT',
      title: '',
      description: '',
      tax_year: new Date().getFullYear(),
      amount: '',
      category: DeductionCategory.OTHER,
      tags: '',
      date_received: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowForm(false);
  };

  const handleEdit = (doc: TaxDocument) => {
    setFormData({
      document_type: doc.document_type,
      title: doc.title,
      description: doc.description || '',
      tax_year: doc.tax_year,
      amount: doc.amount?.toString() || '',
      category: doc.category || DeductionCategory.OTHER,
      tags: doc.tags.join(', '),
      date_received: doc.date_received || new Date().toISOString().split('T')[0],
      notes: doc.notes || '',
    });
    setEditingId(doc.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      document_type: 'RECEIPT',
      title: '',
      description: '',
      tax_year: new Date().getFullYear(),
      amount: '',
      category: DeductionCategory.OTHER,
      tags: '',
      date_received: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  // Calculate totals
  const totals = useMemo(() => {
    const docs1099 = filteredDocs.filter(d => d.document_type.includes('1099'));
    const receipts = filteredDocs.filter(d => d.document_type === 'RECEIPT');

    return {
      total1099: docs1099.reduce((sum, doc) => sum + (doc.amount || 0), 0),
      totalReceipts: receipts.reduce((sum, doc) => sum + (doc.amount || 0), 0),
      count1099: docs1099.length,
      countReceipts: receipts.length,
    };
  }, [filteredDocs]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Documents</CardDescription>
            <CardTitle className="text-2xl">{filteredDocs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>1099 Forms</CardDescription>
            <CardTitle className="text-2xl">{totals.count1099}</CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(totals.total1099)}
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Receipts</CardDescription>
            <CardTitle className="text-2xl">{totals.countReceipts}</CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(totals.totalReceipts)}
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tax Year</CardDescription>
            <CardTitle className="text-2xl">{filterYear}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tax Documents</CardTitle>
              <CardDescription>
                Upload and organize W-9s, 1099s, receipts, and other tax documents
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterYear.toString()} onValueChange={(value) => setFilterYear(parseInt(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {getTaxYearOptions().map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doc_type">Document Type</Label>
                  <Select
                    value={formData.document_type}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        document_type: value as TaxDocument['document_type'],
                      })
                    }
                    required
                  >
                    <SelectTrigger id="doc_type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="W9">W-9</SelectItem>
                      <SelectItem value="1099">1099</SelectItem>
                      <SelectItem value="1099-NEC">1099-NEC</SelectItem>
                      <SelectItem value="1099-MISC">1099-MISC</SelectItem>
                      <SelectItem value="W2">W-2</SelectItem>
                      <SelectItem value="1040-ES">1040-ES</SelectItem>
                      <SelectItem value="RECEIPT">Receipt</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc_title">Title</Label>
                  <Input
                    id="doc_title"
                    placeholder="e.g., ABC Company 1099-NEC"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_year">Tax Year</Label>
                  <Select
                    value={formData.tax_year.toString()}
                    onValueChange={(value) => setFormData({ ...formData, tax_year: parseInt(value) })}
                  >
                    <SelectTrigger id="tax_year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {getTaxYearOptions().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (Optional)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value as DeductionCategory })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DeductionCategory).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_received">Date Received</Label>
                  <Input
                    id="date_received"
                    type="date"
                    value={formData.date_received}
                    onChange={(e) => setFormData({ ...formData, date_received: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Brief description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., client, supplies, equipment"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  <Check className="h-4 w-4 mr-2" />
                  {editingId ? 'Update' : 'Save'} Document
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Documents Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No documents found. Add your first document to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocs.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Badge variant={doc.document_type.includes('1099') ? 'default' : 'secondary'}>
                          {doc.document_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{doc.title}</div>
                          {doc.description && (
                            <div className="text-xs text-muted-foreground">{doc.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {doc.category
                            ?.replace(/_/g, ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {doc.amount ? formatCurrency(doc.amount) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {doc.date_received ? formatDate(doc.date_received) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {doc.tags.slice(0, 2).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {doc.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{doc.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(doc)}>
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteTaxDocument(doc.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
