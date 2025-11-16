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
import { calculateMileageDeduction, getMileageRateForDate, formatCurrency, formatDate } from '@/lib/tax-utils';
import { MileageLog } from '@/lib/types/tax';
import { Plus, Download, Trash2, Edit2, Check, X } from 'lucide-react';

interface MileageLogProps {
  userId: string;
  filterPeriod?: 'month' | 'quarter' | 'year' | 'all';
}

export function MileageLogComponent({ userId, filterPeriod = 'month' }: MileageLogProps) {
  const {
    mileageLogs,
    addMileageLog,
    updateMileageLog,
    deleteMileageLog,
    getMileageLogsForPeriod,
  } = useTaxStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    start_location: '',
    end_location: '',
    miles: '',
    purpose: '',
    is_business: true,
    customer_name: '',
    notes: '',
  });

  // Filter logs based on period
  const filteredLogs = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (filterPeriod) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return mileageLogs.filter(log => log.user_id === userId);
    }

    return getMileageLogsForPeriod(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    ).filter(log => log.user_id === userId);
  }, [mileageLogs, filterPeriod, userId, getMileageLogsForPeriod]);

  // Calculate totals
  const totals = useMemo(() => {
    const businessLogs = filteredLogs.filter(log => log.is_business);
    const personalLogs = filteredLogs.filter(log => !log.is_business);

    return {
      totalMiles: filteredLogs.reduce((sum, log) => sum + log.miles, 0),
      businessMiles: businessLogs.reduce((sum, log) => sum + log.miles, 0),
      personalMiles: personalLogs.reduce((sum, log) => sum + log.miles, 0),
      totalDeduction: businessLogs.reduce((sum, log) => sum + log.deduction_amount, 0),
      count: filteredLogs.length,
    };
  }, [filteredLogs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const miles = parseFloat(formData.miles);
    const deductionAmount = formData.is_business
      ? calculateMileageDeduction(miles, formData.date)
      : 0;

    const logData = {
      user_id: userId,
      date: formData.date,
      start_location: formData.start_location,
      end_location: formData.end_location,
      miles,
      purpose: formData.purpose,
      is_business: formData.is_business,
      customer_name: formData.customer_name || undefined,
      deduction_amount: deductionAmount,
      notes: formData.notes || undefined,
    };

    if (editingId) {
      updateMileageLog(editingId, logData);
      setEditingId(null);
    } else {
      addMileageLog(logData);
    }

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      start_location: '',
      end_location: '',
      miles: '',
      purpose: '',
      is_business: true,
      customer_name: '',
      notes: '',
    });
    setShowForm(false);
  };

  const handleEdit = (log: MileageLog) => {
    setFormData({
      date: log.date,
      start_location: log.start_location,
      end_location: log.end_location,
      miles: log.miles.toString(),
      purpose: log.purpose,
      is_business: log.is_business,
      customer_name: log.customer_name || '',
      notes: log.notes || '',
    });
    setEditingId(log.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      start_location: '',
      end_location: '',
      miles: '',
      purpose: '',
      is_business: true,
      customer_name: '',
      notes: '',
    });
  };

  const handleExport = () => {
    // In a real app, this would use the export utility
    const csv = filteredLogs
      .map(log =>
        [
          log.date,
          log.start_location,
          log.end_location,
          log.miles,
          log.purpose,
          log.is_business ? 'Business' : 'Personal',
          log.customer_name || '',
          formatCurrency(log.deduction_amount),
        ].join(',')
      )
      .join('\n');

    const headers = 'Date,From,To,Miles,Purpose,Type,Customer,Deduction\n';
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mileage-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Miles</CardDescription>
            <CardTitle className="text-2xl">{totals.totalMiles.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Business Miles</CardDescription>
            <CardTitle className="text-2xl">{totals.businessMiles.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Deduction</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totals.totalDeduction)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Trips</CardDescription>
            <CardTitle className="text-2xl">{totals.count}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Mileage Log Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mileage Log</CardTitle>
              <CardDescription>
                Track your business and personal mileage for tax deductions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => setShowForm(!showForm)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Entry Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="miles">Miles</Label>
                  <Input
                    id="miles"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={formData.miles}
                    onChange={(e) => setFormData({ ...formData, miles: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_location">From</Label>
                  <Input
                    id="start_location"
                    placeholder="Starting location"
                    value={formData.start_location}
                    onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_location">To</Label>
                  <Input
                    id="end_location"
                    placeholder="Destination"
                    value={formData.end_location}
                    onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input
                    id="purpose"
                    placeholder="e.g., Client meeting, Job site visit"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Customer (Optional)</Label>
                  <Input
                    id="customer_name"
                    placeholder="Customer name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="is_business">Trip Type</Label>
                  <Select
                    value={formData.is_business ? 'business' : 'personal'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, is_business: value === 'business' })
                    }
                  >
                    <SelectTrigger id="is_business">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Est. Deduction</Label>
                  <div className="h-9 flex items-center font-semibold text-green-600">
                    {formData.miles && formData.is_business
                      ? formatCurrency(
                          calculateMileageDeduction(parseFloat(formData.miles), formData.date)
                        )
                      : '$0.00'}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  <Check className="h-4 w-4 mr-2" />
                  {editingId ? 'Update' : 'Save'} Entry
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Mileage Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>From → To</TableHead>
                  <TableHead>Miles</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Deduction</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No mileage entries yet. Add your first entry to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.date)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{log.start_location}</div>
                          <div className="text-muted-foreground">→ {log.end_location}</div>
                        </div>
                      </TableCell>
                      <TableCell>{log.miles.toFixed(1)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{log.purpose}</div>
                          {log.customer_name && (
                            <div className="text-xs text-muted-foreground">{log.customer_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.is_business ? 'default' : 'secondary'}>
                          {log.is_business ? 'Business' : 'Personal'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(log.deduction_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(log)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMileageLog(log.id)}
                          >
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
