/**
 * County Insurance Rate Adjustments for 2025
 * 
 * Adjustments to state averages based on county population density and local factors
 */

// Major metropolitan counties typically have higher rates due to:
// - Higher property values
// - Higher construction costs
// - Higher crime rates in some areas
// - More traffic/liability exposure
export const COUNTY_ADJUSTMENTS: Record<string, number> = {
  // California
  'Los Angeles, CA': 1.25,
  'San Diego, CA': 1.20,
  'Orange, CA': 1.22,
  'San Francisco, CA': 1.30,
  'Alameda, CA': 1.25,
  'Santa Clara, CA': 1.28,
  'Sacramento, CA': 1.15,
  'Riverside, CA': 1.18,
  'San Bernardino, CA': 1.15,
  'Ventura, CA': 1.20,
  
  // Texas
  'Harris, TX': 1.20,      // Houston
  'Dallas, TX': 1.18,
  'Tarrant, TX': 1.15,     // Fort Worth
  'Bexar, TX': 1.12,       // San Antonio
  'Travis, TX': 1.15,      // Austin
  'Collin, TX': 1.10,      // Plano
  'Denton, TX': 1.08,
  'Fort Bend, TX': 1.12,
  'Williamson, TX': 1.08,
  
  // Florida
  'Miami-Dade, FL': 1.35,
  'Broward, FL': 1.30,
  'Palm Beach, FL': 1.28,
  'Hillsborough, FL': 1.20, // Tampa
  'Orange, FL': 1.18,       // Orlando
  'Duval, FL': 1.15,        // Jacksonville
  'Pinellas, FL': 1.18,
  'Lee, FL': 1.22,
  
  // New York
  'New York, NY': 1.35,     // NYC - Manhattan
  'Kings, NY': 1.30,        // Brooklyn
  'Queens, NY': 1.28,
  'Bronx, NY': 1.25,
  'Nassau, NY': 1.22,
  'Suffolk, NY': 1.20,
  'Westchester, NY': 1.25,
  
  // Illinois
  'Cook, IL': 1.25,         // Chicago
  'DuPage, IL': 1.15,
  'Lake, IL': 1.12,
  'Will, IL': 1.10,
  'Kane, IL': 1.08,
  
  // Pennsylvania
  'Philadelphia, PA': 1.20,
  'Allegheny, PA': 1.12,    // Pittsburgh
  'Montgomery, PA': 1.15,
  'Bucks, PA': 1.12,
  'Delaware, PA': 1.10,
  
  // Arizona
  'Maricopa, AZ': 1.15,     // Phoenix
  'Pima, AZ': 1.10,         // Tucson
  
  // Massachusetts
  'Suffolk, MA': 1.30,      // Boston
  'Middlesex, MA': 1.22,
  'Essex, MA': 1.18,
  'Norfolk, MA': 1.20,
  'Worcester, MA': 1.10,
  
  // Washington
  'King, WA': 1.25,         // Seattle
  'Pierce, WA': 1.15,       // Tacoma
  'Snohomish, WA': 1.18,
  'Clark, WA': 1.10,
  
  // Georgia
  'Fulton, GA': 1.20,       // Atlanta
  'DeKalb, GA': 1.18,
  'Cobb, GA': 1.15,
  'Gwinnett, GA': 1.12,
  
  // North Carolina
  'Mecklenburg, NC': 1.15,  // Charlotte
  'Wake, NC': 1.12,         // Raleigh
  'Guilford, NC': 1.08,     // Greensboro
  
  // Michigan
  'Wayne, MI': 1.15,        // Detroit
  'Oakland, MI': 1.12,
  'Macomb, MI': 1.10,
  
  // Ohio
  'Cuyahoga, OH': 1.12,     // Cleveland
  'Franklin, OH': 1.10,     // Columbus
  'Hamilton, OH': 1.08,     // Cincinnati
  
  // Colorado
  'Denver, CO': 1.18,
  'Jefferson, CO': 1.15,
  'Arapahoe, CO': 1.12,
  'Adams, CO': 1.10,
  'Boulder, CO': 1.20,
  
  // Oregon
  'Multnomah, OR': 1.15,    // Portland
  'Washington, OR': 1.12,
  'Clackamas, OR': 1.10,
  
  // Nevada
  'Clark, NV': 1.15,        // Las Vegas
  'Washoe, NV': 1.12,       // Reno
  
  // Rural counties typically have lower rates (0.85-0.95 multiplier)
  // We'll handle these dynamically based on population density
};

/**
 * Get county adjustment factor
 * Returns a multiplier to apply to state average rates
 */
export function getCountyAdjustment(countyName: string, state: string): number {
  const key = `${countyName}, ${state}`;
  
  // Check if we have a specific adjustment for this county
  if (COUNTY_ADJUSTMENTS[key]) {
    return COUNTY_ADJUSTMENTS[key];
  }
  
  // Default to no adjustment (1.0)
  // In a real implementation, we might use population density data
  // to determine if it's rural (0.9) or suburban (1.0)
  return 1.0;
}

/**
 * Estimate if a county is rural based on name patterns
 * This is a simplified heuristic - real implementation would use census data
 */
export function isRuralCounty(countyName: string, state: string): boolean {
  const key = `${countyName}, ${state}`;
  
  // If it's in our major metro list, it's definitely not rural
  if (COUNTY_ADJUSTMENTS[key]) {
    return false;
  }
  
  // Simple heuristic: counties with certain patterns tend to be rural
  const ruralPatterns = [
    /\bRural\b/i,
    /\bFarm/i,
    /\bAgricultural\b/i
  ];
  
  return ruralPatterns.some(pattern => pattern.test(countyName));
}

/**
 * Get description of county adjustment
 */
export function getCountyAdjustmentDescription(adjustment: number): string {
  if (adjustment >= 1.3) {
    return 'Major metropolitan area with significantly higher rates';
  } else if (adjustment >= 1.2) {
    return 'Large metropolitan area with higher rates';
  } else if (adjustment >= 1.1) {
    return 'Metropolitan area with moderately higher rates';
  } else if (adjustment > 1.0) {
    return 'Suburban area with slightly higher rates';
  } else if (adjustment === 1.0) {
    return 'Average rates for the state';
  } else if (adjustment >= 0.9) {
    return 'Rural area with lower rates';
  } else {
    return 'Very rural area with significantly lower rates';
  }
}