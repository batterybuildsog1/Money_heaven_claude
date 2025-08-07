/**
 * Enhanced Insurance Estimation Types
 */

export interface CountyData {
  county: string;
  state: string;
  fips: string;
  fullName: string;
}

export interface RiskFactors {
  floodZone: boolean;
  coastalCounty: boolean;
  wildfireRisk: 'low' | 'medium' | 'high';
  severeWeatherRisk: 'low' | 'medium' | 'high';
  earthquakeRisk: 'low' | 'medium' | 'high';
}

export interface EnhancedInsuranceEstimate {
  estimatedAnnual: number;
  estimatedMonthly: number;
  confidence: 'high' | 'medium' | 'low';
  source: string;
  factors: {
    baseRate: number;
    countyAdjustment: number;
    riskMultiplier: number;
    propertyMultiplier: number;
  };
  zebraUrl: string;
  county?: CountyData;
  riskAssessment?: RiskFactors;
}

export interface CensusGeocodingResponse {
  result: {
    addressMatches: Array<{
      geographies: {
        Counties: Array<{
          BASENAME: string;
          GEOID: string;
          NAME: string;
          STATE: string;
        }>;
      };
    }>;
  };
}

export interface PropertyDetails {
  yearBuilt?: number;
  constructionType?: 'frame' | 'masonry' | 'steel' | 'concrete';
  roofAge?: number;
  hasSecuritySystem?: boolean;
  hasPool?: boolean;
  distanceToFireHydrant?: 'close' | 'far';
}