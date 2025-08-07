/**
 * FHA Loan Limits for 2024
 * County-based FHA loan limits with ZIP code lookup functionality
 */

export interface FHALoanLimit {
  county: string;
  state: string;
  limit: number;
  isHighCost: boolean;
}

export interface ZipCodeLookup {
  zipCode: string;
  county: string;
  state: string;
  limit: number;
}

// 2024 FHA Loan Limits
export const FHA_LIMITS_2024: {
  baseline: number;
  ceiling: number;
  statewide: { [key: string]: number };
} = {
  // National baseline (floor)
  baseline: 498250,
  
  // High-cost area ceiling
  ceiling: 1149825,
  
  // State-wide limits (for states with uniform limits)
  statewide: {
    'AL': 498250, // Alabama
    'AK': 792350, // Alaska
    'AZ': 498250, // Arizona (varies by county)
    'AR': 498250, // Arkansas
    'DE': 498250, // Delaware
    'FL': 498250, // Florida (varies by county)
    'GA': 498250, // Georgia (varies by county)
    'ID': 498250, // Idaho
    'IN': 498250, // Indiana
    'IA': 498250, // Iowa
    'KS': 498250, // Kansas
    'KY': 498250, // Kentucky
    'LA': 498250, // Louisiana
    'ME': 555550, // Maine
    'MS': 498250, // Mississippi
    'MO': 498250, // Missouri
    'MT': 498250, // Montana
    'NE': 498250, // Nebraska
    'NV': 498250, // Nevada (varies by county)
    'NH': 625500, // New Hampshire
    'NM': 498250, // New Mexico
    'ND': 498250, // North Dakota
    'OH': 498250, // Ohio
    'OK': 498250, // Oklahoma
    'OR': 498250, // Oregon (varies by county)
    'PA': 498250, // Pennsylvania (varies by county)
    'RI': 625500, // Rhode Island
    'SC': 498250, // South Carolina
    'SD': 498250, // South Dakota
    'TN': 498250, // Tennessee
    'TX': 498250, // Texas (varies by county)
    'UT': 555550, // Utah
    'VT': 625500, // Vermont
    'WV': 498250, // West Virginia
    'WI': 498250, // Wisconsin
    'WY': 498250  // Wyoming
  }
};

