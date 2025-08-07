import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export interface MortgageRateData {
  rate: number;
  source: string;
  lastUpdated: number;
  isStale: boolean;
  wasFallbackUsed: boolean;
  isLoading: boolean;
}

/**
 * Hook to get current FHA mortgage rates from Convex
 * Includes fallback detection and error state management
 */
export function useMortgageRates(): MortgageRateData {
  const rateData = useQuery(api.rates.getCurrentFHARate);
  
  return {
    rate: rateData?.rate || 7.0, // Default fallback rate
    source: rateData?.source || 'default',
    lastUpdated: rateData?.lastUpdated || Date.now(),
    isStale: rateData?.isStale || false,
    wasFallbackUsed: rateData?.wasFallbackUsed || false,
    isLoading: rateData === undefined,
  };
}

/**
 * Hook to check if rate data indicates an error condition
 * Returns true if fallback was used or rate is stale
 */
export function useRateErrorState(): {
  hasError: boolean;
  errorMessage: string | null;
  errorType: 'fallback' | 'stale' | 'loading' | null;
} {
  const rateData = useMortgageRates();
  
  if (rateData.isLoading) {
    return {
      hasError: true,
      errorMessage: 'Loading current mortgage rates...',
      errorType: 'loading'
    };
  }
  
  if (rateData.wasFallbackUsed) {
    return {
      hasError: true,
      errorMessage: 'Using backup rate source due to primary source unavailability',
      errorType: 'fallback'
    };
  }
  
  if (rateData.isStale) {
    return {
      hasError: true,
      errorMessage: 'Rate data may be outdated (last updated more than 24 hours ago)',
      errorType: 'stale'
    };
  }
  
  return {
    hasError: false,
    errorMessage: null,
    errorType: null
  };
}
