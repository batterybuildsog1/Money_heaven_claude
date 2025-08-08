import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { state, zipCode, city, county, isPrimaryResidence, isOver65, isVeteran, isDisabled, homeValue } = body;

    if (!state) {
      return NextResponse.json({ error: 'State is required' }, { status: 400 });
    }

    // Try to get cached property tax data first
    try {
      const cached = await convexClient.query(api.propertyTax.getCachedPropertyTax, {
        state,
        zipCode,
        isPrimaryResidence,
        isOver65,
        isVeteran,
        isDisabled
      });
      
      if (cached) {
        return NextResponse.json(cached);
      }
    } catch (error) {
      console.log('Cache miss or error, fetching fresh data');
    }

    // Cache miss - fetch fresh data via Groq parallel action (smaller prompts, lower token use)
    const queryParams = {
      state,
      zipCode,
      city,
      county,
      isPrimaryResidence,
      isOver65,
      isVeteran,
      isDisabled,
      homeValue
    };

    // Use Groq parallel action
    const freshData = await convexClient.action(api.groq_parallel.queryPropertyTaxParallel, queryParams);
    
    return NextResponse.json(freshData);
  } catch (error) {
    console.error('Property tax API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property tax data' },
      { status: 500 }
    );
  }
}