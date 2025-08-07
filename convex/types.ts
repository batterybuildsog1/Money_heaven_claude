import { v } from "convex/values";

// Shared type definitions for scenarios
// This file provides a single source of truth for all scenario-related types

export const scenarioInputs = v.object({
  location: v.optional(v.string()),
  income: v.optional(v.number()),
  fico: v.optional(v.number()),
  downPaymentPercent: v.optional(v.number()), // Changed from downPayment to percentage
  // Legacy field for backward compatibility
  downPayment: v.optional(v.number()), // Deprecated - for migration only
  // Additional input fields
  monthlyDebts: v.optional(v.number()),
  employmentType: v.optional(v.union(
    v.literal("W2"),
    v.literal("SelfEmployed"),
    v.literal("Contract"),
    v.literal("Retired"),
    v.literal("Other")
  )),
  employmentLength: v.optional(v.number()),
  propertyType: v.optional(v.union(
    v.literal("SingleFamily"),
    v.literal("Condo"),
    v.literal("Townhouse"),
    v.literal("MultiFamily"),
    v.literal("Investment")
  )),
  loanPurpose: v.optional(v.union(
    v.literal("Purchase"),
    v.literal("Refinance"),
    v.literal("CashOut")
  )),
});

export const scenarioFactors = v.object({
  reserves: v.optional(v.number()),
  additionalIncome: v.optional(v.number()),
  excellentCreditHistory: v.optional(v.boolean()),
  stableEmployment: v.optional(v.boolean()),
  lowDebtToIncomeRatio: v.optional(v.boolean()),
  significantAssets: v.optional(v.boolean()),
});

export const scenarioResults = v.object({
  maxLoanAmount: v.optional(v.number()),
  maxHomePrice: v.optional(v.number()),
  monthlyPayment: v.optional(v.number()),
  debtToIncomeRatio: v.optional(v.number()),
  loanToValueRatio: v.optional(v.number()),
  interestRate: v.optional(v.number()),
  pmi: v.optional(v.number()),
  mip: v.optional(v.number()),
  recommendations: v.optional(v.array(v.string())),
  warnings: v.optional(v.array(v.string())),
  baseDTI: v.optional(v.number()),
  maxAllowedDTI: v.optional(v.number()),
  dtiIncrease: v.optional(v.number()),
});