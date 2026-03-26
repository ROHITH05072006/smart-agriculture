/**
 * SoilGrids API Service
 * Fetches global gridded soil information from ISRIC.
 * Reference: https://rest.isric.org/soilgrids/v2.0/docs
 */

const BASE_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query";

export interface SoilData {
  nitrogen: number; // cg/kg
  ph: number;       // pH units
  soc: number;      // dg/kg (Soil Organic Carbon)
  lat: number;
  lon: number;
}

export async function fetchSoilData(lat: number, lon: number): Promise<SoilData> {
  const url = `${BASE_URL}?lon=${lon}&lat=${lat}&property=nitrogen&property=phh2o&property=soc&depth=0-5cm&value=mean`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SoilGrids API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract mean values from the complex SoilGrids JSON structure
    const getVal = (prop: string) => {
      const p = data.properties.layers.find((l: any) => l.name === prop);
      return p?.depths[0]?.values?.mean ?? 0;
    };

    const nitrogen = getVal("nitrogen"); // cg/kg
    const phRaw = getVal("phh2o");       // pH * 10
    const soc = getVal("soc");           // dg/kg

    return {
      nitrogen,
      ph: phRaw / 10,
      soc,
      lat,
      lon
    };
  } catch (error) {
    console.error("Failed to fetch from SoilGrids:", error);
    throw error;
  }
}

/**
 * Heuristic to convert SoilGrids units to farmer-friendly units (kg/ha)
 * This is a rough estimation for the top 15cm of soil.
 */
export function convertToKgHa(cgPerKg: number): number {
  // 1 cg/kg = 10 mg/kg (ppm)
  // 1 ppm is roughly 2 kg/ha for 15cm depth
  return Math.round(cgPerKg * 0.2) * 10; // Simplified estimation
}
