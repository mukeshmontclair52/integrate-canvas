import { useState } from "react";
import { Plus } from "lucide-react";
import { FlowNode } from "./FlowNode";
import { Button } from "./ui/button";

export interface FlowNodeData {
  id: string;
  type: "start" | "test" | "condition" | "end";
  label: string;
  x: number;
  y: number;
}

const initialNodes: FlowNodeData[] = [
  { id: "start", type: "start", label: "Start", x: 100, y: 200 },
  { id: "end", type: "end", label: "End", x: 700, y: 200 },
];

export const FlowCanvas = () => {
  const [nodes, setNodes] = useState<FlowNodeData[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const addNode = (type: FlowNodeData['type']) => {
    const newNode: FlowNodeData = {
      id: `${type}-${Date.now()}`,
      type,
      label: type === "test" ? "Test Step" : type === "condition" ? "Condition" : type,
      x: 400,
      y: 200,
    };
    setNodes([...nodes, newNode]);
  };

  const updateNodePosition = (id: string, x: number, y: number) => {
    setNodes(nodes.map(node => 
      node.id === id ? { ...node, x, y } : node
    ));
  };

  return (
    <div className="flex-1 bg-canvas-bg relative overflow-hidden">
      {/* Canvas Header */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex gap-2">
          <Button
            onClick={() => addNode("test")}
            size="sm"
            className="bg-node-test hover:bg-node-test/80"
          >
            <Plus className="h-4 w-4 mr-1" />
            Test Step
          </Button>
          <Button
            onClick={() => addNode("condition")}
            size="sm"
            variant="secondary"
            className="bg-node-condition hover:bg-node-condition/80 text-black"
          >
            <Plus className="h-4 w-4 mr-1" />
            Condition
          </Button>
        </div>
      </div>

      {/* Add Stage Placeholder */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 bg-card/50">
          <div className="text-center">
            <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">Add Stage</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Click to add a test step or condition
            </p>
          </div>
        </div>
      </div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Start to Add Stage line */}
        <line
          x1={100 + 60}
          y1={200 + 30}
          x2={400}
          y2={250}
          stroke="hsl(var(--connection-line))"
          strokeWidth="2"
          strokeDasharray="0"
        />
        {/* Add Stage to End line */}
        <line
          x1={500}
          y1={250}
          x2={700}
          y2={200 + 30}
          stroke="hsl(var(--connection-line))"
          strokeWidth="2"
          strokeDasharray="0"
        />
      </svg>

      {/* Flow Nodes */}
      {nodes.map((node) => (
        <FlowNode
          key={node.id}
          data={node}
          isSelected={selectedNode === node.id}
          onSelect={() => setSelectedNode(node.id)}
          onPositionChange={updateNodePosition}
        />
      ))}
    </div>
  );
};