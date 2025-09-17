import { Save, Play, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export const TopBar = () => {
  return (
    <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Account: testuser</span>
        <ChevronRight className="h-4 w-4" />
        <span>Organization: default</span>
        <ChevronRight className="h-4 w-4" />
        <span>Project: Integration Tests</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Test Flows</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* View Toggle */}
        <div className="flex bg-muted rounded-md p-1">
          <button className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded">
            VISUAL
          </button>
          <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            YAML
          </button>
        </div>

        {/* Status */}
        <Badge variant="secondary" className="text-orange-400 border-orange-400/30">
          Unsaved changes
        </Badge>

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" className="bg-gradient-primary">
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="secondary" className="bg-gradient-success text-white">
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
        </div>
      </div>
    </div>
  );
};