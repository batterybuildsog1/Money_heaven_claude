import { v } from "convex/values";
import { query, mutation, internalMutation, action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Get current FHA rate (public query)
export const getCurrentFHARate = query({
  args: {},
  handler: async (ctx) => {
    const rate = await ctx.db
      .query("mortgageRates")
      .withIndex("by_type", (q) => q.eq("rateType", "fha30"))
      .first();
    
    if (!rate) {
      // Return default if no rate stored yet
      return {
        rate: 7.0, // Conservative default
        source: "default",
        lastUpdated: Date.now(),
        isStale: true
      };
    }
    
    // Check if rate is stale (older than 24 hours)
    const isStale = Date.now() - rate.lastUpdated > 24 * 60 * 60 * 1000;
    
    // Check if fallback was used (for user notification)
    const wasFallbackUsed = rate.source === "xai" || rate.source === "default";
    
    return {
      rate: rate.rate,
      source: rate.source,
      lastUpdated: rate.lastUpdated,
      isStale,
      wasFallbackUsed
    };
  },
});

// Admin function to manually update rate
export const updateRate = mutation({
  args: {
    rateType: v.string(),
    rate: v.number(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: Add admin authentication check here
    // const identity = await ctx.auth.getUserIdentity();
    // if (!isAdmin(identity)) throw new Error("Unauthorized");
    
    const existing = await ctx.db
      .query("mortgageRates")
      .withIndex("by_type", (q) => q.eq("rateType", args.rateType))
      .first();
    
    const rateData = {
      rateType: args.rateType,
      rate: args.rate,
      source: args.source || "manual",
      lastUpdated: Date.now(),
      isManualOverride: true,
    };
    
    if (existing) {
      await ctx.db.patch(existing._id, rateData);
    } else {
      await ctx.db.insert("mortgageRates", rateData);
    }
    
    return { success: true };
  },
});

// Helper function to validate rates
function validateRate(rate: number): { isValid: boolean; error?: string } {
  if (typeof rate !== 'number' || isNaN(rate)) {
    return { isValid: false, error: 'Rate must be a valid number' };
  }
  
  if (rate < 2.0 || rate > 15.0) {
    return { isValid: false, error: `Rate ${rate}% is outside reasonable range (2-15%)` };
  }
  
  return { isValid: true };
}

// Helper function to log errors
async function logRateError(
  ctx: any,
  source: string,
  error: string,
  errorCode?: string,
  responseDetails?: string,
  fallbackUsed: boolean = false,
  finalResult: { success: boolean; rate?: number; source?: string } = { success: false }
) {
  await ctx.db.insert("rateUpdateErrors", {
    timestamp: Date.now(),
    attemptedSource: source,
    error,
    errorCode,
    responseDetails,
    fallbackUsed,
    finalResult,
  });
}

// Scrape MortgageNewsDaily for FHA rates
export const scrapeMortgageNewsDaily = internalAction({
  args: {},
  handler: async () => {
    try {
      console.log('Fetching FHA rates from MortgageNewsDaily...');
      
      const response = await fetch('https://www.mortgagenewsdaily.com/mortgage-rates/30-year-fha', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Multiple regex patterns to catch FHA rates
      const patterns = [
        /30[\s-]*year[\s-]*fha[^0-9]*(\d+\.\d+)%/i,
        /fha[\s-]*30[\s-]*year[^0-9]*(\d+\.\d+)%/i,
        /fha[^0-9]*(\d+\.\d+)%/i,
        /(\d+\.\d+)%[^0-9]*fha/i,
      ];
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) {
          const rate = parseFloat(match[1]);
          const validation = validateRate(rate);
          
          if (validation.isValid) {
            console.log(`Successfully scraped FHA rate: ${rate}%`);
            return { success: true, rate, source: 'mortgagenewsdaily' };
          } else {
            console.log(`Invalid rate found: ${rate}% - ${validation.error}`);
          }
        }
      }
      
      throw new Error('No valid FHA rate found in page content');
      
    } catch (error) {
      console.error('MortgageNewsDaily scraping failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        errorCode: error instanceof Error && 'status' in error ? String(error.status) : undefined
      };
    }
  },
});

// Fallback to xAI for rate information
export const fetchRateFromXAI = internalAction({
  args: {},
  handler: async () => {
    try {
      console.log('Fetching FHA rates from xAI as fallback...');
      
      const prompt = `What is the current 30-year FHA mortgage interest rate today? 
      
Please search for the most recent FHA mortgage rates and return just the numerical rate as a percentage.
For example, if the rate is 6.875%, return just "6.875".

Focus on finding official sources like:
- FHA.gov
- HUD.gov  
- Mortgage News Daily
- Bankrate
- Major lenders

Return only the rate number without the % symbol.`;

      // Use the existing groq infrastructure (similar to property tax)
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a mortgage rate expert. Provide only numerical rates without additional commentary.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'grok-beta',
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`xAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      
      if (!content) {
        throw new Error('No content in xAI response');
      }
      
      // Extract rate from response
      const rateMatch = content.match(/(\d+\.\d+)/);
      if (rateMatch) {
        const rate = parseFloat(rateMatch[1]);
        const validation = validateRate(rate);
        
        if (validation.isValid) {
          console.log(`Successfully got FHA rate from xAI: ${rate}%`);
          return { success: true, rate, source: 'xai' };
        } else {
          throw new Error(`Invalid rate from xAI: ${rate}% - ${validation.error}`);
        }
      } else {
        throw new Error(`Could not parse rate from xAI response: ${content}`);
      }
      
    } catch (error) {
      console.error('xAI fallback failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        errorCode: error instanceof Error && 'status' in error ? String(error.status) : undefined
      };
    }
  },
});

// Internal helper to update rate in database
async function updateRateInDatabase(
  ctx: any,
  rate: number,
  source: string
): Promise<void> {
  const existing = await ctx.db
    .query("mortgageRates")
    .withIndex("by_type", (q: any) => q.eq("rateType", "fha30"))
    .first();
  
  const rateData = {
    rateType: "fha30" as const,
    rate,
    source,
    lastUpdated: Date.now(),
    isManualOverride: false,
  };
  
  if (existing) {
    await ctx.db.patch(existing._id, rateData);
  } else {
    await ctx.db.insert("mortgageRates", rateData);
  }
}

// (Removed scheduledRateUpdate internal mutation; cron will call internal action directly)

// Action version for manual rate updates with scraping
export const updateRateWithScraping = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log('Starting manual rate update with scraping...');
    
    try {
      // Try web scraping MortgageNewsDaily
      let scrapingResult;
      try {
        const response = await fetch('https://www.mortgagenewsdaily.com/mortgage-rates/30-year-fha', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        
        // Multiple regex patterns to catch FHA rates
        const patterns = [
          /30[\s-]*year[\s-]*fha[^0-9]*(\d+\.\d+)%/i,
          /fha[\s-]*30[\s-]*year[^0-9]*(\d+\.\d+)%/i,
          /fha[^0-9]*(\d+\.\d+)%/i,
          /(\d+\.\d+)%[^0-9]*fha/i,
        ];
        
        for (const pattern of patterns) {
          const match = html.match(pattern);
          if (match) {
            const rate = parseFloat(match[1]);
            const validation = validateRate(rate);
            
            if (validation.isValid) {
              scrapingResult = { success: true, rate, source: 'mortgagenewsdaily' };
              break;
            }
          }
        }
        
        if (!scrapingResult) {
          throw new Error('No valid FHA rate found in page content');
        }
      } catch (error) {
        scrapingResult = { 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        };
      }
      
      if (scrapingResult.success && scrapingResult.rate) {
        // Success with scraping - update database
        await ctx.runMutation(internal.rates.updateRateInDB, {
          rate: scrapingResult.rate,
          source: scrapingResult.source || 'mortgagenewsdaily'
        });
        
        console.log(`Rate updated successfully: ${scrapingResult.rate}% from ${scrapingResult.source}`);
        return { success: true, rate: scrapingResult.rate, source: scrapingResult.source, fallbackUsed: false };
      } else {
        // Scraping failed, log error and try xAI fallback
        await ctx.runMutation(internal.rates.logError, {
          source: 'mortgagenewsdaily',
          error: scrapingResult.error || 'Unknown scraping error',
          fallbackUsed: true
        });
        
        console.log('Web scraping failed, trying xAI fallback...');
        
        // Try xAI fallback
        let xaiResult;
        try {
          const prompt = `What is the current 30-year FHA mortgage interest rate today? 
          
Please search for the most recent FHA mortgage rates and return just the numerical rate as a percentage.
For example, if the rate is 6.875%, return just "6.875".

Focus on finding official sources like:
- FHA.gov
- HUD.gov  
- Mortgage News Daily
- Bankrate
- Major lenders

Return only the rate number without the % symbol.`;

          const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
            },
            body: JSON.stringify({
              messages: [
                {
                  role: 'system',
                  content: 'You are a mortgage rate expert. Provide only numerical rates without additional commentary.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              model: 'grok-beta',
              temperature: 0.1,
            }),
          });

          if (!response.ok) {
            throw new Error(`xAI API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          
          if (!content) {
            throw new Error('No content in xAI response');
          }
          
          // Extract rate from response
          const rateMatch = content.match(/(\d+\.\d+)/);
          if (rateMatch) {
            const rate = parseFloat(rateMatch[1]);
            const validation = validateRate(rate);
            
            if (validation.isValid) {
              xaiResult = { success: true, rate, source: 'xai' };
            } else {
              throw new Error(`Invalid rate from xAI: ${rate}% - ${validation.error}`);
            }
          } else {
            throw new Error(`Could not parse rate from xAI response: ${content}`);
          }
        } catch (error) {
          xaiResult = { 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
          };
        }
        
        if (xaiResult.success && xaiResult.rate) {
          // Success with xAI fallback - update database
          await ctx.runMutation(internal.rates.updateRateInDB, {
            rate: xaiResult.rate,
            source: xaiResult.source || 'xai'
          });
          
          // Log that fallback was used successfully
          await ctx.runMutation(internal.rates.logError, {
            source: 'xai',
            error: 'Fallback used successfully',
            fallbackUsed: true,
            finalResult: { success: true, rate: xaiResult.rate, source: xaiResult.source }
          });
          
          console.log(`Rate updated via xAI fallback: ${xaiResult.rate}%`);
          return { success: true, rate: xaiResult.rate, source: xaiResult.source, fallbackUsed: true };
        } else {
          // Both methods failed
          await ctx.runMutation(internal.rates.logError, {
            source: 'xai',
            error: xaiResult.error || 'Unknown xAI error',
            fallbackUsed: true,
            finalResult: { success: false }
          });
          
          throw new Error(`All rate sources failed. Scraping: ${scrapingResult.error}. xAI: ${xaiResult.error}`);
        }
      }
    } catch (error) {
      console.error('Rate update completely failed:', error);
      
      // Log the final error
      await ctx.runMutation(internal.rates.logError, {
        source: 'system',
        error: error instanceof Error ? error.message : String(error),
        fallbackUsed: false,
        finalResult: { success: false }
      });
      
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
});

// Helper mutation to update rate in database
export const updateRateInDB = internalMutation({
  args: {
    rate: v.number(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    await updateRateInDatabase(ctx, args.rate, args.source);
  },
});

// Helper mutation to log errors
export const logError = internalMutation({
  args: {
    source: v.string(),
    error: v.string(),
    errorCode: v.optional(v.string()),
    fallbackUsed: v.boolean(),
    finalResult: v.optional(v.object({
      success: v.boolean(),
      rate: v.optional(v.number()),
      source: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("rateUpdateErrors", {
      timestamp: Date.now(),
      attemptedSource: args.source,
      error: args.error,
      errorCode: args.errorCode,
      responseDetails: undefined,
      fallbackUsed: args.fallbackUsed,
      finalResult: args.finalResult || { success: false },
    });
  },
});

// (Removed runScheduledRateUpdate indirection; cron calls internal action directly)

// Test function to manually trigger rate update (for testing)
export const testRateUpdate = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; message?: string; error?: string }> => {
    console.log('Testing rate update manually...');
    
    try {
      // Test web scraping directly
      const response = await fetch('https://www.mortgagenewsdaily.com/mortgage-rates/30-year-fha');
      if (response.ok) {
        const html = await response.text();
        const hasContent = html.includes('fha') || html.includes('FHA');
        
        return {
          success: true,
          message: `Test successful. Page accessible: ${hasContent ? 'Yes' : 'No'}`
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },
});