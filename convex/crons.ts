/**
 * Scheduled Functions (Cron Jobs)
 * 
 * This file defines scheduled tasks that run periodically.
 * Following Convex patterns for scheduled functions.
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Clean up expired property tax cache entries
 * Runs daily at 3 AM ET (8 AM UTC)
 * 
 * This helps maintain database size by removing expired cache entries
 * that are no longer valid. The cache has built-in expiration times:
 * - Property tax rates: 12 months
 * - Exemption rules: 6 months
 */
crons.daily(
  "cleanup expired property tax cache",
  { 
    hourUTC: 8, // 3 AM ET = 8 AM UTC (adjust for DST as needed)
    minuteUTC: 0 
  },
  internal.propertyTax.cleanupExpiredEntries,
);

/**

* Update mortgage rates daily
 * Runs daily at 10 PM UTC (5 PM ET / 2 PM PT)
 * 
 * Uses web scraping from MortgageNewsDaily with xAI fallback
 */
crons.daily(
  "update mortgage rates",
  { hourUTC: 22, minuteUTC: 0 }, // 5 PM ET
  internal.rates.updateRateWithScraping,
);

export default crons;