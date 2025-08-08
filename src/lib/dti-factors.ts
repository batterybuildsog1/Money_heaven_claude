/**
 * DTI Compensating Factors Logic
 * Implements FHA compensating factors that can increase the maximum DTI ratio
 */

import { getResidualIncomeThreshold } from './residualIncomeTable';
export interface CompensatingFactor {
  id: string;
  name: string;
  description: string;
  dtiIncrease: number;
  isActive: boolean;
  category: 'financial' | 'credit' | 'payment' | 'employment';
}

export interface DTIFactorState {
  cashReserves: {
    months: number;
    qualifies: boolean;
  };
  minimalPaymentIncrease: {
    currentPayment: number;
    newPayment: number;
    increasePercent: number;
    qualifies: boolean;
  };
  residualIncome: {
    hasAdequate: boolean;
    qualifies: boolean;
  };
  noDiscretionaryDebt: {
    hasDiscretionaryDebt: boolean;
    qualifies: boolean;
  };
  highFICO: {
    score: number;
    qualifies: boolean;
  };
  largeDownPayment: {
    percent: number;
    qualifies: boolean;
  };
}

export interface DTICalculationResult {
  baseDTI: number;
  totalIncrease: number;
  maxAllowedDTI: number;
  activeFactors: CompensatingFactor[];
  progressPercentage: number;
  remainingCapacity: number;
  // AUS simulation metadata
  ausModeApplied?: boolean;
  ausFrontierDTI?: number;
}

// DTI compensating factor definitions
export const COMPENSATING_FACTORS: Record<string, Omit<CompensatingFactor, 'isActive'>> = {
  cashReserves: {
    id: 'cashReserves',
    name: 'Cash Reserves',
    description: '6+ months of mortgage payments in reserves',
    dtiIncrease: 0.03,
    category: 'financial'
  },
  minimalPaymentIncrease: {
    id: 'minimalPaymentIncrease',
    name: 'Minimal Payment Increase',
    description: 'New payment is minimal increase from current housing costs',
    dtiIncrease: 0.02,
    category: 'payment'
  },
  residualIncome: {
    id: 'residualIncome',
    name: 'Adequate Residual Income',
    description: 'Sufficient income after all obligations',
    dtiIncrease: 0.02,
    category: 'financial'
  },
  noDiscretionaryDebt: {
    id: 'noDiscretionaryDebt',
    name: 'Low Revolving Balances',
    description: 'Credit card utilization under ~10% and limited non-essential payments',
    dtiIncrease: 0.02,
    category: 'financial'
  },
  highFICO: {
    id: 'highFICO',
    name: 'High Credit Score',
    description: 'FICO score of 740 or higher',
    dtiIncrease: 0.02,
    category: 'credit'
  },
  largeDownPayment: {
    id: 'largeDownPayment',
    name: 'Large Down Payment',
    description: 'Down payment of 10% or more',
    dtiIncrease: 0.02,
    category: 'payment'
  }
};

// Constants
export const DTI_CONSTANTS = {
  baseDTI: 0.43,
  maxDTIWithFactors: 0.5699,
  maxTotalIncrease: 0.1399,
  minCashReserveMonths: 6,
  minHighFICO: 740,
  minLargeDownPayment: 10.0,
  maxPaymentIncreasePercent: 5.0 // 5% increase threshold for minimal payment increase
};

/**
 * Evaluate cash reserves factor
 */
export function evaluateCashReserves(
  reserves: number,
  monthlyMortgagePayment: number
): { months: number; qualifies: boolean } {
  const months = monthlyMortgagePayment > 0 ? reserves / monthlyMortgagePayment : 0;
  const qualifies = months >= DTI_CONSTANTS.minCashReserveMonths;
  
  return { months: Math.round(months * 10) / 10, qualifies };
}

/**
 * Evaluate minimal payment increase factor
 * Qualifies when new payment is no more than 5% higher than current housing payment
 * (including cases where new payment is lower than current)
 */
