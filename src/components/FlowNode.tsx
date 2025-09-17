import { useState, useRef } from "react";
import { Play, CheckCircle, Diamond, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowNodeData } from "./FlowCanvas";

interface FlowNodeProps {
  data: FlowNodeData;
  isSelected: boolean;
  onSelect: () => void;
  onPositionChange: (id: string, x: number, y: number) => void;
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

export const FlowNode = ({ data, isSelected, onSelect, onPositionChange }: FlowNodeProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);
  const Icon = nodeIcons[data.type];

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - data.x,
      y: e.clientY - data.y,
    });
    onSelect();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    onPositionChange(data.id, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Attach global mouse events for dragging
  useState(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  });

  return (
    <div
      ref={nodeRef}
      className={cn(
        "absolute cursor-move select-none transition-all duration-200",
        isSelected && "scale-105"
      )}
      style={{ left: data.x, top: data.y }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-3 rounded-lg border-2 min-w-[120px] shadow-lg",
          nodeColors[data.type],
          "text-white font-medium",
          isSelected 
            ? "border-white shadow-xl" 
            : "border-transparent hover:border-white/50",
          isDragging && "shadow-2xl scale-105"
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="text-sm">{data.label}</span>
      </div>
      
      {/* Connection Points */}
      <div className="absolute top-1/2 -right-2 w-4 h-4 bg-connection-line rounded-full transform -translate-y-1/2 border-2 border-background" />
      <div className="absolute top-1/2 -left-2 w-4 h-4 bg-connection-line rounded-full transform -translate-y-1/2 border-2 border-background" />
    </div>
  );
};