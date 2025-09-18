import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  History, 
  Download, 
  Eye, 
  GitCompare, 
  Calendar,
  Monitor,
  Smartphone,
  Tablet,
  X,
  BarChart3
} from "lucide-react";
import { TestResult } from "./UITestStudio";
import { PerformanceMetricsPanel } from "./PerformanceMetricsPanel";
import { toast } from "sonner";

interface TestResultsPanelProps {
  testResults: TestResult[];
  onCompare: (result: TestResult) => void;
  selectedResult: TestResult | null;
  showComparison: boolean;
  onCloseComparison: () => void;
}

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

export const TestResultsPanel = ({ 
  testResults, 
  onCompare, 
  selectedResult, 
  showComparison, 
  onCloseComparison 
}: TestResultsPanelProps) => {
  const [selectedForComparison, setSelectedForComparison] = useState<TestResult | null>(null);
  const [viewModalResult, setViewModalResult] = useState<TestResult | null>(null);

  const handleDownload = (result: TestResult) => {
    const link = document.createElement("a");
    link.href = result.screenshot;
    link.download = `${result.name}-${result.device}-${result.timestamp.toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Screenshot downloaded");
  };

  const handleCompareWith = () => {
    if (selectedResult && selectedForComparison) {
      toast.success("Comparing test results");
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <>
      <div className="w-80 border-l border-border bg-card p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5" />
          <h2 className="font-semibold">Test Results</h2>
          <Badge variant="secondary" className="ml-auto">
            {testResults.length}
          </Badge>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-3">
            {testResults.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No test results yet</p>
                <p className="text-xs">Capture screenshots to see them here</p>
              </div>
            ) : (
              testResults.map((result) => {
                const DeviceIcon = deviceIcons[result.device];
                return (
                  <Card key={result.id} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{result.name}</h3>
                          <p className="text-xs text-muted-foreground truncate">{result.url}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <DeviceIcon className="h-3 w-3" />
                          <Badge variant="outline" className="text-xs">
                            {result.device}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(result.timestamp)}
                      </div>

                      {/* Thumbnail */}
                      <div className="relative">
                        <img 
                          src={result.screenshot} 
                          alt={result.name}
                          className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setViewModalResult(result)}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setViewModalResult(result)}
                          className="flex-1 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onCompare(result)}
                          className="flex-1 text-xs"
                        >
                          <GitCompare className="h-3 w-3 mr-1" />
                          Compare
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDownload(result)}
                          className="text-xs"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* View Screenshot Modal */}
      {viewModalResult && (
        <Dialog open={true} onOpenChange={() => setViewModalResult(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {viewModalResult.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{viewModalResult.url}</span>
                <Badge variant="outline">{viewModalResult.device}</Badge>
                <span>{formatDate(viewModalResult.timestamp)}</span>
              </div>
              
              <Tabs defaultValue="screenshot" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="screenshot">Screenshot</TabsTrigger>
                  <TabsTrigger value="metrics" disabled={!viewModalResult.metrics}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Metrics
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="screenshot" className="space-y-4">
                  <div className="max-h-[60vh] overflow-auto">
                    <img 
                      src={viewModalResult.screenshot} 
                      alt={viewModalResult.name}
                      className="w-full border rounded"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="metrics" className="space-y-4">
                  {viewModalResult.metrics ? (
                    <div className="max-h-[60vh] overflow-auto">
                      <PerformanceMetricsPanel metrics={viewModalResult.metrics} />
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No performance metrics available for this test</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="flex gap-2">
                <Button onClick={() => handleDownload(viewModalResult)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => onCompare(viewModalResult)}>
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Comparison Modal */}
      {showComparison && selectedResult && (
        <Dialog open={true} onOpenChange={onCloseComparison}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5" />
                  Compare Test Results
                </div>
                <Button variant="ghost" size="sm" onClick={onCloseComparison}>
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Compare with:</label>
                  <Select onValueChange={(value) => {
                    const result = testResults.find(r => r.id === value);
                    setSelectedForComparison(result || null);
                  }}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a test result to compare" />
                    </SelectTrigger>
                    <SelectContent>
                      {testResults
                        .filter(r => r.id !== selectedResult.id)
                        .map((result) => (
                          <SelectItem key={result.id} value={result.id}>
                            {result.name} - {result.device} - {formatDate(result.timestamp)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedForComparison && (
                  <Button onClick={handleCompareWith}>
                    Compare
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-auto">
                {/* Selected Result */}
                <div className="space-y-2">
                  <div className="text-center">
                    <h3 className="font-medium">{selectedResult.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedResult.device} - {formatDate(selectedResult.timestamp)}
                    </p>
                  </div>
                  <img 
                    src={selectedResult.screenshot} 
                    alt={selectedResult.name}
                    className="w-full border rounded"
                  />
                </div>

                {/* Comparison Result */}
                <div className="space-y-2">
                  {selectedForComparison ? (
                    <>
                      <div className="text-center">
                        <h3 className="font-medium">{selectedForComparison.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedForComparison.device} - {formatDate(selectedForComparison.timestamp)}
                        </p>
                      </div>
                      <img 
                        src={selectedForComparison.screenshot} 
                        alt={selectedForComparison.name}
                        className="w-full border rounded"
                      />
                    </>
                  ) : (
                    <div className="border border-dashed border-border rounded h-full flex items-center justify-center text-muted-foreground">
                      Select a test result to compare
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};