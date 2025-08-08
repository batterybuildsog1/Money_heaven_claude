export type USRegion = 'Northeast' | 'Midwest' | 'South' | 'West'

const stateToRegionMap: Record<string, USRegion> = {
  // Northeast
  CT: 'Northeast', ME: 'Northeast', MA: 'Northeast', NH: 'Northeast', RI: 'Northeast', VT: 'Northeast',
  NJ: 'Northeast', NY: 'Northeast', PA: 'Northeast',
  // Midwest
  IL: 'Midwest', IN: 'Midwest', MI: 'Midwest', OH: 'Midwest', WI: 'Midwest',
  IA: 'Midwest', KS: 'Midwest', MN: 'Midwest', MO: 'Midwest', NE: 'Midwest', ND: 'Midwest', SD: 'Midwest',
  // South
  DE: 'South', FL: 'South', GA: 'South', MD: 'South', NC: 'South', SC: 'South', VA: 'South', DC: 'South',
  WV: 'South', AL: 'South', KY: 'South', MS: 'South', TN: 'South', AR: 'South', LA: 'South', OK: 'South',
  TX: 'South',
  // West
  AZ: 'West', CO: 'West', ID: 'West', MT: 'West', NV: 'West', NM: 'West', UT: 'West', WY: 'West',
  AK: 'West', CA: 'West', HI: 'West', OR: 'West', WA: 'West'
}

export function getRegionFromStateAbbr(stateAbbr?: string | null): USRegion | undefined {
  if (!stateAbbr) return undefined
  const abbr = stateAbbr.trim().toUpperCase()
  return stateToRegionMap[abbr]
}


