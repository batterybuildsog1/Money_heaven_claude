import { create } from 'zustand';
import { calculateFHALoanWithFactors, calculateFHALoan, calculatePITI, FHA_REQUIREMENTS } from '../lib/fha-calculator';
import { getDTIProgressData, getDTIRecommendations } from '../lib/dti-factors';
import { getFHALimitByZip } from '../lib/fha-limits';
import { getPropertyTaxInfo, getMonthlyPropertyTax } from '../lib/property-tax';
import { estimateHomeownersInsurance, getMonthlyInsurancePayment, getStateRiskFactors } from '../lib/insurance';
import { getEnhancedInsuranceEstimate } from '../lib/insurance/insurance-enhanced';
import { getLocationFromZip } from '../lib/zip-lookup';
import { getRegionFromStateAbbr } from '../lib/regions';
import { debounce } from '../lib/utils';

// Import types from the main types file
import type { 
  UserInputs, 
  CompensatingFactors, 
  CalculationResults,
  DTIProgressData,
  FHALoanResult,
  TaxExemptions,
  PropertyTaxInfo,
  InsuranceInfo
} from '../types';

export interface UIState {
  currentStep: number;
  isCalculating: boolean;
  showResults: boolean;
  showCompensatingFactors: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
}

interface CalculatorStore {
  // State
  userInputs: UserInputs;
  compensatingFactors: CompensatingFactors;
  results: CalculationResults;
  previousResults: CalculationResults | null;
  uiState: UIState;
  dtiProgressData: DTIProgressData | null;
  fhaLoanResult: FHALoanResult | null;
  
  // Rate information for display
  currentRate: {
    rate: number;
    source: string;
    lastUpdated: number;
    wasFallbackUsed: boolean;
  } | null;
  
  // Actions
  updateUserInputs: (inputs: Partial<UserInputs>) => void;
  updateCompensatingFactors: (factors: Partial<CompensatingFactors>) => void;
  setResults: (results: CalculationResults) => void;
  setUIState: (state: Partial<UIState>) => void;
  resetCalculator: () => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  
  // FHA-specific actions
  calculateFHABorrowingPower: () => void;
  calculateFHABorrowingPowerSilent: () => void;
  
  // Property tax and insurance actions
  calculatePropertyTax: () => Promise<void>;
  calculateInsurance: () => Promise<void>;
  updateTaxExemptions: (exemptions: Partial<TaxExemptions>) => void;
  
  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  
  // Validation
  validateCurrentStep: () => boolean;
  isStepComplete: (step: number) => boolean;
}

const initialUserInputs: UserInputs = {};

const initialCompensatingFactors: CompensatingFactors = {};

const initialResults: CalculationResults = {};

const initialUIState: UIState = {
  currentStep: 1,
  isCalculating: false,
  showResults: false,
  showCompensatingFactors: false,
  isDirty: false,
  errors: {},
};

// Create debounced calculation function outside the store to maintain reference
let debouncedCalculate: (() => void) | null = null;