// High-cost counties with specific limits
export const HIGH_COST_COUNTIES: Record<string, FHALoanLimit[]> = {
  'CA': [
    { county: 'Los Angeles', state: 'CA', limit: 1149825, isHighCost: true },
    { county: 'Orange', state: 'CA', limit: 1149825, isHighCost: true },
    { county: 'San Francisco', state: 'CA', limit: 1149825, isHighCost: true },
    { county: 'San Mateo', state: 'CA', limit: 1149825, isHighCost: true },
    { county: 'Santa Clara', state: 'CA', limit: 1149825, isHighCost: true },
    { county: 'Marin', state: 'CA', limit: 1149825, isHighCost: true },
    { county: 'San Diego', state: 'CA', limit: 1031250, isHighCost: true },
    { county: 'Alameda', state: 'CA', limit: 1149825, isHighCost: true },
    { county: 'Contra Costa', state: 'CA', limit: 1149825, isHighCost: true },
    { county: 'Santa Barbara', state: 'CA', limit: 986850, isHighCost: true },
    { county: 'Ventura', state: 'CA', limit: 986850, isHighCost: true },
    { county: 'Monterey', state: 'CA', limit: 847000, isHighCost: true },
    { county: 'Napa', state: 'CA', limit: 1149825, isHighCost: true },
    { county: 'Sonoma', state: 'CA', limit: 847000, isHighCost: true }
  ],
  'NY': [
    { county: 'New York', state: 'NY', limit: 1149825, isHighCost: true },
    { county: 'Kings', state: 'NY', limit: 1149825, isHighCost: true },
    { county: 'Queens', state: 'NY', limit: 1149825, isHighCost: true },
    { county: 'Bronx', state: 'NY', limit: 1149825, isHighCost: true },
    { county: 'Richmond', state: 'NY', limit: 1149825, isHighCost: true },
    { county: 'Nassau', state: 'NY', limit: 1149825, isHighCost: true },
    { county: 'Suffolk', state: 'NY', limit: 1149825, isHighCost: true },
    { county: 'Westchester', state: 'NY', limit: 1149825, isHighCost: true },
    { county: 'Rockland', state: 'NY', limit: 1149825, isHighCost: true }
  ],
  'NJ': [
    { county: 'Bergen', state: 'NJ', limit: 1149825, isHighCost: true },
    { county: 'Essex', state: 'NJ', limit: 1149825, isHighCost: true },
    { county: 'Hudson', state: 'NJ', limit: 1149825, isHighCost: true },
    { county: 'Hunterdon', state: 'NJ', limit: 1149825, isHighCost: true },
    { county: 'Middlesex', state: 'NJ', limit: 1149825, isHighCost: true },
    { county: 'Monmouth', state: 'NJ', limit: 1149825, isHighCost: true },
    { county: 'Morris', state: 'NJ', limit: 1149825, isHighCost: true },
    { county: 'Ocean', state: 'NJ', limit: 1149825, isHighCost: true },
    { county: 'Passaic', state: 'NJ', limit: 1149825, isHighCost: true },
    { county: 'Somerset', state: 'NJ', limit: 1149825, isHighCost: true },
    { county: 'Sussex', state: 'NJ', limit: 1149825, isHighCost: true },
    { county: 'Union', state: 'NJ', limit: 1149825, isHighCost: true }
  ],
  'CT': [
    { county: 'Fairfield', state: 'CT', limit: 1149825, isHighCost: true },
    { county: 'New Haven', state: 'CT', limit: 625500, isHighCost: false },
    { county: 'Hartford', state: 'CT', limit: 625500, isHighCost: false },
    { county: 'Litchfield', state: 'CT', limit: 625500, isHighCost: false }
  ],
  'MA': [
    { county: 'Suffolk', state: 'MA', limit: 1149825, isHighCost: true },
    { county: 'Middlesex', state: 'MA', limit: 1149825, isHighCost: true },
    { county: 'Norfolk', state: 'MA', limit: 1149825, isHighCost: true },
    { county: 'Essex', state: 'MA', limit: 847000, isHighCost: true },
    { county: 'Plymouth', state: 'MA', limit: 847000, isHighCost: true },
    { county: 'Worcester', state: 'MA', limit: 625500, isHighCost: false }
  ],
  'DC': [
    { county: 'District of Columbia', state: 'DC', limit: 1149825, isHighCost: true }
  ],
  'MD': [
    { county: 'Montgomery', state: 'MD', limit: 1149825, isHighCost: true },
    { county: 'Prince Georges', state: 'MD', limit: 1149825, isHighCost: true },
    { county: 'Anne Arundel', state: 'MD', limit: 847000, isHighCost: true },
    { county: 'Baltimore', state: 'MD', limit: 625500, isHighCost: false }
  ],
  'VA': [
    { county: 'Arlington', state: 'VA', limit: 1149825, isHighCost: true },
    { county: 'Fairfax', state: 'VA', limit: 1149825, isHighCost: true },
    { county: 'Loudoun', state: 'VA', limit: 1149825, isHighCost: true },
    { county: 'Prince William', state: 'VA', limit: 1149825, isHighCost: true },
    { county: 'Falls Church', state: 'VA', limit: 1149825, isHighCost: true },
    { county: 'Alexandria', state: 'VA', limit: 1149825, isHighCost: true }
  ],
  'WA': [
    { county: 'King', state: 'WA', limit: 1149825, isHighCost: true },
    { county: 'Snohomish', state: 'WA', limit: 847000, isHighCost: true },
    { county: 'Pierce', state: 'WA', limit: 740550, isHighCost: true }
  ],
  'CO': [
    { county: 'Denver', state: 'CO', limit: 740550, isHighCost: true },
    { county: 'Boulder', state: 'CO', limit: 847000, isHighCost: true },
    { county: 'Jefferson', state: 'CO', limit: 740550, isHighCost: true }
  ],
  'HI': [
    { county: 'Honolulu', state: 'HI', limit: 1149825, isHighCost: true },
    { county: 'Maui', state: 'HI', limit: 1149825, isHighCost: true },
    { county: 'Hawaii', state: 'HI', limit: 847000, isHighCost: true },
    { county: 'Kauai', state: 'HI', limit: 1149825, isHighCost: true }
  ]
};

