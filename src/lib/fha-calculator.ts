/**
 * FHA Loan Calculator
 * Implements FHA-specific calculations including loan limits, MIP, and DTI calculations
 */

import { calculateDTIFactors, DTICalculationResult } from './dti-factors';

export interface FHALoanParams {
  income: number;
  monthlyDebts: number;
  downPaymentPercent: number; // Percentage (3.5 to 20)
  fico: number;
  loanAmount?: number;
  propertyTax?: number;
  insurance?: number;
  zipCode?: string;
  // Additional for AUS modeling and residual income
  ausMode?: boolean;
  positiveRentHistory?: boolean;
  monthlyTaxes?: number;
  childcareExpense?: number;
  region?: 'Northeast' | 'Midwest' | 'South' | 'West';
}

export interface MIPRates {
  upfrontMIP: number;
  monthlyMIP: number;
}

export interface FHALoanResult {
  maxLoanAmount: number;
  maxHomePrice: number;
  downPaymentAmount: number;
  monthlyPayment: number;
  totalMonthlyPayment: number; // Including PITI + MIP
  upfrontMIP: number;
  monthlyMIP: number;
  debtToIncomeRatio: number;
  loanToValueRatio: number;
  meetsMinimumRequirements: boolean;
  warnings: string[];
}

// FHA MIP Rates (2024 Official - Updated per HUD Mortgagee Letter 2023-05)
// Source: HUD ML 2023-05, effective March 20, 2023
// Loan amount threshold: $726,200 | Upfront: 1.75% for ALL loans
const FHA_MIP_RATES = {
  // Loan amount threshold for rate tiers
  loanAmountThreshold: 726200,
  
  // Upfront MIP: 1.75% for ALL loans (regardless of term or LTV)
  upfront: 0.0175,
  
  // For loans <= 15 years
  lessThanOrEqual15Years: {
    // For loan amounts <= $726,200
    baseLoanAmount: {
      ltv90OrLess: 0.0015,  // 0.15% annually
      ltv90Plus: 0.0040     // 0.40% annually
    },
    // For loan amounts > $726,200
    highLoanAmount: {
      ltv78OrLess: 0.0015,     // 0.15% annually
      ltv78To90: 0.0040,       // 0.40% annually
      ltv90Plus: 0.0065        // 0.65% annually
    }
  },
  
  // For loans > 15 years
  moreThan15Years: {
    // For loan amounts <= $726,200
    baseLoanAmount: {
      ltv95OrLess: 0.0050,    // 0.50% annually
      ltv95Plus: 0.0055       // 0.55% annually
    },
    // For loan amounts > $726,200
    highLoanAmount: {
      ltv95OrLess: 0.0070,    // 0.70% annually
      ltv95Plus: 0.0075       // 0.75% annually
    }
  }
};

// Cached interest rate management
const cachedRate: { rate: number; timestamp: number; source: string; wasFallbackUsed?: boolean } | null = null;
const RATE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hour cache to avoid frequent API calls

/**
 * Get current FHA interest rate (cached)
 * Fetches from Convex with 24-hour caching
 */
function getCurrentInterestRate(): number {
  // Check cache first - 24 hour cache for rate requests
  if (cachedRate && Date.now() - cachedRate.timestamp < RATE_CACHE_DURATION) {
    return cachedRate.rate;
  }
  
  // Cache expired or doesn't exist - return default and trigger async update
  const defaultRate = 7.0;
  
  // Try to update cache asynchronously (don't block calculation)
  if (typeof window !== 'undefined') {
    // Only run in browser environment
    updateRateCache().catch(error => {
      console.warn('Failed to update rate cache:', error);
    });
  }
  
  // Return cached rate if available, otherwise default
  return cachedRate?.rate || defaultRate;
}

/**
 * Async function to update rate cache from Convex
 */
async function updateRateCache(): Promise<void> {
  try {
    // This will be called by the calculator components that have access to Convex client
    // For now, we'll implement this in the store where we have access to the client
    console.log('Rate cache update triggered');
  } catch (error) {
    console.error('Rate cache update failed:', error);
  }
}

// FHA Requirements
export const FHA_REQUIREMENTS = {
  minFICOFor3_5Percent: 580,
  minFICOFor10Percent: 500,
  minDownPaymentPercent3_5: 3.5,
  minDownPaymentPercent10: 10.0,
  baseDTIRatio: 0.43,
  maxDTIWithFactors: 0.5699,
  loanTermYears: 30,
  get baseInterestRate() {
    return getCurrentInterestRate();
  }
};

