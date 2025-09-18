import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Monitor, Smartphone, Tablet, RefreshCw, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { TestResult } from "./UITestStudio";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { PerformanceMetricsPanel } from "./PerformanceMetricsPanel";

interface URLPreviewProps {
  onSaveTestResult: (result: TestResult) => void;
}

const deviceViews = {
  desktop: { width: "100%", height: "100%", icon: Monitor },
  tablet: { width: "768px", height: "1024px", icon: Tablet },
  mobile: { width: "375px", height: "667px", icon: Smartphone },
};

export const URLPreview = ({ onSaveTestResult }: URLPreviewProps) => {
  const [url, setUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [device, setDevice] = useState<keyof typeof deviceViews>("desktop");
  const [isLoading, setIsLoading] = useState(false);
  const [testName, setTestName] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "metrics">("preview");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMonitoring, metrics, startMonitoring } = usePerformanceMonitor();

  const handleLoadUrl = async () => {
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }
    
    setIsLoading(true);
    setCurrentUrl(url);
    
    try {
      // Start performance monitoring
      await startMonitoring(url);
      toast.success("Application loaded successfully with performance metrics");
      setActiveTab("metrics");
    } catch (error) {
      console.error("Error loading URL:", error);
      toast.error("Failed to load application");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScreenCapture = async () => {
    if (!currentUrl) {
      toast.error("Please load a URL first");
      return;
    }

    if (!testName.trim()) {
      toast.error("Please enter a test name");
      return;
    }

    try {
      if (containerRef.current) {
        const canvas = await html2canvas(containerRef.current, {
          allowTaint: true,
          useCORS: true,
          scale: 0.8
        });
        
        const screenshot = canvas.toDataURL("image/png");
        
        const testResult: TestResult = {
          id: Date.now().toString(),
          url: currentUrl,
          timestamp: new Date(),
          device,
          screenshot,
          name: testName,
          metrics: metrics || undefined
        };

        onSaveTestResult(testResult);
        toast.success("Screenshot saved successfully");
        setTestName("");
      }
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      toast.error("Failed to capture screenshot");
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const deviceConfig = deviceViews[device];
  const DeviceIcon = deviceConfig.icon;

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4">
      {/* URL Input Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Application URL Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="url">Application URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>
            <div className="w-32">
              <Label htmlFor="device">Device View</Label>
              <Select value={device} onValueChange={(value: keyof typeof deviceViews) => setDevice(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(deviceViews).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col justify-end">
              <Button onClick={handleLoadUrl} disabled={isLoading || isMonitoring}>
                {isLoading || isMonitoring ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Load"
                )}
              </Button>
            </div>
          </div>

          {/* Screenshot Controls */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="testName">Test Name</Label>
              <Input
                id="testName"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Enter test name for screenshot"
                className="mt-1"
              />
            </div>
            <Button onClick={handleScreenCapture} disabled={!currentUrl}>
              <Camera className="h-4 w-4 mr-2" />
              Capture Screenshot
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={!currentUrl}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* URL Preview and Metrics */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "preview" | "metrics")} className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DeviceIcon className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                {device.charAt(0).toUpperCase() + device.slice(1)} View
                {device !== "desktop" && (
                  <span className="ml-2">({deviceConfig.width} × {deviceConfig.height})</span>
                )}
              </span>
            </div>
            
            <TabsList className="grid w-48 grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="metrics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Metrics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="preview" className="flex-1 flex flex-col mt-0">
            <div 
              ref={containerRef}
              className="flex-1 border border-border rounded-lg overflow-hidden bg-card flex items-center justify-center"
              style={{
                maxWidth: device === "desktop" ? "100%" : deviceConfig.width,
                maxHeight: device === "desktop" ? "100%" : deviceConfig.height,
                margin: device === "desktop" ? "0" : "0 auto"
              }}
            >
              {currentUrl ? (
                <iframe
                  ref={iframeRef}
                  src={currentUrl}
                  className="w-full h-full border-0"
                  title="Application Preview"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter a URL and click "Load" to preview the application</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="flex-1 flex flex-col mt-0">
            <div className="flex-1 border border-border rounded-lg overflow-hidden bg-card">
              {metrics ? (
                <div className="p-4 h-full overflow-auto">
                  <PerformanceMetricsPanel metrics={metrics} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Load a URL to see performance metrics</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};