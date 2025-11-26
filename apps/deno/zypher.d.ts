// Minimal TypeScript declarations for the Zypher JSR module, so editors/tsc
// in a Node.js environment don't complain about `jsr:@corespeed/zypher`.
// Deno will use the real types from JSR at runtime.

declare module "jsr:@corespeed/zypher" {
  export type ZypherContext = any;

  export class ZypherAgent {
    constructor(context: ZypherContext, modelProvider: any);
    runTask(input: string, model: string): AsyncIterable<{ type: string; content: string }>;
  }

  export class AnthropicModelProvider {
    constructor(config: { apiKey: string });
  }

  export class OpenAIModelProvider {
    constructor(config: { apiKey: string });
  }

  export function createZypherContext(workspaceDir: string): Promise<ZypherContext>;
}


