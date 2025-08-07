// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

// Calculator Input Types
export interface UserInputs {
  location?: string;
  income?: number;
  fico?: number;
  downPaymentPercent?: number; // Percentage (3.5 to 20)
  monthlyDebts?: number; // Total of all individual debts below
  studentLoanPayment?: number;
  autoLoanPayment?: number;
  creditCardPayment?: number;
  otherDebtPayment?: number; // Personal loans, other monthly obligations
  employmentType?: 'W2' | 'SelfEmployed' | 'Contract' | 'Retired' | 'Other';
  employmentLength?: number; // in months
  propertyType?: 'SingleFamily' | 'Condo' | 'Townhouse' | 'MultiFamily' | 'Investment';
  loanPurpose?: 'Purchase' | 'Refinance' | 'CashOut';
  zipCode?: string;
  currentHousingPayment?: number;
  propertyTax?: number;
  homeInsurance?: number;
  familySize?: number;
  necessaryDebts?: number; // Calculated from student + auto loans
  // Property tax and insurance related inputs
  taxExemptions?: TaxExemptions;
  homeValue?: number; // For property tax and insurance calculations
  // Insurance-related inputs
  yearBuilt?: number;
  constructionType?: 'frame' | 'masonry' | 'steel' | 'concrete';
  hasSecuritySystem?: boolean;
  hasSmokeDetectors?: boolean;
  distanceToFireHydrant?: 'close' | 'far';
}

export interface CompensatingFactors {
  reserves?: number; // months of mortgage payments
  additionalIncome?: number; // monthly additional income
  excellentCreditHistory?: boolean;
  stableEmployment?: boolean;
  lowDebtToIncomeRatio?: boolean;
  significantAssets?: boolean;
  // FHA-specific compensating factors
  cashReserves?: number; // dollar amount in reserves
  necessaryDebts?: number; // dollar amount of necessary (non-discretionary) debts
  minimalPaymentIncrease?: boolean;
  adequateResidualIncome?: boolean;
  noDiscretionaryDebt?: boolean;
  highCreditScore?: boolean; // 740+
  largeDownPayment?: boolean; // 10%+
}

// Property Tax Types
export interface PropertyTaxInfo {
  headlineRate: number; // Base property tax rate as percentage
  applicableRate: number; // Rate after exemptions/discounts
  monthlyPayment: number; // Monthly property tax payment
  annualPayment: number; // Annual property tax payment
  exemptions: {
    homestead?: { amount: number; description: string };
    senior?: { amount?: number; discount?: number; description: string };
    veteran?: { amount: number; description: string };
    disability?: { amount: number; description: string };
  };
  confidence: 'high' | 'medium' | 'low';
  source: string;
}

// Insurance Types
export interface InsuranceInfo {
  monthlyPremium: number;
  annualPremium: number;
  dwellingCoverage: number;
  confidence: 'high' | 'medium' | 'low';
  zebraQuoteUrl: string;
  riskFactors: {
    hurricanes: boolean;
    tornadoes: boolean;
    earthquakes: boolean;
    floods: boolean;
    wildfires: boolean;
  };
  // Enhanced insurance fields (optional for backward compatibility)
  county?: {
    county: string;
    state: string;
    fips: string;
    fullName: string;
  };
  enhancedFactors?: {
    baseRate: number;
    countyAdjustment: number;
    riskMultiplier: number;
    propertyMultiplier: number;
  };
  riskAssessment?: {
    floodZone: boolean;
    coastalCounty: boolean;
    wildfireRisk: 'low' | 'medium' | 'high';
    severeWeatherRisk: 'low' | 'medium' | 'high';
    earthquakeRisk: 'low' | 'medium' | 'high';
  };
}

// Tax Exemptions for User Input
export interface TaxExemptions {
  isPrimaryResidence?: boolean;
  ownerAge?: number;
  isVeteran?: boolean;
  isDisabled?: boolean;
}

