/**
 * Groq API Integration with Parallel Queries for Property Tax Analysis
 * 
 * Uses focused, parallel queries for better accuracy with OpenAI's gpt-oss models
 * Each query targets specific information for improved results
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Types for property tax analysis
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

// Cache durations
const CACHE_DURATIONS = {
  PROPERTY_TAX_RATES: 365 * 24 * 60 * 60 * 1000, // 12 months
  EXEMPTION_RULES: 180 * 24 * 60 * 60 * 1000,     // 6 months
} as const;

/**
 * Make a focused Groq API call for specific information
 */
async function queryGroq(apiKey: string, systemPrompt: string, userPrompt: string): Promise<any> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        },
        {
          role: 'assistant',
          content: ''
        }
      ],
      temperature: 0.2, // Lower temperature for consistency
      max_completion_tokens: 2048,
      top_p: 0.9,
      reasoning_effort: 'high', // Use high reasoning for better accuracy
      stream: false,
      stop: null,
      tools: [
        {
          type: 'browser_search'
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Groq API error:', response.status, errorText);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Query 1: Get the headline property tax rate
 */
async function getHeadlineTaxRate(apiKey: string, location: string, county?: string, state?: string): Promise<{ rate: number; source: string }> {
  const locationStr = county ? `${county}, ${state}` : location;
  
  const systemPrompt = `You are a property tax expert. Search for and find the EXACT property tax rate from official government sources. 
Return ONLY the tax rate as a decimal number (e.g., 0.006016 for 0.6016%) and the source.
If you find multiple rates, return the county or city base rate.`;

  const userPrompt = `What is the exact property tax rate for ${locationStr}?
Search official county assessor websites and tax documents.
Return in this exact format:
RATE: [decimal number]
SOURCE: [where you found it]`;

  const response = await queryGroq(apiKey, systemPrompt, userPrompt);
  
  // Parse the response
  const rateMatch = response.match(/RATE:\s*([\d.]+)/i);
  const sourceMatch = response.match(/SOURCE:\s*(.+)/i);
  
  // Try alternative patterns if first doesn't match
  const altRateMatch = response.match(/(0\.0\d+)/);
  
  return {
    rate: rateMatch ? parseFloat(rateMatch[1]) : (altRateMatch ? parseFloat(altRateMatch[1]) : 0.01),
    source: sourceMatch ? sourceMatch[1] : 'Groq search'
  };
}

/**
 * Query 2: Get homestead/residential exemptions
 */
async function getHomesteadExemption(apiKey: string, location: string, homeValue: number, state: string): Promise<{ exemption: number; isPercentage: boolean; description: string }> {
  const systemPrompt = `You are a property tax expert. Search for and find the EXACT homestead or residential exemption for primary residences.
Return the exemption as either a dollar amount OR a percentage of home value.
Focus on official government sources only.`;

  const userPrompt = `What is the homestead/residential exemption for a primary residence in ${location}?
Home value: $${homeValue.toLocaleString()}
State: ${state}

Search for official exemption amounts. Common patterns:
- Utah: 45% of market value exemption
- Texas: $100,000 homestead exemption
- Florida: $50,000 homestead exemption

Return in this exact format:
EXEMPTION: [number or percentage like "45%"]
TYPE: [DOLLAR or PERCENTAGE]
DESCRIPTION: [brief description]`;

  const response = await queryGroq(apiKey, systemPrompt, userPrompt);
  
  // Parse the response
  const exemptionMatch = response.match(/EXEMPTION:\s*([\d,.$%]+)/i);
  const typeMatch = response.match(/TYPE:\s*(\w+)/i);
  const descMatch = response.match(/DESCRIPTION:\s*(.+)/i);
  
  if (exemptionMatch) {
    const value = exemptionMatch[1];
    const isPercentage = value.includes('%') || typeMatch?.[1]?.toUpperCase() === 'PERCENTAGE';
    
    if (isPercentage) {
      const percent = parseFloat(value.replace(/[%,$]/g, ''));
      return {
        exemption: homeValue * (percent / 100),
        isPercentage: true,
        description: descMatch?.[1] || `${percent}% residential exemption`
      };
    } else {
      const amount = parseFloat(value.replace(/[$,]/g, ''));
      return {
        exemption: amount,
        isPercentage: false,
        description: descMatch?.[1] || 'Homestead exemption'
      };
    }
  }
  
  // State-specific fallbacks
  const stateExemptions: Record<string, { amount: number; percentage?: number }> = {
    'UT': { amount: 0, percentage: 45 },
    'TX': { amount: 100000 },
    'FL': { amount: 50000 },
    'AZ': { amount: 4748 },
    'GA': { amount: 2000 },
    'CA': { amount: 7000 }
  };
  
  const stateExemption = stateExemptions[state];
  if (stateExemption?.percentage) {
    return {
      exemption: homeValue * (stateExemption.percentage / 100),
      isPercentage: true,
      description: `${stateExemption.percentage}% residential exemption`
    };
  } else if (stateExemption?.amount) {
    return {
      exemption: stateExemption.amount,
      isPercentage: false,
      description: 'Homestead exemption'
    };
  }
  
  return {
    exemption: 0,
    isPercentage: false,
    description: 'No exemption found'
  };
}

/**
 * Query 3: Get special exemptions (senior, veteran, disability)
 */
async function getSpecialExemptions(
  apiKey: string, 
  location: string, 
  isOver65?: boolean, 
  isVeteran?: boolean, 
  isDisabled?: boolean
): Promise<{ senior?: number; veteran?: number; disability?: number }> {
  
  if (!isOver65 && !isVeteran && !isDisabled) {
    return {};
  }
  
  const systemPrompt = `You are a property tax expert. Search for and find EXACT exemption amounts for special categories.
Return specific dollar amounts or percentages from official sources.`;

  const exemptionsNeeded = [];
  if (isOver65) exemptionsNeeded.push('senior citizen (65+)');
  if (isVeteran) exemptionsNeeded.push('veteran');
  if (isDisabled) exemptionsNeeded.push('disability');

  const userPrompt = `What are the property tax exemptions in ${location} for:
${exemptionsNeeded.join(', ')}

Return in this format:
SENIOR: [amount or "none"]
VETERAN: [amount or "none"]
DISABILITY: [amount or "none"]`;

  const response = await queryGroq(apiKey, systemPrompt, userPrompt);
  
  const result: any = {};
  
  if (isOver65) {
    const seniorMatch = response.match(/SENIOR:\s*([\d,.$]+)/i);
    if (seniorMatch) {
      result.senior = parseFloat(seniorMatch[1].replace(/[$,]/g, ''));
    }
  }
  
  if (isVeteran) {
    const veteranMatch = response.match(/VETERAN:\s*([\d,.$]+)/i);
    if (veteranMatch) {
      result.veteran = parseFloat(veteranMatch[1].replace(/[$,]/g, ''));
    }
  }
  
  if (isDisabled) {
    const disabilityMatch = response.match(/DISABILITY:\s*([\d,.$]+)/i);
    if (disabilityMatch) {
      result.disability = parseFloat(disabilityMatch[1].replace(/[$,]/g, ''));
    }
  }
  
  return result;
}

/**
 * Main action to query property tax using parallel focused queries
 */
export const queryPropertyTaxParallel = action({
  args: {
    state: v.string(),
    zipCode: v.optional(v.string()),
    city: v.optional(v.string()),
    county: v.optional(v.string()),
    isPrimaryResidence: v.boolean(),
    isOver65: v.optional(v.boolean()),
    isVeteran: v.optional(v.boolean()),
    isDisabled: v.optional(v.boolean()),
    homeValue: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<PropertyTaxResponse> => {
    const query: PropertyTaxQuery = {
      state: args.state,
      zipCode: args.zipCode,
      city: args.city,
      county: args.county,
      isPrimaryResidence: args.isPrimaryResidence,
      isOver65: args.isOver65,
      isVeteran: args.isVeteran,
      isDisabled: args.isDisabled,
      homeValue: args.homeValue || 500000,
    };

    const cacheDuration = query.isOver65 || query.isVeteran || query.isDisabled 
      ? CACHE_DURATIONS.EXEMPTION_RULES 
      : CACHE_DURATIONS.PROPERTY_TAX_RATES;
    
    try {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('GROQ_API_KEY environment variable is not configured');
      }

      // Build location string
      const locationStr = query.county 
        ? `${query.county}, ${query.state}`
        : query.city 
        ? `${query.city}, ${query.state}`
        : query.state;

      // Execute parallel queries
      const [taxRateResult, homesteadResult, specialExemptions] = await Promise.all([
        // Query 1: Get headline tax rate
        getHeadlineTaxRate(apiKey, locationStr, query.county, query.state),
        
        // Query 2: Get homestead exemption (if primary residence)
        query.isPrimaryResidence 
          ? getHomesteadExemption(apiKey, locationStr, query.homeValue || 500000, query.state)
          : Promise.resolve({ exemption: 0, isPercentage: false, description: 'Not primary residence' }),
        
        // Query 3: Get special exemptions
        getSpecialExemptions(apiKey, locationStr, query.isOver65, query.isVeteran, query.isDisabled)
      ]);

      // Build exemptions object
      const exemptions: any = {};
      
      if (homesteadResult.exemption > 0) {
        exemptions.homestead = {
          amount: Math.round(homesteadResult.exemption),
          description: homesteadResult.description
        };
      }
      
      if (specialExemptions.senior) {
        exemptions.senior = {
          amount: specialExemptions.senior,
          discount: 0,
          description: 'Senior citizen exemption (65+)'
        };
      }
      
      if (specialExemptions.veteran) {
        exemptions.veteran = {
          amount: specialExemptions.veteran,
          description: 'Veteran property tax exemption'
        };
      }
      
      if (specialExemptions.disability) {
        exemptions.disability = {
          amount: specialExemptions.disability,
          description: 'Disability exemption'
        };
      }

      // Calculate totals
      const exemptionTotal = Object.values(exemptions).reduce((sum: number, ex: any) => 
        sum + (ex.amount || 0), 0);
      
      const taxableValue = Math.max(0, (query.homeValue || 500000) - exemptionTotal);
      const annualTax = taxableValue * taxRateResult.rate;
      const effectiveRate = query.homeValue ? annualTax / query.homeValue : taxRateResult.rate;

      const result: PropertyTaxResponse = {
        headlineRate: taxRateResult.rate,
        applicableRate: effectiveRate,
        exemptions,
        estimatedAnnualTax: annualTax,
        details: {
          assessedValue: query.homeValue || 500000,
          exemptionTotal,
          taxableValue,
          jurisdiction: locationStr
        },
        confidence: 0.9, // High confidence with parallel queries
        sources: ['Groq Parallel Search', taxRateResult.source]
      };

      // Store in cache
      await ctx.runMutation(internal.propertyTax.storePropertyTaxData, {
        state: query.state,
        zipCode: query.zipCode,
        city: query.city,
        county: query.county,
        isPrimaryResidence: query.isPrimaryResidence,
        isOver65: query.isOver65,
        isVeteran: query.isVeteran,
        isDisabled: query.isDisabled,
        homeValue: query.homeValue,
        headlineRate: result.headlineRate,
        applicableRate: result.applicableRate,
        exemptions: result.exemptions,
        estimatedAnnualTax: result.estimatedAnnualTax,
        details: result.details,
        confidence: result.confidence,
        sources: result.sources,
        expiresAt: Date.now() + cacheDuration,
      });
      
      return result;
      
    } catch (error) {
      console.error('Error in parallel property tax queries:', error);
      
      // Fallback response
      const stateRates: Record<string, number> = {
        'UT': 0.60, 'AZ': 0.81, 'NV': 0.60, 'TX': 1.80, 'CA': 0.75,
        'FL': 0.83, 'NY': 1.68, 'IL': 2.05, 'CO': 0.55, 'WA': 0.98
      };
      
      const baseRate = (stateRates[query.state] || 1.07) / 100;
      
      return {
        headlineRate: baseRate,
        applicableRate: baseRate,
        exemptions: {},
        estimatedAnnualTax: (query.homeValue || 500000) * baseRate,
        details: {
          assessedValue: query.homeValue || 500000,
          exemptionTotal: 0,
          taxableValue: query.homeValue || 500000,
          jurisdiction: query.state
        },
        confidence: 0.3,
        sources: ['Fallback estimate']
      };
    }
  },
});