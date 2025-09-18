import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { URLPreview } from "./URLPreview";
import { TestResultsPanel } from "./TestResultsPanel";
import { EnhancedTestResult } from "@/types/performance";

export type TestResult = EnhancedTestResult;

export const UITestStudio = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const handleSaveTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev]);
  };

  const handleCompareResults = (result: TestResult) => {
    setSelectedResult(result);
    setShowComparison(true);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopBar 
        viewMode="visual" 
        onViewModeChange={() => {}}
        hasUnsavedChanges={false}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex">
          <URLPreview onSaveTestResult={handleSaveTestResult} />
          <TestResultsPanel 
            testResults={testResults}
            onCompare={handleCompareResults}
            selectedResult={selectedResult}
            showComparison={showComparison}
            onCloseComparison={() => setShowComparison(false)}
          />
        </div>
      </div>
    </div>
  );
};