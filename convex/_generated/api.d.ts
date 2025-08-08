/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as authDebug from "../authDebug.js";
import type * as crons from "../crons.js";
import type * as groq from "../groq.js";
import type * as groq_parallel from "../groq_parallel.js";
import type * as http from "../http.js";
import type * as propertyTax from "../propertyTax.js";
import type * as rates from "../rates.js";
import type * as scenarios from "../scenarios.js";
import type * as types from "../types.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authDebug: typeof authDebug;
  crons: typeof crons;
  groq: typeof groq;
  groq_parallel: typeof groq_parallel;
  http: typeof http;
  propertyTax: typeof propertyTax;
  rates: typeof rates;
  scenarios: typeof scenarios;
  types: typeof types;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