export const useCalculatorStore = create<CalculatorStore>((set, get) => {
  // Initialize debounced function with access to get()
  if (!debouncedCalculate) {
    debouncedCalculate = debounce(() => {
      // Use the silent calculation for real-time updates (no navigation changes)
      get().calculateFHABorrowingPowerSilent();
    }, 300); // 300ms debounce for performance
  }

  return {
      // Initial state
      userInputs: initialUserInputs,
      compensatingFactors: initialCompensatingFactors,
      results: initialResults,
      previousResults: null,
      uiState: initialUIState,
      dtiProgressData: null,
      fhaLoanResult: null,
      currentRate: null,

      // Actions
      updateUserInputs: async (inputs: Partial<UserInputs>) => {
        const previousResults = get().results;
        const previousInputs = get().userInputs;
        
        set((state) => ({
          userInputs: { ...state.userInputs, ...inputs },
          uiState: { ...state.uiState, isDirty: true },
        }));
        
        // Trigger debounced real-time calculation if we have minimum required data
        const { userInputs } = get();
        const updatedInputs = { ...userInputs, ...inputs };
        
        // If zipCode is updated, just store it - we'll look up location data when needed
        if (inputs.zipCode && inputs.zipCode.length === 5) {
          // Simply validate it's a 5-digit ZIP and store it
          // Location data will be fetched on-demand during calculations
          updatedInputs.zipCode = inputs.zipCode;
        }
        
        // Trigger unified calculation when we have basic required data
        if (updatedInputs.income && updatedInputs.fico !== undefined && updatedInputs.monthlyDebts !== undefined) {
          debouncedCalculate?.();
          
          // Check for borrowing power changes after calculation completes
          setTimeout(() => {
            const newResults = get().results;
            if (previousResults.maxLoanAmount && newResults.maxLoanAmount) {
              const loanDiff = newResults.maxLoanAmount - previousResults.maxLoanAmount;
              
              // Only dispatch events for significant changes (> $1000)
              if (Math.abs(loanDiff) > 1000) {
                // Determine what changed and dispatch appropriate event
                if (inputs.income !== undefined && inputs.income !== previousInputs.income) {
                  window.dispatchEvent(new CustomEvent('borrowingPowerChange', {
                    detail: {
                      changeType: 'income',
                      displayName: loanDiff > 0 ? 'Income Increased' : 'Income Decreased',
                      direction: loanDiff > 0 ? 'increase' : 'decrease',
                      borrowingPowerChange: Math.abs(loanDiff),
                      inputField: 'income'
                    }
                  }));
                } else if (inputs.fico !== undefined && inputs.fico !== previousInputs.fico) {
                  window.dispatchEvent(new CustomEvent('borrowingPowerChange', {
                    detail: {
                      changeType: 'fico',
                      displayName: loanDiff > 0 ? 'Credit Score Improved' : 'Credit Score Decreased',
                      direction: loanDiff > 0 ? 'increase' : 'decrease',
                      borrowingPowerChange: Math.abs(loanDiff),
                      inputField: 'fico'
                    }
                  }));
                } else if (inputs.monthlyDebts !== undefined && inputs.monthlyDebts !== previousInputs.monthlyDebts) {
                  // Debts have inverse relationship - more debt = less borrowing power
                  const debtIncreased = (inputs.monthlyDebts || 0) > (previousInputs.monthlyDebts || 0);
                  window.dispatchEvent(new CustomEvent('borrowingPowerChange', {
                    detail: {
                      changeType: 'debt',
                      displayName: debtIncreased ? 'Monthly Debts Increased' : 'Monthly Debts Reduced',
                      direction: loanDiff > 0 ? 'increase' : 'decrease',
                      borrowingPowerChange: Math.abs(loanDiff),
                      inputField: 'monthlyDebts'
                    }
                  }));
                }
              }
            }
          }, 350); // After 300ms debounce + 50ms buffer
        }
        
        // Trigger property tax calculation when zipCode or homeValue changes
        if ((inputs.zipCode !== undefined || inputs.homeValue !== undefined || inputs.taxExemptions !== undefined) && 
            updatedInputs.zipCode && updatedInputs.homeValue) {
          const { calculatePropertyTax } = get();
          calculatePropertyTax();
        }
        
        // Trigger insurance calculation when zipCode or insurance-related fields change
        if ((inputs.zipCode !== undefined || inputs.hasSecuritySystem !== undefined || inputs.homeValue !== undefined) && 
            updatedInputs.zipCode && updatedInputs.homeValue) {
          const { calculateInsurance } = get();
          calculateInsurance();
        }
      },

      updateCompensatingFactors: (factors: Partial<CompensatingFactors>) => {
        const previousFactors = get().compensatingFactors;
        const previousResults = get().results;
        
        set((state) => ({
          compensatingFactors: { ...state.compensatingFactors, ...factors },
          uiState: { ...state.uiState, isDirty: true },
        }));
        
        // Trigger unified calculation when compensating factors change
        const { userInputs, calculateFHABorrowingPowerSilent } = get();
        if (userInputs.income && userInputs.fico !== undefined && userInputs.monthlyDebts !== undefined) {
          // Calculate immediately to check for changes
          calculateFHABorrowingPowerSilent();
          
          // Check for newly activated factors and emit events
          setTimeout(() => {
            const newResults = get().results;
            const newDTIData = get().dtiProgressData;
            
            if (newResults.maxLoanAmount && previousResults.maxLoanAmount && 
                newResults.maxLoanAmount > previousResults.maxLoanAmount && newDTIData) {
              
              // Find newly activated factors
              const prevActiveIds = previousFactors ? Object.keys(previousFactors).filter(k => (previousFactors as any)[k]) : [];
              const newActiveFactors = newDTIData.activeFactors.filter(
                factor => !prevActiveIds.includes(factor.id)
              );
              
              // Emit event for each newly activated factor
              newActiveFactors.forEach(factor => {
                const loanDiff = newResults.maxLoanAmount! - previousResults.maxLoanAmount!;
                const borrowingPowerIncrease = Math.round(
                  loanDiff * (factor.dtiIncrease / newDTIData.totalIncrease)
                );
                
                if (borrowingPowerIncrease > 0) {
                  window.dispatchEvent(new CustomEvent('borrowingPowerIncrease', {
                    detail: {
                      name: factor.name,
                      dtiIncrease: factor.dtiIncrease,
                      borrowingPowerIncrease
                    }
                  }));
                }
              });
            }
          }, 100);
        }
      },

      setResults: (results: CalculationResults) => {
        set((state) => ({
          previousResults: state.results,
          results,
          uiState: { 
            ...state.uiState, 
            showResults: true, 
            isCalculating: false,
            isDirty: false 
          },
        }));
      },

      setUIState: (uiState: Partial<UIState>) => {
        set((state) => ({
          uiState: { ...state.uiState, ...uiState },
        }));
      },

      resetCalculator: () => {
        set({
          userInputs: initialUserInputs,
          compensatingFactors: initialCompensatingFactors,
          results: initialResults,
          uiState: initialUIState,
          dtiProgressData: null,
          fhaLoanResult: null,
          currentRate: null,
        });
      },

      setError: (field: string, error: string) => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            errors: { ...state.uiState.errors, [field]: error },
          },
        }));
      },

      clearError: (field: string) => {
        set((state) => {
          const newErrors = { ...state.uiState.errors };
          delete newErrors[field];
          return {
            uiState: { ...state.uiState, errors: newErrors },
          };
        });
      },

      clearAllErrors: () => {
        set((state) => ({
          uiState: { ...state.uiState, errors: {} },
        }));
      },

      // FHA-specific calculation functions
      // Silent version for real-time updates (doesn't set showResults)
      calculateFHABorrowingPowerSilent: () => {
        const { userInputs, compensatingFactors } = get();
        
        if (!userInputs.income || !userInputs.fico || userInputs.monthlyDebts === undefined) {
          return;
        }
        
        // Default to FHA minimum if not specified
        const downPaymentPercent = userInputs.downPaymentPercent || 3.5;

        // Get FHA loan limit
        const fhaLimitData = userInputs.zipCode ? getFHALimitByZip(userInputs.zipCode) : null;
        
        // Calculate necessary debts from individual debt fields
        // Necessary = student loans + auto loans (transportation/education are necessary)
        // Discretionary = credit cards + other debts
        const necessaryDebts = (userInputs.studentLoanPayment || 0) + (userInputs.autoLoanPayment || 0);
        const totalDebts = (userInputs.studentLoanPayment || 0) + 
                          (userInputs.autoLoanPayment || 0) + 
                          (userInputs.creditCardPayment || 0) + 
                          (userInputs.otherDebtPayment || 0);
        
        // Use individual debts if available, otherwise fall back to total monthlyDebts
        const effectiveMonthlyDebts = totalDebts > 0 ? totalDebts : (userInputs.monthlyDebts || 0);
        const effectiveNecessaryDebts = necessaryDebts > 0 ? necessaryDebts : 
                                        (compensatingFactors.necessaryDebts || userInputs.necessaryDebts || 0);
        // Use unified calculation with iteration
        const stateAbbrForRegion = userInputs.location?.match(/\b([A-Z]{2})\b/)?.[1]
        const fhaParams = {
          income: userInputs.income,
          monthlyDebts: effectiveMonthlyDebts,
          downPaymentPercent: downPaymentPercent,
          fico: userInputs.fico,
          propertyTax: userInputs.propertyTax,
          insurance: userInputs.homeInsurance,
          zipCode: userInputs.zipCode,
          ausMode: userInputs.ausMode ?? true,
          positiveRentHistory: userInputs.positiveRentHistory,
          monthlyTaxes: userInputs.monthlyTaxes,
          childcareExpense: userInputs.childcareExpense,
          region: getRegionFromStateAbbr(stateAbbrForRegion || undefined)
        };
        
        const factorParams = {
          necessaryDebts: effectiveNecessaryDebts,
          cashReserves: compensatingFactors.cashReserves || 0,
          currentHousingPayment: userInputs.currentHousingPayment || 0,
          familySize: userInputs.familySize || 1
        };
        
        // Single unified calculation with iteration - solves circular dependency
        const result = calculateFHALoanWithFactors(fhaParams, factorParams);
        const fhaResult = result; // For compatibility with existing code
        const dtiResult = result.dtiFactors;
        
        // Calculate PITI breakdown for display
        const pitiBreakdown = calculatePITI(
          fhaResult.maxLoanAmount,
          fhaResult.maxHomePrice,
          FHA_REQUIREMENTS.baseInterestRate,
          userInputs.propertyTax,
          userInputs.homeInsurance
        );

        // Get DTI progress data and merge with full DTI result
        const progressData = getDTIProgressData(dtiResult);
        // Estimate $ per 1% DTI using a small delta to the DTI used
        const baselineDTIUsed = result.convergedDTI
        const epsilon = 0.01 // 1% DTI
        const lowerDTI = Math.max(0.30, baselineDTIUsed - epsilon)
        const higherDTI = Math.min(0.5699, baselineDTIUsed + epsilon)
        const lowerResult = calculateFHALoan({ ...fhaParams }, lowerDTI)
        const higherResult = calculateFHALoan({ ...fhaParams }, higherDTI)
        const dollarsPerDtiPercent = Math.round(((higherResult.maxLoanAmount - lowerResult.maxLoanAmount) / (2 * epsilon)) ) // $ per 1.00 DTI

        const fullDTIProgressData: DTIProgressData = {
          currentDTI: progressData.currentDTI,
          maxDTI: progressData.maxDTI,
          baseDTI: dtiResult.baseDTI,
          totalIncrease: dtiResult.totalIncrease,
          activeFactors: dtiResult.activeFactors.map(factor => ({
            id: factor.id,
            name: factor.name,
            description: factor.description,
            dtiIncrease: factor.dtiIncrease,
            isActive: factor.isActive,
            category: factor.category
          })),
          progressPercentage: dtiResult.progressPercentage,
          remainingCapacity: dtiResult.remainingCapacity,
          dollarsPerDtiPercent
        };

        // Update state WITHOUT setting showResults
        set((state) => ({
          fhaLoanResult: {
            ...fhaResult,
            fhaLoanLimit: fhaLimitData?.limit || 498250,
            isHighCostArea: fhaLimitData?.isHighCost || false
          },
          dtiProgressData: fullDTIProgressData,
          results: {
            maxLoanAmount: fhaResult.maxLoanAmount,
            maxHomePrice: fhaResult.maxHomePrice,
            monthlyPayment: fhaResult.monthlyPayment,
            totalMonthlyPayment: fhaResult.totalMonthlyPayment,
            principalAndInterest: pitiBreakdown.principalAndInterest,
            monthlyPropertyTax: pitiBreakdown.propertyTax,
            monthlyInsurance: pitiBreakdown.insurance,
            monthlyMIP: pitiBreakdown.mip,
            debtToIncomeRatio: result.convergedDTI * 100, // Convert to percentage
            loanToValueRatio: fhaResult.loanToValueRatio,
            interestRate: FHA_REQUIREMENTS.baseInterestRate,
            mip: fhaResult.monthlyMIP,
            upfrontMIP: fhaResult.upfrontMIP,
            recommendations: getDTIRecommendations(dtiResult, {
              reserves: compensatingFactors.cashReserves || 0,
              ficoScore: userInputs.fico || 580,
              downPaymentPercent: downPaymentPercent,
              currentHousingPayment: userInputs.currentHousingPayment || 0,
              newMortgagePayment: fhaResult.totalMonthlyPayment,
              totalMonthlyDebts: effectiveMonthlyDebts,
              necessaryDebts: effectiveNecessaryDebts
            }),
            warnings: fhaResult.warnings,
            meetsMinimumRequirements: fhaResult.meetsMinimumRequirements,
            baseDTI: dtiResult.baseDTI,
            maxAllowedDTI: dtiResult.maxAllowedDTI,
            dtiIncrease: dtiResult.totalIncrease,
            fhaLoanLimit: fhaLimitData?.limit || 498250,
            isHighCostArea: fhaLimitData?.isHighCost || false,
            loanProgram: 'FHA' as const
          },
          uiState: { ...state.uiState, isCalculating: false }
        }));
      },

      // Main calculation function that DOES set showResults (for explicit user actions)
      calculateFHABorrowingPower: () => {
        const { userInputs, compensatingFactors } = get();
        
        if (!userInputs.income || !userInputs.fico || userInputs.monthlyDebts === undefined) {
          return;
        }
        
        // Default to FHA minimum if not specified
        const downPaymentPercent = userInputs.downPaymentPercent || 3.5;

        // Get FHA loan limit
        const fhaLimitData = userInputs.zipCode ? getFHALimitByZip(userInputs.zipCode) : null;
        
        // Calculate necessary debts from individual debt fields
        // Necessary = student loans + auto loans (transportation/education are necessary)
        // Discretionary = credit cards + other debts
        const necessaryDebts = (userInputs.studentLoanPayment || 0) + (userInputs.autoLoanPayment || 0);
        const totalDebts = (userInputs.studentLoanPayment || 0) + 
                          (userInputs.autoLoanPayment || 0) + 
                          (userInputs.creditCardPayment || 0) + 
                          (userInputs.otherDebtPayment || 0);
        
        // Use individual debts if available, otherwise fall back to total monthlyDebts
        const effectiveMonthlyDebts = totalDebts > 0 ? totalDebts : (userInputs.monthlyDebts || 0);
        const effectiveNecessaryDebts = necessaryDebts > 0 ? necessaryDebts : 
                                        (compensatingFactors.necessaryDebts || userInputs.necessaryDebts || 0);
        // Use unified calculation with iteration
        const stateAbbrForRegion2 = userInputs.location?.match(/\b([A-Z]{2})\b/)?.[1]
        const fhaParams = {
          income: userInputs.income,
          monthlyDebts: effectiveMonthlyDebts,
          downPaymentPercent: downPaymentPercent,
          fico: userInputs.fico,
          propertyTax: userInputs.propertyTax,
          insurance: userInputs.homeInsurance,
          zipCode: userInputs.zipCode,
          ausMode: userInputs.ausMode ?? true,
          positiveRentHistory: userInputs.positiveRentHistory,
          monthlyTaxes: userInputs.monthlyTaxes,
          childcareExpense: userInputs.childcareExpense,
          region: getRegionFromStateAbbr(stateAbbrForRegion2 || undefined)
        };
        
        const factorParams = {
          necessaryDebts: effectiveNecessaryDebts,
          cashReserves: compensatingFactors.cashReserves || 0,
          currentHousingPayment: userInputs.currentHousingPayment || 0,
          familySize: userInputs.familySize || 1
        };
        
        // Single unified calculation with iteration - solves circular dependency
        const result = calculateFHALoanWithFactors(fhaParams, factorParams);
        const fhaResult = result; // For compatibility with existing code
        const dtiResult = result.dtiFactors;
        
        // Calculate PITI breakdown for display
        const pitiBreakdown = calculatePITI(
          fhaResult.maxLoanAmount,
          fhaResult.maxHomePrice,
          FHA_REQUIREMENTS.baseInterestRate,
          userInputs.propertyTax,
          userInputs.homeInsurance
        );

        // Get DTI progress data and merge with full DTI result
        const progressData = getDTIProgressData(dtiResult);
        const baselineDTIUsed2 = result.convergedDTI
        const lowerDTI2 = Math.max(0.30, baselineDTIUsed2 - 0.01)
        const higherDTI2 = Math.min(0.5699, baselineDTIUsed2 + 0.01)
        const lowerResult2 = calculateFHALoan({ ...fhaParams }, lowerDTI2)
        const higherResult2 = calculateFHALoan({ ...fhaParams }, higherDTI2)
        const dollarsPerDtiPercent2 = Math.round(((higherResult2.maxLoanAmount - lowerResult2.maxLoanAmount) / (2 * 0.01)) )

        const fullDTIProgressData: DTIProgressData = {
          currentDTI: progressData.currentDTI,
          maxDTI: progressData.maxDTI,
          baseDTI: dtiResult.baseDTI,
          totalIncrease: dtiResult.totalIncrease,
          activeFactors: dtiResult.activeFactors.map(factor => ({
            id: factor.id,
            name: factor.name,
            description: factor.description,
            dtiIncrease: factor.dtiIncrease,
            isActive: factor.isActive,
            category: factor.category
          })),
          progressPercentage: dtiResult.progressPercentage,
          remainingCapacity: dtiResult.remainingCapacity,
          dollarsPerDtiPercent: dollarsPerDtiPercent2
        };

        // Update state WITH showResults for explicit calculations
        set((state) => ({
          fhaLoanResult: {
            ...fhaResult,
            fhaLoanLimit: fhaLimitData?.limit || 498250,
            isHighCostArea: fhaLimitData?.isHighCost || false
          },
          dtiProgressData: fullDTIProgressData,
          results: {
            maxLoanAmount: fhaResult.maxLoanAmount,
            maxHomePrice: fhaResult.maxHomePrice,
            monthlyPayment: fhaResult.monthlyPayment,
            totalMonthlyPayment: fhaResult.totalMonthlyPayment,
            principalAndInterest: pitiBreakdown.principalAndInterest,
            monthlyPropertyTax: pitiBreakdown.propertyTax,
            monthlyInsurance: pitiBreakdown.insurance,
            monthlyMIP: pitiBreakdown.mip,
            debtToIncomeRatio: result.convergedDTI * 100, // Convert to percentage
            loanToValueRatio: fhaResult.loanToValueRatio,
            interestRate: FHA_REQUIREMENTS.baseInterestRate,
            mip: fhaResult.monthlyMIP,
            upfrontMIP: fhaResult.upfrontMIP,
            recommendations: getDTIRecommendations(dtiResult, {
              reserves: compensatingFactors.cashReserves || 0,
              ficoScore: userInputs.fico || 580,
              downPaymentPercent: downPaymentPercent,
              currentHousingPayment: userInputs.currentHousingPayment || 0,
              newMortgagePayment: fhaResult.totalMonthlyPayment,
              totalMonthlyDebts: effectiveMonthlyDebts,
              necessaryDebts: effectiveNecessaryDebts
            }),
            warnings: fhaResult.warnings,
            meetsMinimumRequirements: fhaResult.meetsMinimumRequirements,
            baseDTI: dtiResult.baseDTI,
            maxAllowedDTI: dtiResult.maxAllowedDTI,
            dtiIncrease: dtiResult.totalIncrease,
            fhaLoanLimit: fhaLimitData?.limit || 498250,
            isHighCostArea: fhaLimitData?.isHighCost || false,
            loanProgram: 'FHA' as const
          },
          uiState: { ...state.uiState, showResults: true, isCalculating: false }
        }));
      },


      // Navigation
      nextStep: () => {
        const { currentStep } = get().uiState;
        const maxStep = 4; // Adjust based on your total steps
        if (currentStep < maxStep) {
          set((state) => ({
            uiState: { ...state.uiState, currentStep: currentStep + 1 },
          }));
        }
      },

      prevStep: () => {
        const { currentStep } = get().uiState;
        if (currentStep > 1) {
          set((state) => ({
            uiState: { ...state.uiState, currentStep: currentStep - 1 },
          }));
        }
      },

      goToStep: (step: number) => {
        set((state) => ({
          uiState: { ...state.uiState, currentStep: step },
        }));
      },

      // Validation
      validateCurrentStep: () => {
        const { userInputs, uiState } = get();
        const { currentStep } = uiState;
        
        switch (currentStep) {
          case 1: // Basic info
            return !!(userInputs.income && userInputs.fico && userInputs.location);
          case 2: // Property and loan details
            return !!(userInputs.propertyType && userInputs.loanPurpose);
          case 3: // Employment and debts
            return !!(userInputs.employmentType && userInputs.employmentLength !== undefined);
          case 4: // Review and compensating factors
            return true; // Always valid
          default:
            return false;
        }
      },

      isStepComplete: (step: number) => {
        const { userInputs } = get();
        
        switch (step) {
          case 1:
            return !!(userInputs.income && userInputs.fico && userInputs.location);
          case 2:
            return !!(userInputs.propertyType && userInputs.loanPurpose);
          case 3:
            return !!(userInputs.employmentType && userInputs.employmentLength !== undefined);
          case 4:
            return true;
          default:
            return false;
        }
      },

      // Property tax and insurance actions
      calculatePropertyTax: async () => {
        const { userInputs } = get();
        
        if (!userInputs.zipCode || !userInputs.homeValue) {
          return;
        }

        try {
          set((state) => ({
            uiState: { ...state.uiState, isCalculating: true }
          }));

          // Get location data from ZIP when needed for tax calculations
          let locationString = userInputs.zipCode;
          const locationData = await getLocationFromZip(userInputs.zipCode);
          if (locationData && locationData.county) {
            // Include county for more accurate property tax calculations
            locationString = `${userInputs.zipCode}, ${locationData.county}, ${locationData.stateAbbr}`;
          }

          const taxInfo = await getPropertyTaxInfo(
            locationString,
            userInputs.homeValue,
            userInputs.taxExemptions?.isPrimaryResidence ?? false,
            userInputs.taxExemptions?.ownerAge,
            userInputs.taxExemptions?.isVeteran,
            userInputs.taxExemptions?.isDisabled,
            true // Use AI analysis
          );

          const propertyTaxInfo: PropertyTaxInfo = {
            headlineRate: taxInfo.stateFormula.effectiveRate,
            applicableRate: taxInfo.recommendation.effectiveRate,
            monthlyPayment: taxInfo.recommendation.estimatedAnnualTax / 12,
            annualPayment: taxInfo.recommendation.estimatedAnnualTax,
            exemptions: taxInfo.stateFormula.exemptions,
            confidence: taxInfo.recommendation.confidence,
            source: taxInfo.recommendation.source
          };

          set((state) => ({
            results: {
              ...state.results,
              propertyTax: propertyTaxInfo.monthlyPayment,
              propertyTaxInfo
            },
            userInputs: {
              ...state.userInputs,
              propertyTax: propertyTaxInfo.monthlyPayment,
              // Keep a richer location string so we can derive region reliably
              location: locationString
            },
            uiState: { ...state.uiState, isCalculating: false }
          }));

        } catch (error) {
          console.error('Error calculating property tax:', error);
          set((state) => ({
            uiState: { 
              ...state.uiState, 
              isCalculating: false,
              errors: { 
                ...state.uiState.errors, 
                propertyTax: 'Unable to calculate property tax' 
              }
            }
          }));
        }
      },

      calculateInsurance: async () => {
        const { userInputs } = get();
        
        if (!userInputs.zipCode || !userInputs.homeValue) {
          return;
        }

        try {
          set((state) => ({
            uiState: { ...state.uiState, isCalculating: true }
          }));

          // Try enhanced insurance estimation first
          let insuranceInfo: InsuranceInfo;
          
          try {
            console.log('=== STARTING ENHANCED INSURANCE ESTIMATION ===');
            console.log('User inputs:', {
              zipCode: userInputs.zipCode,
              homeValue: userInputs.homeValue,
              yearBuilt: userInputs.yearBuilt,
              constructionType: userInputs.constructionType,
              hasSecuritySystem: userInputs.hasSecuritySystem,
              distanceToFireHydrant: userInputs.distanceToFireHydrant
            });
            
            const enhancedEstimate = await getEnhancedInsuranceEstimate(
              userInputs.zipCode,
              userInputs.homeValue,
              {
                yearBuilt: new Date().getFullYear(), // Assume new construction
                constructionType: 'frame', // Standard frame construction
                hasSecuritySystem: userInputs.hasSecuritySystem,
                distanceToFireHydrant: 'close' // Building code requires close proximity
              }
            );
            
            console.log('Enhanced estimate result:', enhancedEstimate);
            console.log('=== ENHANCED INSURANCE ESTIMATION SUCCESS ===');
            
            // Get state risk factors for backward compatibility
            const state = userInputs.location?.match(/\b([A-Z]{2})\b/)?.[1] || 'US';
            const riskFactors = getStateRiskFactors(state);
            
            insuranceInfo = {
              monthlyPremium: enhancedEstimate.estimatedMonthly,
              annualPremium: enhancedEstimate.estimatedAnnual,
              dwellingCoverage: userInputs.homeValue * 0.9, // 90% of home value
              confidence: enhancedEstimate.confidence,
              zebraQuoteUrl: enhancedEstimate.zebraUrl,
              riskFactors,
              // Add enhanced data
              county: enhancedEstimate.county,
              enhancedFactors: enhancedEstimate.factors,
              riskAssessment: enhancedEstimate.riskAssessment
            };
          } catch (error) {
            console.error('=== ENHANCED INSURANCE ESTIMATION FAILED ===');
            console.error('Error details:', {
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
              name: error instanceof Error ? error.name : undefined,
              userInputs: {
                location: userInputs.location,
                homeValue: userInputs.homeValue
              }
            });
            console.error('Falling back to basic insurance estimation');
            
            // Fall back to original estimation
            // Define locationString for fallback (extract state from location or use zipCode)
            const stateCode = userInputs.location?.match(/\b([A-Z]{2})\b/)?.[1];
            const locationString = stateCode || userInputs.zipCode || 'US';
            const insuranceEstimate = estimateHomeownersInsurance(locationString, {
              homeValue: userInputs.homeValue,
              yearBuilt: new Date().getFullYear(), // Assume new construction
              constructionType: 'frame', // Standard frame construction
              hasSecuritySystem: userInputs.hasSecuritySystem,
              hasSmokeDetectors: true // Required by code
            });

            const state = userInputs.location?.match(/\b([A-Z]{2})\b/)?.[1] || 'US';
            const riskFactors = getStateRiskFactors(state);

            insuranceInfo = {
              monthlyPremium: insuranceEstimate.monthlyPremium,
              annualPremium: insuranceEstimate.annualPremium,
              dwellingCoverage: insuranceEstimate.dwellingCoverage,
              confidence: insuranceEstimate.confidence,
              zebraQuoteUrl: insuranceEstimate.zebraQuoteUrl,
              riskFactors
            };
          }

          set((state) => ({
            results: {
              ...state.results,
              homeInsurance: insuranceInfo.monthlyPremium,
              insuranceInfo
            },
            userInputs: {
              ...state.userInputs,
              homeInsurance: insuranceInfo.monthlyPremium
            },
            uiState: { ...state.uiState, isCalculating: false }
          }));

        } catch (error) {
          console.error('Error calculating insurance:', error);
          set((state) => ({
            uiState: { 
              ...state.uiState, 
              isCalculating: false,
              errors: { 
                ...state.uiState.errors, 
                homeInsurance: 'Unable to calculate insurance' 
              }
            }
          }));
        }
      },

      updateTaxExemptions: (exemptions: Partial<TaxExemptions>) => {
        set((state) => ({
          userInputs: {
            ...state.userInputs,
            taxExemptions: { ...state.userInputs.taxExemptions, ...exemptions }
          },
          uiState: { ...state.uiState, isDirty: true }
        }));

        // Automatically recalculate property tax when exemptions change
        const { calculatePropertyTax } = get();
        calculatePropertyTax();
      },
    }
  });