// Calculation Results Types
export interface CalculationResults {
  maxLoanAmount?: number;
  maxHomePrice?: number;
  monthlyPayment?: number;
  totalMonthlyPayment?: number; // Including PITI + MIP
  debtToIncomeRatio?: number;
  loanToValueRatio?: number;
  interestRate?: number;
  pmi?: number; // Private Mortgage Insurance
  mip?: number; // FHA Mortgage Insurance Premium (monthly)
  upfrontMIP?: number; // FHA Upfront Mortgage Insurance Premium
  recommendations?: string[];
  warnings?: string[];
  meetsMinimumRequirements?: boolean;
  // DTI breakdown
  baseDTI?: number;
  maxAllowedDTI?: number;
  dtiIncrease?: number;
  // PITI breakdown
  principalAndInterest?: number;
  propertyTax?: number;
  homeInsurance?: number;
  monthlyPropertyTax?: number;
  monthlyInsurance?: number;
  monthlyMIP?: number;
  // Property tax and insurance details
  propertyTaxInfo?: PropertyTaxInfo;
  insuranceInfo?: InsuranceInfo;
  // FHA-specific
  fhaLoanLimit?: number;
  isHighCostArea?: boolean;
  loanProgram?: 'FHA' | 'Conventional' | 'VA' | 'USDA';
}

// Scenario Types (matches Convex schema)
export interface Scenario {
  _id: string;
  userId: string;
  inputs: UserInputs;
  compensatingFactors?: CompensatingFactors;
  results?: CalculationResults;
  name?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// UI State Types
export interface UIState {
  currentStep: number;
  isCalculating: boolean;
  showResults: boolean;
  showCompensatingFactors: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
}

// Form Validation Types
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [field: string]: ValidationRule;
}

export interface FormError {
  field: string;
  message: string;
}

// Location and Market Data Types
export interface LocationData {
  state: string;
  city?: string;
  zipCode?: string;
  county?: string;
  medianHomePrice?: number;
  averageInterestRate?: number;
  marketTrends?: 'Hot' | 'Balanced' | 'Cool';
}

// Loan Program Types
export interface LoanProgram {
  id: string;
  name: string;
  type: 'Conventional' | 'FHA' | 'VA' | 'USDA';
  minCreditScore: number;
  maxLTV: number; // Loan-to-Value ratio
  minDownPayment: number; // percentage
  pmiRequired: boolean;
  baseInterestRate: number;
  description: string;
  benefits: string[];
  requirements: string[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CalculationRequest {
  inputs: UserInputs;
  compensatingFactors?: CompensatingFactors;
  location?: LocationData;
}

export interface CalculationResponse extends ApiResponse<CalculationResults> {
  recommendedPrograms?: LoanProgram[];
  warnings?: string[];
}

// Component Props Types
export interface StepComponentProps {
  onNext: () => void;
  onPrev: () => void;
  onSkip?: () => void;
  isValid: boolean;
  isLoading?: boolean;
}

export interface InputFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'tel' | 'password';
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  value?: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export interface SelectFieldProps {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Event Types
export interface CalculatorStepChangeEvent {
  fromStep: number;
  toStep: number;
  isValid: boolean;
}

export interface InputChangeEvent<T = string | number> {
  field: string;
  value: T;
  isValid: boolean;
}

// Theme and Styling Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
}

export interface BreakpointConfig {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// FHA-Specific Types
export interface FHALoanParams {
  income: number;
  monthlyDebts: number;
  downPaymentPercent: number; // Changed from downPaymentAmount to percentage
  fico: number;
  loanAmount?: number;
  propertyTax?: number;
  insurance?: number;
  zipCode?: string;
  currentHousingPayment?: number;
  familySize?: number;
  necessaryDebts?: number;
}

export interface FHALoanResult {
  maxLoanAmount: number;
  maxHomePrice: number;
  monthlyPayment: number;
  totalMonthlyPayment: number;
  upfrontMIP: number;
  monthlyMIP: number;
  debtToIncomeRatio: number;
  loanToValueRatio: number;
  meetsMinimumRequirements: boolean;
  warnings: string[];
  fhaLoanLimit: number;
  isHighCostArea: boolean;
}

export interface DTIFactor {
  id: string;
  name: string;
  description: string;
  dtiIncrease: number;
  isActive: boolean;
  category: 'financial' | 'credit' | 'payment' | 'employment';
}

export interface DTIProgressData {
  currentDTI: number;
  maxDTI: number;
  baseDTI: number;
  totalIncrease: number;
  activeFactors: DTIFactor[];
  progressPercentage: number;
  remainingCapacity: number;
}

export interface MIPCalculation {
  upfrontMIP: number;
  monthlyMIP: number;
  annualMIPRate: number;
  upfrontMIPRate: number;
}

export interface PITIBreakdown {
  principalAndInterest: number;
  propertyTax: number;
  insurance: number;
  mip: number;
  totalPITI: number;
}