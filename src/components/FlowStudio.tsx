import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { FlowCanvas, FlowNodeData, FlowConnection } from "./FlowCanvas";
import { YamlView } from "./YamlView";

export const FlowStudio = () => {
  const [viewMode, setViewMode] = useState<"visual" | "yaml">("visual");
  const [nodes, setNodes] = useState<FlowNodeData[]>([]);
  const [connections, setConnections] = useState<FlowConnection[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleFlowChange = (updatedNodes: FlowNodeData[], updatedConnections: FlowConnection[]) => {
    setNodes(updatedNodes);
    setConnections(updatedConnections);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopBar 
        viewMode={viewMode} 
        onViewModeChange={setViewMode}
        hasUnsavedChanges={hasUnsavedChanges}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {viewMode === "visual" ? (
          <FlowCanvas onFlowChange={handleFlowChange} />
        ) : (
          <YamlView nodes={nodes} connections={connections} />
        )}
      </div>
    </div>
  );
};