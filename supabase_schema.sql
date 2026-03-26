-- 1. Crops Table
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    season TEXT,
    water_need TEXT,
    duration TEXT,
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- 2. Pests Table
CREATE TABLE IF NOT EXISTS public.pests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    crop TEXT NOT NULL,
    symptoms TEXT,
    treatment TEXT,
    prevention TEXT,
    severity TEXT,
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- 3. Diseases Table
CREATE TABLE IF NOT EXISTS public.diseases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    crop TEXT NOT NULL,
    disease TEXT NOT NULL,
    is_healthy BOOLEAN,
    pathogen TEXT,
    type TEXT,
    symptoms TEXT[],
    affected_parts TEXT[],
    favorable_conditions TEXT[],
    base_severity_weight INT,
    yield_loss_min INT,
    yield_loss_max INT,
    treatment_pesticide TEXT,
    treatment_organic TEXT,
    treatment_steps TEXT[],
    treatment_prevention TEXT[],
    treatment_fertilizer TEXT,
    leaf_colors TEXT[],
    spot_types TEXT[],
    leaf_textures TEXT[],
    leaf_edges TEXT[],
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- 4. Market Prices Table
CREATE TABLE IF NOT EXISTS public.market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop TEXT NOT NULL UNIQUE,
    price DECIMAL(10,2),
    unit TEXT,
    change FLOAT,
    market TEXT,
    date TEXT,
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- 5. Scans Table (History)
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT,
    prediction TEXT,
    confidence FLOAT,
    location JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (Row Level Security) - Optional but recommended
-- ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
-- Add policies as needed for your application security model
