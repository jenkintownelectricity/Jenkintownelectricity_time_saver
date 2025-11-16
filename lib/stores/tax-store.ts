// Tax Data Store using Zustand

import { create } from 'zustand';
import {
  MileageLog,
  TaxDocument,
  TaxReport,
  TaxSettings,
  TaxQuarter,
  DeductionCategory,
  QuarterlyExpense,
  QuarterlyPayment,
  AnnualSummary,
} from '../types/tax';
import {
  calculateMileageDeduction,
  getQuarterDateRange,
  getCurrentQuarter,
  isDateInRange,
  calculateSelfEmploymentTax,
  getQuarterlyTaxDueDates,
} from '../tax-utils';

interface TaxStore {
  // State
  mileageLogs: MileageLog[];
  taxDocuments: TaxDocument[];
  taxReports: TaxReport[];
  taxSettings: TaxSettings | null;
  isLoading: boolean;
  error: string | null;

  // Mileage Log Actions
  addMileageLog: (log: Omit<MileageLog, 'id' | 'created_at' | 'updated_at'>) => void;
  updateMileageLog: (id: string, log: Partial<MileageLog>) => void;
  deleteMileageLog: (id: string) => void;
  getMileageLogsForPeriod: (startDate: string, endDate: string) => MileageLog[];
  getTotalMileageForPeriod: (startDate: string, endDate: string) => number;
  getTotalMileageDeductionForPeriod: (startDate: string, endDate: string) => number;

