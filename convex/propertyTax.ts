/**
 * Property Tax Data Management
 * 
 * This module provides queries and mutations for cached property tax data.
 * Following the hybrid caching pattern documented in CLAUDE.md:
 * - Queries check cached data (auto-cached by Convex)
 * - Actions call external APIs only on cache miss
 * - Database stores results with expiration
 */

import { query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate consistent cache key from query parameters
 * Must match the key generation in xai.ts
 */
function generateCacheKey(params: {
  state: string;
  zipCode?: string;
  city?: string;
  county?: string;
  isPrimaryResidence: boolean;
  isOver65?: boolean;
  isVeteran?: boolean;
  isDisabled?: boolean;
  homeValue?: number;
}): string {
  return JSON.stringify({
    location: `${params.state}-${params.zipCode || params.city || params.county}`,
    primary: params.isPrimaryResidence,
    senior: params.isOver65,
    veteran: params.isVeteran,
    disabled: params.isDisabled,
    value: Math.floor((params.homeValue || 0) / 10000) * 10000 // Round to nearest 10k
  });
}

/**
 * Public query to get cached property tax data
 * This is called by the client and benefits from Convex's automatic query caching
 */
export const getCachedPropertyTax = query({
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
  handler: async (ctx, args) => {
    const cacheKey = generateCacheKey(args);
    
    // Query for valid (non-expired) cached data
    const cached = await ctx.db
      .query("propertyTaxData")
      .withIndex("by_key", q => q.eq("cacheKey", cacheKey))
      .filter(q => q.gt(q.field("expiresAt"), Date.now()))
      .first();
    
    if (!cached) {
      return null; // Client should call action to fetch fresh data
    }
    
    // Return the cached data in the expected format
    return {
      headlineRate: cached.headlineRate,
      applicableRate: cached.applicableRate,
      exemptions: cached.exemptions,
      estimatedAnnualTax: cached.estimatedAnnualTax,
      details: cached.details,
      confidence: cached.confidence,
      sources: cached.sources,
    };
  }
});

/**
 * Simplified query for just tax rates (used by property-tax.ts)
 */
export const getCachedSimpleRate = query({
  args: {
    state: v.string(),
    zipCode: v.optional(v.string()),
    isPrimaryResidence: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const cacheKey = generateCacheKey({
      state: args.state,
      zipCode: args.zipCode,
      isPrimaryResidence: args.isPrimaryResidence ?? true,
      city: undefined,
      county: undefined,
    });
    
    const cached = await ctx.db
      .query("propertyTaxData")
      .withIndex("by_key", q => q.eq("cacheKey", cacheKey))
      .filter(q => q.gt(q.field("expiresAt"), Date.now()))
      .first();
    
    if (!cached) {
      return null;
    }
    
    return {
      headlineRate: cached.headlineRate,
      applicableRate: cached.applicableRate,
    };
  }
});

/**
 * Internal mutation to store property tax data
 * Called by xai.ts after fetching from API
 */
export const storePropertyTaxData = internalMutation({
  args: {
    // Query parameters for cache key
    state: v.string(),
    zipCode: v.optional(v.string()),
    city: v.optional(v.string()),
    county: v.optional(v.string()),
    isPrimaryResidence: v.boolean(),
    isOver65: v.optional(v.boolean()),
    isVeteran: v.optional(v.boolean()),
    isDisabled: v.optional(v.boolean()),
    homeValue: v.optional(v.number()),
    // Response data to cache
    headlineRate: v.number(),
    applicableRate: v.number(),
    exemptions: v.object({
      homestead: v.optional(v.object({ 
        amount: v.number(), 
        description: v.string() 
      })),
      senior: v.optional(v.object({ 
        discount: v.number(), 
        description: v.string() 
      })),
      veteran: v.optional(v.object({ 
        amount: v.number(), 
        description: v.string() 
      })),
      disability: v.optional(v.object({ 
        amount: v.number(), 
        description: v.string() 
      })),
    }),
    estimatedAnnualTax: v.number(),
    details: v.object({
      assessedValue: v.number(),
      exemptionTotal: v.number(),
      taxableValue: v.number(),
      jurisdiction: v.string(),
    }),
    confidence: v.number(),
    sources: v.array(v.string()),
    // Cache duration
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const cacheKey = generateCacheKey({
      state: args.state,
      zipCode: args.zipCode,
      city: args.city,
      county: args.county,
      isPrimaryResidence: args.isPrimaryResidence,
      isOver65: args.isOver65,
      isVeteran: args.isVeteran,
      isDisabled: args.isDisabled,
      homeValue: args.homeValue,
    });
    
    // Check if entry already exists
    const existing = await ctx.db
      .query("propertyTaxData")
      .withIndex("by_key", q => q.eq("cacheKey", cacheKey))
      .first();
    
    const data = {
      cacheKey,
      state: args.state,
      zipCode: args.zipCode,
      city: args.city,
      county: args.county,
      isPrimaryResidence: args.isPrimaryResidence,
      isOver65: args.isOver65,
      isVeteran: args.isVeteran,
      isDisabled: args.isDisabled,
      homeValue: args.homeValue,
      headlineRate: args.headlineRate,
      applicableRate: args.applicableRate,
      exemptions: args.exemptions,
      estimatedAnnualTax: args.estimatedAnnualTax,
      details: args.details,
      confidence: args.confidence,
      sources: args.sources,
      lastUpdated: Date.now(),
      expiresAt: args.expiresAt,
    };
    
    if (existing) {
      // Update existing entry
      await ctx.db.patch(existing._id, data);
    } else {
      // Create new entry
      await ctx.db.insert("propertyTaxData", data);
      
      // Clean up old entries to prevent unbounded growth
      await cleanupOldEntries(ctx);
    }
  }
});

/**
 * Helper to clean up old cache entries
 * Keeps a maximum of 1000 entries, removing oldest first
 */
async function cleanupOldEntries(ctx: any) {
  const MAX_ENTRIES = 1000;
  
  const allEntries = await ctx.db
    .query("propertyTaxData")
    .collect();
  
  if (allEntries.length > MAX_ENTRIES) {
    // Sort by expiry date and delete oldest
    allEntries.sort((a: any, b: any) => a.expiresAt - b.expiresAt);
    const toDelete = allEntries.slice(0, allEntries.length - MAX_ENTRIES);
    
    for (const entry of toDelete) {
      await ctx.db.delete(entry._id);
    }
  }
}

/**
 * Internal mutation to clear all property tax cache
 * Used by clearPropertyTaxCache action in xai.ts
 */
export const clearAllCache = internalMutation({
  handler: async (ctx) => {
    const allEntries = await ctx.db.query("propertyTaxData").collect();
    for (const entry of allEntries) {
      await ctx.db.delete(entry._id);
    }
    return { deleted: allEntries.length };
  }
});

/**
 * Internal query to get cache statistics
 */
export const getCacheStats = internalQuery({
  handler: async (ctx) => {
    const allEntries = await ctx.db.query("propertyTaxData").collect();
    const now = Date.now();
    
    const stats = {
      total: allEntries.length,
      expired: 0,
      active: 0,
      byState: {} as Record<string, number>,
    };
    
    for (const entry of allEntries) {
      if (entry.expiresAt < now) {
        stats.expired++;
      } else {
        stats.active++;
      }
      
      stats.byState[entry.state] = (stats.byState[entry.state] || 0) + 1;
    }
    
    return stats;
  }
});

/**
 * Scheduled function to clean up expired entries
 * Run daily to remove expired cache entries
 */
export const cleanupExpiredEntries = internalMutation({
  handler: async (ctx) => {
    const expired = await ctx.db
      .query("propertyTaxData")
      .withIndex("by_expiry", q => q.lt("expiresAt", Date.now()))
      .collect();
    
    for (const entry of expired) {
      await ctx.db.delete(entry._id);
    }
    
    return { deleted: expired.length };
  }
});