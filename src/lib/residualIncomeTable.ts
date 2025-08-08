import type { USRegion } from './regions'

// Conservative residual income thresholds by region and household size (1–8+)
// Values are an approximation based on VA residual guidance and rounded for clarity.
// Unit scope: 1–2 units only.
export const RESIDUAL_INCOME_TABLE: Record<USRegion, number[]> = {
  Northeast: [
    500, 850, 1000, 1150, 1250, 1350, 1450, 1550 // 1..8+
  ],
  Midwest: [
    450, 800, 950, 1100, 1200, 1300, 1400, 1500
  ],
  South: [
    440, 780, 920, 1070, 1170, 1270, 1370, 1470
  ],
  West: [
    520, 900, 1050, 1200, 1300, 1400, 1500, 1600
  ]
}

export function getResidualIncomeThreshold(region: USRegion, householdSize: number): number {
  const size = Math.max(1, Math.min(8, Math.floor(householdSize || 1)))
  const arr = RESIDUAL_INCOME_TABLE[region]
  const value = arr[size - 1]
  return Math.round(value)
}