  // Tax Document Actions
  addTaxDocument: (doc: Omit<TaxDocument, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTaxDocument: (id: string, doc: Partial<TaxDocument>) => void;
  deleteTaxDocument: (id: string) => void;
  getTaxDocumentsForYear: (year: number) => TaxDocument[];

  // Tax Report Actions
  generateQuarterlyReport: (quarter: TaxQuarter, year: number) => TaxReport;
  generateAnnualReport: (year: number) => AnnualSummary;
  saveReport: (report: TaxReport) => void;
  getReport: (reportType: 'quarterly' | 'annual', year: number, quarter?: TaxQuarter) => TaxReport | null;

  // Tax Settings Actions
  updateTaxSettings: (settings: Partial<TaxSettings>) => void;
  getTaxSettings: () => TaxSettings | null;

  // Quarterly Payment Tracking
  recordQuarterlyPayment: (year: number, quarter: TaxQuarter, payment: QuarterlyPayment) => void;

  // Export Functions
  exportMileageLog: (startDate: string, endDate: string) => MileageLog[];
  exportTaxReport: (year: number, quarter?: TaxQuarter) => TaxReport | null;

  // Utility Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useTaxStore = create<TaxStore>((set, get) => ({
  // Initial State
  mileageLogs: [],
  taxDocuments: [],
  taxReports: [],
  taxSettings: null,
  isLoading: false,
  error: null,

  // Mileage Log Actions
  addMileageLog: (log) => {
    const now = new Date().toISOString();
    const newLog: MileageLog = {
      ...log,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };

    set((state) => ({
      mileageLogs: [...state.mileageLogs, newLog],
    }));
  },

  updateMileageLog: (id, updates) => {
    set((state) => ({
      mileageLogs: state.mileageLogs.map((log) =>
        log.id === id
          ? { ...log, ...updates, updated_at: new Date().toISOString() }
          : log
      ),
    }));
  },

  deleteMileageLog: (id) => {
    set((state) => ({
      mileageLogs: state.mileageLogs.filter((log) => log.id !== id),
    }));
  },

  getMileageLogsForPeriod: (startDate, endDate) => {
    const { mileageLogs } = get();
    return mileageLogs.filter((log) => isDateInRange(log.date, startDate, endDate));
  },

  getTotalMileageForPeriod: (startDate, endDate) => {
    const logs = get().getMileageLogsForPeriod(startDate, endDate);
    return logs
      .filter((log) => log.is_business)
      .reduce((total, log) => total + log.miles, 0);
  },

  getTotalMileageDeductionForPeriod: (startDate, endDate) => {
    const logs = get().getMileageLogsForPeriod(startDate, endDate);
    return logs
      .filter((log) => log.is_business)
      .reduce((total, log) => total + log.deduction_amount, 0);
  },

  // Tax Document Actions
  addTaxDocument: (doc) => {
    const now = new Date().toISOString();
    const newDoc: TaxDocument = {
      ...doc,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };

    set((state) => ({
      taxDocuments: [...state.taxDocuments, newDoc],
    }));
  },

  updateTaxDocument: (id, updates) => {
    set((state) => ({
      taxDocuments: state.taxDocuments.map((doc) =>
        doc.id === id
          ? { ...doc, ...updates, updated_at: new Date().toISOString() }
          : doc
      ),
    }));
  },

  deleteTaxDocument: (id) => {
    set((state) => ({
      taxDocuments: state.taxDocuments.filter((doc) => doc.id !== id),
    }));
  },

  getTaxDocumentsForYear: (year) => {
    const { taxDocuments } = get();
    return taxDocuments.filter((doc) => doc.tax_year === year);
  },

  // Tax Report Actions
  generateQuarterlyReport: (quarter, year) => {
    const { mileageLogs, taxSettings } = get();
    const quarterInfo = getQuarterDateRange(quarter, year);

    // Get mileage data for quarter
    const quarterMileage = get().getMileageLogsForPeriod(
      quarterInfo.start_date,
      quarterInfo.end_date
    );
    const totalMiles = quarterMileage
      .filter((log) => log.is_business)
      .reduce((sum, log) => sum + log.miles, 0);
    const mileageDeduction = quarterMileage
      .filter((log) => log.is_business)
      .reduce((sum, log) => sum + log.deduction_amount, 0);

    // Calculate home office deduction (quarterly)
    let homeOfficeDeduction = 0;
    if (taxSettings?.home_office_enabled) {
      const monthlyDeduction = taxSettings.home_office_square_feet * 5; // Simplified method
      homeOfficeDeduction = monthlyDeduction * 3; // 3 months per quarter
    }

    // Mock data for expenses (in real app, would come from financial_documents or expense tracking)
    const expenses: QuarterlyExpense[] = [
      { category: DeductionCategory.MILEAGE, amount: mileageDeduction, count: quarterMileage.length },
      { category: DeductionCategory.HOME_OFFICE, amount: homeOfficeDeduction, count: 1 },
    ];

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Mock revenue (in real app, would sum invoices from financial_documents)
    const grossRevenue = 25000; // Placeholder

    const netIncome = grossRevenue - totalExpenses;

    // Calculate estimated tax
    const estimatedTaxRate = taxSettings?.estimated_total_tax_rate || 0.3;
    const selfEmploymentTax = calculateSelfEmploymentTax(netIncome);
    const incomeTax = netIncome * (taxSettings?.federal_tax_rate || 0.22);
    const estimatedTaxOwed = selfEmploymentTax + incomeTax;

    // Get quarterly due dates
    const dueDates = getQuarterlyTaxDueDates(year);

    const report: TaxReport = {
      id: generateId(),
      user_id: 'current-user', // In real app, get from auth
      report_type: 'quarterly',
      year,
      quarter,
      gross_revenue: grossRevenue,
      expenses,
      total_expenses: totalExpenses,
      mileage_deduction: mileageDeduction,
      total_miles: totalMiles,
      home_office_deduction: homeOfficeDeduction,
      equipment_purchases: 0,
      section_179_deduction: 0,
      depreciation: 0,
      net_income: netIncome,
      estimated_tax_rate: estimatedTaxRate,
      estimated_tax_owed: estimatedTaxOwed,
      estimated_tax_paid: 0,
      quarterly_payments: [
        {
          quarter,
          due_date: dueDates[quarter],
          amount: estimatedTaxOwed,
          paid: false,
        },
      ],
      generated_at: new Date().toISOString(),
    };

    return report;
  },

  generateAnnualReport: (year) => {
    const { taxReports, mileageLogs, taxSettings, taxDocuments } = get();

    // Get or generate quarterly reports
    const quarterlyReports: TaxReport[] = [];
    for (let q = 1; q <= 4; q++) {
      const quarter = q as TaxQuarter;
      let report = get().getReport('quarterly', year, quarter);
      if (!report) {
        report = get().generateQuarterlyReport(quarter, year);
      }
      quarterlyReports.push(report);
    }

    // Aggregate quarterly data
    const grossReceipts = quarterlyReports.reduce((sum, r) => sum + r.gross_revenue, 0);
    const totalExpenses = quarterlyReports.reduce((sum, r) => sum + r.total_expenses, 0);
    const totalMileageDeduction = quarterlyReports.reduce((sum, r) => sum + r.mileage_deduction, 0);
    const homeOfficeDeduction = quarterlyReports.reduce((sum, r) => sum + r.home_office_deduction, 0);

    // Aggregate expenses by category
    const expensesByCategory: Record<DeductionCategory, number> = {} as any;
    for (const report of quarterlyReports) {
      for (const expense of report.expenses) {
        if (!expensesByCategory[expense.category]) {
          expensesByCategory[expense.category] = 0;
        }
        expensesByCategory[expense.category] += expense.amount;
      }
    }

    // Calculate totals
    const netRevenue = grossReceipts;
    const cogs = 0; // Contractors typically don't have COGS
    const grossProfit = netRevenue - cogs;
    const netProfit = grossProfit - totalExpenses;

    // Self-employment tax
    const selfEmploymentIncome = netProfit * 0.9235;
    const selfEmploymentTax = selfEmploymentIncome * 0.153;

    // Estimated tax
    const estimatedFederalTax = netProfit * (taxSettings?.federal_tax_rate || 0.22);
    const estimatedStateTax = netProfit * (taxSettings?.state_tax_rate || 0.05);
    const totalEstimatedTax = selfEmploymentTax + estimatedFederalTax + estimatedStateTax;

    // Total estimated payments made
    const allQuarterlyPayments = quarterlyReports.flatMap((r) => r.quarterly_payments);
    const totalEstimatedPayments = allQuarterlyPayments
      .filter((p) => p.paid)
      .reduce((sum, p) => sum + p.amount, 0);

    // Tax balance
    const taxBalanceDue = totalEstimatedTax - totalEstimatedPayments;

    // Mileage data
    const startOfYear = `${year}-01-01`;
    const endOfYear = `${year}-12-31`;
    const yearMileage = get().getMileageLogsForPeriod(startOfYear, endOfYear);
    const businessMileage = yearMileage
      .filter((log) => log.is_business)
      .reduce((sum, log) => sum + log.miles, 0);
    const totalMileage = yearMileage.reduce((sum, log) => sum + log.miles, 0);

    // 1099 income
    const docs1099 = taxDocuments.filter(
      (doc) => doc.tax_year === year && (doc.document_type === '1099-NEC' || doc.document_type === '1099-MISC')
    );
    const income1099NEC = docs1099
      .filter((doc) => doc.document_type === '1099-NEC')
      .reduce((sum, doc) => sum + (doc.amount || 0), 0);
    const income1099MISC = docs1099
      .filter((doc) => doc.document_type === '1099-MISC')
      .reduce((sum, doc) => sum + (doc.amount || 0), 0);

    const annualSummary: AnnualSummary = {
      year,
      gross_receipts: grossReceipts,
      returns_allowances: 0,
      net_revenue: netRevenue,
      cogs,
      gross_profit: grossProfit,
      expenses_by_category: expensesByCategory,
      total_expenses: totalExpenses,
      car_truck_expenses: totalMileageDeduction,
      depreciation: 0,
      home_office: homeOfficeDeduction,
      net_profit: netProfit,
      self_employment_income: selfEmploymentIncome,
      self_employment_tax: selfEmploymentTax,
      quarterly_payments_made: allQuarterlyPayments,
      total_estimated_payments: totalEstimatedPayments,
      estimated_federal_tax: estimatedFederalTax,
      estimated_state_tax: estimatedStateTax,
      total_estimated_tax: totalEstimatedTax,
      tax_balance_due: taxBalanceDue,
      total_mileage: totalMileage,
      business_mileage: businessMileage,
      mileage_deduction: totalMileageDeduction,
      income_1099_nec: income1099NEC,
      income_1099_misc: income1099MISC,
      total_1099_income: income1099NEC + income1099MISC,
      quarterly_reports: quarterlyReports,
    };

    return annualSummary;
  },

  saveReport: (report) => {
    set((state) => {
      const existingIndex = state.taxReports.findIndex(
        (r) =>
          r.report_type === report.report_type &&
          r.year === report.year &&
          r.quarter === report.quarter
      );

      if (existingIndex >= 0) {
        // Update existing report
        const updatedReports = [...state.taxReports];
        updatedReports[existingIndex] = report;
        return { taxReports: updatedReports };
      } else {
        // Add new report
        return { taxReports: [...state.taxReports, report] };
      }
    });
  },

  getReport: (reportType, year, quarter) => {
    const { taxReports } = get();
    return (
      taxReports.find(
        (r) =>
          r.report_type === reportType &&
          r.year === year &&
          r.quarter === quarter
      ) || null
    );
  },

  // Tax Settings Actions
  updateTaxSettings: (settings) => {
    set((state) => ({
      taxSettings: state.taxSettings
        ? { ...state.taxSettings, ...settings, updated_at: new Date().toISOString() }
        : {
            user_id: 'current-user',
            tax_features_enabled: true,
            home_office_enabled: false,
            home_office_square_feet: 0,
            total_home_square_feet: 0,
            home_office_percentage: 0,
            vehicle_method: 'standard_mileage',
            vehicles: [],
            phone_business_percentage: 50,
            internet_business_percentage: 50,
            federal_tax_rate: 0.22,
            state_tax_rate: 0.05,
            self_employment_tax_rate: 0.153,
            estimated_total_tax_rate: 0.423,
            quarterly_reminder_enabled: true,
            auto_calculate_mileage: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...settings,
          },
    }));
  },

  getTaxSettings: () => {
    return get().taxSettings;
  },

  // Quarterly Payment Tracking
  recordQuarterlyPayment: (year, quarter, payment) => {
    set((state) => {
      const reportIndex = state.taxReports.findIndex(
        (r) => r.report_type === 'quarterly' && r.year === year && r.quarter === quarter
      );

      if (reportIndex >= 0) {
        const updatedReports = [...state.taxReports];
        const report = { ...updatedReports[reportIndex] };

        // Update or add payment
        const paymentIndex = report.quarterly_payments.findIndex((p) => p.quarter === quarter);
        if (paymentIndex >= 0) {
          report.quarterly_payments[paymentIndex] = payment;
        } else {
          report.quarterly_payments.push(payment);
        }

        // Recalculate total paid
        report.estimated_tax_paid = report.quarterly_payments
          .filter((p) => p.paid)
          .reduce((sum, p) => sum + p.amount, 0);

        updatedReports[reportIndex] = report;
        return { taxReports: updatedReports };
      }

      return state;
    });
  },

  // Export Functions
  exportMileageLog: (startDate, endDate) => {
    return get().getMileageLogsForPeriod(startDate, endDate);
  },

  exportTaxReport: (year, quarter) => {
    const reportType = quarter ? 'quarterly' : 'annual';
    return get().getReport(reportType, year, quarter);
  },

  // Utility Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