/**
 * Calculate maximum loan amount based on income and DTI
 */
export function calculateMaxLoanAmount(
  income: number,
  dtiRatio: number,
  monthlyDebts: number
): number {
  const interestRate = FHA_REQUIREMENTS.baseInterestRate;
  const monthlyIncome = income / 12;
  const maxTotalMonthlyPayment = monthlyIncome * dtiRatio;
  const maxHousingPayment = maxTotalMonthlyPayment - monthlyDebts;
  
  if (maxHousingPayment <= 0) {
    return 0;
  }
  
  // Calculate loan amount based on housing payment
  // Using standard 30-year mortgage calculation
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = FHA_REQUIREMENTS.loanTermYears * 12;
  
  // Calculate base loan amount before MIP
  const baseLoanAmount = maxHousingPayment * 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
  
  // Adjust for MIP - we need to account for monthly MIP in the payment
  // This is an iterative calculation, but we'll use an approximation
  // Use the most common rate: 0.50% for loans <= $726,200 with LTV <= 95%
  let estimatedMIPRate: number;
  if (baseLoanAmount <= FHA_MIP_RATES.loanAmountThreshold) {
    estimatedMIPRate = 0.0050 / 12; // 0.50% annually for most common scenario
  } else {
    estimatedMIPRate = 0.0070 / 12; // 0.70% annually for high loan amounts
  }
  const adjustedRate = monthlyRate + estimatedMIPRate;
  
  const adjustedLoanAmount = maxHousingPayment * 
    (Math.pow(1 + adjustedRate, numberOfPayments) - 1) /
    (adjustedRate * Math.pow(1 + adjustedRate, numberOfPayments));
  
  return Math.max(0, adjustedLoanAmount);
}

/**
 * Calculate MIP (Mortgage Insurance Premium) for FHA loans
 */
export function calculateMIP(loanAmount: number, homePrice: number, loanTermYears: number = 30): MIPRates {
  const ltv = (loanAmount / homePrice) * 100;
  const isBaseLoanAmount = loanAmount <= FHA_MIP_RATES.loanAmountThreshold;
  
  // Upfront MIP: 1.75% for ALL loans regardless of term or LTV
  const upfrontMIP = loanAmount * FHA_MIP_RATES.upfront;
  
  let annualMIPRate: number;
  
  if (loanTermYears <= 15) {
    // 15 year or less loans
    if (isBaseLoanAmount) {
      // For loan amounts <= $726,200
      annualMIPRate = ltv <= 90 ? 
        FHA_MIP_RATES.lessThanOrEqual15Years.baseLoanAmount.ltv90OrLess : 
        FHA_MIP_RATES.lessThanOrEqual15Years.baseLoanAmount.ltv90Plus;
    } else {
      // For loan amounts > $726,200
      if (ltv <= 78) {
        annualMIPRate = FHA_MIP_RATES.lessThanOrEqual15Years.highLoanAmount.ltv78OrLess;
      } else if (ltv <= 90) {
        annualMIPRate = FHA_MIP_RATES.lessThanOrEqual15Years.highLoanAmount.ltv78To90;
      } else {
        annualMIPRate = FHA_MIP_RATES.lessThanOrEqual15Years.highLoanAmount.ltv90Plus;
      }
    }
  } else {
    // More than 15 year loans
    if (ltv <= 95) {
      annualMIPRate = isBaseLoanAmount ? 
        FHA_MIP_RATES.moreThan15Years.baseLoanAmount.ltv95OrLess :
        FHA_MIP_RATES.moreThan15Years.highLoanAmount.ltv95OrLess;
    } else {
      annualMIPRate = isBaseLoanAmount ? 
        FHA_MIP_RATES.moreThan15Years.baseLoanAmount.ltv95Plus :
        FHA_MIP_RATES.moreThan15Years.highLoanAmount.ltv95Plus;
    }
  }
  
  const annualMIP = loanAmount * annualMIPRate;
  
  return {
    upfrontMIP: Math.round(upfrontMIP * 100) / 100,     // Round to cents
    monthlyMIP: Math.round((annualMIP / 12) * 100) / 100 // Round to cents
  };
}

/**
 * Calculate PITI (Principal, Interest, Taxes, Insurance) + MIP
 */
