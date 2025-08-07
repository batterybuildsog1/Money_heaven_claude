/**
 * Homeowners Insurance Estimation Library
 * 
 * This module provides functions for estimating homeowners insurance costs
 * based on state averages and property characteristics.
 */

// State average homeowners insurance rates (annual premium per $100k of coverage)
export interface StateInsuranceData {
  state: string;
  stateName: string;
  averageAnnualPremium: number;
  averagePerThousand: number; // Cost per $1000 of coverage
  riskFactors: {
    hurricanes: boolean;
    tornadoes: boolean;
    earthquakes: boolean;
    floods: boolean;
    wildfires: boolean;
  };
  notes?: string;
}

// 2024 state homeowners insurance averages
const STATE_INSURANCE_DATA: Record<string, StateInsuranceData> = {
  'FL': {
    state: 'FL',
    stateName: 'Florida',
    averageAnnualPremium: 4231,
    averagePerThousand: 14.1,
    riskFactors: {
      hurricanes: true,
      tornadoes: false,
      earthquakes: false,
      floods: true,
      wildfires: false
    },
    notes: 'High hurricane and flood risk drives up premiums significantly'
  },
  'TX': {
    state: 'TX',
    stateName: 'Texas',
    averageAnnualPremium: 3425,
    averagePerThousand: 11.4,
    riskFactors: {
      hurricanes: true,
      tornadoes: true,
      earthquakes: false,
      floods: true,
      wildfires: false
    }
  },
  'LA': {
    state: 'LA',
    stateName: 'Louisiana',
    averageAnnualPremium: 3892,
    averagePerThousand: 13.0,
    riskFactors: {
      hurricanes: true,
      tornadoes: false,
      earthquakes: false,
      floods: true,
      wildfires: false
    }
  },
  'OK': {
    state: 'OK',
    stateName: 'Oklahoma',
    averageAnnualPremium: 3268,
    averagePerThousand: 10.9,
    riskFactors: {
      hurricanes: false,
      tornadoes: true,
      earthquakes: false,
      floods: false,
      wildfires: false
    }
  },
  'KS': {
    state: 'KS',
    stateName: 'Kansas',
    averageAnnualPremium: 2918,
    averagePerThousand: 9.7,
    riskFactors: {
      hurricanes: false,
      tornadoes: true,
      earthquakes: false,
      floods: false,
      wildfires: false
    }
  },
  'AL': {
    state: 'AL',
    stateName: 'Alabama',
    averageAnnualPremium: 2565,
    averagePerThousand: 8.5,
    riskFactors: {
      hurricanes: true,
      tornadoes: true,
      earthquakes: false,
      floods: false,
      wildfires: false
    }
  },
  'MS': {
    state: 'MS',
    stateName: 'Mississippi',
    averageAnnualPremium: 2435,
    averagePerThousand: 8.1,
    riskFactors: {
      hurricanes: true,
      tornadoes: true,
      earthquakes: false,
      floods: true,
      wildfires: false
    }
  },
  'CA': {
    state: 'CA',
    stateName: 'California',
    averageAnnualPremium: 1958,
    averagePerThousand: 6.5,
    riskFactors: {
      hurricanes: false,
      tornadoes: false,
      earthquakes: true,
      floods: false,
      wildfires: true
    },
    notes: 'Wildfire risk is increasing premiums in high-risk areas'
  },
  'NY': {
    state: 'NY',
    stateName: 'New York',
    averageAnnualPremium: 1456,
    averagePerThousand: 4.9,
    riskFactors: {
      hurricanes: false,
      tornadoes: false,
      earthquakes: false,
      floods: false,
      wildfires: false
    }
  },
  'NJ': {
    state: 'NJ',
    stateName: 'New Jersey',
    averageAnnualPremium: 1342,
    averagePerThousand: 4.5,
    riskFactors: {
      hurricanes: false,
      tornadoes: false,
      earthquakes: false,
      floods: true,
      wildfires: false
    }
  },
  'CT': {
    state: 'CT',
    stateName: 'Connecticut',
    averageAnnualPremium: 1289,
    averagePerThousand: 4.3,
    riskFactors: {
      hurricanes: false,
      tornadoes: false,
      earthquakes: false,
      floods: false,
      wildfires: false
    }
  },
  'MA': {
    state: 'MA',
    stateName: 'Massachusetts',
    averageAnnualPremium: 1456,
    averagePerThousand: 4.9,
    riskFactors: {
      hurricanes: false,
      tornadoes: false,
      earthquakes: false,
      floods: false,
      wildfires: false
    }
  },
  'PA': {
    state: 'PA',
    stateName: 'Pennsylvania',
    averageAnnualPremium: 1198,
    averagePerThousand: 4.0,
    riskFactors: {
      hurricanes: false,
      tornadoes: false,
      earthquakes: false,
      floods: false,
      wildfires: false
    }
  },
  'OH': {
    state: 'OH',
    stateName: 'Ohio',
    averageAnnualPremium: 1087,
    averagePerThousand: 3.6,
    riskFactors: {
      hurricanes: false,
      tornadoes: false,
      earthquakes: false,
      floods: false,
      wildfires: false
    }
  },
  'IL': {
    state: 'IL',
    stateName: 'Illinois',
    averageAnnualPremium: 1245,
    averagePerThousand: 4.2,
    riskFactors: {
      hurricanes: false,
      tornadoes: true,
      earthquakes: false,
      floods: false,
      wildfires: false
    }
  },
  'MI': {
    state: 'MI',
    stateName: 'Michigan',
    averageAnnualPremium: 1165,
    averagePerThousand: 3.9,
    riskFactors: {
      hurricanes: false,
      tornadoes: false,
      earthquakes: false,
      floods: false,
      wildfires: false
    }
  },
  'UT': {
    state: 'UT',
    stateName: 'Utah',
    averageAnnualPremium: 865,
    averagePerThousand: 2.9,
    riskFactors: {
      hurricanes: false,
      tornadoes: false,
      earthquakes: true,
      floods: false,
      wildfires: true
    }
  },
  'ID': {
    state: 'ID',
    stateName: 'Idaho',
    averageAnnualPremium: 756,
    averagePerThousand: 2.5,
    riskFactors: {
      hurricanes: false,
      tornadoes: false,
      earthquakes: false,
      floods: false,
      wildfires: true
    }
  },
  'WY': {
    state: 'WY',
    stateName: 'Wyoming',
    averageAnnualPremium: 965,
    averagePerThousand: 3.2,
    riskFactors: {
      hurricanes: false,
      tornadoes: false,
      earthquakes: false,
      floods: false,
      wildfires: true
    }
  },
  'NH': {
    state: 'NH',
    stateName: 'New Hampshire',
    averageAnnualPremium: 1034,
    averagePerThousand: 3.4,
    riskFactors: {
      hurricanes: false,
      tornadoes: false,
      earthquakes: false,
      floods: false,
      wildfires: false
    }
  },
  'VT': {
    state: 'VT',
    stateName: 'Vermont',
    averageAnnualPremium: 1123,
    averagePerThousand: 3.7,
    riskFactors: {
      hurricanes: false,
      tornadoes: false,
      earthquakes: false,
      floods: false,
      wildfires: false
    }
  }
};

