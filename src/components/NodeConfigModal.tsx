import { useState } from "react";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FlowNodeData } from "./FlowCanvas";

interface NodeConfigModalProps {
  node: FlowNodeData;
  onUpdateNode: (id: string, updates: Partial<FlowNodeData>) => void;
  trigger?: React.ReactNode;
}

export const NodeConfigModal = ({ node, onUpdateNode, trigger }: NodeConfigModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(node.config || {});

  const handleSave = () => {
    onUpdateNode(node.id, { 
      config: {
        ...config,
        // Add any default values based on node type
        timeout: config.timeout || 30,
      }
    });
    setIsOpen(false);
  };

  const updateConfig = (key: string, value: string | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const renderFormFields = () => {
    if (node.type === "start" || node.type === "end") {
      return (
        <div className="text-sm text-muted-foreground">
          This node doesn't have configurable properties.
        </div>
      );
    }

    if (node.type === "test") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testType">Test Type</Label>
            <Select value={config.testType || "api"} onValueChange={(value) => updateConfig("testType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select test type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api">API Test</SelectItem>
                <SelectItem value="ui">UI Test</SelectItem>
                <SelectItem value="database">Database Test</SelectItem>
                <SelectItem value="integration">Integration Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint/URL</Label>
            <Input
              id="endpoint"
              value={config.endpoint || ""}
              onChange={(e) => updateConfig("endpoint", e.target.value)}
              placeholder="https://api.example.com/endpoint"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">HTTP Method</Label>
            <Select value={config.method || "GET"} onValueChange={(value) => updateConfig("method", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headers">Headers (JSON)</Label>
            <Textarea
              id="headers"
              value={config.headers || ""}
              onChange={(e) => updateConfig("headers", e.target.value)}
              placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Request Body</Label>
            <Textarea
              id="body"
              value={config.body || ""}
              onChange={(e) => updateConfig("body", e.target.value)}
              placeholder='{"key": "value"}'
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedStatus">Expected Status Code</Label>
            <Input
              id="expectedStatus"
              type="number"
              value={config.expectedStatus || 200}
              onChange={(e) => updateConfig("expectedStatus", parseInt(e.target.value))}
              placeholder="200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeout">Timeout (seconds)</Label>
            <Input
              id="timeout"
              type="number"
              value={config.timeout || 30}
              onChange={(e) => updateConfig("timeout", parseInt(e.target.value))}
              placeholder="30"
            />
          </div>
        </div>
      );
    }

    if (node.type === "condition") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="condition">Condition Expression</Label>
            <Textarea
              id="condition"
              value={config.condition || ""}
              onChange={(e) => updateConfig("condition", e.target.value)}
              placeholder="response.status === 200 && response.data.success === true"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={config.description || ""}
              onChange={(e) => updateConfig("description", e.target.value)}
              placeholder="Describe what this condition checks"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onTrue">Action on True</Label>
            <Input
              id="onTrue"
              value={config.onTrue || ""}
              onChange={(e) => updateConfig("onTrue", e.target.value)}
              placeholder="continue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onFalse">Action on False</Label>
            <Input
              id="onFalse"
              value={config.onFalse || ""}
              onChange={(e) => updateConfig("onFalse", e.target.value)}
              placeholder="fail"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Configure
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure {node.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {renderFormFields()}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};