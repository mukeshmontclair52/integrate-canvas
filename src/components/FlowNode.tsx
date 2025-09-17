import { useState, useRef, useEffect } from "react";
import { Play, CheckCircle, Diamond, Square, Link, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowNodeData } from "./FlowCanvas";
import { Input } from "./ui/input";

interface FlowNodeProps {
  data: FlowNodeData;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: () => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onStartConnection: (nodeId: string) => void;
  onCompleteConnection: (nodeId: string) => void;
  onUpdateNode: (id: string, updates: Partial<FlowNodeData>) => void;
}

const nodeIcons = {
  start: Play,
  test: CheckCircle,
  condition: Diamond,
  end: Square,
};

const nodeColors = {
  start: "bg-node-start",
  test: "bg-node-test",
  condition: "bg-node-condition",
  end: "bg-node-end",
};

export const FlowNode = ({ 
  data, 
  isSelected, 
  isConnecting,
  onSelect, 
  onPositionChange, 
  onStartConnection,
  onCompleteConnection,
  onUpdateNode 
}: FlowNodeProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);
  const Icon = nodeIcons[data.type];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - data.x,
      y: e.clientY - data.y,
    });
    onSelect();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, e.clientX - dragStart.x);
    const newY = Math.max(0, e.clientY - dragStart.y);
    onPositionChange(data.id, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnecting) {
      onCompleteConnection(data.id);
    } else {
      onSelect();
    }
  };

  const handleConnectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartConnection(data.id);
  };

  const handleLabelEdit = () => {
    if (data.type === "start" || data.type === "end") return;
    setIsEditing(true);
    setEditValue(data.label);
  };

  const handleLabelSave = () => {
    onUpdateNode(data.id, { label: editValue });
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLabelSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(data.label);
    }
  };

  // Attach global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div
      ref={nodeRef}
      className={cn(
        "absolute select-none transition-all duration-200 group",
        isSelected && "scale-105",
        isDragging ? "cursor-grabbing z-50" : "cursor-grab",
        isConnecting && "cursor-crosshair"
      )}
      style={{ left: data.x, top: data.y }}
      onMouseDown={handleMouseDown}
      onClick={handleNodeClick}
    >
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-3 rounded-lg border-2 min-w-[120px] shadow-lg relative",
          nodeColors[data.type],
          "text-white font-medium",
          isSelected 
            ? "border-white shadow-xl" 
            : "border-transparent hover:border-white/50",
          isDragging && "shadow-2xl scale-105",
          isConnecting && "hover:ring-2 hover:ring-white"
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        
        {isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleLabelSave}
            onKeyDown={handleKeyPress}
            className="text-sm bg-transparent border-none text-white p-0 h-auto focus:ring-0 focus:outline-none"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-1 flex-1">
            <span className="text-sm">{data.label}</span>
            {isSelected && data.type !== "start" && data.type !== "end" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLabelEdit();
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
              >
                <Edit3 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
        
        {/* Node type indicator */}
        {data.config && (
          <div className="absolute -top-2 -right-2 bg-background text-xs px-1 py-0.5 rounded text-muted-foreground">
            {data.config.testType || "config"}
          </div>
        )}
      </div>
      
      {/* Connection Points */}
      <button
        className={cn(
          "absolute top-1/2 -right-2 w-4 h-4 bg-connection-line rounded-full transform -translate-y-1/2 border-2 border-background",
          "hover:scale-125 transition-transform cursor-pointer z-10",
          isConnecting && "ring-2 ring-white animate-pulse"
        )}
        onClick={handleConnectionClick}
        title="Create connection"
      >
        <Link className="h-2 w-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </button>
      
      <div className="absolute top-1/2 -left-2 w-4 h-4 bg-connection-line rounded-full transform -translate-y-1/2 border-2 border-background" />
    </div>
  );
};