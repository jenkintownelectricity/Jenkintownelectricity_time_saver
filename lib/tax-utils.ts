// Tax Calculation Utilities

import {
  TaxQuarter,
  TaxQuarterInfo,
  DeductionCategory,
  HomeOfficeCalculation,
  VehicleExpenseComparison,
  MealDeductionCalculation,
} from './types/tax';

// ============================================================================
// IRS MILEAGE RATES BY YEAR
// ============================================================================

export const IRS_MILEAGE_RATES: Record<number, number> = {
  2020: 0.575,
  2021: 0.56,
  2022: 0.585, // Changed mid-year to 0.625 in July
  2023: 0.655,
  2024: 0.67,
  2025: 0.70, // Estimate - update when IRS announces
};

/**
 * Get IRS standard mileage rate for a given year
 */
export function getIRSMileageRate(year: number): number {
  return IRS_MILEAGE_RATES[year] || IRS_MILEAGE_RATES[2024];
}

/**
 * Get IRS mileage rate for a specific date
 * Handles mid-year rate changes (like 2022)
 */
export function getMileageRateForDate(date: string | Date): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;

  // Handle special cases (mid-year changes)
  if (year === 2022 && month >= 7) {
    return 0.625; // July-December 2022
  }

  return getIRSMileageRate(year);
}

/**
 * Calculate mileage deduction
 */
export function calculateMileageDeduction(miles: number, date: string | Date): number {
  const rate = getMileageRateForDate(date);
  return miles * rate;
}

// ============================================================================
// TAX QUARTER UTILITIES
// ============================================================================

/**
 * Get tax quarter from date
 */
export function getQuarterFromDate(date: string | Date): TaxQuarter {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = d.getMonth() + 1; // 1-12

  if (month >= 1 && month <= 3) return 1;
  if (month >= 4 && month <= 6) return 2;
  if (month >= 7 && month <= 9) return 3;
  return 4;
}

/**
 * Get quarter date ranges
 */
export function getQuarterDateRange(quarter: TaxQuarter, year: number): TaxQuarterInfo {
  const ranges: Record<TaxQuarter, { start: string; end: string }> = {
    1: { start: `${year}-01-01`, end: `${year}-03-31` },
    2: { start: `${year}-04-01`, end: `${year}-06-30` },
    3: { start: `${year}-07-01`, end: `${year}-09-30` },
    4: { start: `${year}-10-01`, end: `${year}-12-31` },
  };

  return {
    quarter,
    year,
    start_date: ranges[quarter].start,
    end_date: ranges[quarter].end,
  };
}

/**
 * Get all quarters for a year
 */
export function getQuartersForYear(year: number): TaxQuarterInfo[] {
  return [1, 2, 3, 4].map((q) => getQuarterDateRange(q as TaxQuarter, year));
}

/**
 * Get current quarter
 */
export function getCurrentQuarter(): TaxQuarterInfo {
  const now = new Date();
  const quarter = getQuarterFromDate(now);
  const year = now.getFullYear();
  return getQuarterDateRange(quarter, year);
}

/**
 * Get estimated tax payment due dates for quarters
 */
export function getQuarterlyTaxDueDates(year: number): Record<TaxQuarter, string> {
  return {
    1: `${year}-04-15`, // Q1 due April 15
    2: `${year}-06-15`, // Q2 due June 15
    3: `${year}-09-15`, // Q3 due September 15
    4: `${year + 1}-01-15`, // Q4 due January 15 of next year
  };
}

// ============================================================================
// HOME OFFICE DEDUCTION CALCULATOR
// ============================================================================

/**
 * Calculate home office deduction using both methods
 * Returns recommendation for which method to use
 */