// Common ZIP code to county mappings (sample - in production this would be much larger)
export const ZIP_TO_COUNTY_MAPPING: Record<string, { county: string; state: string }> = {
  // California major cities
  '90210': { county: 'Los Angeles', state: 'CA' },
  '90211': { county: 'Los Angeles', state: 'CA' },
  '94102': { county: 'San Francisco', state: 'CA' },
  '94103': { county: 'San Francisco', state: 'CA' },
  '95014': { county: 'Santa Clara', state: 'CA' },
  '92101': { county: 'San Diego', state: 'CA' },
  '92102': { county: 'San Diego', state: 'CA' },
  
  // New York
  '10001': { county: 'New York', state: 'NY' },
  '10002': { county: 'New York', state: 'NY' },
  '11201': { county: 'Kings', state: 'NY' },
  '11354': { county: 'Queens', state: 'NY' },
  '10451': { county: 'Bronx', state: 'NY' },
  '10301': { county: 'Richmond', state: 'NY' },
  '11501': { county: 'Nassau', state: 'NY' },
  '11701': { county: 'Suffolk', state: 'NY' },
  
  // New Jersey
  '07001': { county: 'Bergen', state: 'NJ' },
  '07002': { county: 'Bergen', state: 'NJ' },
  '07101': { county: 'Essex', state: 'NJ' },
  '07030': { county: 'Hudson', state: 'NJ' },
  
  // Washington DC
  '20001': { county: 'District of Columbia', state: 'DC' },
  '20002': { county: 'District of Columbia', state: 'DC' },
  
  // Maryland
  '20814': { county: 'Montgomery', state: 'MD' },
  '20735': { county: 'Prince Georges', state: 'MD' },
  
  // Virginia
  '22201': { county: 'Arlington', state: 'VA' },
  '22003': { county: 'Fairfax', state: 'VA' },
  '20176': { county: 'Loudoun', state: 'VA' },
  
  // Washington
  '98101': { county: 'King', state: 'WA' },
  '98102': { county: 'King', state: 'WA' },
  '98201': { county: 'Snohomish', state: 'WA' },
  '98401': { county: 'Pierce', state: 'WA' },
  
  // Colorado
  '80201': { county: 'Denver', state: 'CO' },
  '80202': { county: 'Denver', state: 'CO' },
  '80301': { county: 'Boulder', state: 'CO' },
  
  // Hawaii
  '96801': { county: 'Honolulu', state: 'HI' },
  '96802': { county: 'Honolulu', state: 'HI' },
  '96708': { county: 'Maui', state: 'HI' },
  
  // Massachusetts
  '02101': { county: 'Suffolk', state: 'MA' },
  '02139': { county: 'Middlesex', state: 'MA' },
  '02116': { county: 'Norfolk', state: 'MA' },
  
  // Connecticut
  '06830': { county: 'Fairfield', state: 'CT' },
  '06831': { county: 'Fairfield', state: 'CT' }
};

/**
 * Get FHA loan limit by state
 */
export function getFHALimitByState(state: string): number {
  const stateCode = state.toUpperCase();
  return FHA_LIMITS_2024.statewide[stateCode] || FHA_LIMITS_2024.baseline;
}

/**
 * Get FHA loan limit by county and state
 */
export function getFHALimitByCounty(county: string, state: string): number {
  const stateCode = state.toUpperCase();
  const countyLimits = HIGH_COST_COUNTIES[stateCode];
  
  if (countyLimits) {
    const countyData = countyLimits.find(
      c => c.county.toLowerCase() === county.toLowerCase()
    );
    if (countyData) {
      return countyData.limit;
    }
  }
  
  // Fall back to state limit or baseline
  return getFHALimitByState(state);
}

/**
 * Get FHA loan limit by ZIP code
 */
export function getFHALimitByZip(zipCode: string): {
  limit: number;
  county: string;
  state: string;
  isHighCost: boolean;
} {
  const locationData = ZIP_TO_COUNTY_MAPPING[zipCode];
  
  if (locationData) {
    const limit = getFHALimitByCounty(locationData.county, locationData.state);
    const isHighCost = limit > FHA_LIMITS_2024.baseline;
    
    return {
      limit,
      county: locationData.county,
      state: locationData.state,
      isHighCost
    };
  }
  
  // Default to baseline if ZIP not found
  return {
    limit: FHA_LIMITS_2024.baseline,
    county: 'Unknown',
    state: 'Unknown',
    isHighCost: false
  };
}

/**
 * Check if a location is considered high-cost
 */
export function isHighCostArea(county: string, state: string): boolean {
  const limit = getFHALimitByCounty(county, state);
  return limit > FHA_LIMITS_2024.baseline;
}

