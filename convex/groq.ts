/**
 * Groq API Integration for Property Tax Analysis - Convex Actions
 * 
 * Uses OpenAI's open-source gpt-oss-120b model hosted on Groq with browser search
 * for real-time property tax data retrieval and analysis.
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
  headlineRate: number; // Base property tax rate as percentage
  applicableRate: number; // Rate after exemptions/discounts
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
  confidence: number; // 0-1 confidence in the data
  sources: string[];
}

// Cache durations per PRD specifications
const CACHE_DURATIONS = {
  PROPERTY_TAX_RATES: 365 * 24 * 60 * 60 * 1000, // 12 months for tax rates
  EXEMPTION_RULES: 180 * 24 * 60 * 60 * 1000,     // 6 months for exemption rules
} as const;

/**
 * Determine appropriate cache duration based on query type
 */
function getCacheDuration(query: PropertyTaxQuery): number {
  const hasExemptionFactors = query.isOver65 || query.isVeteran || query.isDisabled;
  return hasExemptionFactors 
    ? CACHE_DURATIONS.EXEMPTION_RULES 
    : CACHE_DURATIONS.PROPERTY_TAX_RATES;
}

/**
 * Create structured prompt for property tax analysis
 * Optimized for browser search capability
 */
function createPropertyTaxPrompt(query: PropertyTaxQuery): string {
  const year = new Date().getFullYear();
  
  // Build search-optimized location string
  let locationStr = '';
  if (query.county) {
    locationStr = `${query.county} County, ${query.state}`;
  } else if (query.zipCode) {
    locationStr = `ZIP code ${query.zipCode}, ${query.state}`;
  } else if (query.city) {
    locationStr = `${query.city}, ${query.state}`;
  } else {
    locationStr = query.state;
  }

  return `What is the property tax rate for ${locationStr} and what are the applicable exemptions?

Property Details:
- Home Value: $${query.homeValue?.toLocaleString() || '500,000'}
- Property Type: ${query.isPrimaryResidence ? 'Primary Residence' : 'Investment Property'}
${query.isOver65 ? '- Owner is 65+ years old' : ''}
${query.isVeteran ? '- Owner is a veteran' : ''}
${query.isDisabled ? '- Owner has disability status' : ''}

Search for and provide:
1. The exact county/city tax rate (as a decimal, e.g., 0.006016 for 0.6016%)
2. Residential exemptions (if primary residence)
3. Any other applicable exemptions based on owner status
4. Calculate the annual property tax

Return a JSON response with these exact fields:
{
  "property_tax_rate": <decimal rate from official sources>,
  "homestead_exemption": <dollar amount OR percentage of value>,
  "senior_exemption": <dollar amount if applicable>,
  "veteran_exemption": <dollar amount if applicable>,
  "annual_tax": <calculated annual tax in dollars>,
  "effective_rate": <actual rate after all exemptions>,
  "sources": ["list of sources used"],
  "confidence": <0.0 to 1.0>
}

IMPORTANT: Use only current ${year} data from official county assessor websites, tax district documents, and government sources.`;
}

/**
 * Parse Groq response into structured format
 */
