// Tax Compliance Data Types

export type TaxQuarter = 1 | 2 | 3 | 4;

export enum DeductionCategory {
  // Vehicle & Travel
  MILEAGE = 'mileage',
  VEHICLE_EXPENSES = 'vehicle_expenses',
  PARKING_TOLLS = 'parking_tolls',

  // Home Office
  HOME_OFFICE = 'home_office',

  // Equipment & Supplies
  TOOLS_EQUIPMENT = 'tools_equipment',
  SUPPLIES = 'supplies',
  DEPRECIATION = 'depreciation',

  // Insurance
  BUSINESS_INSURANCE = 'business_insurance',
  HEALTH_INSURANCE = 'health_insurance',
  LIABILITY_INSURANCE = 'liability_insurance',

  // Professional Services
  LEGAL_FEES = 'legal_fees',
  ACCOUNTING_FEES = 'accounting_fees',
  CONSULTING = 'consulting',

  // Communications
  PHONE_INTERNET = 'phone_internet',

  // Marketing & Advertising
  ADVERTISING = 'advertising',
  MARKETING = 'marketing',
  WEBSITE = 'website',

  // Education & Training
  EDUCATION = 'education',
  LICENSES_PERMITS = 'licenses_permits',
  PROFESSIONAL_DUES = 'professional_dues',

  // Meals & Entertainment
  MEALS = 'meals',

  // Contract Labor
  CONTRACT_LABOR = 'contract_labor',
  SUBCONTRACTORS = 'subcontractors',

  // Office Expenses
  OFFICE_SUPPLIES = 'office_supplies',
  POSTAGE = 'postage',
  PRINTING = 'printing',

  // Utilities
  UTILITIES = 'utilities',

  // Rent
  RENT = 'rent',

  // Other
  BANK_FEES = 'bank_fees',
  INTEREST = 'interest',
  TAXES_FEES = 'taxes_fees',
  OTHER = 'other'
}

