/**
 * ZIP Code to State/County Lookup Utility
 * Uses API Ninjas for reliable ZIP code data with county information
 */

export interface LocationData {
  zipCode: string;
  city: string;
  state: string;
  stateAbbr: string;
  county?: string;
  timezone?: string;
  lat?: number;
  lng?: number;
}

// Cache for ZIP lookups (in-memory)
// ZIP to location mappings never change, so we can cache indefinitely
// Cache only clears on server restart (which is fine)
const zipCache = new Map<string, { data: LocationData | null; timestamp: number }>();
const CACHE_DURATION = 365 * 24 * 60 * 60 * 1000; // 1 year (effectively permanent for in-memory cache)

/**
 * Get location data from a ZIP code using API Ninjas
 * Free tier allows 50,000 requests per month
 */
export async function getLocationFromZip(zipCode: string): Promise<LocationData | null> {
  // Validate ZIP code format
  if (!/^\d{5}$/.test(zipCode)) {
    console.error('Invalid ZIP code format:', zipCode);
    return null;
  }

  // Check cache first
  const cached = zipCache.get(zipCode);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Use our API route to protect the API key
    const response = await fetch(`/api/zipcode?zip=${zipCode}`);

    if (!response.ok) {
      console.error('ZIP API error:', response.status);
      return null;
    }

    const result = await response.json();
    
    if (!result || !result.city) {
      console.error('No data returned for ZIP:', zipCode);
      return null;
    }
    const locationData: LocationData = {
      zipCode,
      city: result.city,
      state: getFullStateName(result.state) || result.state,
      stateAbbr: result.state,
      county: result.county,
      timezone: result.timezone,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };

    // Cache the result
    zipCache.set(zipCode, { data: locationData, timestamp: Date.now() });
    
    return locationData;
  } catch (error) {
    console.error('Error fetching ZIP code data:', error);
    return getFallbackLocation(zipCode);
  }
}

/**
 * Fallback function using free Zippopotamus API (no county data)
 */
async function getFallbackLocation(zipCode: string): Promise<LocationData | null> {
  try {
    // Zippopotamus is free and doesn't require an API key
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    
    if (!response.ok) {
      console.error('Zippopotamus error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.places || data.places.length === 0) {
      return null;
    }

    const place = data.places[0];
    const locationData: LocationData = {
      zipCode,
      city: place['place name'],
      state: place.state,
      stateAbbr: place['state abbreviation'],
      county: undefined, // Not available from Zippopotamus
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude)
    };

    // Cache the result
    zipCache.set(zipCode, { data: locationData, timestamp: Date.now() });
    
    return locationData;
  } catch (error) {
    console.error('Fallback ZIP lookup failed:', error);
    return null;
  }
}

/**
 * Convert state abbreviation to full name
 */
function getFullStateName(abbr: string): string | null {
  const stateNames: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
    'DC': 'District of Columbia'
  };
  
  return stateNames[abbr.toUpperCase()] || null;
}

/**
 * Get state abbreviation from various input formats
 */
export function getStateAbbreviation(input: string): string | null {
  // If it's already a 2-letter abbreviation
  if (/^[A-Z]{2}$/.test(input.toUpperCase())) {
    return input.toUpperCase();
  }
  
  // Map of state names to abbreviations
  const stateAbbreviations: Record<string, string> = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
    'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
    'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
    'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
    'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
    'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
    'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
    'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
    'district of columbia': 'DC', 'washington dc': 'DC', 'washington d.c.': 'DC'
  };
  
  const normalized = input.trim().toLowerCase();
  return stateAbbreviations[normalized] || null;
}