function parseGroqResponse(response: string, query: PropertyTaxQuery): PropertyTaxResponse {
  // State-specific default rates as fallback
  const stateDefaults: Record<string, number> = {
    'TX': 1.80, 'NJ': 2.13, 'NH': 1.86, 'NY': 1.68, 'CT': 1.63,
    'IL': 2.05, 'CA': 0.75, 'FL': 0.83, 'UT': 0.60, 'AZ': 0.81,
    'NV': 0.60, 'CO': 0.55, 'WA': 0.98, 'OR': 0.97, 'GA': 0.92,
    'MI': 1.50, 'PA': 1.58, 'OH': 1.56, 'VA': 0.82, 'NC': 0.86
  };
  
  // Try to parse as JSON first
  try {
    // Extract JSON from response (it might be wrapped in markdown or other text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonData = JSON.parse(jsonMatch[0]);
      
      const exemptions: any = {};
      
      // Handle homestead exemption (can be dollar amount or percentage)
      if (jsonData.homestead_exemption) {
        if (typeof jsonData.homestead_exemption === 'string' && jsonData.homestead_exemption.includes('%')) {
          // It's a percentage (like "45%" for Utah)
          const percentage = parseFloat(jsonData.homestead_exemption.replace('%', ''));
          const exemptionAmount = (query.homeValue || 0) * (percentage / 100);
          exemptions.homestead = {
            amount: exemptionAmount,
            description: `Homestead exemption (${percentage}% of market value)`
          };
        } else if (jsonData.homestead_exemption > 0) {
          exemptions.homestead = {
            amount: jsonData.homestead_exemption,
            description: 'Homestead exemption for primary residence'
          };
        }
      }
      
      if (jsonData.senior_exemption > 0 || jsonData.senior_discount_percentage > 0) {
        exemptions.senior = {
          amount: jsonData.senior_exemption || 0,
          discount: jsonData.senior_discount_percentage || 0,
          description: jsonData.senior_discount_percentage > 0 
            ? `Senior citizen discount (${jsonData.senior_discount_percentage}%)`
            : `Senior citizen exemption ($${jsonData.senior_exemption?.toLocaleString()})`
        };
      }
      
      if (jsonData.veteran_exemption > 0) {
        exemptions.veteran = {
          amount: jsonData.veteran_exemption,
          description: 'Veteran property tax exemption'
        };
      }
      
      if (jsonData.disability_exemption > 0) {
        exemptions.disability = {
          amount: jsonData.disability_exemption,
          description: 'Disability exemption'
        };
      }
      
      return {
        headlineRate: (jsonData.property_tax_rate || stateDefaults[query.state] || 1.07) / 100,
        applicableRate: (jsonData.effective_rate || jsonData.property_tax_rate || stateDefaults[query.state] || 1.07) / 100,
        exemptions,
        estimatedAnnualTax: jsonData.annual_tax || 0,
        details: {
          assessedValue: query.homeValue || 0,
          exemptionTotal: jsonData.total_exemptions || 0,
          taxableValue: jsonData.taxable_value || (query.homeValue || 0),
          jurisdiction: `${query.county ? query.county + ' County, ' : ''}${query.state}`
        },
        confidence: jsonData.confidence || 0.9,
        sources: ['Groq AI with Browser Search', `${jsonData.data_year || new Date().getFullYear()} Tax Data`]
      };
    }
  } catch (e) {
    console.log('Failed to parse JSON response, falling back to text parsing');
  }
  
  // Fallback to text parsing if JSON parsing fails
  let headlineRate = stateDefaults[query.state] || 1.07;
  let applicableRate = headlineRate;
  let estimatedAnnualTax = 0;
  const exemptions: any = {};
  let confidence = 0.8;
  
  const lines = response.split('\n');
  
  for (const line of lines) {
    const lower = line.toLowerCase();
    
    // Extract property tax rate
    if (lower.includes('property tax rate') || lower.includes('tax rate')) {
      // Look for patterns like "1.25%" or "1.25 percent" or "rate: 1.25"
      const rateMatch = line.match(/(\d+\.?\d*)\s*%/) || line.match(/rate[:\s]+(\d+\.?\d*)/);
      if (rateMatch) {
        const rate = parseFloat(rateMatch[1]);
        if (rate > 0 && rate < 5) { // Sanity check
          headlineRate = rate;
          applicableRate = rate;
          confidence = 0.9; // Very high confidence when we find specific rate
        }
      }
    }
    
    // Extract homestead exemption
    if (lower.includes('homestead') && query.isPrimaryResidence) {
      const amountMatch = line.match(/\$?([\d,]+)/);
      if (amountMatch) {
        const amount = parseInt(amountMatch[1].replace(/,/g, ''));
        if (amount > 0) {
          exemptions.homestead = {
            amount: amount,
            description: 'Homestead exemption for primary residence'
          };
        }
      }
    }
    
    // Extract senior exemption
    if ((lower.includes('senior') || lower.includes('65')) && query.isOver65) {
      const percentMatch = line.match(/(\d+\.?\d*)\s*%/);
      const amountMatch = line.match(/\$?([\d,]+)/);
      
      if (percentMatch) {
        exemptions.senior = {
          discount: parseFloat(percentMatch[1]),
          description: `Senior citizen discount (${percentMatch[1]}%)`
        };
      } else if (amountMatch) {
        const amount = parseInt(amountMatch[1].replace(/,/g, ''));
        exemptions.senior = {
          amount: amount,
          discount: 0,
          description: `Senior citizen exemption ($${amount.toLocaleString()})`
        };
      }
    }
    
    // Extract veteran exemption
    if (lower.includes('veteran') && query.isVeteran) {
      const amountMatch = line.match(/\$?([\d,]+)/);
      if (amountMatch) {
        const amount = parseInt(amountMatch[1].replace(/,/g, ''));
        if (amount > 0) {
          exemptions.veteran = {
            amount: amount,
            description: 'Veteran property tax exemption'
          };
        }
      }
    }
    
    // Extract calculated annual tax
    if (lower.includes('annual tax')) {
      const taxMatch = line.match(/\$?([\d,]+)/);
      if (taxMatch) {
        estimatedAnnualTax = parseInt(taxMatch[1].replace(/,/g, ''));
      }
    }
  }
  
  // Calculate if not found in response
  if (query.homeValue && estimatedAnnualTax === 0) {
    const exemptionTotal = Object.values(exemptions).reduce((sum: number, ex: any) => 
      sum + (ex.amount || 0), 0);
    const taxableValue = Math.max(0, query.homeValue - exemptionTotal);
    
    let finalRate = headlineRate / 100;
    
    // Apply percentage discounts
    if (exemptions.senior?.discount) {
      finalRate = finalRate * (1 - exemptions.senior.discount / 100);
      applicableRate = headlineRate * (1 - exemptions.senior.discount / 100);
    }
    
    estimatedAnnualTax = taxableValue * finalRate;
  }
  
  return {
    headlineRate: headlineRate / 100,
    applicableRate: applicableRate / 100,
    exemptions,
    estimatedAnnualTax,
    details: {
      assessedValue: query.homeValue || 0,
      exemptionTotal: Object.values(exemptions).reduce((sum: number, ex: any) => 
        sum + (ex.amount || 0), 0),
      taxableValue: query.homeValue ? Math.max(0, query.homeValue - Object.values(exemptions).reduce((sum: number, ex: any) => 
        sum + (ex.amount || 0), 0)) : 0,
      jurisdiction: `${query.county ? query.county + ' County, ' : ''}${query.state}`
    },
    confidence,
    sources: ['Groq AI with Browser Search', 'Current Tax Data']
  };
}

