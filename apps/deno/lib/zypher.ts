
import {
  ZypherAgent,
  AnthropicModelProvider,
  OpenAIModelProvider,
  createZypherContext,
  type ZypherContext,
} from "@corespeed/zypher";

interface ZypherAgentConfig {
  model: string;
  provider: string;
  apiKey: string;
  systemInstruction: string;
}

interface ZypherAgentResult {
  agent: ZypherAgent;
  model: string;
  systemInstruction: string;
}

export async function createZypherAgent(config: ZypherAgentConfig): Promise<ZypherAgentResult> {
  // Create Zypher context
  const workspaceDir = "./zypher-workspace";
  const context: ZypherContext = await createZypherContext(workspaceDir);

  // Create model provider based on config
  let modelProvider;
  
  if (config.provider === 'anthropic') {
    modelProvider = new AnthropicModelProvider({
      apiKey: config.apiKey,
    });
  } else if (config.provider === 'openai') {
    modelProvider = new OpenAIModelProvider({
      apiKey: config.apiKey,
    });
  } else {
    throw new Error(`Unsupported provider: ${config.provider}`);
  }

  // Initialize ZypherAgent with context and provider
  const agent = new ZypherAgent(context, modelProvider);

  // Return agent instance with metadata
  return {
    agent,
    model: config.model,
    systemInstruction: config.systemInstruction,
  };
}