export function evaluateMinimalPaymentIncrease(
  currentHousingPayment: number,
  newMortgagePayment: number
): { increasePercent: number; qualifies: boolean } {
  if (currentHousingPayment <= 0) {
    return { increasePercent: 0, qualifies: false };
  }
  
  const increasePercent = ((newMortgagePayment - currentHousingPayment) / currentHousingPayment) * 100;
  // Qualifies if the new payment is lower OR only slightly higher (max 5% increase)
  const qualifies = increasePercent <= DTI_CONSTANTS.maxPaymentIncreasePercent;
  
  return { 
    increasePercent: Math.round(increasePercent * 100) / 100, 
    qualifies 
  };
}

/**
 * Evaluate residual income factor
 */
export function evaluateResidualIncome(
  monthlyIncome: number,
  totalMonthlyObligations: number,
  familySize: number = 1,
  options?: {
    monthlyTaxes?: number;
    childcareExpense?: number;
    region?: 'Northeast' | 'Midwest' | 'South' | 'West';
  }
): { residualAmount: number; qualifies: boolean } {
  const taxes = options?.monthlyTaxes || 0;
  const childcare = options?.childcareExpense || 0;
  // Residual = gross income - taxes - obligations - childcare (simple, conservative)
  const residualAmount = monthlyIncome - taxes - totalMonthlyObligations - childcare;

  // Use region table when provided, otherwise fallback to simplified threshold
  let minResidualIncome: number;
  if (options?.region) {
    minResidualIncome = getResidualIncomeThreshold(options.region, familySize);
  } else {
    minResidualIncome = getMinResidualIncome(familySize);
  }
  const qualifies = residualAmount >= minResidualIncome;
  
  return { residualAmount: Math.round(residualAmount), qualifies };
}

/**
 * Get minimum residual income based on family size (simplified national average)
 */
function getMinResidualIncome(familySize: number): number {
  // Simplified FHA residual income requirements
  const baseAmount = 492; // Base amount for 1 person
  const additionalPerPerson = 301; // Additional amount per additional family member
  
  return baseAmount + ((familySize - 1) * additionalPerPerson);
}

/**
 * Evaluate discretionary debt factor
 */
export function evaluateDiscretionaryDebt(
  totalMonthlyDebts: number,
  necessaryDebts: number // mortgage, car loans, student loans, etc.
): { discretionaryDebt: number; qualifies: boolean } {
  const discretionaryDebt = Math.max(0, totalMonthlyDebts - necessaryDebts);
  const discretionaryPercent = totalMonthlyDebts > 0 ? (discretionaryDebt / totalMonthlyDebts) * 100 : 0;
  
  // Qualifies if discretionary debt is less than 10% of total debts
  const qualifies = discretionaryPercent <= 10;
  
  return { discretionaryDebt: Math.round(discretionaryDebt), qualifies };
}

/**
 * Evaluate high FICO factor
 */
export function evaluateHighFICO(ficoScore: number): { qualifies: boolean } {
  return { qualifies: ficoScore >= DTI_CONSTANTS.minHighFICO };
}

/**
 * Evaluate large down payment factor
 */
export function evaluateLargeDownPayment(downPaymentPercent: number): { qualifies: boolean } {
  return { qualifies: downPaymentPercent >= DTI_CONSTANTS.minLargeDownPayment };
}

/**
 * Calculate all DTI factors and determine total increase
 */
