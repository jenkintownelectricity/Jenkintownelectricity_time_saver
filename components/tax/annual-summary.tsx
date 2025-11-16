'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTaxStore } from '@/lib/stores/tax-store';
import { DeductionCategory } from '@/lib/types/tax';
import {
  formatCurrency,
  formatDate,
  getTaxYearOptions,
  getScheduleCLine,
  getScheduleCDescription,
} from '@/lib/tax-utils';
import { Download, FileText, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

export function AnnualSummaryComponent() {
  const [activeTab, setActiveTab] = React.useState("schedule-c");
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { generateAnnualReport } = useTaxStore();

  const annualSummary = useMemo(() => {
    return generateAnnualReport(selectedYear);
  }, [selectedYear, generateAnnualReport]);

  const handleExportForAccountant = () => {
    // Generate comprehensive export for accountant
    const data = {
      year: annualSummary.year,
      scheduleC: {
        gross_receipts: annualSummary.gross_receipts,
        returns_allowances: annualSummary.returns_allowances,
        cogs: annualSummary.cogs,
        gross_profit: annualSummary.gross_profit,
        expenses_by_line: Object.entries(annualSummary.expenses_by_category).map(
          ([category, amount]) => ({
            line: getScheduleCLine(category as DeductionCategory),
            description: getScheduleCDescription(category as DeductionCategory),
            category,
            amount,
          })
        ),
        car_truck_expenses: annualSummary.car_truck_expenses,
        depreciation: annualSummary.depreciation,
        home_office: annualSummary.home_office,
        net_profit: annualSummary.net_profit,
      },
      self_employment: {
        income: annualSummary.self_employment_income,
        tax: annualSummary.self_employment_tax,
      },
      estimated_payments: annualSummary.quarterly_payments_made,
      mileage: {
        total: annualSummary.total_mileage,
        business: annualSummary.business_mileage,
        deduction: annualSummary.mileage_deduction,
      },
      income_1099: {
        nec: annualSummary.income_1099_nec,
        misc: annualSummary.income_1099_misc,
        total: annualSummary.total_1099_income,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tax-summary-${selectedYear}-for-accountant.json`;
    link.click();
  };

  const handleExportPDF = () => {
    alert('PDF export would be implemented here using react-pdf or jsPDF');
  };

  const taxEffectiveRate = annualSummary.net_profit > 0
    ? (annualSummary.total_estimated_tax / annualSummary.net_profit) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Annual Tax Summary</CardTitle>
              <CardDescription>Comprehensive year-end tax report for Schedule C preparation</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportForAccountant} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                For Accountant
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
                  <SelectValue />
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
            <div className="flex items-end">
              <div className="text-sm text-muted-foreground">
                Generated: {formatDate(new Date().toISOString())}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gross Receipts</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {formatCurrency(annualSummary.gross_receipts)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {formatCurrency(annualSummary.total_expenses)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Profit (Loss)</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(annualSummary.net_profit)}
            </CardTitle>
            {annualSummary.net_profit >= 0 ? (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                Profit
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <TrendingDown className="h-3 w-3" />
                Loss
              </div>
            )}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Est. Tax Liability</CardDescription>
            <CardTitle className="text-2xl text-orange-600">
              {formatCurrency(annualSummary.total_estimated_tax)}
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              {taxEffectiveRate.toFixed(1)}% effective rate
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs for Different Sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="schedule-c">Schedule C</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="tax">Tax Summary</TabsTrigger>
          <TabsTrigger value="1099">1099 Income</TabsTrigger>
        </TabsList>

        {/* Schedule C Tab */}
        <TabsContent value="schedule-c" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule C - Profit or Loss from Business</CardTitle>
              <CardDescription>Data for IRS Form 1040 Schedule C</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Part I - Income */}
                <div>
                  <h3 className="font-semibold mb-3">Part I - Income</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Line 1: Gross receipts or sales</span>
                      <span className="font-medium">{formatCurrency(annualSummary.gross_receipts)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Line 2: Returns and allowances</span>
                      <span className="font-medium">{formatCurrency(annualSummary.returns_allowances)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Line 3: Subtract line 2 from line 1</span>
                      <span className="font-medium">{formatCurrency(annualSummary.net_revenue)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Line 4: Cost of goods sold</span>
                      <span className="font-medium">{formatCurrency(annualSummary.cogs)}</span>
                    </div>
                    <div className="flex justify-between py-3 bg-muted px-3 rounded font-semibold">
                      <span>Line 7: Gross profit (line 3 minus line 4)</span>
                      <span>{formatCurrency(annualSummary.gross_profit)}</span>
                    </div>
                  </div>
                </div>

                {/* Part II - Expenses Summary */}
                <div>
                  <h3 className="font-semibold mb-3">Part II - Expenses</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Line 9: Car and truck expenses</span>
                      <span className="font-medium">{formatCurrency(annualSummary.car_truck_expenses)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Line 13: Depreciation</span>
                      <span className="font-medium">{formatCurrency(annualSummary.depreciation)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Line 30: Home office expense</span>
                      <span className="font-medium">{formatCurrency(annualSummary.home_office)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Line 28: Total expenses</span>
                      <span className="font-medium">{formatCurrency(annualSummary.total_expenses)}</span>
                    </div>
                    <div className="flex justify-between py-3 bg-muted px-3 rounded font-semibold">
                      <span>Line 31: Net profit or (loss)</span>
                      <span className={annualSummary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(annualSummary.net_profit)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>Detailed breakdown of all business expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schedule C Line</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(annualSummary.expenses_by_category).map(([category, amount]) => (
                    <TableRow key={category}>
                      <TableCell>
                        <Badge variant="outline">
                          Line {getScheduleCLine(category as DeductionCategory)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {((amount / annualSummary.total_expenses) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} className="font-bold">Total Expenses</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(annualSummary.total_expenses)}
                    </TableCell>
                    <TableCell className="text-right font-bold">100%</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deductions Tab */}
        <TabsContent value="deductions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Expenses</CardTitle>
                <CardDescription>Standard mileage deduction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Miles:</span>
                  <span className="font-medium">{annualSummary.total_mileage.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business Miles:</span>
                  <span className="font-medium">{annualSummary.business_mileage.toFixed(0)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Deduction:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(annualSummary.mileage_deduction)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Home Office Deduction</CardTitle>
                <CardDescription>Business use of home</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual Deduction:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(annualSummary.home_office)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tax Summary Tab */}
        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Summary</CardTitle>
              <CardDescription>Estimated tax liability and payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Self-Employment Tax</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Self-employment income:</span>
                    <span className="font-medium">
                      {formatCurrency(annualSummary.self_employment_income)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Self-employment tax (15.3%):</span>
                    <span className="font-medium">
                      {formatCurrency(annualSummary.self_employment_tax)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Income Tax</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Estimated federal tax:</span>
                    <span className="font-medium">
                      {formatCurrency(annualSummary.estimated_federal_tax)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Estimated state tax:</span>
                    <span className="font-medium">
                      {formatCurrency(annualSummary.estimated_state_tax)}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 bg-muted px-3 rounded font-semibold">
                    <span>Total estimated tax:</span>
                    <span>{formatCurrency(annualSummary.total_estimated_tax)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Estimated Payments Made</h3>
                <div className="space-y-2">
                  {annualSummary.quarterly_payments_made
                    .filter((p) => p.paid)
                    .map((payment, index) => (
                      <div key={index} className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Q{payment.quarter}:</span>
                        <span className="font-medium">{formatCurrency(payment.amount)}</span>
                      </div>
                    ))}
                  <div className="flex justify-between py-3 bg-muted px-3 rounded font-semibold">
                    <span>Total payments:</span>
                    <span>{formatCurrency(annualSummary.total_estimated_payments)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center py-3 bg-muted px-4 rounded-lg">
                  <span className="text-lg font-bold">Balance {annualSummary.tax_balance_due >= 0 ? 'Due' : 'Refund'}:</span>
                  <span className={`text-2xl font-bold ${annualSummary.tax_balance_due >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(Math.abs(annualSummary.tax_balance_due))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 1099 Income Tab */}
        <TabsContent value="1099" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>1099 Income Tracking</CardTitle>
              <CardDescription>Non-employee compensation and miscellaneous income</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>1099-NEC</CardDescription>
                      <CardTitle className="text-xl">
                        {formatCurrency(annualSummary.income_1099_nec)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>1099-MISC</CardDescription>
                      <CardTitle className="text-xl">
                        {formatCurrency(annualSummary.income_1099_misc)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total 1099 Income</CardDescription>
                      <CardTitle className="text-xl text-green-600">
                        {formatCurrency(annualSummary.total_1099_income)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