export interface MileageLog {
  id: string;
  user_id: string;
  date: string; // ISO date string
  start_location: string;
  end_location: string;
  miles: number;
  purpose: string;
  is_business: boolean;
  job_id?: string; // Link to work call or financial document
  customer_name?: string;
  vehicle_id?: string;
  deduction_amount: number; // Calculated: miles × IRS rate
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TaxDocument {
  id: string;
  user_id: string;
  document_type: 'W9' | '1099' | '1099-NEC' | '1099-MISC' | 'W2' | '1040-ES' | 'RECEIPT' | 'OTHER';
  title: string;
  description?: string;
  tax_year: number;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  contact_id?: string; // Related to which contact/vendor
  amount?: number; // For 1099s, receipts, etc.
  category?: DeductionCategory;
  tags: string[];
  date_received?: string;
  date_uploaded: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface QuarterlyExpense {
  category: DeductionCategory;
  amount: number;
  count: number; // Number of transactions
}

export interface TaxQuarterInfo {
  quarter: TaxQuarter;
  year: number;
  start_date: string;
  end_date: string;
}

export interface TaxReport {
  id: string;
  user_id: string;
  report_type: 'quarterly' | 'annual';
  year: number;
  quarter?: TaxQuarter;

  // Revenue (from invoices/financial documents)
  gross_revenue: number;

  // Expenses by category
  expenses: QuarterlyExpense[];
  total_expenses: number;

  // Specific deductions
  mileage_deduction: number;
  total_miles: number;
  home_office_deduction: number;

  // Equipment & Depreciation (Section 179)
  equipment_purchases: number;
  section_179_deduction: number;
  depreciation: number;

  // Net income
  net_income: number; // gross_revenue - total_expenses

  // Estimated tax
  estimated_tax_rate: number; // Default 0.30 (30%)
  estimated_tax_owed: number;
  estimated_tax_paid: number;

  // Payment tracking
  quarterly_payments: QuarterlyPayment[];

  // Metadata
  generated_at: string;
  notes?: string;
}

export interface QuarterlyPayment {
  quarter: TaxQuarter;
  due_date: string;
  amount: number;
  paid: boolean;
  paid_date?: string;
  payment_method?: string;
  confirmation_number?: string;
}

export interface TaxSettings {
  user_id: string;

  // Feature toggles
  tax_features_enabled: boolean;

  // Home office
  home_office_enabled: boolean;
  home_office_square_feet: number;
  total_home_square_feet: number;
  home_office_percentage: number; // Calculated or manual
  monthly_rent_mortgage?: number;
  monthly_utilities?: number;

  // Vehicle
  vehicle_method: 'standard_mileage' | 'actual_expenses';
  vehicles: VehicleInfo[];

  // Phone & Internet
  phone_business_percentage: number;
  internet_business_percentage: number;
  monthly_phone_cost?: number;
  monthly_internet_cost?: number;

  // Tax rates
  federal_tax_rate: number; // e.g., 0.22 for 22%
  state_tax_rate: number;
  self_employment_tax_rate: number; // 0.153 (15.3%)
  estimated_total_tax_rate: number; // Sum of above

  // Accountant info
  accountant_name?: string;
  accountant_email?: string;
  accountant_phone?: string;

  // Preferences
  quarterly_reminder_enabled: boolean;
  auto_calculate_mileage: boolean;
  default_mileage_purpose?: string;

  created_at: string;
  updated_at: string;
}

export interface VehicleInfo {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate?: string;
  is_primary: boolean;
  purchase_date?: string;
  purchase_price?: number;

  // For actual expense method
  annual_expenses?: {
    gas: number;
    maintenance: number;
    insurance: number;
    registration: number;
    lease_payments: number;
    depreciation: number;
  };
}

export interface DeductionCalculation {
  category: string;
  description: string;
  amount: number;
  details: Record<string, any>;
}

export interface HomeOfficeCalculation {
  method: 'simplified' | 'actual';
  square_feet: number;
  total_square_feet?: number;
  percentage?: number;

  // Simplified method (max 300 sq ft)
  simplified_deduction?: number; // $5 per sq ft

  // Actual method
  actual_expenses?: {
    rent_mortgage: number;
    utilities: number;
    insurance: number;
    repairs: number;
    depreciation: number;
    total: number;
  };
  actual_deduction?: number;

  recommended_method: 'simplified' | 'actual';
  recommended_deduction: number;
}

export interface VehicleExpenseComparison {
  standard_mileage: {
    total_miles: number;
    rate: number;
    deduction: number;
  };

  actual_expenses: {
    total_expenses: number;
    business_percentage: number;
    deduction: number;
    breakdown: {
      gas: number;
      maintenance: number;
      insurance: number;
      registration: number;
      lease_payments: number;
      depreciation: number;
    };
  };

  recommended_method: 'standard_mileage' | 'actual_expenses';
  recommended_deduction: number;
  savings: number;
}

export interface MealDeductionCalculation {
  total_meal_expenses: number;
  deductible_percentage: number; // 0.5 for 50% rule
  deduction: number;
}

export interface AnnualSummary {
  year: number;

  // Schedule C data
  gross_receipts: number;
  returns_allowances: number;
  net_revenue: number;

  // Cost of goods sold (if applicable)
  cogs: number;
  gross_profit: number;

  // Expenses (Schedule C Part II)
  expenses_by_category: Record<DeductionCategory, number>;
  total_expenses: number;

  // Specific deductions
  car_truck_expenses: number;
  depreciation: number;
  home_office: number;

  // Net profit/loss
  net_profit: number;

  // Self-employment tax
  self_employment_income: number;
  self_employment_tax: number;

  // Estimated tax payments
  quarterly_payments_made: QuarterlyPayment[];
  total_estimated_payments: number;

  // Tax liability
  estimated_federal_tax: number;
  estimated_state_tax: number;
  total_estimated_tax: number;

  // Balance
  tax_balance_due: number; // or refund if negative

  // Supporting data
  total_mileage: number;
  business_mileage: number;
  mileage_deduction: number;

  // 1099 income tracking
  income_1099_nec: number;
  income_1099_misc: number;
  total_1099_income: number;

  // Quarters
  quarterly_reports: TaxReport[];
}