/**
 * Get all high-cost counties for a state
 */
export function getHighCostCounties(state: string): FHALoanLimit[] {
  const stateCode = state.toUpperCase();
  return HIGH_COST_COUNTIES[stateCode] || [];
}

/**
 * Validate loan amount against FHA limits
 */
export function validateFHALoanAmount(
  loanAmount: number,
  zipCode?: string,
  county?: string,
  state?: string
): {
  isValid: boolean;
  limit: number;
  exceedsBy: number;
  location: string;
} {
  let limit: number;
  let locationName: string;
  
  if (zipCode) {
    const zipData = getFHALimitByZip(zipCode);
    limit = zipData.limit;
    locationName = `${zipData.county}, ${zipData.state} (${zipCode})`;
  } else if (county && state) {
    limit = getFHALimitByCounty(county, state);
    locationName = `${county}, ${state}`;
  } else if (state) {
    limit = getFHALimitByState(state);
    locationName = state;
  } else {
    limit = FHA_LIMITS_2024.baseline;
    locationName = 'National Baseline';
  }
  
  const isValid = loanAmount <= limit;
  const exceedsBy = Math.max(0, loanAmount - limit);
  
  return {
    isValid,
    limit,
    exceedsBy,
    location: locationName
  };
}

/**
 * Get suggested alternative loan programs if FHA limit is exceeded
 */
export function getAlternativeLoanPrograms(loanAmount: number): {
  program: string;
  description: string;
  maxLoanAmount: number;
  requirements: string[];
}[] {
  const alternatives = [];
  
  // Conventional conforming loan limits (2024)
  const conventionalLimit = 766550; // National baseline
  const conventionalHighCostLimit = 1149825; // High-cost areas
  
  if (loanAmount <= conventionalLimit) {
    alternatives.push({
      program: 'Conventional Loan',
      description: 'Standard conventional mortgage with competitive rates',
      maxLoanAmount: conventionalLimit,
      requirements: [
        'Minimum 3% down payment',
        'FICO score 620+',
        'DTI ratio up to 45%',
        'PMI required if down payment < 20%'
      ]
    });
  }
  
  if (loanAmount <= conventionalHighCostLimit) {
    alternatives.push({
      program: 'High-Balance Conventional',
      description: 'Conventional loan for high-cost areas',
      maxLoanAmount: conventionalHighCostLimit,
      requirements: [
        'Minimum 5-10% down payment',
        'FICO score 640+',
        'DTI ratio up to 43%',
        'Higher down payment and reserves required'
      ]
    });
  }
  
  // Jumbo loans
  alternatives.push({
    program: 'Jumbo Loan',
    description: 'Non-conforming loan for amounts above conventional limits',
    maxLoanAmount: 0, // No limit
    requirements: [
      'Minimum 10-20% down payment',
      'FICO score 700+',
      'DTI ratio up to 43%',
      'Significant cash reserves required',
      'Higher interest rates'
    ]
  });
  
  return alternatives;
}

/**
 * Calculate maximum home price based on FHA limits and down payment percentage
 * Updated to use percentage-based down payment
 */
export function calculateMaxHomePriceWithFHALimits(
  downPaymentPercent: number = 3.5, // Default to FHA minimum
  zipCode?: string,
  county?: string,
  state?: string
): {
  maxHomePrice: number;
  maxLoanAmount: number;
  fhaLimit: number;
  location: string;
} {
  let fhaLimit: number;
  let locationName: string;
  
  if (zipCode) {
    const zipData = getFHALimitByZip(zipCode);
    fhaLimit = zipData.limit;
    locationName = `${zipData.county}, ${zipData.state}`;
  } else if (county && state) {
    fhaLimit = getFHALimitByCounty(county, state);
    locationName = `${county}, ${state}`;
  } else if (state) {
    fhaLimit = getFHALimitByState(state);
    locationName = state;
  } else {
    fhaLimit = FHA_LIMITS_2024.baseline;
    locationName = 'National Baseline';
  }
  
  const maxLoanAmount = fhaLimit;
  // Calculate max home price from loan limit and down payment percentage
  const maxHomePrice = maxLoanAmount / (1 - downPaymentPercent / 100);
  
  return {
    maxHomePrice: Math.round(maxHomePrice),
    maxLoanAmount,
    fhaLimit,
    location: locationName
  };
}