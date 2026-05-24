import { useWorkflowStore } from "../store/workflowStore";
import type { WorkflowSnapshot } from "../types/workflow.types";

/**
 * Example workflow demonstrating the practical workflow system
 * This creates a complete workflow with Start, AI, HTTP, and End nodes
 */
export const createExampleWorkflow = (): WorkflowSnapshot => {
  return {
    nodes: [
      {
        id: "start-1",
        type: "startNode",
        position: { x: 100, y: 200 },
        data: {
          title: "Start",
          description: "Begin user onboarding process",
          status: "idle",
          config: {
            description: "Start user onboarding",
            startData: {
              userId: "12345",
              action: "onboarding",
              timestamp: new Date().toISOString(),
            },
          },
        },
      },
      {
        id: "ai-1",
        type: "aiNode",
        position: { x: 400, y: 100 },
        data: {
          title: "AI Node",
          description: "Generate personalized welcome message",
          status: "idle",
          config: {
            model: "gpt-4.1-mini",
            prompt: "Generate a warm welcome message for user {userId} who just joined our platform. Include their name and a brief introduction to our key features.",
            temperature: 0.7,
          },
        },
      },
      {
        id: "http-1",
        type: "httpNode",
        position: { x: 400, y: 300 },
        data: {
          title: "HTTP Request",
          description: "Call user profile API",
          status: "idle",
          config: {
            url: "https://api.example.com/users/{userId}",
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer {api_token}",
            },
          },
        },
      },
      {
        id: "ai-2",
        type: "aiNode",
        position: { x: 700, y: 200 },
        data: {
          title: "AI Node",
          description: "Process user data and generate recommendations",
          status: "idle",
          config: {
            model: "gpt-4.1-mini",
            prompt: "Based on the user profile data and welcome message, generate 3 personalized product recommendations for user {userId}",
            temperature: 0.8,
          },
        },
      },
      {
        id: "http-2",
        type: "httpNode",
        position: { x: 1000, y: 200 },
        data: {
          title: "HTTP Request",
          description: "Send welcome email",
          status: "idle",
          config: {
            url: "https://api.example.com/send-email",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          },
        },
      },
      {
        id: "end-1",
        type: "endNode",
        position: { x: 1300, y: 200 },
        data: {
          title: "End",
          description: "Complete onboarding process",
          status: "idle",
          config: {
            description: "Complete user onboarding",
            outputConfig: {
              mapping: {
                welcomeMessage: "message",
                recommendations: "product_suggestions",
                userId: "user_id",
                status: "completion_status",
              },
            },
          },
        },
      },
    ],
    edges: [
      {
        id: "edge-start-ai1",
        source: "start-1",
        target: "ai-1",
        animated: true,
        label: "Generate Welcome",
        reconnectable: true,
        type: "smoothstep",
      },
      {
        id: "edge-start-http1",
        source: "start-1",
        target: "http-1",
        animated: true,
        label: "Get Profile",
        reconnectable: true,
        type: "smoothstep",
      },
      {
        id: "edge-ai1-ai2",
        source: "ai-1",
        target: "ai-2",
        animated: true,
        label: "Process",
        reconnectable: true,
        type: "smoothstep",
      },
      {
        id: "edge-http1-ai2",
        source: "http-1",
        target: "ai-2",
        animated: true,
        label: "Profile Data",
        reconnectable: true,
        type: "smoothstep",
      },
      {
        id: "edge-ai2-http2",
        source: "ai-2",
        target: "http-2",
        animated: true,
        label: "Send Email",
        reconnectable: true,
        type: "smoothstep",
      },
      {
        id: "edge-http2-end",
        source: "http-2",
        target: "end-1",
        animated: true,
        label: "Complete",
        reconnectable: true,
        type: "smoothstep",
      },
    ],
  };
};

/**
 * Circular workflow example demonstrating continuous execution
 */