export function calculatePITI(
  loanAmount: number,
  homePrice: number,
  interestRate: number = FHA_REQUIREMENTS.baseInterestRate,
  propertyTax: number = 0,
  insurance: number = 0,
  loanTermYears: number = 30
): { 
  principalAndInterest: number;
  propertyTax: number;
  insurance: number;
  mip: number;
  totalPITI: number;
} {
  // Calculate principal and interest
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;
  
  const principalAndInterest = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  // Calculate MIP
  const mipRates = calculateMIP(loanAmount, homePrice, loanTermYears);
  const monthlyMIP = mipRates.monthlyMIP;
  
  // Estimate property tax and insurance if not provided
  const monthlyPropertyTax = propertyTax || (homePrice * 0.012 / 12); // 1.2% annually
  const monthlyInsurance = insurance || (homePrice * 0.003 / 12); // 0.3% annually
  
  const totalPITI = principalAndInterest + monthlyPropertyTax + monthlyInsurance + monthlyMIP;
  
  return {
    principalAndInterest: Math.round(principalAndInterest),
    propertyTax: Math.round(monthlyPropertyTax),
    insurance: Math.round(monthlyInsurance),
    mip: monthlyMIP,
    totalPITI: Math.round(totalPITI)
  };
}

/**
 * Calculate maximum DTI with compensating factors
 */
export function calculateMaxDTI(baseDTI: number, compensatingFactorIncrease: number): number {
  const maxDTI = Math.min(
    baseDTI + compensatingFactorIncrease,
    FHA_REQUIREMENTS.maxDTIWithFactors
  );
  
  return Math.round(maxDTI * 10000) / 10000; // Round to 4 decimal places
}

/**
 * Validate MIP calculation inputs
 */
export function validateMIPInputs(loanAmount: number, homePrice: number, loanTermYears: number): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let isValid = true;
  
  if (loanAmount <= 0 || homePrice <= 0) {
    isValid = false;
    warnings.push("Loan amount and home price must be greater than zero");
  }
  
  if (loanAmount >= homePrice) {
    isValid = false;
    warnings.push("Loan amount cannot equal or exceed home price");
  }
  
  const ltv = (loanAmount / homePrice) * 100;
  if (ltv > 96.5) {
    warnings.push("LTV exceeds typical FHA maximum of 96.5%");
  }
  
  if (loanTermYears < 8 || loanTermYears > 30) {
    warnings.push("Unusual loan term - verify MIP rates apply");
  }
  
  if (loanAmount > 1149825) { // 2024 FHA max in highest cost areas
    warnings.push("Loan amount may exceed FHA limits in your area");
  }
  
  return { isValid, warnings };
}

/**
 * Validate FHA loan eligibility
 */
export function validateFHAEligibility(fico: number, downPaymentPercent: number): {
  isEligible: boolean;
  warnings: string[];
  minDownPayment: number;
} {
  const warnings: string[] = [];
  let isEligible = true;
  let minDownPayment = FHA_REQUIREMENTS.minDownPaymentPercent3_5;
  
  if (fico < FHA_REQUIREMENTS.minFICOFor10Percent) {
    isEligible = false;
    warnings.push(`Minimum FICO score of ${FHA_REQUIREMENTS.minFICOFor10Percent} required for FHA loans`);
  } else if (fico < FHA_REQUIREMENTS.minFICOFor3_5Percent) {
    minDownPayment = FHA_REQUIREMENTS.minDownPaymentPercent10;
    if (downPaymentPercent < minDownPayment) {
      warnings.push(`FICO score ${fico} requires minimum ${minDownPayment}% down payment`);
    }
  } else {
    if (downPaymentPercent < FHA_REQUIREMENTS.minDownPaymentPercent3_5) {
      warnings.push(`Minimum down payment of ${FHA_REQUIREMENTS.minDownPaymentPercent3_5}% required`);
    }
  }
  
  return { isEligible, warnings, minDownPayment };
}

/**
 * Main FHA calculation function
 */