// National average as fallback
const NATIONAL_AVERAGE: StateInsuranceData = {
  state: 'US',
  stateName: 'United States',
  averageAnnualPremium: 1582,
  averagePerThousand: 5.3,
  riskFactors: {
    hurricanes: false,
    tornadoes: false,
    earthquakes: false,
    floods: false,
    wildfires: false
  }
};

/**
 * Property characteristics that affect insurance rates
 */
export interface PropertyInsuranceFactors {
  homeValue: number;
  dwellingCoverage?: number; // Usually 80-100% of home value
  yearBuilt?: number;
  constructionType?: 'frame' | 'masonry' | 'steel' | 'concrete';
  roofType?: 'asphalt' | 'tile' | 'metal' | 'slate';
  roofAge?: number;
  hasPool?: boolean;
  hasSecuritySystem?: boolean;
  hasSmokeDetectors?: boolean;
  distanceToFireStation?: number; // miles
  claims_history?: 'none' | 'minor' | 'moderate' | 'major';
}

/**
 * Insurance estimate result
 */
export interface InsuranceEstimate {
  annualPremium: number;
  monthlyPremium: number;
  dwellingCoverage: number;
  factors: {
    baseRate: number;
    adjustments: Array<{
      factor: string;
      adjustment: number;
      description: string;
    }>;
  };
  confidence: 'high' | 'medium' | 'low';
  zebraQuoteUrl: string;
}

