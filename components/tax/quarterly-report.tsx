'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useTaxStore } from '@/lib/stores/tax-store';
import { TaxQuarter } from '@/lib/types/tax';
import {
  formatCurrency,
  formatDate,
  getQuarterDateRange,
  getTaxYearOptions,
  getQuarterlyTaxDueDates,
  exportTaxReportToCSV,
} from '@/lib/tax-utils';
import { Download, FileText, DollarSign, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export function QuarterlyReportComponent() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<TaxQuarter>(1);

  const { generateQuarterlyReport, saveReport, getReport, recordQuarterlyPayment } = useTaxStore();

  // Generate or get report
  const report = useMemo(() => {
    const existingReport = getReport('quarterly', selectedYear, selectedQuarter);
    if (existingReport) return existingReport;

    const newReport = generateQuarterlyReport(selectedQuarter, selectedYear);
    saveReport(newReport);
    return newReport;
  }, [selectedYear, selectedQuarter, generateQuarterlyReport, saveReport, getReport]);

  const quarterInfo = getQuarterDateRange(selectedQuarter, selectedYear);
  const dueDates = getQuarterlyTaxDueDates(selectedYear);
  const payment = report.quarterly_payments[0];

  const [paymentForm, setPaymentForm] = useState({
    amount: payment?.amount.toFixed(2) || '',
    paid_date: new Date().toISOString().split('T')[0],
    payment_method: 'EFTPS',
    confirmation_number: '',
  });

  const handleRecordPayment = () => {
    recordQuarterlyPayment(selectedYear, selectedQuarter, {
      quarter: selectedQuarter,
      due_date: dueDates[selectedQuarter],
      amount: parseFloat(paymentForm.amount),
      paid: true,
      paid_date: paymentForm.paid_date,
      payment_method: paymentForm.payment_method,
      confirmation_number: paymentForm.confirmation_number || undefined,
    });
  };

  const handleExportPDF = () => {
    // In a real app, this would generate a PDF
    alert('PDF export would be implemented here using a library like react-pdf or jsPDF');
  };

  const handleExportCSV = () => {
    exportTaxReportToCSV(report);
  };

  const profitMargin = report.gross_revenue > 0
    ? (report.net_income / report.gross_revenue) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quarterly Tax Report</CardTitle>
              <CardDescription>Review your quarterly income, expenses, and tax estimates</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={handleExportPDF} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Tax Year</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger id="year">
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
              <Label htmlFor="quarter">Quarter</Label>
              <Select
                value={selectedQuarter.toString()}
                onValueChange={(value) => setSelectedQuarter(parseInt(value) as TaxQuarter)}
              >
                <SelectTrigger id="quarter">
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Q1 (Jan - Mar)</SelectItem>
                  <SelectItem value="2">Q2 (Apr - Jun)</SelectItem>
                  <SelectItem value="3">Q3 (Jul - Sep)</SelectItem>
                  <SelectItem value="4">Q4 (Oct - Dec)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-muted-foreground">Period: </span>
                <span className="font-medium">
                  {formatDate(quarterInfo.start_date)} - {formatDate(quarterInfo.end_date)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Due Date: </span>
                <span className="font-medium">{formatDate(dueDates[selectedQuarter])}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gross Revenue</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {formatCurrency(report.gross_revenue)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {formatCurrency(report.total_expenses)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Income</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(report.net_income)}
            </CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              {profitMargin.toFixed(1)}% margin
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Estimated Tax</CardDescription>
            <CardTitle className="text-2xl text-orange-600">
              {formatCurrency(report.estimated_tax_owed)}
            </CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              {(report.estimated_tax_rate * 100).toFixed(0)}% rate
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Summary by Category</CardTitle>
          <CardDescription>All deductible business expenses for Q{selectedQuarter} {selectedYear}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.expenses.map((expense) => (
                <TableRow key={expense.category}>
                  <TableCell className="font-medium">
                    {expense.category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </TableCell>
                  <TableCell className="text-right">{expense.count}</TableCell>
                  <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell className="text-right">
                    {((expense.amount / report.total_expenses) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(report.total_expenses)}
                </TableCell>
                <TableCell className="text-right font-bold">100%</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Specific Deductions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mileage Deduction</CardTitle>
            <CardDescription>Business vehicle use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Miles:</span>
                <span className="font-medium">{report.total_miles.toFixed(1)} miles</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deduction:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(report.mileage_deduction)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Home Office Deduction</CardTitle>
            <CardDescription>Business use of home</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quarterly Amount:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(report.home_office_deduction)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quarterly Tax Payment */}
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Estimated Tax Payment</CardTitle>
          <CardDescription>
            Form 1040-ES payment for Q{selectedQuarter} {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  {payment?.paid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  )}
                  <div>
                    <div className="font-medium">
                      {payment?.paid ? 'Payment Recorded' : 'Payment Due'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Due: {formatDate(dueDates[selectedQuarter])}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{formatCurrency(report.estimated_tax_owed)}</div>
                {payment?.paid && payment.paid_date && (
                  <div className="text-sm text-muted-foreground">
                    Paid: {formatDate(payment.paid_date)}
                  </div>
                )}
              </div>
            </div>

            {!payment?.paid && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="payment_amount">Amount Paid</Label>
                  <Input
                    id="payment_amount"
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Payment Date</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={paymentForm.paid_date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paid_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select
                    value={paymentForm.payment_method}
                    onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}
                  >
                    <SelectTrigger id="payment_method">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EFTPS">EFTPS (Electronic)</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmation">Confirmation #</Label>
                  <Input
                    id="confirmation"
                    placeholder="Optional"
                    value={paymentForm.confirmation_number}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, confirmation_number: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={handleRecordPayment} className="w-full">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