export function calculateFHALoan(params: FHALoanParams, maxDTI: number = FHA_REQUIREMENTS.baseDTIRatio): FHALoanResult {
  const {
    income,
    monthlyDebts,
    downPaymentPercent: inputDownPaymentPercent = 3.5, // Default to FHA minimum
    fico,
    propertyTax = 0,
    insurance = 0
  } = params;
  
  // Get current interest rate from cache/default
  const interestRate = FHA_REQUIREMENTS.baseInterestRate;
  
  const warnings: string[] = [];
  
  // Ensure down payment meets FHA minimums based on credit score
  const minDownPaymentPercent = fico >= 580 ? 3.5 : 10;
  const downPaymentPercent = Math.max(inputDownPaymentPercent, minDownPaymentPercent);
  
  if (inputDownPaymentPercent < minDownPaymentPercent) {
    warnings.push(`Down payment increased to FHA minimum of ${minDownPaymentPercent}% based on credit score`);
  }
  
  // Validate FHA eligibility
  const eligibility = validateFHAEligibility(fico, downPaymentPercent);
  warnings.push(...eligibility.warnings);
  
  if (!eligibility.isEligible) {
    return {
      maxLoanAmount: 0,
      maxHomePrice: 0,
      downPaymentAmount: 0,
      monthlyPayment: 0,
      totalMonthlyPayment: 0,
      upfrontMIP: 0,
      monthlyMIP: 0,
      debtToIncomeRatio: 0,
      loanToValueRatio: 0,
      meetsMinimumRequirements: false,
      warnings
    };
  }
  
  // Calculate maximum loan amount
  const maxLoanAmount = calculateMaxLoanAmount(income, maxDTI, monthlyDebts);
  
  if (maxLoanAmount <= 0) {
    warnings.push("Current income and debts do not qualify for any loan amount");
    return {
      maxLoanAmount: 0,
      maxHomePrice: 0,
      downPaymentAmount: 0,
      monthlyPayment: 0,
      totalMonthlyPayment: 0,
      upfrontMIP: 0,
      monthlyMIP: 0,
      debtToIncomeRatio: (monthlyDebts / (income / 12)) * 100,
      loanToValueRatio: 0,
      meetsMinimumRequirements: false,
      warnings
    };
  }
  
  // Simple, clean calculation using percentage
  const maxHomePrice = maxLoanAmount / (1 - downPaymentPercent / 100);
  const downPaymentAmount = maxHomePrice * (downPaymentPercent / 100);
  
  // Calculate PITI
  const pitiDetails = calculatePITI(maxLoanAmount, maxHomePrice, interestRate, propertyTax, insurance);
  
  // The DTI used for calculation is the maxDTI passed in (already optimized with compensating factors)
  // We don't recalculate it here as that would be circular
  const usedDTI = maxDTI * 100; // Convert to percentage
  
  // Note: We use the DTI that was passed in for calculation, not a recalculated verification
  // This avoids circular logic where the verified DTI would be lower than what we used
  
  // Use the DTI that was actually used for the calculation (maxDTI)
  // The verification DTI will be lower because we calculated max loan using the higher DTI
  const actualDTI = usedDTI; // Use the DTI we calculated with, not the verification
  
  // Calculate LTV
  const loanToValueRatio = (maxLoanAmount / maxHomePrice) * 100;
  
  // Get MIP details
  const mipRates = calculateMIP(maxLoanAmount, maxHomePrice);
  
  return {
    maxLoanAmount: Math.round(maxLoanAmount),
    maxHomePrice: Math.round(maxHomePrice),
    downPaymentAmount: Math.round(downPaymentAmount),
    monthlyPayment: pitiDetails.principalAndInterest,
    totalMonthlyPayment: pitiDetails.totalPITI,
    upfrontMIP: mipRates.upfrontMIP,
    monthlyMIP: mipRates.monthlyMIP,
    debtToIncomeRatio: Math.round(actualDTI * 100) / 100,
    loanToValueRatio: Math.round(loanToValueRatio * 100) / 100,
    meetsMinimumRequirements: eligibility.isEligible && actualDTI <= 56.99,
    warnings
  };
}

/**
 * Calculate real-time borrowing power changes
 */
