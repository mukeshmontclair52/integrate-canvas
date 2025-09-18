import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Download, Upload, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TestDataSet {
  id: string;
  name: string;
  environment: string;
  testFlow: string;
  description: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const TestData = () => {
  const { toast } = useToast();
  const [dataSets, setDataSets] = useState<TestDataSet[]>([
    {
      id: "1",
      name: "User Registration Flow",
      environment: "staging",
      testFlow: "authentication",
      description: "Test data for user registration scenarios",
      data: {
        validUser: { email: "test@example.com", password: "Test123!", firstName: "John", lastName: "Doe" },
        invalidEmail: { email: "invalid-email", password: "Test123!" },
        weakPassword: { email: "test2@example.com", password: "123" }
      },
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-20")
    },
    {
      id: "2", 
      name: "E-commerce Checkout",
      environment: "production",
      testFlow: "payment",
      description: "Test data for checkout and payment flows",
      data: {
        validCard: { number: "4242424242424242", expiry: "12/25", cvv: "123" },
        declinedCard: { number: "4000000000000002", expiry: "12/25", cvv: "123" },
        products: [{ id: "prod_1", name: "Test Product", price: 29.99 }]
      },
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-18")
    }
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState("all");
  const [selectedTestFlow, setSelectedTestFlow] = useState("all");
  const [editingDataSet, setEditingDataSet] = useState<TestDataSet | null>(null);

  const [newDataSet, setNewDataSet] = useState({
    name: "",
    environment: "",
    testFlow: "",
    description: "",
    data: ""
  });

  const environments = ["development", "staging", "production", "testing"];
  const testFlows = ["authentication", "payment", "navigation", "forms", "api", "ui-components"];

  const handleCreateDataSet = () => {
    try {
      const parsedData = JSON.parse(newDataSet.data || "{}");
      const dataSet: TestDataSet = {
        id: Date.now().toString(),
        name: newDataSet.name,
        environment: newDataSet.environment,
        testFlow: newDataSet.testFlow,
        description: newDataSet.description,
        data: parsedData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setDataSets([...dataSets, dataSet]);
      setNewDataSet({ name: "", environment: "", testFlow: "", description: "", data: "" });
      setIsCreateModalOpen(false);
      
      toast({
        title: "Dataset created",
        description: "Test dataset has been created successfully"
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please enter valid JSON data",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDataSet = (id: string) => {
    setDataSets(dataSets.filter(ds => ds.id !== id));
    toast({
      title: "Dataset deleted",
      description: "Test dataset has been removed"
    });
  };

  const handleDuplicateDataSet = (dataSet: TestDataSet) => {
    const duplicated: TestDataSet = {
      ...dataSet,
      id: Date.now().toString(),
      name: `${dataSet.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setDataSets([...dataSets, duplicated]);
    toast({
      title: "Dataset duplicated",
      description: "Test dataset has been duplicated successfully"
    });
  };

  const handleExportDataSet = (dataSet: TestDataSet) => {
    const dataStr = JSON.stringify(dataSet, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataSet.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredDataSets = dataSets.filter(ds => {
    const envMatch = selectedEnvironment === "all" || ds.environment === selectedEnvironment;
    const flowMatch = selectedTestFlow === "all" || ds.testFlow === selectedTestFlow;
    return envMatch && flowMatch;
  });

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopBar 
        viewMode="visual" 
        onViewModeChange={() => {}}
        hasUnsavedChanges={false}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Test Data Management</h1>
          <p className="text-muted-foreground">Create and manage test datasets for different environments and flows</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Dataset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Test Dataset</DialogTitle>
              <DialogDescription>
                Create a new dataset for testing specific flows in different environments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Dataset Name</Label>
                  <Input
                    id="name"
                    value={newDataSet.name}
                    onChange={(e) => setNewDataSet({ ...newDataSet, name: e.target.value })}
                    placeholder="e.g., User Login Flow"
                  />
                </div>
                <div>
                  <Label htmlFor="environment">Environment</Label>
                  <Select value={newDataSet.environment} onValueChange={(value) => setNewDataSet({ ...newDataSet, environment: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      {environments.map(env => (
                        <SelectItem key={env} value={env}>{env}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="testFlow">Test Flow</Label>
                <Select value={newDataSet.testFlow} onValueChange={(value) => setNewDataSet({ ...newDataSet, testFlow: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test flow" />
                  </SelectTrigger>
                  <SelectContent>
                    {testFlows.map(flow => (
                      <SelectItem key={flow} value={flow}>{flow}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newDataSet.description}
                  onChange={(e) => setNewDataSet({ ...newDataSet, description: e.target.value })}
                  placeholder="Brief description of this dataset"
                />
              </div>
              <div>
                <Label htmlFor="data">Test Data (JSON)</Label>
                <Textarea
                  id="data"
                  value={newDataSet.data}
                  onChange={(e) => setNewDataSet({ ...newDataSet, data: e.target.value })}
                  placeholder='{"username": "testuser", "email": "test@example.com"}'
                  className="min-h-32 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDataSet} disabled={!newDataSet.name || !newDataSet.environment}>
                  Create Dataset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <Label>Environment</Label>
              <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Environments</SelectItem>
                  {environments.map(env => (
                    <SelectItem key={env} value={env}>{env}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Test Flow</Label>
              <Select value={selectedTestFlow} onValueChange={setSelectedTestFlow}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Flows</SelectItem>
                  {testFlows.map(flow => (
                    <SelectItem key={flow} value={flow}>{flow}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datasets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDataSets.map((dataSet) => (
          <Card key={dataSet.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{dataSet.name}</CardTitle>
                  <CardDescription>{dataSet.description}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleDuplicateDataSet(dataSet)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleExportDataSet(dataSet)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteDataSet(dataSet.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">{dataSet.environment}</Badge>
                <Badge variant="outline">{dataSet.testFlow}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  <strong>Data Keys:</strong> {Object.keys(dataSet.data).join(", ")}
                </div>
                <div className="text-xs text-muted-foreground">
                  Created: {dataSet.createdAt.toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Updated: {dataSet.updatedAt.toLocaleDateString()}
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full" onClick={() => setEditingDataSet(dataSet)}>
                  <Edit className="h-4 w-4 mr-2" />
                  View/Edit Data
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Viewer/Editor Modal */}
      <Dialog open={!!editingDataSet} onOpenChange={() => setEditingDataSet(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDataSet?.name} - Test Data</DialogTitle>
            <DialogDescription>
              View and edit the test data for this dataset
            </DialogDescription>
          </DialogHeader>
          {editingDataSet && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Environment</Label>
                  <Badge variant="secondary">{editingDataSet.environment}</Badge>
                </div>
                <div>
                  <Label>Test Flow</Label>
                  <Badge variant="outline">{editingDataSet.testFlow}</Badge>
                </div>
              </div>
              <div>
                <Label>Data (JSON)</Label>
                <Textarea
                  value={JSON.stringify(editingDataSet.data, null, 2)}
                  readOnly
                  className="min-h-64 font-mono text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingDataSet(null)}>
                  Close
                </Button>
                <Button onClick={() => handleExportDataSet(editingDataSet)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredDataSets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              No datasets found for the selected filters
            </div>
          </CardContent>
        </Card>
      )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestData;