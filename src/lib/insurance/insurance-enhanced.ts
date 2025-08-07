/**
 * Enhanced Insurance Estimation Module
 * 
 * Provides more accurate insurance estimates using county-level data and risk assessment
 */

import { getLocationFromZip, getStateAbbreviation } from '../zip-lookup';
import { assessRisk, calculateRiskMultiplier } from './risk-assessment';
import { getCountyAdjustment, isRuralCounty } from './county-rates-2025';
import { 
  EnhancedInsuranceEstimate, 
  PropertyDetails,
  CountyData,
  RiskFactors 
} from './types';
import { getStateInsuranceData } from '../insurance';

/**
 * Get enhanced insurance estimate with county-level precision and risk assessment
 */
export async function getEnhancedInsuranceEstimate(
  location: string,
  homeValue: number,
  propertyDetails?: PropertyDetails
): Promise<EnhancedInsuranceEstimate> {
  console.log('[Insurance API] Request:', {
    source: 'INSURANCE_ENHANCED',
    location,
    homeValue,
    propertyDetails,
    timestamp: new Date().toISOString()
  });
  
  // Try to extract ZIP code from location string
  const zipMatch = location.match(/\b(\d{5})\b/);
  const zipCode = zipMatch ? zipMatch[1] : null;
  
  let state: string | null = null;
  let county: CountyData | null = null;
  
  // Get location data from ZIP if available
  if (zipCode) {
    try {
      console.log(`Attempting to get location data for ZIP: ${zipCode}`);
      const locationData = await getLocationFromZip(zipCode);
      if (locationData) {
        state = locationData.stateAbbr;
        county = locationData.county ? {
          county: locationData.county,
          state: locationData.stateAbbr,
          fips: '', // Not available from new API
          fullName: `${locationData.county}, ${locationData.stateAbbr}`
        } : null;
        console.log(`Location lookup result:`, { state, county: locationData.county });
      }
    } catch (error) {
      console.error(`Failed to get location from ZIP ${zipCode}:`, error);
    }
  }
  
  // If no ZIP or lookup failed, try to extract state from location string
  if (!state) {
    state = getStateAbbreviation(location);
    console.log(`Extracted state: ${state} from location: "${location}"`);
  }
  
  // Fall back to state if county lookup fails
  const effectiveState = county?.state || state;
  console.log(`Using effective state: ${effectiveState} (county state: ${county?.state}, extracted state: ${state})`);
  
  if (!effectiveState) {
    console.log('[Insurance API] Fallback:', {
      source: 'NATIONAL_AVERAGE',
      reason: 'No effective state found',
      homeValue,
      zipCode,
      timestamp: new Date().toISOString()
    });
    return getFallbackEstimate(homeValue, zipCode);
  }

  console.log(`✓ Enhanced insurance estimation proceeding with effective state: ${effectiveState}`);
  
  // Get base state rate
  console.log(`Getting state insurance data for: ${effectiveState}`);
  const stateData = getStateInsuranceData(effectiveState);
  const baseRate = stateData.averagePerThousand;
  console.log(`Base rate for ${effectiveState}: $${baseRate}/1000`);
  
  // Get county adjustment
  const countyAdjustment = county 
    ? getCountyAdjustment(county.county, county.state)
    : 1.0;
  console.log(`County adjustment: ${countyAdjustment} (county: ${county?.county || 'none'})`);
  
  // Apply rural discount if applicable
  let adjustedCountyRate = countyAdjustment;
  if (county && isRuralCounty(county.county, county.state) && countyAdjustment === 1.0) {
    // Apply 10% rural discount
    adjustedCountyRate = countyAdjustment * 0.9;
    console.log(`Applied rural discount: ${adjustedCountyRate}`);
  }
  
  // Assess risk factors
  console.log(`Assessing risk factors for ZIP: ${zipCode || 'none'}, county: ${county?.fullName || 'none'}, state: ${effectiveState}`);
  const riskFactors = await assessRisk(zipCode || '', county, effectiveState);
  const riskMultiplier = calculateRiskMultiplier(riskFactors);
  console.log(`Risk factors:`, riskFactors);
  console.log(`Risk multiplier: ${riskMultiplier}`);
  
  // Calculate property-specific adjustments
  const propertyMultiplier = calculatePropertyMultiplier(propertyDetails);
  console.log(`Property multiplier: ${propertyMultiplier}`, propertyDetails);
  
  // Calculate final premium
  const adjustedRate = baseRate * adjustedCountyRate * riskMultiplier * propertyMultiplier;
  const annualPremium = (homeValue / 1000) * adjustedRate;
  console.log(`Final calculation: ${baseRate} × ${adjustedCountyRate} × ${riskMultiplier} × ${propertyMultiplier} = ${adjustedRate}/1000`);
  console.log(`Annual premium: (${homeValue}/1000) × ${adjustedRate} = $${annualPremium}`);
  
  // Determine confidence level
  const confidence = determineConfidence(county !== null, zipCode !== null);
  console.log(`Confidence level: ${confidence} (hasCounty: ${county !== null}, hasZip: ${zipCode !== null})`);
  
  // Log successful calculation
  console.log('[Insurance API] Success:', {
    source: county ? 'COUNTY_DATA' : 'STATE_AVERAGE',
    state: effectiveState,
    county: county?.county,
    annualPremium: Math.round(annualPremium),
    monthlyPremium: Math.round(annualPremium / 12),
    confidence,
    riskMultiplier,
    timestamp: new Date().toISOString()
  });
  
  // Generate Zebra URL
  const zebraUrl = generateZebraUrl(zipCode || location, homeValue);
  
  return {
    estimatedAnnual: Math.round(annualPremium),
    estimatedMonthly: Math.round(annualPremium / 12),
    confidence,
    source: county 
      ? `County-level data for ${county.fullName}` 
      : `State average for ${effectiveState}`,
    factors: {
      baseRate,
      countyAdjustment: adjustedCountyRate,
      riskMultiplier,
      propertyMultiplier
    },
    zebraUrl,
    ...(county && { county }),
    riskAssessment: riskFactors
  };
}

/**
 * Calculate property-specific multiplier
 */
function calculatePropertyMultiplier(details?: PropertyDetails): number {
  if (!details) return 1.0;
  
  let multiplier = 1.0;
  
  // Newer construction discount
  if (details.yearBuilt && details.yearBuilt > 2010) {
    multiplier *= 0.9;
  } else if (details.yearBuilt && details.yearBuilt < 1980) {
    multiplier *= 1.1;
  }
  
  // Construction type
  if (details.constructionType === 'masonry' || details.constructionType === 'concrete') {
    multiplier *= 0.92;
  } else if (details.constructionType === 'frame') {
    multiplier *= 1.05;
  }
  
  // Roof age
  if (details.roofAge && details.roofAge > 20) {
    multiplier *= 1.1;
  } else if (details.roofAge && details.roofAge < 5) {
    multiplier *= 0.95;
  }
  
  // Safety features
  if (details.hasSecuritySystem) {
    multiplier *= 0.95;
  }
  
  // Pool increases liability
  if (details.hasPool) {
    multiplier *= 1.08;
  }
  
  // Distance to fire hydrant
  if (details.distanceToFireHydrant === 'far') {
    multiplier *= 1.1;
  } else if (details.distanceToFireHydrant === 'close') {
    multiplier *= 0.97;
  }
  
  return multiplier;
}

/**
 * Determine confidence level based on data availability
 */
function determineConfidence(hasCounty: boolean, hasZip: boolean): 'high' | 'medium' | 'low' {
  if (hasCounty && hasZip) {
    return 'high';
  } else if (hasZip || hasCounty) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Generate Zebra quote URL
 */
function generateZebraUrl(location: string, homeValue: number): string {
  const params = new URLSearchParams({
    zip: location,
    home_value: homeValue.toString()
  });
  
  return `https://www.thezebra.com/homeowners-insurance/?${params.toString()}`;
}

/**
 * Get fallback estimate when location can't be determined
 */
function getFallbackEstimate(homeValue: number, zipCode: string | null): EnhancedInsuranceEstimate {
  // Use national average
  const nationalAverage = 5.3; // $5.30 per $1000 of coverage
  const annualPremium = (homeValue / 1000) * nationalAverage;
  
  return {
    estimatedAnnual: Math.round(annualPremium),
    estimatedMonthly: Math.round(annualPremium / 12),
    confidence: 'low',
    source: 'National average (location not determined)',
    factors: {
      baseRate: nationalAverage,
      countyAdjustment: 1.0,
      riskMultiplier: 1.0,
      propertyMultiplier: 1.0
    },
    zebraUrl: generateZebraUrl(zipCode || '', homeValue)
  };
}

/**
 * Format risk assessment for display
 */
export function formatRiskAssessment(risks: RiskFactors): string[] {
  const factors: string[] = [];
  
  if (risks.floodZone) {
    factors.push('Flood zone - higher risk');
  }
  
  if (risks.coastalCounty) {
    factors.push('Coastal location - hurricane risk');
  }
  
  if (risks.wildfireRisk === 'high') {
    factors.push('High wildfire risk area');
  } else if (risks.wildfireRisk === 'medium') {
    factors.push('Moderate wildfire risk');
  }
  
  if (risks.severeWeatherRisk === 'high') {
    factors.push('High severe weather risk (tornadoes/hail)');
  } else if (risks.severeWeatherRisk === 'medium') {
    factors.push('Moderate severe weather risk');
  }
  
  if (risks.earthquakeRisk === 'high') {
    factors.push('High earthquake risk');
  } else if (risks.earthquakeRisk === 'medium') {
    factors.push('Moderate earthquake risk');
  }
  
  return factors;
}