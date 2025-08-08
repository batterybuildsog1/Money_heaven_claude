/**
 * Property Tax Calculation Library
 * 
 * This module provides functions for calculating property taxes with state-specific
 * handling and integration with the xAI Grok API for accurate rate determination.
 */

// Types from the Convex xAI module
export interface PropertyTaxQuery {
  zipCode?: string;
  state: string;
  city?: string;
  county?: string;
  isPrimaryResidence: boolean;
  isOver65?: boolean;
  isVeteran?: boolean;
  isDisabled?: boolean;
  homeValue?: number;
}

export interface PropertyTaxResponse {
  headlineRate: number;
  applicableRate: number;
  exemptions: {
    homestead?: { amount: number; description: string };
    senior?: { discount: number; description: string };
    veteran?: { amount: number; description: string };
    disability?: { amount: number; description: string };
  };
  estimatedAnnualTax: number;
  details: {
    assessedValue: number;
    exemptionTotal: number;
    taxableValue: number;
    jurisdiction: string;
  };
  confidence: number;
  sources: string[];
}

// Helper function to call property tax API
async function fetchPropertyTaxData(query: PropertyTaxQuery): Promise<PropertyTaxResponse | null> {
  try {
    const response = await fetch('/api/property-tax', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      console.error('Property tax API error:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch property tax data:', error);
    return null;
  }
}

// State-specific property tax configurations
export interface StatePropertyTaxConfig {
  state: string;
  averageRate: number;
  homesteadExemption?: number;
  seniorDiscount?: number;
  veteranExemption?: number;
  hasSpecialFormula: boolean;
  notes?: string;
}

// Base property tax rates by state (as fallback)
const STATE_TAX_CONFIGS: Record<string, StatePropertyTaxConfig> = {
  'TX': {
    state: 'Texas',
    averageRate: 1.80,
    homesteadExemption: 100000, // School tax exemption
    seniorDiscount: 10, // Additional 10% discount for 65+
    veteranExemption: 12000,
    hasSpecialFormula: true,
    notes: 'Texas has complex school district variations and multiple exemption types'
  },
  'NJ': {
    state: 'New Jersey',
    averageRate: 2.13,
    homesteadExemption: 0, // No universal homestead exemption
    seniorDiscount: 0,
    veteranExemption: 250,
    hasSpecialFormula: false
  },
  'NH': {
    state: 'New Hampshire',
    averageRate: 1.86,
    homesteadExemption: 0,
    seniorDiscount: 0,
    veteranExemption: 500,
    hasSpecialFormula: false
  },
  'NY': {
    state: 'New York',
    averageRate: 1.68,
    homesteadExemption: 0,
    seniorDiscount: 50, // Senior Citizens Exemption
    veteranExemption: 15000,
    hasSpecialFormula: true,
    notes: 'STAR exemption for primary residences, complex county variations'
  },
  'CT': {
    state: 'Connecticut',
    averageRate: 1.63,
    homesteadExemption: 0,
    seniorDiscount: 0,
    veteranExemption: 1000,
    hasSpecialFormula: false
  },
  'IL': {
    state: 'Illinois',
    averageRate: 2.05,
    homesteadExemption: 10000,
    seniorDiscount: 5000,
    veteranExemption: 5000,
    hasSpecialFormula: false
  },
  'CA': {
    state: 'California',
    averageRate: 0.75,
    homesteadExemption: 7000,
    seniorDiscount: 0,
    veteranExemption: 4000,
    hasSpecialFormula: true,
    notes: 'Proposition 13 limits, complex assessment rules'
  },
  'FL': {
    state: 'Florida',
    averageRate: 0.83,
    homesteadExemption: 50000,
    seniorDiscount: 50000, // Additional exemption for 65+
    veteranExemption: 5000,
    hasSpecialFormula: false
  },
  'UT': {
    state: 'Utah',
    averageRate: 0.60,
    homesteadExemption: 45000,
    seniorDiscount: 0,
    veteranExemption: 0,
    hasSpecialFormula: true,
    notes: 'Utah has unique primary residence calculation methods'
  }
};

// Add more states with average US rate as fallback
const DEFAULT_CONFIG: StatePropertyTaxConfig = {
  state: 'Default',
  averageRate: 1.07, // National average
  homesteadExemption: 0,
  seniorDiscount: 0,
  veteranExemption: 0,
  hasSpecialFormula: false
};

/**
 * Parse location string to extract state, city, and ZIP code
 */
export function parseLocation(location: string): { state?: string; city?: string; zipCode?: string } {
  const result: { state?: string; city?: string; zipCode?: string } = {};
  
  // Extract ZIP code (5 digits, optionally followed by -4 more digits)
  const zipMatch = location.match(/\b(\d{5}(?:-\d{4})?)\b/);
  if (zipMatch) {
    result.zipCode = zipMatch[1];
  }
  
  // Extract state (2-letter abbreviation or full name)
  const stateAbbreviations = Object.keys(STATE_TAX_CONFIGS);
  const statePattern = new RegExp(`\\b(${stateAbbreviations.join('|')})\\b`, 'i');
  const stateMatch = location.match(statePattern);
  if (stateMatch) {
    result.state = stateMatch[1].toUpperCase();
  }
  
  // Extract city (remaining text after removing ZIP and state)
  let cityText = location.replace(/\b\d{5}(?:-\d{4})?\b/g, '').replace(statePattern, '');
  cityText = cityText.replace(/[,\s]+/g, ' ').trim();
  if (cityText) {
    result.city = cityText;
  }
  
  return result;
}

/**
 * Get headline property tax rate for a location
 * Implements hybrid caching pattern: check cache first, then call action
 */
export async function getHeadlinePropertyTaxRate(location: string): Promise<number> {
  const { state, zipCode } = parseLocation(location);
  
  if (!state) {
    return DEFAULT_CONFIG.averageRate;
  }
  
  try {
    // Use our API route to get property tax data
    const result = await fetchPropertyTaxData({
      state,
      zipCode,
      isPrimaryResidence: true
    });
    
    if (result) {
      return result.headlineRate;
    }
    
    // Fallback to state average if API fails
    return STATE_TAX_CONFIGS[state]?.averageRate || DEFAULT_CONFIG.averageRate;
  } catch (error) {
    console.error('Error getting headline rate:', error);
    return STATE_TAX_CONFIGS[state]?.averageRate || DEFAULT_CONFIG.averageRate;
  }
}

/**
 * Calculate applicable property tax rate using Grok AI
 * Implements hybrid caching pattern: check cache first, then call action
 */
export async function calculateApplicablePropertyTaxRate(
  location: string,
  homeValue: number,
  isPrimaryResidence: boolean,
  ownerAge?: number,
  isVeteran?: boolean,
  isDisabled?: boolean
): Promise<PropertyTaxResponse> {
  const { state, city, zipCode } = parseLocation(location);
  
  if (!state) {
    throw new Error('Unable to determine state from location');
  }
  
  const queryParams = {
    state,
    city,
    // County not available from parseLocation; enrich via ZIP lookup if needed upstream
    // county,
    zipCode,
    isPrimaryResidence,
    isOver65: ownerAge ? ownerAge >= 65 : false,
    isVeteran: isVeteran || false,
    isDisabled: isDisabled || false,
    homeValue
  };
  
  // Use our API route to get property tax data
  const result = await fetchPropertyTaxData(queryParams);
  
  if (!result) {
    // Return a fallback response if the API fails
    const config = STATE_TAX_CONFIGS[state] || DEFAULT_CONFIG;
    const baseRate = config.averageRate / 100;
    
    return {
      headlineRate: baseRate,
      applicableRate: baseRate,
      exemptions: {},
      estimatedAnnualTax: homeValue * baseRate,
      details: {
        assessedValue: homeValue,
        exemptionTotal: 0,
        taxableValue: homeValue,
        jurisdiction: state
      },
      confidence: 0.3,
      sources: ['Fallback calculation']
    };
  }
  
  return result;
}

/**
 * Calculate property tax using state-specific formulas
 */
export function calculatePropertyTaxWithStateFormula(
  state: string,
  homeValue: number,
  isPrimaryResidence: boolean,
  ownerAge?: number,
  isVeteran?: boolean
): { annualTax: number; effectiveRate: number; exemptions: { homestead?: { amount: number; description: string }; senior?: { amount?: number; discount?: number; description: string }; veteran?: { amount: number; description: string } } } {
  const config = STATE_TAX_CONFIGS[state] || DEFAULT_CONFIG;
  let exemptionTotal = 0;
  const exemptions: { homestead?: { amount: number; description: string }; senior?: { amount?: number; discount?: number; description: string }; veteran?: { amount: number; description: string } } = {};
  
  // Apply homestead exemption for primary residence
  if (isPrimaryResidence && config.homesteadExemption) {
    exemptionTotal += config.homesteadExemption;
    exemptions.homestead = {
      amount: config.homesteadExemption,
      description: 'Homestead exemption for primary residence'
    };
  }
  
  // Apply senior discount
  if (ownerAge && ownerAge >= 65 && config.seniorDiscount) {
    if (config.seniorDiscount > 100) {
      // Fixed amount exemption
      exemptionTotal += config.seniorDiscount;
      exemptions.senior = {
        amount: config.seniorDiscount,
        description: 'Senior citizen exemption (65+)'
      };
    } else {
      // Percentage discount (applied to taxable value)
      exemptions.senior = {
        discount: config.seniorDiscount,
        description: `Senior citizen discount (${config.seniorDiscount}% off)`
      };
    }
  }
  
  // Apply veteran exemption
  if (isVeteran && config.veteranExemption) {
    exemptionTotal += config.veteranExemption;
    exemptions.veteran = {
      amount: config.veteranExemption,
      description: 'Veteran exemption'
    };
  }
  
  // Calculate taxable value
  const taxableValue = Math.max(0, homeValue - exemptionTotal);
  
  // Apply senior percentage discount if applicable
  let finalTaxableValue = taxableValue;
  if (ownerAge && ownerAge >= 65 && config.seniorDiscount && config.seniorDiscount <= 100) {
    finalTaxableValue = taxableValue * (1 - config.seniorDiscount / 100);
  }
  
  // Handle state-specific formulas
  let annualTax: number;
  
  if (state === 'TX') {
    // Texas has multiple tax entities (school, county, city, etc.)
    // Simplified calculation with average combined rate
    annualTax = finalTaxableValue * (config.averageRate / 100);
  } else if (state === 'UT') {
    // Utah has special primary residence calculations
    const primaryResidenceRate = isPrimaryResidence ? 0.0055 : config.averageRate / 100;
    annualTax = finalTaxableValue * primaryResidenceRate;
  } else if (state === 'CA') {
    // California Proposition 13 - simplified version
    // In reality, this would require assessed value history
    annualTax = finalTaxableValue * (config.averageRate / 100);
  } else {
    // Standard calculation
    annualTax = finalTaxableValue * (config.averageRate / 100);
  }
  
  const effectiveRate = homeValue > 0 ? (annualTax / homeValue) * 100 : 0;
  
  return {
    annualTax,
    effectiveRate,
    exemptions
  };
}

/**
 * Get comprehensive property tax information
 */
export async function getPropertyTaxInfo(
  location: string,
  homeValue: number,
  isPrimaryResidence: boolean = true,
  ownerAge?: number,
  isVeteran?: boolean,
  isDisabled?: boolean,
  useAI: boolean = true
): Promise<{
  grokAnalysis?: PropertyTaxResponse;
  stateFormula: ReturnType<typeof calculatePropertyTaxWithStateFormula>;
  recommendation: {
    estimatedAnnualTax: number;
    effectiveRate: number;
    confidence: 'high' | 'medium' | 'low';
    source: string;
  };
}> {
  const { state } = parseLocation(location);
  
  if (!state) {
    throw new Error('Unable to determine state from location');
  }
  
  // Calculate using state formula as baseline
  const stateFormula = calculatePropertyTaxWithStateFormula(
    state,
    homeValue,
    isPrimaryResidence,
    ownerAge,
    isVeteran
  );
  
  let grokAnalysis: PropertyTaxResponse | undefined;
  let recommendation: any;
  
  if (useAI) {
    try {
      grokAnalysis = await calculateApplicablePropertyTaxRate(
        location,
        homeValue,
        isPrimaryResidence,
        ownerAge,
        isVeteran,
        isDisabled
      );
      
      // Use Grok analysis as primary recommendation if confidence is high
      if (grokAnalysis.confidence > 0.7) {
        recommendation = {
          estimatedAnnualTax: grokAnalysis.estimatedAnnualTax,
          effectiveRate: grokAnalysis.applicableRate,
          confidence: 'high' as const,
          source: 'AI Analysis (Grok)'
        };
      } else {
        // Use average of both methods for medium confidence
        const avgTax = (grokAnalysis.estimatedAnnualTax + stateFormula.annualTax) / 2;
        recommendation = {
          estimatedAnnualTax: avgTax,
          effectiveRate: homeValue > 0 ? (avgTax / homeValue) * 100 : 0,
          confidence: 'medium' as const,
          source: 'AI + State Formula Average'
        };
      }
    } catch (error) {
      console.error('AI analysis failed, using state formula:', error);
      recommendation = {
        estimatedAnnualTax: stateFormula.annualTax,
        effectiveRate: stateFormula.effectiveRate,
        confidence: 'low' as const,
        source: 'State Formula (AI Unavailable)'
      };
    }
  } else {
    recommendation = {
      estimatedAnnualTax: stateFormula.annualTax,
      effectiveRate: stateFormula.effectiveRate,
      confidence: 'medium' as const,
      source: 'State Formula'
    };
  }
  
  return {
    grokAnalysis,
    stateFormula,
    recommendation
  };
}

/**
 * Get monthly property tax payment
 */
export async function getMonthlyPropertyTax(
  location: string,
  homeValue: number,
  isPrimaryResidence: boolean = true,
  ownerAge?: number,
  isVeteran?: boolean,
  isDisabled?: boolean
): Promise<number> {
  const info = await getPropertyTaxInfo(
    location,
    homeValue,
    isPrimaryResidence,
    ownerAge,
    isVeteran,
    isDisabled,
    true // Use AI analysis
  );
  
  return info.recommendation.estimatedAnnualTax / 12;
}

/**
 * Get state property tax configuration
 */
export function getStateConfig(state: string): StatePropertyTaxConfig {
  return STATE_TAX_CONFIGS[state.toUpperCase()] || DEFAULT_CONFIG;
}

/**
 * Get all available states with tax configurations
 */
export function getAvailableStates(): StatePropertyTaxConfig[] {
  return Object.values(STATE_TAX_CONFIGS);
}