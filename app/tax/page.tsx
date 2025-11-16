'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTaxStore } from '@/lib/stores/tax-store';
import {
  formatCurrency,
  formatDate,
  getCurrentQuarter,
  getQuarterlyTaxDueDates,
} from '@/lib/tax-utils';
import {
  FileText,
  Calculator,
  Car,
  Calendar,
  TrendingUp,
  DollarSign,
  Upload,
  Settings,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function TaxDashboardPage() {
  const { generateQuarterlyReport, generateAnnualReport, mileageLogs, taxDocuments } = useTaxStore();

  const userId = 'current-user'; // In real app, get from auth
  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();

  // Generate current quarter and YTD reports
  const quarterlyReport = useMemo(() => {
    return generateQuarterlyReport(currentQuarter.quarter, currentQuarter.year);
  }, [generateQuarterlyReport, currentQuarter]);

  const yearToDate = useMemo(() => {
    return generateAnnualReport(currentYear);
  }, [generateAnnualReport, currentYear]);

  const dueDates = getQuarterlyTaxDueDates(currentYear);
  const nextPaymentDue = dueDates[currentQuarter.quarter];
  const daysUntilDue = Math.ceil(
    (new Date(nextPaymentDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Recent mileage logs
  const recentMileage = useMemo(() => {
    return mileageLogs
      .filter((log) => log.user_id === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [mileageLogs, userId]);

  // Recent documents
  const recentDocs = useMemo(() => {
    return taxDocuments
      .filter((doc) => doc.user_id === userId)
      .sort((a, b) => new Date(b.date_uploaded).getTime() - new Date(a.date_uploaded).getTime())
      .slice(0, 5);
  }, [taxDocuments, userId]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tax Dashboard</h1>
          <p className="text-muted-foreground">
            Track your tax compliance and deductions for {currentYear}
          </p>
        </div>
        <Link href="/tax/deductions">
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Tax Settings
          </Button>
        </Link>
      </div>

      {/* Quarterly Tax Due Alert */}
      {daysUntilDue <= 30 && daysUntilDue > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <div className="font-semibold text-orange-900 dark:text-orange-100">
                  Quarterly Tax Payment Due Soon
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-200">
                  Q{currentQuarter.quarter} {currentYear} payment of{' '}
                  {formatCurrency(quarterlyReport.estimated_tax_owed)} is due on{' '}
                  {formatDate(nextPaymentDue)} ({daysUntilDue} days remaining)
                </div>
              </div>
              <Link href="/tax/reports">
                <Button variant="outline">View Report</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Quarter Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Current Quarter (Q{currentQuarter.quarter} {currentYear})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Revenue</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {formatCurrency(quarterlyReport.gross_revenue)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Expenses</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                {formatCurrency(quarterlyReport.total_expenses)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Net Income</CardDescription>
              <CardTitle className="text-2xl">
                {formatCurrency(quarterlyReport.net_income)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Est. Tax</CardDescription>
              <CardTitle className="text-2xl text-orange-600">
                {formatCurrency(quarterlyReport.estimated_tax_owed)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Year to Date Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Year to Date ({currentYear})</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Gross Receipts</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {formatCurrency(yearToDate.gross_receipts)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Expenses</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                {formatCurrency(yearToDate.total_expenses)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Net Profit</CardDescription>
              <CardTitle className="text-2xl">
                {formatCurrency(yearToDate.net_profit)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tax Liability</CardDescription>
              <CardTitle className="text-2xl text-orange-600">
                {formatCurrency(yearToDate.total_estimated_tax)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/tax/mileage">
            <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Car className="h-8 w-8 mb-2 text-primary" />
                  <div className="font-semibold">Add Mileage</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {quarterlyReport.total_miles.toFixed(0)} miles this quarter
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tax/documents">
            <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Upload className="h-8 w-8 mb-2 text-primary" />
                  <div className="font-semibold">Upload Document</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {recentDocs.length} documents this year
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tax/reports">
            <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <FileText className="h-8 w-8 mb-2 text-primary" />
                  <div className="font-semibold">View Reports</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Quarterly & annual reports
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tax/deductions">
            <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Calculator className="h-8 w-8 mb-2 text-primary" />
                  <div className="font-semibold">Deduction Calculator</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Estimate your deductions
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Mileage */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Mileage</CardTitle>
              <Link href="/tax/mileage">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentMileage.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No mileage entries yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentMileage.map((log) => (
                  <div key={log.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{log.purpose}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(log.date)} • {log.miles.toFixed(1)} miles
                      </div>
                    </div>
                    <Badge variant={log.is_business ? 'default' : 'secondary'}>
                      {formatCurrency(log.deduction_amount)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Documents</CardTitle>
              <Link href="/tax/documents">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentDocs.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No documents uploaded yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{doc.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(doc.date_uploaded)}
                      </div>
                    </div>
                    <Badge variant={doc.document_type.includes('1099') ? 'default' : 'secondary'}>
                      {doc.document_type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deduction Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Top Deductions (YTD)</CardTitle>
          <CardDescription>Your largest tax deductions for {currentYear}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Mileage Deduction</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(yearToDate.mileage_deduction)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {yearToDate.business_mileage.toFixed(0)} business miles
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Home Office</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(yearToDate.home_office)}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Total Deductions</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(yearToDate.total_expenses)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
