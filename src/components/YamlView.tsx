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
        const config = node.config || {};
        stage.spec = {
          execution: {
            steps: [
              {
                step: {
                  type: config.testType || "Http",
                  name: node.label,
                  identifier: `${node.id}_step`,
                  timeout: `${config.timeout || 30}s`,
                  spec: {
                    method: config.method || "GET",
                    url: config.endpoint || "https://api.example.com/endpoint",
                    ...(config.headers && { headers: JSON.parse(config.headers) }),
                    ...(config.body && { requestBody: config.body }),
                    assertion: config.expectedStatus 
                      ? `response.status == ${config.expectedStatus}` 
                      : "response.status == 200",
                  },
                },
              },
            ],
          },
        };
      } else if (node.type === "condition") {
        const config = node.config || {};
        stage.when = {
          pipelineStatus: "Success",
          condition: config.condition || "<+pipeline.variables.test_result> == 'pass'",
        };
        stage.spec = {
          execution: {
            steps: [
              {
                step: {
                  type: "ShellScript",
                  name: config.description || "Conditional Check",
                  identifier: `${node.id}_condition`,
                  spec: {
                    shell: "Bash",
                    source: {
                      type: "Inline",
                      spec: {
                        script: `# ${config.description || 'Condition check'}
echo "Checking: ${config.condition || 'No condition specified'}"
# On success: ${config.onTrue || 'continue'}  
# On failure: ${config.onFalse || 'fail'}`,
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

    // Add pipeline variables based on node configurations
    const variables: any[] = [
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

    // Add custom variables from node configurations
    nodes.forEach(node => {
      if (node.config) {
        Object.entries(node.config).forEach(([key, value]) => {
          if (typeof value === 'string' && value.length > 0 && !['testType', 'timeout'].includes(key)) {
            variables.push({
              name: `${node.id}_${key}`,
              type: "String",
              value: String(value)
            });
          }
        });
      }
    });

    pipeline.spec.variables = variables;
    return pipeline;
  };

  const generateYamlString = (obj: any, indent = 0): string => {
    const spaces = "  ".repeat(indent);
    let result = "";

    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        result += `${spaces}${key}:\n`;
        value.forEach((item: any) => {
          if (typeof item === "object") {
            result += `${spaces}- ${generateYamlString(item, indent + 1).trim()}\n`;
          } else {
            result += `${spaces}- ${item}\n`;
          }
        });
      } else if (typeof value === "object" && value !== null) {
        result += `${spaces}${key}:\n${generateYamlString(value, indent + 1)}`;
      } else {
        result += `${spaces}${key}: ${value}\n`;
      }
    }

    return result;
  };

  const yamlContent = generateYamlString(generateYaml());

  return (
    <div className="flex-1 bg-card p-6 font-mono text-sm">
      <div className="mb-4 border-b border-border pb-2">
        <h3 className="text-lg font-semibold text-foreground">Generated Pipeline YAML</h3>
        <p className="text-xs text-muted-foreground">
          Auto-generated from {nodes.length} nodes and {connections.length} connections
        </p>
      </div>
      
      <pre className="text-foreground whitespace-pre-wrap overflow-auto h-full bg-muted/10 p-4 rounded-lg border">
        <code>{yamlContent}</code>
      </pre>
    </div>
  );
};