/**
 * Parse location to extract state
 */
function parseLocationForState(location: string): string | null {
  const stateAbbreviations = Object.keys(STATE_INSURANCE_DATA);
  const statePattern = new RegExp(`\\b(${stateAbbreviations.join('|')})\\b`, 'i');
  const match = location.match(statePattern);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Get state insurance data
 */
export function getStateInsuranceData(state: string): StateInsuranceData {
  return STATE_INSURANCE_DATA[state.toUpperCase()] || NATIONAL_AVERAGE;
}

/**
 * Calculate adjustment factor based on property characteristics
 */
function calculateAdjustmentFactor(factors: PropertyInsuranceFactors): {
  multiplier: number;
  adjustments: Array<{ factor: string; adjustment: number; description: string }>;
} {
  let multiplier = 1.0;
  const adjustments: Array<{ factor: string; adjustment: number; description: string }> = [];
  
  // Age of home
  if (factors.yearBuilt) {
    const age = new Date().getFullYear() - factors.yearBuilt;
    if (age > 30) {
      multiplier *= 1.15;
      adjustments.push({
        factor: 'home_age',
        adjustment: 0.15,
        description: `Home built in ${factors.yearBuilt} (${age} years old) increases risk`
      });
    } else if (age < 10) {
      multiplier *= 0.95;
      adjustments.push({
        factor: 'home_age',
        adjustment: -0.05,
        description: `Newer home (${age} years old) reduces risk`
      });
    }
  }
  
  // Construction type
  if (factors.constructionType) {
    switch (factors.constructionType) {
      case 'masonry':
      case 'concrete':
        multiplier *= 0.90;
        adjustments.push({
          factor: 'construction',
          adjustment: -0.10,
          description: `${factors.constructionType} construction reduces fire risk`
        });
        break;
      case 'frame':
        multiplier *= 1.05;
        adjustments.push({
          factor: 'construction',
          adjustment: 0.05,
          description: 'Frame construction increases fire risk'
        });
        break;
    }
  }
  
  // Roof type and age
  if (factors.roofType) {
    switch (factors.roofType) {
      case 'tile':
      case 'metal':
      case 'slate':
        multiplier *= 0.92;
        adjustments.push({
          factor: 'roof_type',
          adjustment: -0.08,
          description: `${factors.roofType} roof reduces weather damage risk`
        });
        break;
      case 'asphalt':
        if (factors.roofAge && factors.roofAge > 15) {
          multiplier *= 1.10;
          adjustments.push({
            factor: 'roof_age',
            adjustment: 0.10,
            description: `Older asphalt roof (${factors.roofAge} years) increases risk`
          });
        }
        break;
    }
  }
  
  // Safety features
  if (factors.hasSecuritySystem) {
    multiplier *= 0.95;
    adjustments.push({
      factor: 'security_system',
      adjustment: -0.05,
      description: 'Security system reduces theft risk'
    });
  }
  
  if (factors.hasSmokeDetectors) {
    multiplier *= 0.93;
    adjustments.push({
      factor: 'smoke_detectors',
      adjustment: -0.07,
      description: 'Smoke detectors reduce fire damage risk'
    });
  }
  
  // Pool increases liability risk
  if (factors.hasPool) {
    multiplier *= 1.08;
    adjustments.push({
      factor: 'pool',
      adjustment: 0.08,
      description: 'Swimming pool increases liability risk'
    });
  }
  
  // Distance to fire station
  if (factors.distanceToFireStation) {
    if (factors.distanceToFireStation > 5) {
      multiplier *= 1.12;
      adjustments.push({
        factor: 'fire_station_distance',
        adjustment: 0.12,
        description: `${factors.distanceToFireStation} miles from fire station increases risk`
      });
    } else if (factors.distanceToFireStation <= 1) {
      multiplier *= 0.95;
      adjustments.push({
        factor: 'fire_station_distance',
        adjustment: -0.05,
        description: 'Close to fire station reduces risk'
      });
    }
  }
  
  // Claims history
  if (factors.claims_history) {
    switch (factors.claims_history) {
      case 'major':
        multiplier *= 1.25;
        adjustments.push({
          factor: 'claims_history',
          adjustment: 0.25,
          description: 'Major claims history significantly increases premium'
        });
        break;
      case 'moderate':
        multiplier *= 1.15;
        adjustments.push({
          factor: 'claims_history',
          adjustment: 0.15,
          description: 'Recent claims increase premium'
        });
        break;
      case 'minor':
        multiplier *= 1.05;
        adjustments.push({
          factor: 'claims_history',
          adjustment: 0.05,
          description: 'Minor claims slightly increase premium'
        });
        break;
    }
  }
  
  return { multiplier, adjustments };
}

/**
 * Generate Zebra quote URL
 */
function generateZebraQuoteUrl(location: string, homeValue: number): string {
  const baseUrl = 'https://www.thezebra.com/homeowners-insurance/';
  const params = new URLSearchParams({
    home_value: homeValue.toString(),
    location: encodeURIComponent(location)
  });
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Estimate homeowners insurance cost
 */
export function estimateHomeownersInsurance(
  location: string,
  propertyFactors: PropertyInsuranceFactors
): InsuranceEstimate {
  const state = parseLocationForState(location);
  const stateData = state ? getStateInsuranceData(state) : NATIONAL_AVERAGE;
  
  // Determine dwelling coverage (typically 80-100% of home value)
  const dwellingCoverage = propertyFactors.dwellingCoverage || propertyFactors.homeValue * 0.9;
  
  // Calculate base premium based on state average
  const basePremium = (dwellingCoverage / 1000) * stateData.averagePerThousand;
  
  // Apply adjustments for property characteristics
  const { multiplier, adjustments } = calculateAdjustmentFactor(propertyFactors);
  const adjustedPremium = basePremium * multiplier;
  
  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low';
  if (state && STATE_INSURANCE_DATA[state]) {
    confidence = adjustments.length > 3 ? 'high' : 'medium';
  } else {
    confidence = 'low';
  }
  
  return {
    annualPremium: Math.round(adjustedPremium),
    monthlyPremium: Math.round(adjustedPremium / 12),
    dwellingCoverage,
    factors: {
      baseRate: stateData.averagePerThousand,
      adjustments
    },
    confidence,
    zebraQuoteUrl: generateZebraQuoteUrl(location, propertyFactors.homeValue)
  };
}

/**
 * Get simple insurance estimate (basic calculation)
 */
export function getSimpleInsuranceEstimate(
  location: string,
  homeValue: number
): { annualPremium: number; monthlyPremium: number } {
  const estimate = estimateHomeownersInsurance(location, { homeValue });
  
  return {
    annualPremium: estimate.annualPremium,
    monthlyPremium: estimate.monthlyPremium
  };
}

/**
 * Get monthly insurance payment for mortgage calculation
 */
export function getMonthlyInsurancePayment(
  location: string,
  homeValue: number,
  propertyFactors?: Partial<PropertyInsuranceFactors>
): number {
  const fullFactors: PropertyInsuranceFactors = {
    homeValue,
    ...propertyFactors
  };
  
  const estimate = estimateHomeownersInsurance(location, fullFactors);
  return estimate.monthlyPremium;
}

/**
 * Get all states with insurance data
 */
export function getStatesWithInsuranceData(): StateInsuranceData[] {
  return Object.values(STATE_INSURANCE_DATA);
}

/**
 * Get risk factors for a state
 */
export function getStateRiskFactors(state: string): StateInsuranceData['riskFactors'] {
  const stateData = getStateInsuranceData(state);
  return stateData.riskFactors;
}

/**
 * Compare insurance costs across states
 */
export function compareInsuranceCosts(
  homeValue: number,
  states: string[]
): Array<{
  state: string;
  stateName: string;
  annualPremium: number;
  monthlyPremium: number;
  ranking: number;
}> {
  const results = states.map(state => {
    const stateData = getStateInsuranceData(state);
    const annualPremium = (homeValue / 1000) * stateData.averagePerThousand;
    
    return {
      state,
      stateName: stateData.stateName,
      annualPremium: Math.round(annualPremium),
      monthlyPremium: Math.round(annualPremium / 12),
      ranking: 0
    };
  });
  
  // Sort by premium and assign rankings
  results.sort((a, b) => a.annualPremium - b.annualPremium);
  results.forEach((result, index) => {
    result.ranking = index + 1;
  });
  
  return results;
}