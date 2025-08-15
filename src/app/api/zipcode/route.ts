import { NextRequest, NextResponse } from 'next/server';

// Route segment config for timeout handling
export const maxDuration = 30; // 30 seconds max execution
export const dynamic = 'force-dynamic'; // For real-time data

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const zipCode = searchParams.get('zip');

  if (!zipCode) {
    return NextResponse.json({ error: 'ZIP code is required' }, { status: 400 });
  }

  // Validate ZIP code format
  if (!/^\d{5}$/.test(zipCode)) {
    return NextResponse.json({ error: 'Invalid ZIP code format' }, { status: 400 });
  }

  console.log(`[ZIP API] Looking up ZIP: ${zipCode}`);

  try {
    // Use API Ninjas if key is available
    const apiNinjasKey = process.env.API_NINJAS_KEY;
    
    if (apiNinjasKey) {
      console.log('[ZIP API] Using API Ninjas (primary)');
      const response = await fetch(
        `https://api.api-ninjas.com/v1/zipcode?zip=${zipCode}`,
        {
          signal: AbortSignal.timeout(5000), // 5 second timeout for fast lookup
          headers: {
            'X-Api-Key': apiNinjasKey,
            'Accept': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          console.log('[ZIP API] ✅ API Ninjas SUCCESS - County:', data[0].county);
          return NextResponse.json(data[0]);
        }
      } else {
        console.log('[ZIP API] ⚠️ API Ninjas failed, status:', response.status);
      }
    } else {
      console.log('[ZIP API] ⚠️ No API Ninjas key found');
    }

    // Fallback to Zippopotamus (free, no key required)
    console.log('[ZIP API] 🔄 FALLBACK to Zippopotamus (no county data)');
    const fallbackResponse = await fetch(`https://api.zippopotam.us/us/${zipCode}`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout for fast lookup
    });
    
    if (!fallbackResponse.ok) {
      return NextResponse.json(
        { error: 'ZIP code not found' },
        { status: 404 }
      );
    }

    const fallbackData = await fallbackResponse.json();
    
    if (fallbackData.places && fallbackData.places.length > 0) {
      const place = fallbackData.places[0];
      console.log('[ZIP API] ⚠️ Zippopotamus SUCCESS but NO COUNTY DATA');
      // Format to match API Ninjas structure
      return NextResponse.json({
        zip_code: zipCode,
        city: place['place name'],
        state: place['state abbreviation'],
        county: null, // Not available in Zippopotamus
        timezone: null,
        lat: place.latitude,
        lon: place.longitude
      });
    }

    return NextResponse.json(
      { error: 'No data found for ZIP code' },
      { status: 404 }
    );
  } catch (error) {
    console.error('ZIP code lookup error:', error);
    
    // Handle timeout errors specifically
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      return NextResponse.json(
        { error: 'Request timeout - external service unavailable' }, 
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}