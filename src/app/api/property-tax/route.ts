import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { z } from 'zod';

// Route segment config for timeout handling
export const maxDuration = 30; // 30 seconds max execution
export const dynamic = 'force-dynamic'; // For real-time data

// Zod validation schema for property tax requests
const PropertyTaxSchema = z.object({
  state: z.string().min(2).max(2).regex(/^[A-Z]{2}$/),
  zipCode: z.string().regex(/^\d{5}$/).optional(),
  city: z.string().min(1).max(100).optional(),
  county: z.string().min(1).max(100).optional(),
  homeValue: z.number().min(1000).max(50000000).optional(),
  isPrimaryResidence: z.boolean(),
  isOver65: z.boolean().optional(),
  isVeteran: z.boolean().optional(),
  isDisabled: z.boolean().optional(),
});


const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input with Zod
    const validatedData = PropertyTaxSchema.parse(body);
    
    const {
      state,
      zipCode,
      city,
      county,
      isPrimaryResidence,
      isOver65,
      isVeteran,
      isDisabled,
      homeValue,
    } = validatedData;

    // Provide safe defaults for optional fields
    const primary = isPrimaryResidence;
    const senior = isOver65 ?? false;
    const veteran = isVeteran ?? false;
    const disabled = isDisabled ?? false;

    // Try to get cached property tax data first
    try {
      const cached = await convexClient.query(api.propertyTax.getCachedPropertyTax, {
        state,
        zipCode,
        city,
        county,
        isPrimaryResidence: primary,
        isOver65: senior,
        isVeteran: veteran,
        isDisabled: disabled,
      });
      
      if (cached) {
        return NextResponse.json(cached);
      }
    } catch {
      console.log('Cache miss or error, fetching fresh data');
    }

    // Cache miss - fetch fresh data via Groq parallel action (smaller prompts, lower token use)
    const queryParams = {
      state,
      zipCode,
      city,
      county,
      isPrimaryResidence: primary,
      isOver65: senior,
      isVeteran: veteran,
      isDisabled: disabled,
      homeValue
    };

    // Use Groq parallel action
    const freshData = await convexClient.action(api.groq_parallel.queryPropertyTaxParallel, queryParams);
    
    return NextResponse.json(freshData);
  } catch (error) {
    console.error('Property tax API error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        }, 
        { status: 400 }
      );
    }
    
    // Handle timeout errors specifically
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      return NextResponse.json(
        { error: 'Request timeout - external service unavailable' }, 
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch property tax data' },
      { status: 500 }
    );
  }
}