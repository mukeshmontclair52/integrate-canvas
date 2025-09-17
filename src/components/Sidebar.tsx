import { 
  Home, 
  Play, 
  Settings, 
  GitBranch, 
  Database, 
  Shield, 
  BarChart3,
  Folder,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", icon: Home, active: false },
  { name: "Test Flows", icon: GitBranch, active: true },
  { name: "Executions", icon: Play, active: false },
  { name: "Test Data", icon: Database, active: false },
  { name: "Environments", icon: Shield, active: false },
  { name: "Reports", icon: BarChart3, active: false },
];

const projectItems = [
  { name: "API Tests", icon: FileText },
  { name: "UI Tests", icon: FileText },
  { name: "Integration", icon: FileText },
];

export const Sidebar = () => {
  return (
    <div className="w-64 bg-sidebar-bg border-r border-border flex flex-col h-screen">
      {/* Project Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-primary" />
          <div>
            <h1 className="font-semibold text-foreground">Integration Tests</h1>
            <p className="text-xs text-muted-foreground">Default Project</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <a
            key={item.name}
            href="#"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              item.active
                ? "bg-primary/10 text-primary border-l-2 border-primary"
                : "text-muted-foreground hover:bg-sidebar-hover hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </a>
        ))}

        {/* Project Section */}
        <div className="pt-6">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Test Suites
          </h3>
          {projectItems.map((item) => (
            <a
              key={item.name}
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </a>
          ))}
        </div>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-border">
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          Project Settings
        </a>
      </div>
    </div>
  );
};