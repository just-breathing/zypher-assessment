# 🦕 Zypher Deno Backend

The Deno-based AI agent runtime for the Zypher Chatbot Platform. This backend handles real-time AI chat interactions using the Zypher AI agent library.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Streaming](#streaming)
- [Custom Models](#custom-models)
- [Development](#development)
- [Deployment](#deployment)

---

## 🌟 Overview

The Deno backend serves as the **AI agent runtime** that:

1. Receives chat requests from the Next.js API
2. Initializes Zypher AI agents with custom configurations
3. Processes user messages with RAG context
4. Streams responses back to the client in real-time
5. Supports multiple AI providers (OpenAI, Anthropic)

**Why Deno?**
- The `@corespeed/zypher` library is designed for Deno
- Built-in TypeScript support
- Secure by default (permissions system)
- Modern JavaScript runtime

---

## 🏗️ Architecture

### Request Flow

```
┌────────────────┐
│   Next.js API  │
│   (Port 3000)  │
└───────┬────────┘
        │ POST /chat
        │ {
        │   model, provider, apiKey,
        │   systemInstruction,
        │   chatbotName, chatbotDescription,
        │   message, knowledgeContext
        │ }
        ↓
┌────────────────┐
│   Deno Server  │
│   (Port 8000)  │
├────────────────┤
│ 1. Create      │
│    Zypher      │
│    Agent       │
│                │
│ 2. Build       │
│    Prompt      │
│    with RAG    │
│                │
│ 3. Run Task    │
│    (streaming) │
│                │
│ 4. Stream      │
│    Response    │
└───────┬────────┘
        │ ReadableStream
        │ (text chunks)
        ↓
┌────────────────┐
│   Next.js API  │
│   (Proxy)      │
└───────┬────────┘
        │
        ↓
┌────────────────┐
│   ChatWidget   │
│   (Browser)    │
└────────────────┘
```

### Tech Stack

- **Runtime**: Deno 2.0+
- **AI Library**: @corespeed/zypher (JSR)
- **HTTP Server**: Deno.serve (native)
- **AI Providers**: OpenAI, Anthropic

---

## ✨ Features

### 🤖 AI Agent Management

- **Dynamic Agent Creation**: New agent per request with custom config
- **Multi-Provider Support**: OpenAI and Anthropic models
- **System Instructions**: Custom behavior definition
- **Streaming Responses**: Real-time token-by-token output

### 🧠 RAG Integration

- **Knowledge Context**: Receives pre-retrieved context from Next.js
- **Prompt Engineering**: Combines identity, system instruction, context, and user message
- **Context-Aware Responses**: Uses knowledge base to provide relevant answers

### 🔒 Security

- **CORS**: Configured for Next.js origin
- **Environment Variables**: API keys and config via `.env`
- **Permission System**: Deno's granular permissions

---

## 🚀 Getting Started

### Prerequisites

- **Deno** 2.0 or higher
- **Access** to OpenAI or Anthropic API

### Installation

1. **Install Deno** (if not already installed)
   ```bash
   curl -fsSL https://deno.land/install.sh | sh
   ```

2. **Navigate to Deno app**
   ```bash
   cd apps/deno
   ```

3. **Set up environment variables**
   
   Create `.env` file:
   ```env
   PORT=8000
   NEXT_API_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   deno task dev
   ```

5. **Verify**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"ok"}
   ```

---

## 📁 Project Structure

```
apps/deno/
├── lib/
│   └── zypher.ts           # Zypher agent creation
│
├── main.ts                 # HTTP server & chat handler
├── deno.json              # Deno configuration
├── .env                   # Environment variables
└── README.md              # This file
```

### Key Files

#### `main.ts`
Main HTTP server with endpoints:
- `POST /chat` - Chat with AI agent
- `GET /health` - Health check

#### `lib/zypher.ts`
Zypher agent initialization:
```typescript
export async function createZypherAgent(config: {
  model: string;
  provider: string;
  apiKey: string;
  systemInstruction?: string;
})
```

---

## 🔌 API Endpoints

### `POST /chat`

Process chat message and return AI response.

**Request**:
```json
{
  "model": "gpt-4-turbo",
  "provider": "openai",
  "apiKey": "sk-...",
  "systemInstruction": "You are a helpful assistant.",
  "chatbotName": "Support Bot",
  "chatbotDescription": "Customer support assistant",
  "message": "How do I reset my password?",
  "knowledgeContext": [
    {
      "content": "To reset password, go to Settings...",
      "score": 0.85
    }
  ]
}
```

**Response**: `text/plain` stream (chunks of text)

**Example**:
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4-turbo",
    "provider": "openai",
    "apiKey": "sk-...",
    "message": "Hello!",
    "chatbotName": "My Bot"
  }'
```

---

### `GET /health`

Health check endpoint.

**Response**:
```json
{
  "status": "ok"
}
```

---

## 📡 Streaming

### How Streaming Works

The Deno backend implements **true end-to-end streaming**:

```typescript
// 1. Create Zypher agent
const { agent, model } = await createZypherAgent({ ... });

// 2. Run task (returns async iterable)
const taskResult = agent.runTask(prompt, model);

// 3. Create transform stream
const { readable, writable } = new TransformStream();
const writer = writable.getWriter();
const encoder = new TextEncoder();

// 4. Stream chunks
if (isAsyncIterable(taskResult)) {
  for await (const event of taskResult) {
    const textChunk = extractTextFromEvent(event);
    if (textChunk) {
      await writer.write(encoder.encode(textChunk));
    }
  }
}

// 5. Close stream
await writer.close();

// 6. Return readable stream
return new Response(readable, {
  headers: { "Content-Type": "text/plain" }
});
```

### Event Types

The Zypher agent emits different event types:
- `text` - Text chunk
- `tool_call` - Tool execution
- `complete` - Task complete

We extract and stream only text chunks.

---

## 🎨 Prompt Engineering

### Prompt Structure

```
[Identity]
You are "Chatbot Name", a custom chatbot assistant.
Description: Your chatbot description here.

[System Instruction]
User's custom system instruction...

[Knowledge Context]
RELEVANT CONTEXT FROM KNOWLEDGE BASE:
- Context chunk 1
- Context chunk 2
...

[User Message]
USER QUESTION:
User's actual message here
```

### Identity Override

The backend automatically replaces generic Zypher responses:

```typescript
// If response starts with "I'm Zypher..." or similar
if (responseText.toLowerCase().includes("i'm zypher") ||
    responseText.toLowerCase().includes("i am zypher")) {
  // Replace with chatbot-specific intro
  responseText = `I'm ${chatbotName}, ${chatbotDescription}. ...`;
}
```

---

## 🤖 Custom Models

### Supported Providers

#### OpenAI
- `gpt-4`
- `gpt-4-turbo`
- `gpt-3.5-turbo`

#### Anthropic
- `claude-3-5-sonnet-20241022`
- `claude-3-5-sonnet-20240620`
- `claude-3-opus-20240229`
- `claude-sonnet-4-20250514`

### Adding New Models

1. Update model list in Next.js UI
2. Pass model name to Deno backend
3. Zypher library handles model initialization automatically

---

## 💻 Development

### Local Development

```bash
# Start dev server with hot reload
deno task dev

# Or manually with all permissions
deno run --allow-net --allow-read --allow-env --allow-sys --watch main.ts
```

### Testing

```bash
# Health check
curl http://localhost:8000/health

# Test chat (replace with valid API key)
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4-turbo",
    "provider": "openai",
    "apiKey": "YOUR_OPENAI_API_KEY",
    "message": "Hello!",
    "chatbotName": "Test Bot",
    "systemInstruction": "You are helpful."
  }'
```

### Debugging

Enable verbose logging:
```typescript
// In main.ts
console.log("Request body:", body);
console.log("Agent created:", agent);
console.log("Streaming response...");
```

---

## 🔧 Configuration

### `deno.json`

```json
{
  "tasks": {
    "dev": "deno run --allow-net --allow-read --allow-env --allow-sys --watch main.ts",
    "start": "deno run --allow-net --allow-read --allow-env --allow-sys main.ts"
  },
  "imports": {
    "@corespeed/zypher": "jsr:@corespeed/zypher@^0.5.2"
  }
}
```

### Permissions

- `--allow-net`: HTTP server and external API calls
- `--allow-read`: Read `.env` file
- `--allow-env`: Access environment variables
- `--allow-sys`: System info (required by Zypher)

---

## 🚀 Deployment

### Deno Deploy

1. **Install Deno Deploy CLI**
   ```bash
   deno install -Arf jsr:@deno/deployctl
   ```

2. **Deploy**
   ```bash
   cd apps/deno
   deployctl deploy --project=your-project main.ts
   ```

3. **Set environment variables** in Deno Deploy dashboard:
   - `NEXT_API_URL`
   - Any other required vars

### Docker

```dockerfile
FROM denoland/deno:alpine

WORKDIR /app

COPY . .

EXPOSE 8000

CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "--allow-sys", "main.ts"]
```

**Build and run**:
```bash
docker build -t zypher-deno .
docker run -p 8000:8000 --env-file .env zypher-deno
```

### VPS / Cloud Server

```bash
# Install Deno
curl -fsSL https://deno.land/install.sh | sh

