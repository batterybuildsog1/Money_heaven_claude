import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { scenarioInputs, scenarioFactors, scenarioResults } from "./types";

// Helper function to migrate old scenarios with dollar-based down payments
function migrateScenarioData(scenario: any) {
  if (!scenario) return scenario;
  
  // Check if we have old format (downPayment in dollars) but not new format
  if (scenario.inputs?.downPayment && !scenario.inputs?.downPaymentPercent) {
    // Try to estimate the percentage if we have home price in results
    if (scenario.results?.maxHomePrice && scenario.results.maxHomePrice > 0) {
      // Calculate percentage from dollar amount and home price
      const percentage = (scenario.inputs.downPayment / scenario.results.maxHomePrice) * 100;
      scenario.inputs.downPaymentPercent = Math.round(percentage * 10) / 10; // Round to 1 decimal
    } else {
      // Fallback: assume it was meant to be the minimum FHA down payment
      // or try to estimate based on typical loan amounts
      if (scenario.inputs.downPayment < 100) {
        // Likely already a percentage
        scenario.inputs.downPaymentPercent = scenario.inputs.downPayment;
      } else if (scenario.inputs.downPayment < 50000) {
        // Likely a dollar amount, assume 3.5% was intended
        scenario.inputs.downPaymentPercent = 3.5;
      } else {
        // Large amount, assume 20% was intended
        scenario.inputs.downPaymentPercent = 20;
      }
    }
  }
  
  return scenario;
}

export const create = mutation({
  args: {
    inputs: scenarioInputs,
    compensatingFactors: v.optional(scenarioFactors),
    results: v.optional(scenarioResults),
    name: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    
    return await ctx.db.insert("scenarios", {
      userId: identity.subject,
      inputs: args.inputs,
      compensatingFactors: args.compensatingFactors,
      results: args.results,
      name: args.name,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("scenarios"),
    inputs: v.optional(scenarioInputs),
    compensatingFactors: v.optional(scenarioFactors),
    results: v.optional(scenarioResults),
    name: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const scenario = await ctx.db.get(args.id);
    if (!scenario || scenario.userId !== identity.subject) {
      throw new Error("Scenario not found or access denied");
    }

    const updateData: {
      updatedAt: number;
      inputs?: typeof args.inputs;
      compensatingFactors?: typeof args.compensatingFactors;
      results?: typeof args.results;
      name?: string;
      notes?: string;
    } = {
      updatedAt: Date.now(),
    };

    if (args.inputs !== undefined) updateData.inputs = args.inputs;
    if (args.compensatingFactors !== undefined) updateData.compensatingFactors = args.compensatingFactors;
    if (args.results !== undefined) updateData.results = args.results;
    if (args.name !== undefined) updateData.name = args.name;
    if (args.notes !== undefined) updateData.notes = args.notes;

    return await ctx.db.patch(args.id, updateData);
  },
});

export const remove = mutation({
  args: { id: v.id("scenarios") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const scenario = await ctx.db.get(args.id);
    if (!scenario || scenario.userId !== identity.subject) {
      throw new Error("Scenario not found or access denied");
    }

    return await ctx.db.delete(args.id);
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const scenarios = await ctx.db
      .query("scenarios")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
    
    // Migrate old data format for all scenarios
    return scenarios.map(migrateScenarioData);
  },
});

export const get = query({
  args: { id: v.id("scenarios") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const scenario = await ctx.db.get(args.id);
    if (!scenario || scenario.userId !== identity.subject) {
      return null;
    }

    // Migrate old data format if needed
    return migrateScenarioData(scenario);
  },
});