/**
 * Convex action to query Groq API for property tax analysis
 * Uses gpt-oss-120b with browser search for real-time data
 */
export const queryPropertyTax = action({
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
      homeValue: args.homeValue,
    };

    const cacheDuration = getCacheDuration(query);
    
    // Log incoming request for debugging
    console.log('[Property Tax API] Request:', {
      source: 'GROQ_API',
      state: query.state,
      county: query.county,
      zipCode: query.zipCode,
      city: query.city,
      homeValue: query.homeValue,
      isPrimaryResidence: query.isPrimaryResidence,
      isOver65: query.isOver65,
      isVeteran: query.isVeteran,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Get GROQ_API_KEY from Convex environment variables
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('GROQ_API_KEY environment variable is not configured');
      }

      const prompt = createPropertyTaxPrompt(query);
      
      // Call Groq API with gpt-oss-20b and browser search for better accuracy
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
              content: 'Find and validate the headline tax rate and the effective tax rate from authoritative sources only that are current. Use official government websites, tax assessor offices, and verified tax documents. Provide specific numerical values with sources.'
            },
            {
              role: 'user',
              content: prompt
            },
            {
              role: 'assistant',
              content: '' // Empty assistant message to trigger response
            }
          ],
          temperature: 0.2,
          max_completion_tokens: 2048,
          top_p: 0.9,
          reasoning_effort: 'low',
          stream: false, // We need the full response
          stop: null,
          tools: [{ type: 'browser_search' }]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error:', response.status, errorText);
        throw new Error(`Groq API error: ${response.status}`);
      }
      
      const data = await response.json();
      const groqResponse = data.choices?.[0]?.message?.content || '';
      
      if (!groqResponse) {
        throw new Error('Empty response from Groq API');
      }
      
      const result = parseGroqResponse(groqResponse, query);
      
      // Log successful response
      console.log('[Property Tax API] Success:', {
        source: 'GROQ_API',
        state: query.state,
        county: query.county,
        headlineRate: result.headlineRate,
        applicableRate: result.applicableRate,
        confidence: result.confidence,
        exemptions: Object.keys(result.exemptions),
        annualTax: result.estimatedAnnualTax,
        timestamp: new Date().toISOString()
      });
      
      // Store the result in database for caching
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
      console.error('Error querying Groq for property tax:', error);
      
      // Log error and fallback usage
      console.log('[Property Tax API] Error:', {
        source: 'GROQ_API_FALLBACK',
        state: query.state,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      // Fallback with accurate state-specific rates
      const stateRates: Record<string, number> = {
        'UT': 0.60, 'AZ': 0.81, 'NV': 0.60, 'TX': 1.80, 'CA': 0.75,
        'FL': 0.83, 'NY': 1.68, 'IL': 2.05, 'CO': 0.55, 'WA': 0.98,
        'OR': 0.97, 'GA': 0.92, 'MI': 1.50, 'PA': 1.58, 'OH': 1.56
      };
      
      const baseRate = stateRates[query.state] || 1.07;
      const rate = baseRate / 100;
      
      // Apply basic exemptions
      let exemptionTotal = 0;
      const exemptions: any = {};
      
      if (query.isPrimaryResidence) {
        const homesteadAmounts: Record<string, number> = {
          'TX': 100000, 'FL': 50000, 'UT': 45000, 'CA': 7000, 'GA': 2000
        };
        const homesteadAmount = homesteadAmounts[query.state] || 25000;
        exemptions.homestead = {
          amount: homesteadAmount,
          description: 'Estimated homestead exemption'
        };
        exemptionTotal += homesteadAmount;
      }
      
      const taxableValue = query.homeValue ? Math.max(0, query.homeValue - exemptionTotal) : 0;
      const annualTax = taxableValue * rate;
      
      return {
        headlineRate: rate,
        applicableRate: rate,
        exemptions,
        estimatedAnnualTax: annualTax,
        details: {
          assessedValue: query.homeValue || 0,
          exemptionTotal,
          taxableValue,
          jurisdiction: query.state
        },
        confidence: 0.4,
        sources: ['State average (Groq unavailable)']
      };
    }
  },
});

/**
 * Clear property tax cache
 */
export const clearPropertyTaxCache = action({
  args: {},
  handler: async (ctx): Promise<void> => {
    await ctx.runMutation(internal.propertyTax.clearAllCache);
  },
});

/**
 * Get cache statistics
 */
export const getCacheStats = action({
  args: {},
  handler: async (ctx): Promise<{ total: number; expired: number; active: number; byState: Record<string, number> }> => {
    const stats = await ctx.runQuery(internal.propertyTax.getCacheStats);
    return stats;
  },
});