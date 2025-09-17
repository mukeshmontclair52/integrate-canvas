import { useState, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { FlowNode } from "./FlowNode";
import { Button } from "./ui/button";

export interface FlowNodeData {
  id: string;
  type: "start" | "test" | "condition" | "end";
  label: string;
  x: number;
  y: number;
  config?: {
    testType?: string;
    condition?: string;
    action?: string;
    timeout?: number;
    endpoint?: string;
    method?: string;
    headers?: string;
    body?: string;
    expectedStatus?: number;
    description?: string;
    onTrue?: string;
    onFalse?: string;
  };
}

export interface FlowConnection {
  id: string;
  from: string;
  to: string;
}

const initialNodes: FlowNodeData[] = [
  { id: "start", type: "start", label: "Start", x: 100, y: 200 },
  { id: "end", type: "end", label: "End", x: 700, y: 200 },
];

const initialConnections: FlowConnection[] = [
  { id: "start-end", from: "start", to: "end" },
];

interface FlowCanvasProps {
  onFlowChange?: (nodes: FlowNodeData[], connections: FlowConnection[]) => void;
}

export const FlowCanvas = ({ onFlowChange }: FlowCanvasProps) => {
  const [nodes, setNodes] = useState<FlowNodeData[]>(initialNodes);
  const [connections, setConnections] = useState<FlowConnection[]>(initialConnections);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addNode = (type: FlowNodeData["type"]) => {
    // Find the rightmost node that's not the end node to position the new node
    const nonEndNodes = nodes.filter(node => node.type !== "end");
    const rightmostNode = nonEndNodes.reduce((rightmost, node) => 
      node.x > rightmost.x ? node : rightmost, nonEndNodes[0]);
    
    const newNode: FlowNodeData = {
      id: `${type}-${Date.now()}`,
      type,
      label: type === "test" ? "API Test" : type === "condition" ? "If Condition" : type,
      x: rightmostNode.x + 200,
      y: 200,
      config: {
        testType: type === "test" ? "api" : undefined,
        condition: type === "condition" ? "response.status === 200" : undefined,
        timeout: 30,
      },
    };

    const updatedNodes = [...nodes, newNode];
    
    // Find direct start-to-end connection and replace it with start->newNode->end
    const directConnection = connections.find(conn => conn.from === "start" && conn.to === "end");
    let updatedConnections = [...connections];
    
    if (directConnection) {
      // Remove direct start-end connection
      updatedConnections = connections.filter(conn => conn.id !== directConnection.id);
      // Add start->newNode and newNode->end connections
      updatedConnections.push(
        { id: `start-${newNode.id}`, from: "start", to: newNode.id },
        { id: `${newNode.id}-end`, from: newNode.id, to: "end" }
      );
    } else {
      // Find the last node before end and connect newNode between it and end
      const endConnections = connections.filter(conn => conn.to === "end");
      if (endConnections.length > 0) {
        const lastConnection = endConnections[0];
        // Remove the connection to end
        updatedConnections = connections.filter(conn => conn.id !== lastConnection.id);
        // Add connections: lastNode->newNode->end
        updatedConnections.push(
          { id: `${lastConnection.from}-${newNode.id}`, from: lastConnection.from, to: newNode.id },
          { id: `${newNode.id}-end`, from: newNode.id, to: "end" }
        );
      }
    }
    
    setNodes(updatedNodes);
    setConnections(updatedConnections);
    onFlowChange?.(updatedNodes, updatedConnections);
  };

  const updateNode = (id: string, updates: Partial<FlowNodeData>) => {
    const updatedNodes = nodes.map(node => 
      node.id === id ? { ...node, ...updates } : node
    );
    setNodes(updatedNodes);
    onFlowChange?.(updatedNodes, connections);
  };

  const deleteNode = (id: string) => {
    if (id === "start" || id === "end") return; // Prevent deleting start/end nodes
    
    const updatedNodes = nodes.filter(node => node.id !== id);
    const updatedConnections = connections.filter(conn => 
      conn.from !== id && conn.to !== id
    );
    
    setNodes(updatedNodes);
    setConnections(updatedConnections);
    onFlowChange?.(updatedNodes, updatedConnections);
    setSelectedNode(null);
  };

  const startConnection = (nodeId: string) => {
    setIsConnecting(true);
    setConnectionStart(nodeId);
  };

  const completeConnection = (nodeId: string) => {
    if (connectionStart && connectionStart !== nodeId) {
      const newConnection: FlowConnection = {
        id: `${connectionStart}-${nodeId}`,
        from: connectionStart,
        to: nodeId,
      };
      
      // Check if connection already exists
      const exists = connections.some(conn => 
        conn.from === connectionStart && conn.to === nodeId
      );
      
      if (!exists) {
        const updatedConnections = [...connections, newConnection];
        setConnections(updatedConnections);
        onFlowChange?.(nodes, updatedConnections);
      }
    }
    
    setIsConnecting(false);
    setConnectionStart(null);
  };

  const updateNodePosition = (id: string, x: number, y: number) => {
    updateNode(id, { x, y });
  };

  const getNodeById = (id: string) => nodes.find(node => node.id === id);

  return (
    <div 
      ref={canvasRef}
      className="flex-1 bg-canvas-bg relative overflow-hidden"
      onClick={() => {
        if (isConnecting) {
          setIsConnecting(false);
          setConnectionStart(null);
        }
      }}
    >
      {/* Canvas Header */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
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
          className="bg-node-condition hover:bg-node-condition/80 text-black"
        >
          <Plus className="h-4 w-4 mr-1" />
          Condition
        </Button>
        {selectedNode && selectedNode !== "start" && selectedNode !== "end" && (
          <Button
            onClick={() => deleteNode(selectedNode)}
            size="sm"
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </div>

      {/* Connection Status */}
      {isConnecting && (
        <div className="absolute top-4 right-4 z-10 bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium">
          Click on a node to connect
        </div>
      )}

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connections.map((connection) => {
          const fromNode = getNodeById(connection.from);
          const toNode = getNodeById(connection.to);
          
          if (!fromNode || !toNode) return null;
          
          return (
            <line
              key={connection.id}
              x1={fromNode.x + 60}
              y1={fromNode.y + 25}
              x2={toNode.x}
              y2={toNode.y + 25}
              stroke="hsl(var(--connection-line))"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          );
        })}
        
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="hsl(var(--connection-line))"
            />
          </marker>
        </defs>
      </svg>

      {/* Flow Nodes */}
      {nodes.map((node) => (
        <FlowNode
          key={node.id}
          data={node}
          isSelected={selectedNode === node.id}
          isConnecting={isConnecting}
          onSelect={() => setSelectedNode(node.id)}
          onPositionChange={updateNodePosition}
          onStartConnection={startConnection}
          onCompleteConnection={completeConnection}
          onUpdateNode={updateNode}
        />
      ))}
    </div>
  );
};