export function calculateHomeOfficeDeduction(
  officeSquareFeet: number,
  totalSquareFeet: number,
  actualExpenses?: {
    rent_mortgage?: number;
    utilities?: number;
    insurance?: number;
    repairs?: number;
    depreciation?: number;
  }
): HomeOfficeCalculation {
  // Simplified method: $5 per square foot, max 300 sq ft
  const simplifiedSqFt = Math.min(officeSquareFeet, 300);
  const simplifiedDeduction = simplifiedSqFt * 5;

  // Actual method: percentage of actual home expenses
  const percentage = totalSquareFeet > 0 ? officeSquareFeet / totalSquareFeet : 0;

  let actualDeduction = 0;
  let actualExpenseBreakdown = {
    rent_mortgage: 0,
    utilities: 0,
    insurance: 0,
    repairs: 0,
    depreciation: 0,
    total: 0,
  };

  if (actualExpenses) {
    actualExpenseBreakdown = {
      rent_mortgage: (actualExpenses.rent_mortgage || 0) * percentage,
      utilities: (actualExpenses.utilities || 0) * percentage,
      insurance: (actualExpenses.insurance || 0) * percentage,
      repairs: (actualExpenses.repairs || 0) * percentage,
      depreciation: (actualExpenses.depreciation || 0) * percentage,
      total: 0,
    };
    actualExpenseBreakdown.total = Object.values(actualExpenseBreakdown).reduce(
      (sum, val) => sum + val,
      0
    );
    actualDeduction = actualExpenseBreakdown.total;
  }

  // Recommend the method with higher deduction
  const recommendedMethod = actualDeduction > simplifiedDeduction ? 'actual' : 'simplified';
  const recommendedDeduction = Math.max(actualDeduction, simplifiedDeduction);

  return {
    method: recommendedMethod,
    square_feet: officeSquareFeet,
    total_square_feet: totalSquareFeet,
    percentage: percentage * 100,
    simplified_deduction: simplifiedDeduction,
    actual_expenses: actualExpenses ? actualExpenseBreakdown : undefined,
    actual_deduction: actualDeduction,
    recommended_method: recommendedMethod,
    recommended_deduction: recommendedDeduction,
  };
}

// ============================================================================
// VEHICLE EXPENSE CALCULATOR
// ============================================================================

/**
 * Compare standard mileage vs actual expenses method
 */
export function calculateVehicleExpenseComparison(
  totalMiles: number,
  businessPercentage: number, // 0-1
  actualExpenses: {
    gas: number;
    maintenance: number;
    insurance: number;
    registration: number;
    lease_payments: number;
    depreciation: number;
  },
  year: number
): VehicleExpenseComparison {
  const rate = getIRSMileageRate(year);
  const businessMiles = totalMiles * businessPercentage;

  // Standard mileage method
  const standardMileageDeduction = businessMiles * rate;

  // Actual expenses method
  const totalActualExpenses = Object.values(actualExpenses).reduce((sum, val) => sum + val, 0);
  const actualExpensesDeduction = totalActualExpenses * businessPercentage;

  const actualExpensesBreakdown = {
    gas: actualExpenses.gas * businessPercentage,
    maintenance: actualExpenses.maintenance * businessPercentage,
    insurance: actualExpenses.insurance * businessPercentage,
    registration: actualExpenses.registration * businessPercentage,
    lease_payments: actualExpenses.lease_payments * businessPercentage,
    depreciation: actualExpenses.depreciation * businessPercentage,
  };

  // Recommend the method with higher deduction
  const recommendedMethod =
    actualExpensesDeduction > standardMileageDeduction ? 'actual_expenses' : 'standard_mileage';
  const recommendedDeduction = Math.max(actualExpensesDeduction, standardMileageDeduction);
  const savings = Math.abs(actualExpensesDeduction - standardMileageDeduction);

  return {
    standard_mileage: {
      total_miles: businessMiles,
      rate,
      deduction: standardMileageDeduction,
    },
    actual_expenses: {
      total_expenses: totalActualExpenses,
      business_percentage: businessPercentage * 100,
      deduction: actualExpensesDeduction,
      breakdown: actualExpensesBreakdown,
    },
    recommended_method: recommendedMethod,
    recommended_deduction: recommendedDeduction,
    savings,
  };
}

