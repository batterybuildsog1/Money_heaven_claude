/**
 * Risk Assessment Module
 * 
 * Evaluates location-based risk factors for insurance pricing
 */

import { CountyData, RiskFactors } from './types';

// High-risk counties for various perils (simplified dataset)
const HIGH_RISK_COUNTIES = {
  hurricane: [
    'Miami-Dade, FL', 'Broward, FL', 'Palm Beach, FL', 'Monroe, FL',
    'Harris, TX', 'Galveston, TX', 'Jefferson, TX', 'Brazoria, TX',
    'Orleans, LA', 'Jefferson, LA', 'St. Bernard, LA', 'Plaquemines, LA',
    'Mobile, AL', 'Baldwin, AL', 'Jackson, MS', 'Harrison, MS'
  ],
  wildfire: [
    'Los Angeles, CA', 'San Diego, CA', 'Riverside, CA', 'San Bernardino, CA',
    'Ventura, CA', 'Orange, CA', 'Santa Barbara, CA', 'Kern, CA',
    'Boulder, CO', 'El Paso, CO', 'Jefferson, CO', 'Douglas, CO',
    'Deschutes, OR', 'Jackson, OR', 'Josephine, OR', 'Klamath, OR'
  ],
  tornado: [
    'Oklahoma, OK', 'Cleveland, OK', 'Canadian, OK', 'Moore, OK',
    'Sedgwick, KS', 'Johnson, KS', 'Butler, KS', 'Harvey, KS',
    'Dallas, TX', 'Tarrant, TX', 'Denton, TX', 'Collin, TX',
    'Madison, AL', 'Jefferson, AL', 'Tuscaloosa, AL', 'Shelby, AL'
  ],
  earthquake: [
    'Los Angeles, CA', 'San Francisco, CA', 'Alameda, CA', 'Santa Clara, CA',
    'King, WA', 'Pierce, WA', 'Snohomish, WA', 'Clark, WA',
    'Salt Lake, UT', 'Utah, UT', 'Davis, UT', 'Weber, UT',
    'Anchorage, AK', 'Fairbanks North Star, AK', 'Matanuska-Susitna, AK'
  ],
  flood: [
    'Harris, TX', 'Orleans, LA', 'Miami-Dade, FL', 'Kings, NY',
    'Galveston, TX', 'Jefferson, LA', 'Virginia Beach, VA', 'Norfolk, VA',
    'Charleston, SC', 'Horry, SC', 'New Hanover, NC', 'Dare, NC'
  ]
};

// Coastal states
const COASTAL_STATES = [
  'ME', 'NH', 'MA', 'RI', 'CT', 'NY', 'NJ', 'DE', 'MD', 'VA',
  'NC', 'SC', 'GA', 'FL', 'AL', 'MS', 'LA', 'TX', 'CA', 'OR',
  'WA', 'AK', 'HI'
];

// States with significant wildfire risk
const WILDFIRE_STATES = {
  high: ['CA', 'OR', 'WA', 'NV', 'ID', 'MT', 'WY', 'CO', 'UT', 'AZ', 'NM'],
  medium: ['TX', 'OK', 'KS', 'NE', 'SD', 'ND'],
  low: [] // All others
};

// States with significant tornado risk
const TORNADO_STATES = {
  high: ['OK', 'KS', 'TX', 'NE', 'SD', 'IA', 'MO', 'AR', 'LA', 'MS', 'AL'],
  medium: ['IL', 'IN', 'OH', 'KY', 'TN', 'GA', 'FL', 'SC', 'NC'],
  low: [] // All others
};

// States with earthquake risk
const EARTHQUAKE_STATES = {
  high: ['CA', 'AK', 'WA', 'OR', 'NV', 'UT'],
  medium: ['ID', 'MT', 'WY', 'MO', 'AR', 'TN', 'KY', 'IL', 'SC'],
  low: [] // All others
};

/**
 * Assess risk factors for a given location
 */
export async function assessRisk(
  zipCode: string,
  county: CountyData | null,
  state: string | null
): Promise<RiskFactors> {
  const risks: RiskFactors = {
    floodZone: false,
    coastalCounty: false,
    wildfireRisk: 'low',
    severeWeatherRisk: 'low',
    earthquakeRisk: 'low'
  };

  if (!state) {
    return risks;
  }

  // Check if coastal state
  risks.coastalCounty = COASTAL_STATES.includes(state);

  // Assess wildfire risk
  if (WILDFIRE_STATES.high.includes(state)) {
    risks.wildfireRisk = 'high';
  } else if (WILDFIRE_STATES.medium.includes(state)) {
    risks.wildfireRisk = 'medium';
  }

  // Assess severe weather (tornado) risk
  if (TORNADO_STATES.high.includes(state)) {
    risks.severeWeatherRisk = 'high';
  } else if (TORNADO_STATES.medium.includes(state)) {
    risks.severeWeatherRisk = 'medium';
  }

  // Assess earthquake risk
  if (EARTHQUAKE_STATES.high.includes(state)) {
    risks.earthquakeRisk = 'high';
  } else if (EARTHQUAKE_STATES.medium.includes(state)) {
    risks.earthquakeRisk = 'medium';
  }

  // Check county-specific risks if available
  if (county) {
    const countyFullName = county.fullName;
    
    // Check flood risk
    risks.floodZone = HIGH_RISK_COUNTIES.flood.includes(countyFullName) || 
                      HIGH_RISK_COUNTIES.hurricane.includes(countyFullName);
    
    // Refine wildfire risk based on county
    if (HIGH_RISK_COUNTIES.wildfire.includes(countyFullName)) {
      risks.wildfireRisk = 'high';
    }
    
    // Refine severe weather risk based on county
    if (HIGH_RISK_COUNTIES.tornado.includes(countyFullName) || 
        HIGH_RISK_COUNTIES.hurricane.includes(countyFullName)) {
      risks.severeWeatherRisk = 'high';
    }
    
    // Refine earthquake risk based on county
    if (HIGH_RISK_COUNTIES.earthquake.includes(countyFullName)) {
      risks.earthquakeRisk = 'high';
    }
  }

  return risks;
}

/**
 * Calculate risk multiplier based on risk factors
 */
export function calculateRiskMultiplier(factors: RiskFactors): number {
  let multiplier = 1.0;

  // Flood zone has highest impact
  if (factors.floodZone) {
    multiplier *= 1.3;
  }

  // Coastal counties
  if (factors.coastalCounty) {
    multiplier *= 1.2;
  }

  // Wildfire risk
  switch (factors.wildfireRisk) {
    case 'high':
      multiplier *= 1.25;
      break;
    case 'medium':
      multiplier *= 1.1;
      break;
  }

  // Severe weather risk
  switch (factors.severeWeatherRisk) {
    case 'high':
      multiplier *= 1.15;
      break;
    case 'medium':
      multiplier *= 1.08;
      break;
  }

  // Earthquake risk
  switch (factors.earthquakeRisk) {
    case 'high':
      multiplier *= 1.2;
      break;
    case 'medium':
      multiplier *= 1.1;
      break;
  }

  return multiplier;
}