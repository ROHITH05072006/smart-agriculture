export interface CropRecommendation {
  crop: string;
  score: number;
  season: string;
  waterNeed: string;
  duration: string;
}

export interface DiseaseEntry {
  key: string;
  crop: string;
  disease: string;
  isHealthy: boolean;
  pathogen: string;
  type: string;
  symptoms: string[];
  affectedParts: string[];
  favorableConditions: string[];
  baseSeverityWeight: number;
  yieldLossRange: [number, number];
  treatment: {
    pesticide: string;
    organicAlternative: string;
    steps: string[];
    prevention: string[];
    fertilizer: string;
  };
  visualCues: {
    leafColors: string[];
    spotTypes: string[];
    leafTextures: string[];
    leafEdges: string[];
  };
}

export interface MarketPrice {
  crop: string;
  price: number;
  unit: string;
  change: number;
  market: string;
  date: string;
}

export interface PestEntry {
  name: string;
  crop: string;
  symptoms: string;
  treatment: string;
  prevention: string;
  severity: "Low" | "Medium" | "High";
}

export interface YieldPrediction {
  expectedYieldPerAcre: number;
  totalExpectedYield: number;
  lossPercentage: number;
  yieldLostPerAcre: number;
  totalYieldLost: number;
  remainingYield: number;
  affectedAcres: number;
  estimatedRevenueLoss: number;
  pricePerTon: number;
  unit: string;
}

export interface WeatherRiskFactor {
  factor: string;
  risk: "Low" | "Medium" | "High";
  description: string;
}