// ============================================================================
// MEAL DEDUCTION CALCULATOR
// ============================================================================

/**
 * Calculate meal deduction (50% rule)
 * Note: 100% deduction allowed for 2021-2022 due to COVID relief
 */
export function calculateMealDeduction(
  totalMealExpenses: number,
  year: number
): MealDeductionCalculation {
  // COVID relief: 100% deduction for 2021-2022
  const deductiblePercentage = year === 2021 || year === 2022 ? 1.0 : 0.5;

  return {
    total_meal_expenses: totalMealExpenses,
    deductible_percentage: deductiblePercentage,
    deduction: totalMealExpenses * deductiblePercentage,
  };
}

// ============================================================================
// SCHEDULE C CATEGORY MAPPING
// ============================================================================

/**
 * Map our internal categories to Schedule C line items
 */
export const SCHEDULE_C_MAPPING: Record<
  DeductionCategory,
  { line: number; description: string }
> = {
  [DeductionCategory.ADVERTISING]: { line: 8, description: 'Advertising' },
  [DeductionCategory.MILEAGE]: { line: 9, description: 'Car and truck expenses' },
  [DeductionCategory.VEHICLE_EXPENSES]: { line: 9, description: 'Car and truck expenses' },
  [DeductionCategory.PARKING_TOLLS]: { line: 9, description: 'Car and truck expenses' },
  [DeductionCategory.CONTRACT_LABOR]: { line: 11, description: 'Contract labor' },
  [DeductionCategory.SUBCONTRACTORS]: { line: 11, description: 'Contract labor' },
  [DeductionCategory.DEPRECIATION]: { line: 13, description: 'Depreciation' },
  [DeductionCategory.BUSINESS_INSURANCE]: { line: 15, description: 'Insurance (other than health)' },
  [DeductionCategory.LIABILITY_INSURANCE]: { line: 15, description: 'Insurance (other than health)' },
  [DeductionCategory.HEALTH_INSURANCE]: { line: 14, description: 'Health insurance' },
  [DeductionCategory.INTEREST]: { line: 16, description: 'Interest: Mortgage' },
  [DeductionCategory.BANK_FEES]: { line: 16, description: 'Interest: Other' },
  [DeductionCategory.LEGAL_FEES]: { line: 17, description: 'Legal and professional services' },
  [DeductionCategory.ACCOUNTING_FEES]: { line: 17, description: 'Legal and professional services' },
  [DeductionCategory.CONSULTING]: { line: 17, description: 'Legal and professional services' },
  [DeductionCategory.OFFICE_SUPPLIES]: { line: 18, description: 'Office expense' },
  [DeductionCategory.POSTAGE]: { line: 18, description: 'Office expense' },
  [DeductionCategory.PRINTING]: { line: 18, description: 'Office expense' },
  [DeductionCategory.RENT]: { line: 20, description: 'Rent or lease: Business property' },
  [DeductionCategory.SUPPLIES]: { line: 22, description: 'Supplies' },
  [DeductionCategory.TOOLS_EQUIPMENT]: { line: 22, description: 'Supplies' },
  [DeductionCategory.TAXES_FEES]: { line: 23, description: 'Taxes and licenses' },
  [DeductionCategory.LICENSES_PERMITS]: { line: 23, description: 'Taxes and licenses' },
  [DeductionCategory.PHONE_INTERNET]: { line: 25, description: 'Utilities' },
  [DeductionCategory.UTILITIES]: { line: 25, description: 'Utilities' },
  [DeductionCategory.MEALS]: { line: 24, description: 'Meals (50% deductible)' },
  [DeductionCategory.MARKETING]: { line: 27, description: 'Other expenses' },
  [DeductionCategory.WEBSITE]: { line: 27, description: 'Other expenses' },
  [DeductionCategory.EDUCATION]: { line: 27, description: 'Other expenses' },
  [DeductionCategory.PROFESSIONAL_DUES]: { line: 27, description: 'Other expenses' },
  [DeductionCategory.OTHER]: { line: 27, description: 'Other expenses' },
  [DeductionCategory.HOME_OFFICE]: { line: 30, description: 'Business use of home' },
};

