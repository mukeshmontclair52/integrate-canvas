import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { FlowCanvas } from "./FlowCanvas";

export const FlowStudio = () => {
  return (
    <div className="h-screen flex flex-col bg-background">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <FlowCanvas />
      </div>
    </div>
  );
};