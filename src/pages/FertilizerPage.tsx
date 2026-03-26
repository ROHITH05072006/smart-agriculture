import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Leaf, MapPin, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { recommendFertilizer, FertilizerRec } from "@/lib/farmer-data";
import { useLanguage } from "@/lib/language-context";
import { fetchSoilData, convertToKgHa } from "@/lib/soil-service";
import { toast } from "sonner";

const FertilizerPage = () => {
  const { t } = useLanguage();
  const [crop, setCrop] = useState("Rice");
  const [stage, setStage] = useState("sowing");
  const [soilN, setSoilN] = useState("40");
  const [soilP, setSoilP] = useState("20");
  const [soilK, setSoilK] = useState("20");
  const [soilPH, setSoilPH] = useState("6.5");
  const [results, setResults] = useState<FertilizerRec[] | null>(null);
  const [isFetchingSoil, setIsFetchingSoil] = useState(false);

  const handleFetchSoil = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsFetchingSoil(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await fetchSoilData(latitude, longitude);
          
          setSoilN(convertToKgHa(data.nitrogen).toString());
          setSoilPH(data.ph.toFixed(1));
          
          toast.success("Soil data synchronized from SoilGrids!", {
            description: `Location: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
            icon: <Sparkles className="h-4 w-4 text-primary" />,
          });
        } catch (err) {
          toast.error("Failed to fetch soil data from global database");
        } finally {
          setIsFetchingSoil(false);
        }
      },
      (error) => {
        toast.error("Geolocation access denied. Please enter soil values manually.");
        setIsFetchingSoil(false);
      }
    );
  };

  const calculate = () => {
    setResults(recommendFertilizer(crop, stage, +soilN, +soilP, +soilK));
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground">🧪 {t("fertilizer")}</h1>
          <p className="mt-1 text-muted-foreground">Get precision fertilizer recommendations based on real-time soil data</p>
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="border-none shadow-premium overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-base">Input Parameters</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1.5 text-xs font-semibold"
                  onClick={handleFetchSoil}
                  disabled={isFetchingSoil}
                >
                  {isFetchingSoil ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <MapPin className="h-3 w-3" />
                  )}
                  Auto-fetch Soil
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t("cropName")}</label>
                <Select value={crop} onValueChange={setCrop}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Rice", "Wheat", "Maize", "Cotton", "Soybean", "Groundnut"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Growth Stage</label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sowing">Sowing / Basal</SelectItem>
                    <SelectItem value="vegetative">Vegetative</SelectItem>
                    <SelectItem value="flowering">Flowering</SelectItem>
                    <SelectItem value="maturity">Maturity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Soil N (kg/ha)</label>
                  <Input type="number" className="bg-background h-9" value={soilN} onChange={e => setSoilN(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Soil pH</label>
                  <Input type="number" className="bg-background h-9" value={soilPH} step="0.1" onChange={e => setSoilPH(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Soil P (kg/ha)</label>
                  <Input type="number" className="bg-background h-9" value={soilP} onChange={e => setSoilP(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Soil K (kg/ha)</label>
                  <Input type="number" className="bg-background h-9" value={soilK} onChange={e => setSoilK(e.target.value)} />
                </div>
              </div>

              <Button onClick={calculate} className="w-full gap-2 mt-2 h-10 shadow-lg shadow-primary/20"><FlaskConical className="h-4 w-4" />Calculate Advice</Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {isFetchingSoil && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-12 bg-muted/20 rounded-xl border border-dashed border-primary/30">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-sm font-medium text-foreground">Querying Global Soil Database...</p>
                <p className="text-xs text-muted-foreground mt-1">Analyzing Nitrogen, pH, and Carbon content for your location</p>
              </motion.div>
            )}

            {!isFetchingSoil && results && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4 mb-2">
                <Card className="bg-primary/5 border-primary/10">
                  <CardContent className="p-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Soil pH</span>
                    <Badge variant="outline" className="font-mono text-primary border-primary/20">{soilPH}</Badge>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/10">
                  <CardContent className="p-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Org. Carbon</span>
                    <Badge variant="outline" className="font-mono text-primary border-primary/20">Optimal</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {results ? results.map((rec, i) => (
              <motion.div key={rec.nutrient} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Leaf className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-display font-bold text-foreground">{rec.nutrient}</p>
                          <p className="text-sm text-muted-foreground">{rec.type}</p>
                        </div>
                      </div>
                      <Badge variant="default" className="text-lg font-bold">{rec.amount}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground"><strong>Timing:</strong> {rec.timing}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )) : (
              <div className="flex items-center justify-center rounded-lg border border-dashed p-20 text-muted-foreground">
                <FlaskConical className="h-8 w-8 mr-3" /> Enter soil nutrient levels to get recommendations
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FertilizerPage;
