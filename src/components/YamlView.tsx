import { FlowNodeData, FlowConnection } from "./FlowCanvas";

interface YamlViewProps {
  nodes: FlowNodeData[];
  connections: FlowConnection[];
}

export const YamlView = ({ nodes, connections }: YamlViewProps) => {
  const generateYaml = () => {
    const pipeline: any = {
      apiVersion: "v1",
      kind: "Pipeline",
      metadata: {
        name: "integration-test-pipeline",
        description: "Auto-generated integration test pipeline",
      },
      spec: {
        stages: [],
      },
    };

    // Sort nodes by x position to maintain flow order
    const sortedNodes = [...nodes]
      .filter(node => node.type !== "start" && node.type !== "end")
      .sort((a, b) => a.x - b.x);

    sortedNodes.forEach((node, index) => {
      let stage: any = {
        name: node.label.toLowerCase().replace(/\s+/g, "-"),
        identifier: node.id,
        type: node.type === "test" ? "Integration" : "Conditional",
      };

      if (node.type === "test") {
        stage.spec = {
          execution: {
            steps: [
              {
                step: {
                  type: node.config?.testType || "Http",
                  name: node.label,
                  identifier: `${node.id}_step`,
                  timeout: `${node.config?.timeout || 30}s`,
                  spec: {
                    method: "GET",
                    url: "https://api.example.com/test",
                    assertion: node.config?.condition || "response.status == 200",
                  },
                },
              },
            ],
          },
        };
      } else if (node.type === "condition") {
        stage.when = {
          pipelineStatus: "Success",
          condition: node.config?.condition || "<+pipeline.variables.test_result> == 'pass'",
        };
        stage.spec = {
          execution: {
            steps: [
              {
                step: {
                  type: "ShellScript",
                  name: "Conditional Check",
                  identifier: `${node.id}_condition`,
                  spec: {
                    shell: "Bash",
                    source: {
                      type: "Inline",
                      spec: {
                        script: `echo "Condition met: ${node.config?.condition}"`,
                      },
                    },
                  },
                },
              },
            ],
          },
        };
      }

      pipeline.spec.stages.push(stage);
    });

    // Add pipeline variables
    pipeline.spec.variables = [
      {
        name: "test_environment",
        type: "String",
        value: "development",
      },
      {
        name: "timeout_duration",
        type: "String", 
        value: "300s",
      },
    ];

    return pipeline;
  };

  const yamlString = JSON.stringify(generateYaml(), null, 2)
    .replace(/"/g, "")
    .replace(/,/g, "")
    .replace(/{/g, "")
    .replace(/}/g, "")
    .replace(/\[/g, "")
    .replace(/\]/g, "")
    .split("\n")
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      
      const indentLevel = (line.length - line.trimStart().length) / 2;
      const indent = "  ".repeat(indentLevel);
      
      if (trimmed.includes(":") && !trimmed.startsWith("-")) {
        const [key, ...valueParts] = trimmed.split(":");
        const value = valueParts.join(":").trim();
        return `${indent}${key}:${value ? ` ${value}` : ""}`;
      }
      
      return `${indent}${trimmed}`;
    })
    .join("\n");

  return (
    <div className="flex-1 bg-card p-6 font-mono text-sm">
      <div className="mb-4 border-b border-border pb-2">
        <h3 className="text-lg font-semibold text-foreground">Generated Pipeline YAML</h3>
        <p className="text-xs text-muted-foreground">
          Auto-generated from {nodes.length} nodes and {connections.length} connections
        </p>
      </div>
      
      <pre className="text-foreground whitespace-pre-wrap overflow-auto h-full">
        <code>{`apiVersion: v1
kind: Pipeline  
metadata:
  name: integration-test-pipeline
  description: Auto-generated integration test pipeline
spec:
  stages:${nodes.filter(node => node.type !== "start" && node.type !== "end").sort((a, b) => a.x - b.x).map((node, index) => `
    - name: ${node.label.toLowerCase().replace(/\s+/g, "-")}
      identifier: ${node.id}
      type: ${node.type === "test" ? "Integration" : "Conditional"}${node.type === "test" ? `
      spec:
        execution:
          steps:
            - step:
                type: ${node.config?.testType || "Http"}
                name: ${node.label}
                identifier: ${node.id}_step
                timeout: ${node.config?.timeout || 30}s
                spec:
                  method: GET
                  url: https://api.example.com/test
                  assertion: ${node.config?.condition || "response.status == 200"}` : `
      when:
        pipelineStatus: Success
        condition: ${node.config?.condition || "<+pipeline.variables.test_result> == 'pass'"}
      spec:
        execution:
          steps:
            - step:
                type: ShellScript
                name: Conditional Check
                identifier: ${node.id}_condition
                spec:
                  shell: Bash
                  source:
                    type: Inline
                    spec:
                      script: echo "Condition met: ${node.config?.condition}"`}`).join("")}
  variables:
    - name: test_environment
      type: String
      value: development
    - name: timeout_duration  
      type: String
      value: 300s`}</code>
      </pre>
    </div>
  );
};