export function calculateDTIFactors(
  income: number,
  totalMonthlyDebts: number,
  necessaryDebts: number,
  reserves: number,
  currentHousingPayment: number,
  newMortgagePayment: number,
  ficoScore: number,
  downPaymentPercent: number,
  familySize: number = 1,
  opts?: {
    ausMode?: boolean;
    positiveRentHistory?: boolean;
    monthlyTaxes?: number;
    childcareExpense?: number;
    region?: 'Northeast' | 'Midwest' | 'South' | 'West';
  }
): DTICalculationResult {
  const activeFactors: CompensatingFactor[] = [];
  const monthlyIncome = income / 12;
  
  // Evaluate each factor
  const cashReservesResult = evaluateCashReserves(reserves, newMortgagePayment);
  if (cashReservesResult.qualifies) {
    activeFactors.push({
      ...COMPENSATING_FACTORS.cashReserves,
      isActive: true
    });
  }
  
  const paymentIncreaseResult = evaluateMinimalPaymentIncrease(currentHousingPayment, newMortgagePayment);
  if (paymentIncreaseResult.qualifies) {
    activeFactors.push({
      ...COMPENSATING_FACTORS.minimalPaymentIncrease,
      isActive: true
    });
  }
  
  const residualIncomeResult = evaluateResidualIncome(
    monthlyIncome,
    totalMonthlyDebts + newMortgagePayment,
    familySize,
    { monthlyTaxes: opts?.monthlyTaxes, childcareExpense: opts?.childcareExpense, region: opts?.region }
  );
  if (residualIncomeResult.qualifies) {
    activeFactors.push({
      ...COMPENSATING_FACTORS.residualIncome,
      isActive: true
    });
  }
  
  const discretionaryDebtResult = evaluateDiscretionaryDebt(totalMonthlyDebts, necessaryDebts);
  if (discretionaryDebtResult.qualifies) {
    activeFactors.push({
      ...COMPENSATING_FACTORS.noDiscretionaryDebt,
      isActive: true
    });
  }
  
  const highFICOResult = evaluateHighFICO(ficoScore);
  if (highFICOResult.qualifies) {
    activeFactors.push({
      ...COMPENSATING_FACTORS.highFICO,
      isActive: true
    });
  }
  
  const largeDownPaymentResult = evaluateLargeDownPayment(downPaymentPercent);
  if (largeDownPaymentResult.qualifies) {
    activeFactors.push({
      ...COMPENSATING_FACTORS.largeDownPayment,
      isActive: true
    });
  }
  
  // Calculate total increase (capped at maximum)
  const rawIncrease = activeFactors.reduce((sum, factor) => sum + factor.dtiIncrease, 0);
  const totalIncrease = Math.min(rawIncrease, DTI_CONSTANTS.maxTotalIncrease);
  
  // AUS frontier model (conservative, transparent heuristic)
  let ausFrontierDTI = 0.45; // 45% baseline
  if (opts?.ausMode) {
    // Score signals
    const reservesMonths = newMortgagePayment > 0 ? reserves / newMortgagePayment : 0;
    const paymentShockPercent = currentHousingPayment > 0
      ? ((newMortgagePayment - currentHousingPayment) / currentHousingPayment) * 100
      : 999;
    let signalPoints = 0;
    if (reservesMonths >= 3) signalPoints += reservesMonths >= 6 ? 2 : 1;
    if (paymentShockPercent <= 5) signalPoints += paymentShockPercent <= 0 ? 2 : 1;
    if (opts?.positiveRentHistory) signalPoints += 1;
    if (residualIncomeResult.qualifies) signalPoints += 1;
    if (ficoScore >= DTI_CONSTANTS.minHighFICO) signalPoints += 1;
    if (downPaymentPercent >= DTI_CONSTANTS.minLargeDownPayment) signalPoints += 0.5;
    const discretionaryDebtResult = evaluateDiscretionaryDebt(totalMonthlyDebts, necessaryDebts);
    if (discretionaryDebtResult.qualifies) signalPoints += 0.5;
    
    if (signalPoints >= 3) ausFrontierDTI = 0.50;
    if (signalPoints >= 5) ausFrontierDTI = DTI_CONSTANTS.maxDTIWithFactors; // up to 56.99%
  }
  
  // Combine additive model with AUS frontier cap when AUS mode
  const additiveDTI = DTI_CONSTANTS.baseDTI + totalIncrease;
  const cappedByAdditive = Math.min(additiveDTI, DTI_CONSTANTS.maxDTIWithFactors);
  const maxAllowedDTI = opts?.ausMode ? Math.min(cappedByAdditive, ausFrontierDTI) : cappedByAdditive;
  
  // Calculate progress percentage (0% to 100%)
  const progressPercentage = (totalIncrease / DTI_CONSTANTS.maxTotalIncrease) * 100;
  
  // Calculate remaining capacity
  const remainingCapacity = DTI_CONSTANTS.maxTotalIncrease - totalIncrease;
  
  return {
    baseDTI: DTI_CONSTANTS.baseDTI,
    totalIncrease: Math.round(totalIncrease * 10000) / 10000,
    maxAllowedDTI: Math.round(maxAllowedDTI * 10000) / 10000,
    activeFactors,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    remainingCapacity: Math.round(remainingCapacity * 10000) / 10000,
    ausModeApplied: !!opts?.ausMode,
    ausFrontierDTI: opts?.ausMode ? Math.round(ausFrontierDTI * 10000) / 10000 : undefined
  };
}

/**
 * Get visual progress data for DTI factors
 */
export function getDTIProgressData(dtiResult: DTICalculationResult): {
  currentDTI: number;
  maxDTI: number;
  progressSteps: Array<{
    label: string;
    value: number;
    isActive: boolean;
    color: string;
  }>;
} {
  const progressSteps = [
    {
      label: 'Base DTI (43%)',
      value: DTI_CONSTANTS.baseDTI,
      isActive: true,
      color: '#3b82f6' // Blue
    }
  ];
  
  // Add steps for each active factor
  let currentLevel = DTI_CONSTANTS.baseDTI;
  dtiResult.activeFactors.forEach((factor, index) => {
    currentLevel += factor.dtiIncrease;
    progressSteps.push({
      label: factor.name,
      value: currentLevel,
      isActive: true,
      color: `hsl(${120 + (index * 30)}, 70%, 50%)` // Green spectrum
    });
  });
  
  // Add remaining capacity if any
  if (dtiResult.remainingCapacity > 0) {
    progressSteps.push({
      label: 'Potential Additional',
      value: DTI_CONSTANTS.maxDTIWithFactors,
      isActive: false,
      color: '#d1d5db' // Gray
    });
  }
  
  return {
    currentDTI: dtiResult.maxAllowedDTI,
    maxDTI: DTI_CONSTANTS.maxDTIWithFactors,
    progressSteps
  };
}

/**
 * Get recommendations for improving DTI capacity
 */
export function getDTIRecommendations(
  dtiResult: DTICalculationResult,
  userParams: {
    reserves: number;
    ficoScore: number;
    downPaymentPercent: number;
    currentHousingPayment: number;
    newMortgagePayment: number;
    totalMonthlyDebts: number;
    necessaryDebts: number;
  }
): string[] {
  const recommendations: string[] = [];
  const allFactors = Object.values(COMPENSATING_FACTORS);
  const activeFactorIds = dtiResult.activeFactors.map(f => f.id);
  
  // Find missing factors and provide recommendations
  allFactors.forEach(factor => {
    if (!activeFactorIds.includes(factor.id)) {
      switch (factor.id) {
        case 'cashReserves':
          const neededReserves = DTI_CONSTANTS.minCashReserveMonths * userParams.newMortgagePayment;
          const additionalNeeded = Math.max(0, neededReserves - userParams.reserves);
          if (additionalNeeded > 0) {
            recommendations.push(
              `Build cash reserves: Save an additional $${Math.round(additionalNeeded).toLocaleString()} ` +
              `to reach ${DTI_CONSTANTS.minCashReserveMonths} months of mortgage payments`
            );
          }
          break;
          
        case 'highFICO':
          if (userParams.ficoScore < DTI_CONSTANTS.minHighFICO) {
            recommendations.push(
              `Improve credit score: Increase FICO score to ${DTI_CONSTANTS.minHighFICO}+ ` +
              `(currently ${userParams.ficoScore}) for additional DTI capacity`
            );
          }
          break;
          
        case 'largeDownPayment':
          if (userParams.downPaymentPercent < DTI_CONSTANTS.minLargeDownPayment) {
            recommendations.push(
              `Increase down payment: Save for at least ${DTI_CONSTANTS.minLargeDownPayment}% down ` +
              `(currently ${userParams.downPaymentPercent.toFixed(1)}%) to qualify for DTI boost`
            );
          }
          break;
          
        case 'noDiscretionaryDebt':
          const discretionaryDebt = Math.max(0, userParams.totalMonthlyDebts - userParams.necessaryDebts);
          if (discretionaryDebt > 0) {
            recommendations.push(
              `Reduce discretionary debt: Pay down $${Math.round(discretionaryDebt).toLocaleString()} ` +
              `in credit cards or other non-essential debts`
            );
          }
          break;
      }
    }
  });
  
  return recommendations;
}