/**
 * Get Schedule C line number for a category
 */
export function getScheduleCLine(category: DeductionCategory): number {
  return SCHEDULE_C_MAPPING[category]?.line || 27;
}

/**
 * Get Schedule C description for a category
 */
export function getScheduleCDescription(category: DeductionCategory): string {
  return SCHEDULE_C_MAPPING[category]?.description || 'Other expenses';
}

// ============================================================================
// TAX CALCULATION UTILITIES
// ============================================================================

/**
 * Calculate self-employment tax (Social Security + Medicare)
 * 92.35% of net profit × 15.3%
 */
export function calculateSelfEmploymentTax(netProfit: number): number {
  const selfEmploymentIncome = netProfit * 0.9235;
  return selfEmploymentIncome * 0.153;
}

/**
 * Calculate estimated quarterly tax payment
 */
export function calculateEstimatedQuarterlyTax(
  quarterlyIncome: number,
  quarterlyExpenses: number,
  taxRate: number
): number {
  const netIncome = quarterlyIncome - quarterlyExpenses;
  const selfEmploymentTax = calculateSelfEmploymentTax(netIncome);
  const incomeTax = netIncome * taxRate;
  return selfEmploymentTax + incomeTax;
}

// ============================================================================
// DATE & FILTERING UTILITIES
// ============================================================================

/**
 * Check if a date falls within a quarter
 */
export function isDateInQuarter(date: string | Date, quarter: TaxQuarter, year: number): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const quarterInfo = getQuarterDateRange(quarter, year);
  const start = new Date(quarterInfo.start_date);
  const end = new Date(quarterInfo.end_date);

  return d >= start && d <= end;
}

/**
 * Check if a date falls within a date range
 */
export function isDateInRange(
  date: string | Date,
  startDate: string | Date,
  endDate: string | Date
): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  return d >= start && d <= end;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Get tax year options (current year and previous 3 years)
 */
export function getTaxYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[], headers: string[]): string {
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Download file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export mileage log to CSV
 */
export function exportMileageToCSV(mileageLogs: any[]): void {
  const headers = [
    'date',
    'start_location',
    'end_location',
    'miles',
    'purpose',
    'customer_name',
    'deduction_amount',
    'notes',
  ];

  const csv = convertToCSV(mileageLogs, headers);
  downloadFile(csv, `mileage-log-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}

/**
 * Export tax report to CSV
 */
export function exportTaxReportToCSV(report: any): void {
  const rows = [
    ['Tax Report', report.report_type.toUpperCase()],
    ['Year', report.year],
    report.quarter ? ['Quarter', `Q${report.quarter}`] : [],
    [],
    ['Revenue', report.gross_revenue],
    [],
    ['Expenses by Category', ''],
    ...report.expenses.map((exp: any) => [exp.category, exp.amount]),
    [],
    ['Total Expenses', report.total_expenses],
    ['Net Income', report.net_income],
    [],
    ['Mileage Deduction', report.mileage_deduction],
    ['Total Miles', report.total_miles],
    ['Home Office Deduction', report.home_office_deduction],
    [],
    ['Estimated Tax Owed', report.estimated_tax_owed],
    ['Estimated Tax Paid', report.estimated_tax_paid],
  ].filter((row) => row.length > 0);

  const csv = rows.map((row) => row.join(',')).join('\n');
  const filename = report.quarter
    ? `tax-report-${report.year}-Q${report.quarter}.csv`
    : `tax-report-${report.year}-annual.csv`;

  downloadFile(csv, filename, 'text/csv');
}