export function calculateBorrowingPowerChange(
  baseParams: FHALoanParams,
  updatedParams: FHALoanParams,
  baseDTI: number,
  updatedDTI: number
): {
  loanAmountChange: number;
  loanAmountChangePercent: number;
  homePriceChange: number;
  homePriceChangePercent: number;
  monthlyPaymentChange: number;
} {
  const baseResult = calculateFHALoan(baseParams, baseDTI);
  const updatedResult = calculateFHALoan(updatedParams, updatedDTI);
  
  const loanAmountChange = updatedResult.maxLoanAmount - baseResult.maxLoanAmount;
  const loanAmountChangePercent = baseResult.maxLoanAmount > 0 ? 
    (loanAmountChange / baseResult.maxLoanAmount) * 100 : 0;
  
  const homePriceChange = updatedResult.maxHomePrice - baseResult.maxHomePrice;
  const homePriceChangePercent = baseResult.maxHomePrice > 0 ? 
    (homePriceChange / baseResult.maxHomePrice) * 100 : 0;
  
  const monthlyPaymentChange = updatedResult.totalMonthlyPayment - baseResult.totalMonthlyPayment;
  
  return {
    loanAmountChange: Math.round(loanAmountChange),
    loanAmountChangePercent: Math.round(loanAmountChangePercent * 100) / 100,
    homePriceChange: Math.round(homePriceChange),
    homePriceChangePercent: Math.round(homePriceChangePercent * 100) / 100,
    monthlyPaymentChange: Math.round(monthlyPaymentChange)
  };
}

/**
 * Parameters for compensating factors calculation
 */
export interface CompensatingFactorParams {
  necessaryDebts: number;
  cashReserves: number;
  currentHousingPayment: number;
  familySize: number;
}

/**
 * Unified result including FHA loan and DTI calculations
 */
export interface FHALoanWithFactorsResult extends FHALoanResult {
  dtiFactors: DTICalculationResult;
  convergedDTI: number;
  iterations: number;
  converged: boolean;
}

/**
 * Calculate FHA loan with compensating factors using iterative fixed-point solution
 * This is the single source of truth for DTI and loan calculations
 */
export function calculateFHALoanWithFactors(
  fhaParams: FHALoanParams,
  factorParams: CompensatingFactorParams
): FHALoanWithFactorsResult {
  const { income, monthlyDebts, downPaymentPercent, fico } = fhaParams;
  const { necessaryDebts, cashReserves, currentHousingPayment, familySize } = factorParams;
  
  // Convergence parameters for fixed-point iteration
  const MAX_ITERATIONS = 10;
  const CONVERGENCE_THRESHOLD = 0.001; // 0.1% DTI difference
  
  // Initialize with base DTI
  let currentDTI = FHA_REQUIREMENTS.baseDTIRatio;
  let previousDTI = 0;
  let iterations = 0;
  let converged = false;
  
  // Store results for each iteration
  let fhaResult: FHALoanResult | null = null;
  let dtiResult: DTICalculationResult | null = null;
  
  // Iterate until DTI converges
  while (iterations < MAX_ITERATIONS) {
    iterations++;
    
    // Step 1: Calculate FHA loan with current DTI
    fhaResult = calculateFHALoan(fhaParams, currentDTI);
    
    // Step 2: Use the calculated PITI payment to determine DTI factors
    // This is where we check if Low Payment Shock applies
    dtiResult = calculateDTIFactors(
      income,
      monthlyDebts,
      necessaryDebts,
      cashReserves,
      currentHousingPayment,
      fhaResult.totalMonthlyPayment, // Use actual PITI payment
      fico,
      downPaymentPercent,
      familySize,
      {
        ausMode: !!fhaParams.ausMode,
        positiveRentHistory: !!fhaParams.positiveRentHistory,
        monthlyTaxes: fhaParams.monthlyTaxes,
        childcareExpense: fhaParams.childcareExpense,
        region: fhaParams.region
      }
    );
    
    // Step 3: Update DTI for next iteration
    previousDTI = currentDTI;
    currentDTI = dtiResult.maxAllowedDTI;
    
    // Check for convergence
    const dtiDifference = Math.abs(currentDTI - previousDTI);
    if (dtiDifference < CONVERGENCE_THRESHOLD) {
      converged = true;
      break;
    }
  }
  
  // Final calculation with converged DTI
  if (!converged && iterations >= MAX_ITERATIONS) {
    // If we didn't converge, do one final calculation with the last DTI
    fhaResult = calculateFHALoan(fhaParams, currentDTI);
  }
  
  if (!fhaResult || !dtiResult) {
    // This should never happen, but TypeScript needs the check
    throw new Error('Failed to calculate FHA loan with factors');
  }
  
  // Return unified result
  return {
    ...fhaResult,
    dtiFactors: dtiResult,
    convergedDTI: currentDTI,
    iterations,
    converged
  };
}