# 🌐 Zypher Web Application

The Next.js-based web application for the Zypher Chatbot Platform. This is the main user interface where users can create, manage, and customize their AI chatbots.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [RAG System](#rag-retrieval-augmented-generation)
- [SDK Integration](#sdk-integration)
- [Development](#development)

---

## 🌟 Overview

The web application provides:

1. **User Authentication** - Sign up, login, session management
2. **Chatbot Dashboard** - Create, edit, delete chatbots
3. **Knowledge Base Management** - Add/remove knowledge sources
4. **Theme Customization** - Visual editor for chatbot appearance
5. **SDK Generation** - Embeddable widget code
6. **Preview Mode** - Test chatbot before deployment

---

## ✨ Features

### 🔐 Authentication
- **Provider**: Better Auth (email/password)
- **Session Management**: Secure cookie-based sessions
- **Protected Routes**: Middleware-protected dashboard
- **User Profile**: Avatar, name, email management

### 🤖 Chatbot Management

#### Creating a Chatbot
1. Navigate to `/dashboard/agents/new`
2. Fill in required fields:
   - **Name**: Chatbot display name
   - **Description**: Purpose/context
   - **Provider**: OpenAI or Anthropic
   - **Model**: Select from available models
   - **System Instruction**: Define behavior
   - **API Key**: Your provider API key
3. Click "Create Chatbot"

#### Chatbot Configuration

**Settings Tab**:
- Name, description, system instructions
- Model and provider selection
- API key management
- Theme customization (colors, fonts, layout)

**Knowledge Base Tab**:
- Add text knowledge
- Add URL knowledge (auto-crawls nested links)
- View/delete existing sources

**Embed Tab**:
- Copy embed code
- View API keys
- Regenerate API keys
- SDK customization guide

**Preview Tab**:
- Live chatbot preview
- Test conversations
- See theme changes in real-time

### 🎨 Theme Customization

Configure appearance in Settings → Theme & Layout:

```typescript
{
  primaryColor: '#3b82f6',      // Brand color
  backgroundColor: '#ffffff',    // Widget background
  textColor: '#0f172a',         // Text color
  fontFamily: 'Inter',          // Font
  borderRadius: '0.75rem',      // Corner radius
  width: '380px',               // Widget width
  height: '600px',              // Widget height
  position: 'bottom-right',     // Widget position
  buttonLabel: 'Chat with us',  // Button text
  buttonBgColor: '#3b82f6',     // Button background
  buttonTextColor: '#ffffff'    // Button text
}
```

### 📚 Knowledge Base

#### Supported Sources

1. **Text**
   - Direct text input
   - Markdown, JSON, plain text
   - Auto-embedded and indexed

2. **URLs**
   - Single URL crawling
   - Deep nested link crawling
   - HTML → clean text extraction

#### Knowledge Processing

```
User adds source → Text extracted → 
Chunked → Embedded (Transformers.js) → 
Stored in Qdrant with metadata
```

---

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4, Framer Motion
- **UI Components**: Radix UI
- **Database ORM**: Prisma
- **Authentication**: Better Auth
- **Vector DB**: Qdrant JS Client
- **Embeddings**: @xenova/transformers
- **Web Scraping**: Cheerio, html-to-text

### Directory Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── dashboard/         # Protected dashboard
│   │   │   ├── page.tsx      # Chatbot list
│   │   │   └── agents/
│   │   │       ├── new/      # Create chatbot
│   │   │       └── [id]/     # Chatbot detail
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Better Auth routes
│   │   │   └── agents/       # Chatbot CRUD + chat
│   │   ├── chatbot-test/     # SDK test page
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn/Radix UI components
│   │   ├── ChatWidget.tsx    # Main chatbot widget
│   │   ├── Icons.tsx         # Icon components
│   │   └── ...
│   │
│   ├── lib/                   # Utilities
│   │   ├── auth.ts           # Better Auth config
│   │   ├── auth-client.ts    # Client-side auth
│   │   ├── embeddings.ts     # Transformers.js embeddings
│   │   ├── qdrant.ts         # Qdrant client & operations
│   │   ├── webCrawler.ts     # URL crawling
│   │   └── utils.ts          # Helpers
│   │
│   ├── context/              # React Context
│   │   └── auth-context.tsx  # Auth state
│   │
│   ├── types.ts              # TypeScript types
│   └── sdk-entry.tsx         # SDK initialization
│
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Migration history
│
├── public/
│   └── sdk/                  # Built SDK files
│       ├── chatbot.js        # SDK loader
│       └── zypher-chatbot-sdk.js  # Widget bundle
│
├── scripts/
│   └── build-sdk.js          # SDK build script
│
└── package.json
```

---

## 🔌 API Routes

### Authentication

#### `POST /api/auth/signup`
Create new user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response**: `200 OK` with session cookie

---

#### `POST /api/auth/login`
User login.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**: `200 OK` with session cookie

---

#### `POST /api/auth/logout`
User logout (clears session).

---

### Chatbots (Agents)

#### `GET /api/agents`
List all chatbots for authenticated user.

**Response**:
```json
[
  {
    "id": "cm...",
    "name": "Support Bot",
    "description": "Customer support assistant",
    "model": "gpt-4",
    "provider": "openai",
    "systemInstruction": "You are a helpful assistant.",
    "theme": { ... },
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `GET /api/agents/[id]`
Get single chatbot details.

**Headers**: `x-api-key` (for SDK access)

**Response**: Chatbot object

---

#### `POST /api/agents`
Create new chatbot.

**Request**:
```json
{
  "name": "My Bot",
  "description": "A helpful assistant",
  "model": "gpt-4-turbo",
  "provider": "openai",
  "providerApiKey": "sk-...",
  "systemInstruction": "You are helpful.",
  "theme": { ... }
}
```

**Response**: Created chatbot object

---

#### `PUT /api/agents/[id]`
Update chatbot configuration.

**Request**: Partial chatbot object

**Response**: Updated chatbot object

---

#### `DELETE /api/agents/[id]`
Delete chatbot and all associated knowledge.

**Response**: `200 OK`

---

#### `POST /api/agents/[id]/chat`
Chat with chatbot (non-streaming).

**Request**:
```json
{
  "message": "Hello, how are you?"
}
```

**Response**:
```json
{
  "text": "I'm doing well, thank you!",
  "sources": [
    { "content": "...", "metadata": { ... } }
  ]
}
```

---

#### `POST /api/agents/[id]/chat?stream=1`
Chat with chatbot (streaming).

**Request**: Same as non-streaming

**Response**: `text/plain` stream (chunks of text)

---

#### `PUT /api/agents/[id]/apikey`
Regenerate chatbot API key.

**Response**:
```json
{
  "apiKey": "new-api-key"
}
```

---

### Knowledge Base

#### `POST /api/agents/[id]/knowledge`
Add knowledge source.

**Request**:
```json
{
  "type": "text" | "url",
  "content": "Text content or URL"
}
```

**Response**:
```json
{
  "id": "cm...",
  "type": "text",
  "content": "...",
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

---

#### `DELETE /api/agents/[id]/knowledge/[knowledgeId]`
Delete knowledge source and remove from Qdrant.

**Response**: `200 OK`

---

## 🗄️ Database Schema

### User
```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  agents        Agent[]
  sessions      Session[]
  accounts      Account[]
}
```

### Agent (Chatbot)
```prisma
model Agent {
  id                String          @id @default(cuid())
  name              String
  description       String
  model             String          // e.g., "gpt-4-turbo"
  provider          String          // "openai" | "anthropic"
  providerApiKey    String?         // Encrypted API key
  systemInstruction String
  theme             Json            // Theme configuration
  apiKey            String          @unique  // For SDK authentication
  apiSecret         String          // Hashed secret
  userId            String
  user              User            @relation(...)
  knowledgeSources  KnowledgeSource[]
  createdAt         DateTime        @default(now())
}
```

### KnowledgeSource
```prisma
model KnowledgeSource {
  id          String   @id @default(cuid())
  type        String   // "text" | "url"
  content     String   @db.Text
  agentId     String
  agent       Agent    @relation(...)
  lastUpdated DateTime @default(now())
}
```

### Session (Better Auth)
```prisma
model Session {
  id        String   @id
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(...)
}
```

---

## 🧠 RAG (Retrieval-Augmented Generation)

### Overview

The RAG system enhances chatbot responses with relevant knowledge from the knowledge base.

### Flow

```
1. User message received
   ↓
2. Generate embedding for message (Transformers.js)
   ↓
3. Vector search in Qdrant (top 5 results)
   ↓
4. Format context from retrieved chunks
   ↓
5. Send to Deno backend:
   - System instruction
   - Chatbot name/description
   - Retrieved context
   - User message
   ↓
6. LLM generates response
   ↓
7. Stream response to user
```

### Embeddings

**Model**: `Xenova/all-MiniLM-L6-v2` (via Transformers.js)
- **Dimensions**: 384
- **Type**: Sentence embeddings
- **Speed**: ~50ms per embedding (CPU)
- **Runs**: In-process (no external API)

### Vector Database (Qdrant)

**Collection per Chatbot**: `chatbot_{agentId}`

**Point Structure**:
```typescript
{
  id: number,              // Deterministic hash of cuid
  vector: number[],        // 384-dimensional embedding
  payload: {
    originalId: string,    // KnowledgeSource ID
    content: string,       // Original text
    type: string,          // "text" | "url"
    agentId: string,       // Chatbot ID
    timestamp: number      // Unix timestamp
  }
}
```

**Search Parameters**:
- `limit`: 5 (top 5 results)
- `score_threshold`: 0.3 (minimum similarity)

---

## 🔧 SDK Integration

### Building the SDK

```bash
cd apps/web
pnpm build:sdk
```

**Output**:
- `public/sdk/chatbot.js` - Loader script
- `public/sdk/zypher-chatbot-sdk.js` - Widget bundle

### Embedding on External Sites

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <!-- Your content -->
  
  <!-- Zypher Chatbot -->
  <script
    src="https://your-domain.com/sdk/chatbot.js"
    data-agent-id="YOUR_CHATBOT_ID"
    data-api-key="YOUR_API_KEY"
    defer
  ></script>
</body>
</html>
```

### SDK Customization

#### Method 1: Dashboard Settings
Configure in Dashboard → Chatbot → Settings → Theme & Layout

#### Method 2: CSS Variables

```html
<style>
  #zypher-chatbot-root {
    /* Colors */
    --widget-primary: #3b82f6;
    --widget-bg: #ffffff;
    --widget-text: #0f172a;
    
    /* Typography */
    --widget-font: 'Inter', sans-serif;
    --widget-radius: 0.75rem;
    
    /* Layout */
    --widget-width: 400px;
    --widget-height: 650px;
  }
  
  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    #zypher-chatbot-root {
      --widget-bg: #1e293b;
      --widget-text: #f1f5f9;
    }
  }
</style>
```

### CSS Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `--widget-primary` | `#3b82f6` | Primary brand color |
| `--widget-bg` | `#ffffff` | Widget background |
| `--widget-text` | `#0f172a` | Text color |
| `--widget-font` | `'Inter'` | Font family |
| `--widget-radius` | `0.75rem` | Border radius |
| `--widget-width` | `380px` | Widget width |
| `--widget-height` | `600px` | Widget height |
| `--widget-button-bg` | `#3b82f6` | Button background |
| `--widget-button-text` | `#ffffff` | Button text color |

---

## 💻 Development

### Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in required values.

3. **Start PostgreSQL and Qdrant**
   ```bash
   docker-compose up -d
   ```

4. **Run migrations**
   ```bash
   pnpm prisma migrate dev
   ```

5. **Start dev server**
   ```bash
   pnpm dev
   ```

6. **Access at** http://localhost:3000

### Common Commands

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Type check
pnpm type-check

# Database operations
pnpm prisma studio        # Open Prisma Studio
pnpm prisma migrate dev   # Create migration
pnpm prisma generate      # Generate client

# SDK
pnpm build:sdk           # Build SDK bundle
```

### Adding New UI Components

```bash
# Using shadcn/ui
npx shadcn-ui@latest add <component-name>
```

### Database Changes

1. Update `prisma/schema.prisma`
2. Run `pnpm prisma migrate dev --name description`
3. Commit both schema and migration files

---

## 🧪 Testing the SDK

Navigate to http://localhost:3000/chatbot-test to test the embedded SDK.

**Test page shows**:
- SDK configuration
- Live chatbot widget
- Console logs for debugging

---

## 🚀 Production Build

```bash
# Build the app
pnpm build

# Build SDK
pnpm build:sdk

# Start production server
pnpm start
```

**Build outputs**:
- `.next/` - Next.js production build
- `public/sdk/` - SDK files (served statically)

---

## 🐛 Troubleshooting

### "Prisma Client not found"
```bash
pnpm prisma generate
```

### "Cannot connect to database"
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running: `docker-compose ps`

### "Qdrant connection failed"
- Check `QDRANT_URL` in `.env`
- Ensure Qdrant is running: `docker-compose ps`

### "SDK not loading"
- Rebuild SDK: `pnpm build:sdk`
- Check browser console for errors
- Verify script `src` path is correct

### "Embeddings slow"
- First load downloads model (~20MB)
- Subsequent runs are fast (cached)
- Consider using GPU-accelerated embeddings in production

---

## 📚 Related Documentation

- [Main Project README](../../README.md)
- [Deno Backend README](../deno/README.md)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Qdrant Docs](https://qdrant.tech/documentation/)

---

**Next.js App for Zypher Chatbot Platform** 🚀

