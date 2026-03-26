import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bug, Search, Info, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePests, useCrops } from "@/hooks/use-agricultural-data";
import { useLanguage } from "@/lib/language-context";
import { Skeleton } from "@/components/ui/skeleton";

const severityColor: Record<string, string> = {
  Low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  High: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const PestMonitorPage = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("all");

  // Fetch only the pests for the selected crop (Server-side filtering)
  const { data: pests, isLoading } = usePests(cropFilter === "all" ? undefined : cropFilter);
  const { data: cropsData } = useCrops();

  const crops = useMemo(() => {
    if (!cropsData) return [];
    return [...new Set(cropsData.map(c => c.name))];
  }, [cropsData]);

  const filtered = useMemo(() => {
    if (!pests) return [];
    const term = search.toLowerCase();
    return pests.filter(p => 
      !term || 
      p.name.toLowerCase().includes(term) || 
      p.symptoms.toLowerCase().includes(term)
    );
  }, [pests, search]);

  return (
    <div className="p-6 lg:p-10 text-left">
      <div className="mx-auto max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex gap-4 items-start shadow-sm mb-8"
        >
          <div className="bg-primary/10 p-2 rounded-lg mt-1">
            <Info className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              How to Use Pest Monitor
            </h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Select your crop from the dropdown to focus on specific pests. Use the search bar to find symptoms (e.g., "yellowing") or pest names. Each card provides actionable treatment and prevention steps to protect your yield.
            </p>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-3 items-center justify-between mb-8">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or symptoms..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-9 h-11 bg-background border-muted-foreground/20 focus:border-primary transition-colors text-base" 
            />
          </div>
          <Select value={cropFilter} onValueChange={setCropFilter}>
            <SelectTrigger className="w-[200px] h-11 bg-background border-muted-foreground/20">
              <SelectValue placeholder="Filter by Crop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Crops</SelectItem>
              {crops.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((pest) => (
                <motion.div 
                  key={pest.name} 
                  layout
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full border border-muted-foreground/10 hover:border-primary/30 transition-all shadow-sm hover:shadow-md overflow-hidden group bg-card">
                    <CardHeader className="pb-3 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-display text-base flex items-center gap-2 text-foreground font-bold">
                          <Bug className="h-4 w-4 text-rose-500 group-hover:rotate-12 transition-transform" /> {pest.name}
                        </CardTitle>
                        <Badge variant="outline" className={`${severityColor[pest.severity]} border px-2 py-0.5 text-[10px] font-bold uppercase`}>
                          {pest.severity} Impact
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="w-fit mt-2 text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-none">
                        {pest.crop}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-5 text-[13.5px]">
                      <div className="space-y-1.5">
                        <p className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground">Identifying Symptoms</p>
                        <p className="text-foreground/80 leading-relaxed font-medium">{pest.symptoms}</p>
                      </div>
                      
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 group-hover:bg-primary/10 transition-colors">
                        <p className="font-bold text-primary flex items-center gap-1.5 mb-2 text-[11px] uppercase tracking-widest">
                          <HelpCircle className="h-3.5 w-3.5" /> Recommended Treatment
                        </p>
                        <p className="text-foreground/90 leading-relaxed font-semibold">{pest.treatment}</p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-muted/50">
                        <p className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground">Prevention Strategy</p>
                        <p className="text-muted-foreground leading-relaxed">{pest.prevention}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          {!isLoading && filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-24 text-center bg-muted/10 rounded-3xl border-2 border-dashed border-muted">
              <Bug className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-semibold text-lg">No pests match your search</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your filters or search terms</p>
              <Button variant="outline" size="sm" onClick={() => {setSearch(""); setCropFilter("all")}} className="mt-6 border-primary/20 text-primary hover:bg-primary/5">
                Clear all filters
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PestMonitorPage;
