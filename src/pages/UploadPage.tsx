import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Upload, ImageIcon, Loader2, X, Sparkles } from "lucide-react";
import { detectDisease, detectCropFromImage, addScan, type FieldData } from "@/lib/mock-ai";
import { motion } from "framer-motion";

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [cropAutoDetected, setCropAutoDetected] = useState(false);
  const navigate = useNavigate();

  // Field data state
  const [cropName, setCropName] = useState("");
  const [userEditedCrop, setUserEditedCrop] = useState(false);
  const [acreLand, setAcreLand] = useState<number>(1);
  const [yieldAffected, setYieldAffected] = useState([0]);

  // Image parameters
  const [leafEdge, setLeafEdge] = useState<FieldData["leafEdge"]>("Normal");
  const [leafColor, setLeafColor] = useState<FieldData["leafColor"]>("Healthy Green");
  const [leafSpots, setLeafSpots] = useState<FieldData["leafSpots"]>("None");
  const [leafTexture, setLeafTexture] = useState<FieldData["leafTexture"]>("Normal");
  const [plantAge, setPlantAge] = useState<number>(45);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  // Auto-detect crop when image is uploaded
  useEffect(() => {
    let isMounted = true;
    if (preview && !userEditedCrop) {
      detectCropFromImage(preview).then(({ crop }) => {
        if (isMounted && !userEditedCrop) {
          setCropName(crop);
          setCropAutoDetected(true);
        }
      });
    }
    return () => { isMounted = false; };
  }, [preview, userEditedCrop]);

  const handleCropNameChange = (value: string) => {
    setCropName(value);
    setUserEditedCrop(true);
    setCropAutoDetected(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!preview) return;
    setLoading(true);

    const fieldData: FieldData = {
      cropName: cropName || "Unknown",
      acreLand,
      yieldAffected: yieldAffected[0],
      leafEdge,
      leafColor,
      leafSpots,
      leafTexture,
      plantAge,
    };

    try {
      const result = await detectDisease(preview, fieldData);
      const record = await addScan(result, fieldData);
      setLoading(false);
      sessionStorage.setItem("scanResult", JSON.stringify(record));
      navigate("/result");
    } catch (error) {
      console.error("Analysis failed:", error);
      setLoading(false);
      // You might want to show a toast or error message here
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (!userEditedCrop) {
      setCropName("");
      setCropAutoDetected(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground">Upload & Analyze</h1>
          <p className="mt-2 text-muted-foreground">Upload a plant image for AI-powered disease detection and crop analysis.</p>
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Left Column: Image Upload */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Leaf Image Scanner</CardTitle>
                <CardDescription>JPG, PNG, WebP (max 10MB)</CardDescription>
              </CardHeader>
              <CardContent>
                {!preview ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors cursor-pointer ${
                      dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => document.getElementById("file-input")?.click()}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <ImageIcon className="h-8 w-8 text-primary" />
                    </div>
                    <p className="font-medium text-foreground">Drag & drop your leaf image here</p>
                    <p className="mt-1 text-sm text-muted-foreground">or click to browse files</p>
                    <input id="file-input" type="file" accept="image/*" className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-xl border">
                      <img src={preview} alt="Leaf preview" className="w-full max-h-72 object-contain bg-muted/30" />
                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={clearFile}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{file?.name} — {((file?.size || 0) / 1024).toFixed(0)} KB</p>
                      {cropAutoDetected && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 text-xs font-medium text-primary">
                          <Sparkles className="h-3 w-3" />
                          Crop auto-detected
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Image Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base">Image Parameters (Optional)</CardTitle>
                <CardDescription>Help improve AI accuracy with visual observations</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Leaf Edge Condition</Label>
                  <Select value={leafEdge} onValueChange={(v) => setLeafEdge(v as FieldData["leafEdge"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Damaged">Damaged</SelectItem>
                      <SelectItem value="Burnt">Burnt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Leaf Color</Label>
                  <Select value={leafColor} onValueChange={(v) => setLeafColor(v as FieldData["leafColor"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Healthy Green">Healthy Green</SelectItem>
                      <SelectItem value="Yellow">Yellow</SelectItem>
                      <SelectItem value="Brown">Brown</SelectItem>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Spots on Leaf</Label>
                  <Select value={leafSpots} onValueChange={(v) => setLeafSpots(v as FieldData["leafSpots"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Black Spots">Black Spots</SelectItem>
                      <SelectItem value="Brown Spots">Brown Spots</SelectItem>
                      <SelectItem value="White Powder">White Powder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Leaf Texture</Label>
                  <Select value={leafTexture} onValueChange={(v) => setLeafTexture(v as FieldData["leafTexture"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Dry">Dry</SelectItem>
                      <SelectItem value="Curled">Curled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Field Data */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Field Data</CardTitle>
                <CardDescription>Crop and field information — crop name is auto-detected from image</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Crop Name</Label>
                  <div className="relative">
                    <Input
                      placeholder="Type crop name or upload image for auto-detection"
                      value={cropName}
                      onChange={(e) => handleCropNameChange(e.target.value)}
                    />
                    {cropAutoDetected && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> AI
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Auto-filled by AI when you upload an image. You can edit it anytime.</p>
                </div>

                <div className="space-y-2">
                  <Label>Acre of Land</Label>
                  <Input type="number" value={acreLand} onChange={(e) => setAcreLand(Number(e.target.value))} min={0.1} step={0.1} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Yield Affected (%)</Label>
                    <span className="text-sm font-semibold text-primary">{yieldAffected[0]}%</span>
                  </div>
                  <Slider value={yieldAffected} onValueChange={setYieldAffected} max={100} step={1} />
                </div>

                <div className="space-y-2">
                  <Label>Plant Age (days) <span className="text-muted-foreground font-normal">— optional</span></Label>
                  <Input type="number" value={plantAge} onChange={(e) => setPlantAge(Number(e.target.value))} min={1} max={365} />
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis Info */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-display font-bold text-foreground text-sm">AI Auto-Detection</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      The AI will automatically detect: crop type, disease (or healthy status), confidence score, severity, yield loss estimate, and treatment recommendations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analyze Button */}
            <Button className="w-full gap-2 text-base font-semibold" size="lg" disabled={!preview || loading} onClick={handleAnalyze}>
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing with AI...</>
              ) : (
                <><Upload className="h-5 w-5" /> Analyze Leaf Image</>
              )}
            </Button>

            {loading && (
              <Card>
                <CardContent className="p-4 space-y-2">
                  {["Detecting crop type...", "Running disease classification...", "Calculating confidence score...", "Estimating yield loss...", "Generating treatment plan..."].map((msg, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                      {msg}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <h3 className="font-display font-bold text-foreground mb-3">Tips for Best Results</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✅ Take a clear, close-up photo of the affected leaf</li>
                  <li>✅ Ensure good lighting — avoid shadows</li>
                  <li>✅ Include both healthy and diseased parts if possible</li>
                  <li>✅ Fill in optional parameters for more accurate analysis</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
