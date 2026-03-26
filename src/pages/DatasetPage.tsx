import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadScans, exportAllScansToExcel, exportScanToExcel, exportScanToPDF, type ScanRecord } from "@/lib/mock-ai";
import { useDiseases } from "@/hooks/use-agricultural-data";
import { Database, Search, Download, FileDown, FileText, Filter, Loader2, AlertTriangle, BookOpen, Bug } from "lucide-react";
import { motion } from "framer-motion";

const severityColor: Record<string, string> = {
  Low: "bg-primary/10 text-primary",
  Medium: "bg-warning/10 text-warning",
  High: "bg-destructive/10 text-destructive",
  Critical: "bg-destructive text-destructive-foreground",
};

const DatasetPage = () => {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("all");
  const [diseaseFilter, setDiseaseFilter] = useState("all");
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportingAll, setExportingAll] = useState(false);

  // Fetch Diseases for the Knowledge Base part
  const { data: diseaseKV, isLoading: isKVLoading } = useDiseases();

  useEffect(() => {
    loadScans()
      .then(data => {
        setScans(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load scans:", err);
        setError(err);
        setIsLoading(false);
      });
  }, []);

  const crops = useMemo(() => [...new Set(scans.map(s => s.crop))], [scans]);
  const diseases = useMemo(() => [...new Set(scans.map(s => s.disease))], [scans]);

  const filtered = useMemo(() => {
    return scans.filter(s => {
      if (cropFilter !== "all" && s.crop !== cropFilter) return false;
      if (diseaseFilter !== "all" && s.disease !== diseaseFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return [s.crop, s.disease, s.severity].some(f => f.toLowerCase().includes(q));
      }
      return true;
    });
  }, [scans, search, cropFilter, diseaseFilter]);

  const handleExportSingle = async (scan: ScanRecord, type: "excel" | "pdf" = "excel") => {
    setExportingId(scan.id + type);
    await new Promise(r => setTimeout(r, 400));
    if (type === "excel") exportScanToExcel(scan);
    else exportScanToPDF(scan);
    setExportingId(null);
  };

  const handleExportAll = async () => {
    setExportingAll(true);
    await new Promise(r => setTimeout(r, 600));
    exportAllScansToExcel(filtered);
    setExportingAll(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-primary">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-muted-foreground font-medium">Synchronizing with AgriScan Database...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-foreground">Failed to load dataset</h2>
        <p className="text-muted-foreground mt-2 max-w-md">There was an error connecting to the agricultural database. Please check your internet connection and Supabase configuration.</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <Tabs defaultValue="scans" className="w-full">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="font-display text-3xl font-bold text-foreground">Disease & Scan Dataset</h1>
              <p className="mt-1 text-muted-foreground">Comprehensive agricultural data and scan history</p>
            </motion.div>
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="scans" className="gap-2"><Database className="h-4 w-4" /> My Scans</TabsTrigger>
              <TabsTrigger value="knowledge" className="gap-2"><BookOpen className="h-4 w-4" /> Knowledge Base</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="scans">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <p className="text-sm text-muted-foreground">{scans.length} total scans recorded in your history</p>
                <Button variant="outline" className="gap-2 h-9" onClick={handleExportAll} disabled={exportingAll || filtered.length === 0}>
                  {exportingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Export Excel
                </Button>
              </div>

              {/* Filters */}
              <Card className="mb-6 bg-muted/30 border-none shadow-none">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search scans..." className="pl-9 bg-background" value={search} onChange={e => setSearch(e.target.value)} />
                      </div>
                    </div>
                    <div className="w-40">
                      <Select value={cropFilter} onValueChange={setCropFilter}>
                        <SelectTrigger className="bg-background"><Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Crop" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Crops</SelectItem>
                          {crops.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-48">
                      <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
                        <SelectTrigger className="bg-background"><Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Disease" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Diseases</SelectItem>
                          {diseases.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Table */}
              <Card className="border-none shadow-premium overflow-hidden">
                <div className="overflow-x-auto">
                  <TooltipProvider>
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-16">SL#</TableHead>
                          <TableHead>Crop</TableHead>
                          <TableHead>Land Area</TableHead>
                          <TableHead>Disease Detected</TableHead>
                          <TableHead>Confidence</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Yield Loss</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Report</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map(scan => (
                          <TableRow key={scan.id} className="hover:bg-muted/20 transition-colors">
                            <TableCell className="font-mono text-xs text-muted-foreground">{scan.slNo}</TableCell>
                            <TableCell className="font-semibold text-foreground">{scan.crop}</TableCell>
                            <TableCell>{scan.fieldData.acreLand} acres</TableCell>
                            <TableCell>{scan.disease}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{scan.confidence.toFixed(1)}%</span>
                                <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary" style={{ width: `${scan.confidence}%` }} />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell><Badge className={(severityColor[scan.severity] || "bg-muted text-muted-foreground") + " font-semibold"}>{scan.severity}</Badge></TableCell>
                            <TableCell className="text-destructive font-bold">{scan.yieldLoss}%</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{new Date(scan.timestamp).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10" onClick={() => handleExportSingle(scan, "excel")} disabled={exportingId === scan.id + "excel"}>
                                      {exportingId === scan.id + "excel" ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <FileDown className="h-4 w-4 text-primary" />}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Excel Report</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10" onClick={() => handleExportSingle(scan, "pdf")} disabled={exportingId === scan.id + "pdf"}>
                                      {exportingId === scan.id + "pdf" ? <Loader2 className="h-4 w-4 animate-spin text-destructive" /> : <FileText className="h-4 w-4 text-destructive" />}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>PDF Scan Report</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filtered.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-16 text-muted-foreground">
                              <div className="flex flex-col items-center gap-2">
                                <Database className="h-10 w-10 opacity-20" />
                                <p className="font-medium">No scan matches your filters.</p>
                                <p className="text-xs">Start by uploading a leaf image in the detection page.</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TooltipProvider>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="knowledge">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground">Global Disease Knowledge Base</h3>
                <p className="text-sm text-muted-foreground">Detailed encyclopedia of crop diseases, pathogens, and recommended treatments.</p>
              </div>

              {isKVLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {diseaseKV?.map((d: any) => (
                    <Card key={d.key} className="overflow-hidden hover:shadow-lg transition-all border-none shadow-sm">
                      <CardHeader className="bg-muted/30 pb-3">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline">{d.crop}</Badge>
                          <Badge className={d.is_healthy ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}>
                            {d.is_healthy ? "Healthy" : d.type}
                          </Badge>
                        </div>
                        <CardTitle className="text-base font-display flex items-center gap-2"><Bug className="h-4 w-4 text-primary" /> {d.disease}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pathogen</p>
                          <p className="text-sm italic text-foreground">{d.pathogen}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Common Symptoms</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {d.symptoms?.slice(0, 3).map((s: string) => (
                              <span key={s} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Treatment Plan</p>
                          <p className="text-xs text-foreground line-clamp-2">{d.treatment_pesticide}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DatasetPage;