# Clone repo
git clone <repo-url>
cd apps/deno

# Set up .env
nano .env

# Run with PM2 or similar
pm2 start "deno task start" --name zypher-deno
```

---

## 🐛 Troubleshooting

### "Permission denied"
Ensure all required permissions are granted:
```bash
deno task dev  # Uses permissions from deno.json
```

### "Cannot find module @corespeed/zypher"
The module is imported from JSR. Ensure `deno.json` imports are correct:
```json
{
  "imports": {
    "@corespeed/zypher": "jsr:@corespeed/zypher@^0.5.2"
  }
}
```

### "API key invalid"
- Verify OpenAI/Anthropic API key is correct
- Check API key has sufficient credits
- Ensure key has required permissions

### "Streaming not working"
- Check CORS headers are set correctly
- Verify Next.js is piping the stream properly
- Check browser console for errors

### "High latency"
- First request may be slow (cold start)
- Subsequent requests should be fast
- Consider using a warm-up endpoint

---

## 📚 Related Documentation

- [Main Project README](../../README.md)
- [Web App README](../web/README.md)
- [Zypher Library Docs](https://jsr.io/@corespeed/zypher)
- [Deno Documentation](https://docs.deno.com/)

---

## 🔮 Future Improvements

- [ ] WebSocket support for bidirectional streaming
- [ ] Tool/function calling integration
- [ ] Agent memory/conversation history
- [ ] Rate limiting per chatbot
- [ ] Caching for common queries
- [ ] Multi-turn conversation support
- [ ] Agent performance monitoring

---

**Deno AI Runtime for Zypher Platform** 🦕🤖
