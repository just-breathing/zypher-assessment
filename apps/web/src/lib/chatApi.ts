import { Message, Agent } from "@/types";

interface ChatResponse {
  text: string;
  sources?: { title: string; uri: string }[];
}

export async function getAgentChatResponse(
  agentId: string,
  history: Message[],
  userMessage: string,
  apiKey?: string // Add apiKey parameter
): Promise<ChatResponse> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`/api/agents/${agentId}/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message: userMessage,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to get agent response");
  }

  return response.json();
}

export async function fetchAgentConfig(agentId: string, apiKey?: string): Promise<Agent> {
  const headers: HeadersInit = {};
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  const response = await fetch(`/api/agents/${agentId}`, { headers });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch agent configuration");
  }
  return response.json();
}
