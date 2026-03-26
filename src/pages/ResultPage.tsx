import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type ScanRecord, exportScanToExcel, exportScanToPDF } from "@/lib/mock-ai";
import {
  ArrowLeft, Download, Bug, Leaf, Pill, Sprout, ShieldCheck, Eye,
  FileSpreadsheet, Loader2, ClipboardList, AlertTriangle, CloudRain,
  Microscope, Beaker, TrendingDown, TriangleAlert, ShoppingBag,
  IndianRupee, BarChart3, Wheat, FileText,
} from "lucide-react";
import { motion } from "framer-motion";

const severityColor: Record<string, string> = {
  Low: "bg-primary/10 text-primary",
  Medium: "bg-yellow-500/10 text-yellow-600",
  High: "bg-orange-500/10 text-orange-600",
  Critical: "bg-destructive text-destructive-foreground",
};

const riskBadgeColor: Record<string, string> = {
  Low: "bg-primary/10 text-primary",
  Medium: "bg-yellow-500/10 text-yellow-600",
  High: "bg-destructive/10 text-destructive",
};

const ResultPage = () => {
  const [result, setResult] = useState<ScanRecord | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const data = sessionStorage.getItem("scanResult");
    if (data) { setResult(JSON.parse(data)); } else { navigate("/upload"); }
  }, [navigate]);

  const handleExport = async () => {
    if (!result) return;
    setExporting(true);
    await new Promise(r => setTimeout(r, 500));
    exportScanToExcel(result);
    setExporting(false);
  };

  const handleExportPdf = async () => {
    if (!result) return;
    setExportingPdf(true);
    await new Promise(r => setTimeout(r, 500));
    exportScanToPDF(result);
    setExportingPdf(false);
  };

  if (!result) return null;

  const yp = result.yieldPrediction;

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/upload")}><ArrowLeft className="h-5 w-5" /></Button>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">Scan Results</h1>
                <p className="text-sm text-muted-foreground">SL #{result.slNo} — {new Date(result.timestamp).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={handleExport} disabled={exporting}>
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Excel
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleExportPdf} disabled={exportingPdf}>
                {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                Report
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Low Confidence Warning */}
        {result.isLowConfidence && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}>
            <Card className="mb-6 border-yellow-500/40 bg-yellow-500/10">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display font-bold text-foreground text-sm">⚠️ Low Confidence Detection ({result.confidence.toFixed(1)}%)</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Model uncertain. Please upload a clearer image with good lighting and close-up of the affected leaf.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Report Summary Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="font-display flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" /> Report Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Crop", value: result.crop },
                  { label: "Disease", value: result.disease },
                  { label: "Confidence", value: `${result.confidence.toFixed(1)}%` },
                  { label: "Severity", value: result.severity },
                  { label: "Yield Loss %", value: `${result.yieldLoss}%` },
                  { label: "Pathogen", value: result.diseaseInfo?.pathogen || "N/A" },
                  { label: "Disease Type", value: result.diseaseInfo?.type || "N/A" },
                  { label: "Land Area", value: `${result.fieldData.acreLand} acres` },
                ].map(item => (
                  <div key={item.label} className="rounded-lg bg-background p-3 border">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-semibold text-sm text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="gap-2" onClick={handleExport} disabled={exporting}>
                  <FileSpreadsheet className="h-4 w-4" /> Download Excel Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ─── LEFT COLUMN ─── */}
          <div className="space-y-6">
            {/* Scanned Image */}
            {result.imageUrl && (
              <Card>
                <CardContent className="p-4">
                  <img src={result.imageUrl} alt="Scanned leaf" className="w-full rounded-lg max-h-64 object-contain bg-muted/30" />
                </CardContent>
              </Card>
            )}

            {/* Disease Detection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display flex items-center gap-2"><Bug className="h-5 w-5 text-primary" /> Disease Detection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Crop", value: result.crop },
                  { label: "Disease", value: result.disease },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{r.label}</span>
                    <span className="font-semibold text-foreground">{r.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Confidence</span>
                  <span className={`font-semibold ${result.isLowConfidence ? "text-yellow-600" : "text-primary"}`}>
                    {result.confidence.toFixed(1)}%
                    {result.isLowConfidence && " ⚠️"}
                  </span>
                </div>
                <Progress value={result.confidence} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Severity</span>
                  <Badge className={severityColor[result.severity]}>{result.severity}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Pathogen & Disease Info */}
            {result.diseaseInfo && !result.diseaseInfo.pathogen?.includes("None") && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-display flex items-center gap-2"><Microscope className="h-5 w-5 text-primary" /> Disease Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Pathogen</p>
                      <p className="font-semibold text-sm text-foreground italic">{result.diseaseInfo.pathogen}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="font-semibold text-sm text-foreground">{result.diseaseInfo.type}</p>
                    </div>
                  </div>
                  {result.diseaseInfo.symptoms.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Symptoms</p>
                      <ul className="space-y-1.5">
                        {result.diseaseInfo.symptoms.map((s, i) => (
                          <li key={i} className="flex gap-2 text-sm text-foreground">
                            <span className="text-primary mt-0.5">•</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.diseaseInfo.affectedParts.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Affected Parts</p>
                      <div className="flex flex-wrap gap-2">
                        {result.diseaseInfo.affectedParts.map((part, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{part}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Field Observations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display flex items-center gap-2"><Eye className="h-5 w-5 text-primary" /> Field Observations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Leaf Edge", value: result.fieldData.leafEdge },
                    { label: "Leaf Color", value: result.fieldData.leafColor },
                    { label: "Spots", value: result.fieldData.leafSpots },
                    { label: "Texture", value: result.fieldData.leafTexture },
                    { label: "Plant Age", value: `${result.fieldData.plantAge} days` },
                    { label: "Acre Land", value: `${result.fieldData.acreLand} acres` },
                  ].map(s => (
                    <div key={s.label} className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="font-semibold text-sm text-foreground">{s.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div className="space-y-6">
            {/* Treatment Plan */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display flex items-center gap-2"><Pill className="h-5 w-5 text-primary" /> Treatment Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recommended Pesticide</p>
                  <p className="mt-1 font-semibold text-foreground">{result.treatment.pesticide}</p>
                </div>
                {result.treatment.organicAlternative && result.treatment.organicAlternative !== "None required" && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Beaker className="h-3 w-3" /> Organic Alternative
                    </p>
                    <p className="mt-1 font-semibold text-foreground">{result.treatment.organicAlternative}</p>
                  </div>
                )}
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recommended Fertilizer</p>
                  <p className="mt-1 font-semibold text-foreground">{result.treatment.fertilizer}</p>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Steps */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display flex items-center gap-2"><Sprout className="h-5 w-5 text-primary" /> Treatment Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {result.treatment.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{i + 1}</span>
                      <span className="text-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Product Suggestions */}
            {result.productSuggestions && result.productSuggestions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-display flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-primary" /> Product Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.productSuggestions.map((prod, i) => (
                    <div key={i} className="rounded-lg border p-3 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-foreground">{prod.name}</span>
                        <Badge variant="outline" className="text-xs">{prod.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground"><strong>Dosage:</strong> {prod.dosage}</p>
                      <p className="text-xs text-muted-foreground"><strong>Application:</strong> {prod.applicationMethod}</p>
                      <p className="text-xs font-medium text-primary"><strong>Est. Cost:</strong> {prod.estimatedCost}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Prevention Tips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Prevention Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.treatment.prevention.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground">
                      <Leaf className="h-4 w-4 shrink-0 text-primary mt-0.5" />{tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weather Risk Factors */}
            {result.weatherRiskFactors && result.weatherRiskFactors.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-display flex items-center gap-2"><CloudRain className="h-5 w-5 text-primary" /> Weather Risk Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.weatherRiskFactors.map((wrf, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                        <TriangleAlert className={`h-4 w-4 shrink-0 mt-0.5 ${wrf.risk === "High" ? "text-destructive" : "text-yellow-600"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm text-foreground">{wrf.factor}</span>
                            <Badge className={riskBadgeColor[wrf.risk] + " text-xs"}>{wrf.risk} Risk</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{wrf.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* ─── FULL-WIDTH YIELD PREDICTION ─── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="mt-6 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="font-display flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Yield & Loss Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
                  <Wheat className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Expected Yield/Acre</p>
                  <p className="text-xl font-bold text-foreground">{yp?.expectedYieldPerAcre ?? 0} {yp?.unit ?? "tons"}</p>
                </div>
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
                  <BarChart3 className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Total Expected Yield</p>
                  <p className="text-xl font-bold text-foreground">{yp?.totalExpectedYield ?? 0} {yp?.unit ?? "tons"}</p>
                  <p className="text-xs text-muted-foreground">({result.fieldData.acreLand} acres)</p>
                </div>
                <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4 text-center">
                  <TrendingDown className="h-5 w-5 text-destructive mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Yield Lost</p>
                  <p className="text-xl font-bold text-destructive">{yp?.totalYieldLost ?? 0} {yp?.unit ?? "tons"}</p>
                  <p className="text-xs text-muted-foreground">({result.yieldLoss}% loss)</p>
                </div>
                <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4 text-center">
                  <IndianRupee className="h-5 w-5 text-destructive mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Estimated Revenue Loss</p>
                  <p className="text-xl font-bold text-destructive">₹{(yp?.estimatedRevenueLoss ?? 0).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">@ ₹{(yp?.pricePerTon ?? 0).toLocaleString("en-IN")}/{yp?.unit ?? "ton"}</p>
                </div>
              </div>

              {/* Visual breakdown */}
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Yield Lost / Acre</p>
                  <p className="font-bold text-foreground">{yp?.yieldLostPerAcre ?? 0} {yp?.unit ?? "tons"}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Remaining Yield</p>
                  <p className="font-bold text-primary">{yp?.remainingYield ?? 0} {yp?.unit ?? "tons"}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Affected Area</p>
                  <p className="font-bold text-destructive">{yp?.affectedAcres ?? 0} acres</p>
                </div>
              </div>

              {/* Ring chart */}
              <div className="mt-5 flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0">
                  <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="hsl(var(--destructive))" strokeWidth="3"
                      strokeDasharray={`${result.yieldLoss}, 100`} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-destructive">{result.yieldLoss}%</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {result.yieldLoss === 0 ? "No yield loss — crop is healthy! 🌿" :
                     result.yieldLoss < 15 ? "Minor impact — early treatment recommended." :
                     result.yieldLoss < 30 ? "Moderate impact — apply treatment immediately." :
                     result.yieldLoss < 50 ? "Significant impact — urgent intervention required." :
                     "Severe impact — critical action needed. Consider replanting."}
                  </p>
                  {result.yieldLoss > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      On <strong>{result.fieldData.acreLand} acres</strong>, you may lose <strong className="text-destructive">{yp?.totalYieldLost ?? 0} {yp?.unit ?? "tons"}</strong> worth approximately <strong className="text-destructive">₹{(yp?.estimatedRevenueLoss ?? 0).toLocaleString("en-IN")}</strong>. Remaining harvestable yield: <strong className="text-primary">{yp?.remainingYield ?? 0} {yp?.unit ?? "tons"}</strong>.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/upload"><ArrowLeft className="h-4 w-4" /> Scan Another Image</Link>
          </Button>
          <Button asChild className="gap-2">
            <Link to="/dashboard"><Leaf className="h-4 w-4" /> View Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/dataset"><FileSpreadsheet className="h-4 w-4" /> View All Reports</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
