import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createZypherAgent } from "./lib/zypher.ts";

const PORT = 3001;

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ChatRequest {
  agentId: string;
  message: string;
  provider: string;
  model: string;
  apiKey: string;
  systemInstruction: string;
  chatbotName?: string;
  chatbotDescription?: string;
}

function isAsyncIterable(obj: unknown): obj is AsyncIterable<unknown> {
  return !!obj && typeof (obj as any)[Symbol.asyncIterator] === "function";
}

function isObservable(obj: unknown): obj is { subscribe: (observer: any) => any } {
  return !!obj && typeof (obj as any).subscribe === "function";
}


async function handleChat(req: Request): Promise<Response> {
  try {
    const body: ChatRequest = await req.json();
    
    console.log(`📨 Chat request for agent ${body.agentId}`);

    // Create Zypher agent
    const { agent, model } = await createZypherAgent({
      model: body.model,
      provider: body.provider,
      apiKey: body.apiKey,
      systemInstruction: body.systemInstruction,
    });

    // Build a rich prompt that includes system instructions + knowledge context + user message
    const identityLine = body.chatbotName
      ? `You are "${body.chatbotName}", a custom chatbot assistant.${body.chatbotDescription ? ` Description: ${body.chatbotDescription}` : ""}`
      : "";

    const prompt = [
      identityLine,
      body.systemInstruction?.trim() || "",
      `USER QUESTION:\n${body.message.trim()}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    console.log("🧠 Using prompt (truncated):", prompt.slice(0, 200), "...");

    // Run the task (may return async iterable, observable, or promise/value)
    const taskResult: unknown = agent.runTask(prompt, model);
    let responseText = "";

    if (isAsyncIterable(taskResult)) {
      // Streaming mode: async iterable of events
      for await (const event of taskResult as AsyncIterable<any>) {
        if (typeof event === "string") {
          responseText += event;
        } else if (event && typeof event === "object") {
          // Common event shapes: { type, content } or { text }
          const anyEvent = event as any;
          if (typeof anyEvent.content === "string") {
            responseText += anyEvent.content;
          } else if (typeof anyEvent.text === "string") {
            responseText += anyEvent.text;
          }
        }
      }
    } else if (isObservable(taskResult)) {
      // Observable mode: subscribe and wait for completion
      const obs: any = taskResult;
      responseText = await new Promise<string>((resolve, reject) => {
        let acc = "";
        obs.subscribe({
          next(event: any) {
            if (typeof event === "string") {
              acc += event;
            } else if (event && typeof event === "object") {
              if (typeof event.content === "string") acc += event.content;
              else if (typeof event.text === "string") acc += event.text;
            }
          },
          error(err: any) {
            reject(err);
          },
          complete() {
            resolve(acc);
          },
        });
      });
    } else {
      // Promise or plain value
      const resolved = await (taskResult as Promise<any>);
      if (typeof resolved === "string") {
        responseText = resolved;
      } else if (resolved && typeof resolved === "object") {
        const anyResult = resolved as any;
        if (typeof anyResult.content === "string") {
          responseText = anyResult.content;
        } else if (typeof anyResult.text === "string") {
          responseText = anyResult.text;
        } else {
          responseText = JSON.stringify(anyResult);
        }
      }
    }

    console.log(`✅ Response generated for agent ${body.agentId}`);

    // Post-process generic Zypher identity to align with chatbot branding
    if (body.chatbotName) {
      const name = body.chatbotName;
      const description = body.chatbotDescription || "your chatbot assistant.";

      const genericPatterns: RegExp[] = [
        /Hello! I'm Zypher[^.!]*[.!]?/i,
        /I'm Zypher[^.!]*[.!]?/i,
        /I am Zypher[^.!]*[.!]?/i,
        /I'm an AI coding assistant[^.!]*[.!]?/i,
      ];

      const replacementIntro = `Hello! I'm ${name}, ${description}`.replace(/\s+/g, " ").trim();

      for (const pattern of genericPatterns) {
        if (pattern.test(responseText)) {
          responseText = responseText.replace(pattern, replacementIntro);
          break;
        }
      }
    }

    return new Response(
      JSON.stringify({ response: responseText }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error in chat:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // Health check
  if (url.pathname === "/health") {
    return new Response(
      JSON.stringify({ status: "ok", service: "zypher-deno-backend" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Chat endpoint
  if (url.pathname === "/api/chat" && req.method === "POST") {
    return await handleChat(req);
  }

  return new Response("Not Found", { status: 404, headers: corsHeaders });
}

console.log(`🦕 Zypher Deno Backend starting on http://localhost:${PORT}`);
console.log(`📡 Endpoints:`);
console.log(`   - GET  /health`);
console.log(`   - POST /api/chat`);

await serve(handler, { port: PORT });

