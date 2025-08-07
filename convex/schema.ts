import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { scenarioInputs, scenarioFactors, scenarioResults } from "./types";

export default defineSchema({
  scenarios: defineTable({
    userId: v.string(),
    inputs: scenarioInputs,
    compensatingFactors: v.optional(scenarioFactors),
    results: v.optional(scenarioResults),
    name: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  
  mortgageRates: defineTable({
    rateType: v.string(), // "fha30", "conventional30", etc.
    rate: v.number(),
    source: v.string(), // "mortgagenewsdaily", "manual", etc.
    lastUpdated: v.number(),
    isManualOverride: v.boolean(),
  }).index("by_type", ["rateType"]),
  
  // Rate update error logging
  rateUpdateErrors: defineTable({
    timestamp: v.number(),
    attemptedSource: v.string(), // "mortgagenewsdaily", "xai", etc.
    error: v.string(),
    errorCode: v.optional(v.string()),
    responseDetails: v.optional(v.string()),
    fallbackUsed: v.boolean(),
    finalResult: v.object({
      success: v.boolean(),
      rate: v.optional(v.number()),
      source: v.optional(v.string()),
    }),
  }).index("by_timestamp", ["timestamp"])
    .index("by_source", ["attemptedSource"]),
  
  // Property tax data cache - stores xAI API responses
  propertyTaxData: defineTable({
    cacheKey: v.string(), // Generated from query parameters
    // Location data
    state: v.string(),
    zipCode: v.optional(v.string()),
    city: v.optional(v.string()),
    county: v.optional(v.string()),
    isPrimaryResidence: v.boolean(),
    // User exemption factors
    isOver65: v.optional(v.boolean()),
    isVeteran: v.optional(v.boolean()),
    isDisabled: v.optional(v.boolean()),
    homeValue: v.optional(v.number()),
    // Cached response data
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
    // Cache metadata
    lastUpdated: v.number(),
    expiresAt: v.number(),
  })
  .index("by_key", ["cacheKey"])
  .index("by_location", ["state", "zipCode"])
  .index("by_expiry", ["expiresAt"]),
});