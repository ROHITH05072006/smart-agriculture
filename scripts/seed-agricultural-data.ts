// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parsing
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  } catch (e) {
    console.warn('.env file not found or could not be read');
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Hardcoded seed data (Original Mocks)
const cropsData = [
  { name: "Paddy (Rice)", season: "Kharif", water_need: "High", duration: "120-150 days" },
  { name: "Wheat", season: "Rabi", water_need: "Medium", duration: "100-120 days" },
  { name: "Maize", season: "Kharif/Rabi", water_need: "Medium", duration: "80-110 days" },
  { name: "Millets", season: "Kharif", water_need: "Low", duration: "70-90 days" },
  { name: "Groundnut", season: "Kharif", water_need: "Medium", duration: "100-130 days" },
  { name: "Sugarcane", season: "Year-round", water_need: "High", duration: "300-365 days" },
  { name: "Cotton", season: "Kharif", water_need: "Medium", duration: "150-180 days" },
  { name: "Soybean", season: "Kharif", water_need: "Medium", duration: "90-120 days" },
];

const pestsData = [
  { name: "Rice Stem Borer", crop: "Paddy (Rice)", symptoms: "Dead hearts in vegetative stage, white ears in reproductive stage", treatment: "Apply Chlorantraniliprole 0.4% GR at 10 kg/ha", prevention: "Use light traps, remove stubbles after harvest", severity: "High" },
  { name: "Brown Plant Hopper", crop: "Paddy (Rice)", symptoms: "Hopper burn — circular patches of dried plants", treatment: "Spray Buprofezin 25% SC at 1.6 mL/L", prevention: "Avoid excessive nitrogen, maintain field hygiene", severity: "High" },
  { name: "Leaf Folder", crop: "Paddy (Rice)", symptoms: "Folded leaves with scraping damage, white streaks", treatment: "Spray Fipronil 5% SC at 2 mL/L", prevention: "Release Trichogramma egg parasitoids", severity: "Medium" },
  { name: "Gall Midge", crop: "Paddy (Rice)", symptoms: "Silver shoot (onion-like tubular leaf)", treatment: "Apply Carbofuran 3G at 33 kg/ha", prevention: "Use resistant varieties, early planting", severity: "Medium" },
  { name: "Aphids", crop: "Wheat", symptoms: "Yellowing leaves, stunted growth, honeydew on leaves", treatment: "Spray Imidacloprid 17.8 SL at 0.3 mL/L", prevention: "Encourage natural predators like ladybugs", severity: "Medium" },
  { name: "Fall Armyworm", crop: "Maize", symptoms: "Ragged feeding on leaves, frass in whorl", treatment: "Spray Emamectin Benzoate 5% SG at 0.4 g/L", prevention: "Early sowing, intercropping with legumes", severity: "High" },
  { name: "Bollworm", crop: "Cotton", symptoms: "Bore holes in bolls, damaged squares and flowers", treatment: "Spray Profenofos 50% EC at 2 mL/L", prevention: "Use Bt cotton, install pheromone traps", severity: "High" },
  { name: "Pod Borer", crop: "Soybean", symptoms: "Holes in pods, caterpillars feeding on seeds", treatment: "Spray Quinalphos 25% EC at 2 mL/L", prevention: "Use HNPV biocontrol, trap crops", severity: "Medium" },
];

const pricesData = [
  { crop: "Paddy (Rice)", price: 2100, unit: "₹/quintal", change: 2.3, market: "APMC Hyderabad", date: new Date().toISOString().split('T')[0] },
  { crop: "Wheat", price: 2275, unit: "₹/quintal", change: -0.8, market: "APMC Delhi", date: new Date().toISOString().split('T')[0] },
  { crop: "Maize", price: 1800, unit: "₹/quintal", change: 1.5, market: "APMC Bangalore", date: new Date().toISOString().split('T')[0] },
  { crop: "Soybean", price: 4200, unit: "₹/quintal", change: 3.1, market: "APMC Indore", date: new Date().toISOString().split('T')[0] },
  { crop: "Cotton", price: 6500, unit: "₹/quintal", change: -1.2, market: "APMC Nagpur", date: new Date().toISOString().split('T')[0] },
  { crop: "Groundnut", price: 5800, unit: "₹/quintal", change: 0.5, market: "APMC Rajkot", date: new Date().toISOString().split('T')[0] },
  { crop: "Sugarcane", price: 315, unit: "₹/quintal", change: 0.0, market: "Sugar Mill Rate", date: new Date().toISOString().split('T')[0] },
  { crop: "Millets (Ragi)", price: 3578, unit: "₹/quintal", change: 4.2, market: "APMC Hassan", date: new Date().toISOString().split('T')[0] },
  { crop: "Tomato", price: 1200, unit: "₹/quintal", change: -12.5, market: "APMC Kolar", date: new Date().toISOString().split('T')[0] },
  { crop: "Onion", price: 2300, unit: "₹/quintal", change: 8.4, market: "APMC Lasalgaon", date: new Date().toISOString().split('T')[0] },
  { crop: "Potato", price: 1650, unit: "₹/quintal", change: 2.1, market: "APMC Agra", date: new Date().toISOString().split('T')[0] },
];

// 4. Disease Knowledge Base
const diseaseData = [
  // Tomato
  { key: "tomato_healthy", crop: "Tomato", disease: "Healthy", is_healthy: true, pathogen: "None", type: "Healthy", symptoms: ["No visible symptoms", "Uniform green leaves", "Normal growth pattern"], affected_parts: [], favorable_conditions: ["Balanced nutrition", "Proper irrigation", "Good airflow"], base_severity_weight: 0, yield_loss_min: 0, yield_loss_max: 0, treatment_pesticide: "None required", treatment_organic: "None required", treatment_steps: ["Continue regular monitoring", "Maintain current care routine", "Scout weekly for early signs"], treatment_prevention: ["Crop rotation", "Balanced fertilization", "Proper spacing", "Clean cultivation tools"], treatment_fertilizer: "Standard NPK as per soil test", leaf_colors: ["Healthy Green"], spot_types: ["None"], leaf_textures: ["Normal"], leaf_edges: ["Normal"] },
  { key: "tomato_early_blight", crop: "Tomato", disease: "Early Blight", is_healthy: false, pathogen: "Alternaria solani", type: "Fungal", symptoms: ["Dark brown concentric rings on lower leaves", "Yellowing around lesions", "Leaves wither and drop prematurely"], affected_parts: ["Leaves", "Stems", "Fruit"], favorable_conditions: ["Warm humid weather", "Heavy dew or rain"], base_severity_weight: 2, yield_loss_min: 20, yield_loss_max: 50, treatment_pesticide: "Chlorothalonil 75% WP", treatment_organic: "Copper-based fungicide", treatment_steps: ["Remove infected leaves", "Spray fungicide every 7-10 days"], treatment_prevention: ["Use resistant varieties", "Crop rotation"], treatment_fertilizer: "Balanced NPK + Calcium", leaf_colors: ["Brown", "Yellow"], spot_types: ["Brown Spots"], leaf_textures: ["Dry"], leaf_edges: ["Damaged"] },
  { key: "tomato_late_blight", crop: "Tomato", disease: "Late Blight", is_healthy: false, pathogen: "Phytophthora infestans", type: "Fungal", symptoms: ["Water-soaked dark lesions", "White fuzzy mold", "Rapid collapse of foliage"], affected_parts: ["Leaves", "Stems", "Fruit"], favorable_conditions: ["Cool wet weather", "High humidity"], base_severity_weight: 4, yield_loss_min: 40, yield_loss_max: 100, treatment_pesticide: "Metalaxyl-M + Mancozeb", treatment_organic: "Copper hydroxide spray", treatment_steps: ["Remove infected parts IMMEDIATELY", "Spray fungicide every 5-7 days"], treatment_prevention: ["Plant resistant varieties", "Avoid overhead irrigation"], treatment_fertilizer: "Phosphorus-rich fertilizer", leaf_colors: ["Brown", "Mixed"], spot_types: ["Black Spots", "Brown Spots"], leaf_textures: ["Curled"], leaf_edges: ["Damaged", "Burnt"] },
  // Rice
  { key: "rice_healthy", crop: "Rice", disease: "Healthy", is_healthy: true, pathogen: "None", type: "Healthy", symptoms: ["No visible symptoms", "Uniform green canopy"], affected_parts: [], favorable_conditions: ["Balanced nutrition", "Proper water management"], base_severity_weight: 0, yield_loss_min: 0, yield_loss_max: 0, treatment_pesticide: "None required", treatment_organic: "None required", treatment_steps: ["Continue monitoring"], treatment_prevention: ["Balanced fertilization", "Crop rotation"], treatment_fertilizer: "Standard NPK", leaf_colors: ["Healthy Green"], spot_types: ["None"], leaf_textures: ["Normal"], leaf_edges: ["Normal"] },
  { key: "rice_blast", crop: "Rice", disease: "Rice Blast", is_healthy: false, pathogen: "Magnaporthe oryzae", type: "Fungal", symptoms: ["Diamond-shaped lesions", "Neck rot", "Whitehead"], affected_parts: ["Leaves", "Neck", "Nodes"], favorable_conditions: ["High humidity", "Temp 25-28C"], base_severity_weight: 3, yield_loss_min: 20, yield_loss_max: 70, treatment_pesticide: "Tricyclazole 75% WP", treatment_organic: "Pseudomonas fluorescens", treatment_steps: ["Spray Tricyclazole", "Drain standing water"], treatment_prevention: ["Use resistant varieties", "Avoid excessive nitrogen"], treatment_fertilizer: "Potassium Chloride + Silicon", leaf_colors: ["Brown", "Mixed"], spot_types: ["Black Spots", "Brown Spots"], leaf_textures: ["Dry"], leaf_edges: ["Damaged"] },
  // Wheat
  { key: "wheat_stripe_rust", crop: "Wheat", disease: "Stripe Rust", is_healthy: false, pathogen: "Puccinia striiformis", type: "Fungal", symptoms: ["Yellow-orange pustules in stripes", "Leaves turn yellow"], affected_parts: ["Leaves", "Heads"], favorable_conditions: ["Cool temperatures", "Dew or light rain"], base_severity_weight: 3, yield_loss_min: 20, yield_loss_max: 70, treatment_pesticide: "Propiconazole", treatment_organic: "Sulfur dust", treatment_steps: ["Apply Propiconazole", "Ensure thorough coverage"], treatment_prevention: ["Plant resistant varieties", "Balanced nitrogen"], treatment_fertilizer: "Balanced NPK", leaf_colors: ["Yellow", "Mixed"], spot_types: ["Brown Spots"], leaf_textures: ["Dry"], leaf_edges: ["Damaged"] },
  // Corn
  { key: "corn_common_rust", crop: "Corn", disease: "Common Rust", is_healthy: false, pathogen: "Puccinia sorghi", type: "Fungal", symptoms: ["Small reddish-brown pustules", "Chlorosis around pustules"], affected_parts: ["Leaves", "Leaf sheaths"], favorable_conditions: ["Cool to moderate temps", "High humidity"], base_severity_weight: 2, yield_loss_min: 10, yield_loss_max: 40, treatment_pesticide: "Propiconazole", treatment_organic: "Sulfur-based fungicide", treatment_steps: ["Apply foliar fungicide", "Focus on lower canopy"], treatment_prevention: ["Plant resistant hybrids", "Avoid late planting"], treatment_fertilizer: "Potassium Chloride", leaf_colors: ["Brown", "Mixed"], spot_types: ["Brown Spots"], leaf_textures: ["Dry"], leaf_edges: ["Damaged"] },
  // Sugarcane
  { key: "sugarcane_red_rot", crop: "Sugarcane", disease: "Red Rot", is_healthy: false, pathogen: "Colletotrichum falcatum", type: "Fungal", symptoms: ["Reddening of internal tissue", "Crown wilting", "Sour alcoholic smell"], affected_parts: ["Stalks", "Leaves"], favorable_conditions: ["High humidity", "Waterlogging"], base_severity_weight: 3, yield_loss_min: 25, yield_loss_max: 70, treatment_pesticide: "Carbendazim 50% WP", treatment_organic: "Trichoderma viride", treatment_steps: ["Treat setts before planting", "Remove infected canes"], treatment_prevention: ["Use healthy setts", "Hot water treatment"], treatment_fertilizer: "NPK + Zinc", leaf_colors: ["Yellow", "Brown"], spot_types: ["Brown Spots"], leaf_textures: ["Dry"], leaf_edges: ["Burnt"] },
];

async function seedData() {
  console.log('Starting standalone seed process...');

  try {
    // 1. Seed Crops
    const { error: cropError } = await supabase.from('crops').upsert(cropsData, { onConflict: 'name' });
    if (cropError) console.error('Error seeding crops:', cropError);
    else console.log('Crops seeded successfully!');

    // 2. Seed Pests
    // Note: We use unique name+crop for pests if possible, or just upsert and rely on manual cleanup if script is run many times.
    const { error: pestError } = await supabase.from('pests').upsert(pestsData);
    if (pestError) console.error('Error seeding pests:', pestError);
    else console.log('Pests seeded successfully!');

    // 3. Seed Market Prices
    const { error: priceError } = await supabase.from('market_prices').upsert(pricesData);
    if (priceError) console.error('Error seeding market prices:', priceError);
    else console.log('Market prices seeded successfully!');

    // 4. Seed Diseases
    const { error: diseaseError } = await supabase.from('diseases').upsert(diseaseData, { onConflict: 'key' });
    if (diseaseError) console.error('Error seeding diseases:', diseaseError);
    else console.log('Diseases seeded successfully!');

    console.log('Seed process completed.');
  } catch (err) {
    console.error('Unexpected error during seeding:', err);
  }
}

seedData();