export const createCircularWorkflow = (): WorkflowSnapshot => {
  return {
    nodes: [
      {
        id: "start-1",
        type: "startNode",
        position: { x: 100, y: 200 },
        data: {
          title: "Start",
          description: "Begin monitoring cycle",
          status: "idle",
          config: {
            description: "Start monitoring",
            startData: {
              cycleCount: 0,
              maxCycles: 5,
            },
          },
        },
      },
      {
        id: "http-1",
        type: "httpNode",
        position: { x: 400, y: 200 },
        data: {
          title: "HTTP Request",
          description: "Check system status",
          status: "idle",
          config: {
            url: "https://api.example.com/health",
            method: "GET",
            headers: {},
          },
        },
      },
      {
        id: "ai-1",
        type: "aiNode",
        position: { x: 700, y: 200 },
        data: {
          title: "AI Node",
          description: "Analyze health data",
          status: "idle",
          config: {
            model: "gpt-4.1-mini",
            prompt: "Analyze the system health data and determine if any action is needed",
            temperature: 0.5,
          },
        },
      },
      {
        id: "delay-1",
        type: "delayNode",
        position: { x: 1000, y: 200 },
        data: {
          title: "Delay",
          description: "Wait before next check",
          status: "idle",
          config: {
            duration: 10,
            unit: "seconds",
          },
        },
      },
      {
        id: "end-1",
        type: "endNode",
        position: { x: 1300, y: 200 },
        data: {
          title: "End",
          description: "Complete monitoring cycle",
          status: "idle",
          config: {
            description: "End monitoring cycle",
            outputConfig: {
              mapping: {
                healthStatus: "status",
                recommendations: "actions",
              },
            },
          },
        },
      },
    ],
    edges: [
      {
        id: "edge-start-http",
        source: "start-1",
        target: "http-1",
        animated: true,
        label: "Check Health",
        reconnectable: true,
        type: "smoothstep",
      },
      {
        id: "edge-http-ai",
        source: "http-1",
        target: "ai-1",
        animated: true,
        label: "Analyze",
        reconnectable: true,
        type: "smoothstep",
      },
      {
        id: "edge-ai-delay",
        source: "ai-1",
        target: "delay-1",
        animated: true,
        label: "Wait",
        reconnectable: true,
        type: "smoothstep",
      },
      {
        id: "edge-delay-end",
        source: "delay-1",
        target: "end-1",
        animated: true,
        label: "Complete",
        reconnectable: true,
        type: "smoothstep",
      },
      // This creates the circular connection
      {
        id: "edge-end-start",
        source: "end-1",
        target: "start-1",
        animated: true,
        label: "Next Cycle",
        reconnectable: true,
        type: "smoothstep",
      },
    ],
  };
};

/**
 * Simple linear workflow for basic testing
 */
export const createSimpleWorkflow = (): WorkflowSnapshot => {
  return {
    nodes: [
      {
        id: "start-1",
        type: "startNode",
        position: { x: 100, y: 200 },
        data: {
          title: "Start",
          description: "Start simple workflow",
          status: "idle",
          config: {},
        },
      },
      {
        id: "ai-1",
        type: "aiNode",
        position: { x: 400, y: 200 },
        data: {
          title: "AI Node",
          description: "Process data",
          status: "idle",
          config: {
            model: "gpt-4.1-mini",
            prompt: "Process this data",
            temperature: 0.7,
          },
        },
      },
      {
        id: "end-1",
        type: "endNode",
        position: { x: 700, y: 200 },
        data: {
          title: "End",
          description: "End workflow",
          status: "idle",
          config: {},
        },
      },
    ],
    edges: [
      {
        id: "edge-start-ai",
        source: "start-1",
        target: "ai-1",
        animated: true,
        label: "Process",
        reconnectable: true,
        type: "smoothstep",
      },
      {
        id: "edge-ai-end",
        source: "ai-1",
        target: "end-1",
        animated: true,
        label: "Complete",
        reconnectable: true,
        type: "smoothstep",
      },
    ],
  };
};

/**
 * Helper function to load example workflow into the store
 */
export const loadExampleWorkflow = (workflowType: "simple" | "complex" | "circular" = "complex") => {
  const { importWorkflow } = useWorkflowStore.getState();

  let workflow: WorkflowSnapshot;

  switch (workflowType) {
    case "simple":
      workflow = createSimpleWorkflow();
      break;
    case "circular":
      workflow = createCircularWorkflow();
      break;
    case "complex":
    default:
      workflow = createExampleWorkflow();
      break;
  }

  importWorkflow(workflow);
};
