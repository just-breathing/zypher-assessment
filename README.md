# 🤖 Zypher Chatbot Platform

A full-stack AI chatbot platform that enables users to create, customize, and embed intelligent chatbots with custom knowledge bases on any website.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)

---

## 🌟 Overview

Zypher is a comprehensive chatbot platform that allows users to:

1. **Create AI Chatbots** with custom names, descriptions, and system instructions
2. **Build Knowledge Bases** from multiple sources (text, URLs, documents)
3. **Customize Appearance** with themes, colors, and layout options
4. **Embed Anywhere** using a simple JavaScript SDK
5. **Manage Multiple Chatbots** from a unified dashboard

The platform uses advanced RAG (Retrieval-Augmented Generation) to provide contextually relevant responses based on the knowledge base you provide.

---

## ✨ Features

### 🎨 Chatbot Creation & Management
- **Multi-Model Support**: OpenAI (GPT-4, GPT-4-turbo), Anthropic (Claude 3.5 Sonnet, Claude Sonnet 4)
- **Custom System Instructions**: Define chatbot personality and behavior
- **Knowledge Base Management**: Add text, URLs, or documents as knowledge sources
- **Deep URL Crawling**: Automatically extract content from nested URLs
- **Vector Search**: Powered by Qdrant for efficient knowledge retrieval

### 🎨 Customization
- **Theme Editor**: Customize colors, fonts, border radius
- **Layout Control**: Set widget width, height, and position
- **Button Customization**: Custom labels, colors, and styles
- **Light/Dark Mode**: Automatic theme switching with CSS variables
- **Preview Mode**: Real-time preview of your chatbot

### 🚀 SDK & Embedding
- **Simple Integration**: One-line script tag
- **Responsive Design**: Mobile and desktop optimized
- **Streaming Responses**: Real-time message streaming
- **Markdown Support**: Rich text formatting in responses
- **No Dependencies**: React bundled, works anywhere

### 🔐 Security & Authentication
- **User Authentication**: Email/password with Better Auth
- **API Key Management**: Secure chatbot access with regenerable keys
- **Protected Routes**: Dashboard and API endpoints secured
- **Session Management**: Persistent user sessions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  - Next.js 16 (App Router)                                  │
│  - React 19 + TypeScript                                    │
│  - TailwindCSS v4 + Framer Motion                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                      API Layer (Next.js)                     │
│  - REST API Routes                                           │
│  - Authentication Middleware                                 │
│  - Prisma ORM (PostgreSQL)                                   │
│  - Qdrant Vector DB Client                                   │
│  - Embeddings (Transformers.js)                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                    Agent Runtime (Deno)                      │
│  - Zypher AI Agent (@corespeed/zypher)                       │
│  - Streaming Chat Responses                                  │
│  - Model Provider Integration                                │
│  - RAG Context Integration                                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                    External Services                         │
│  - PostgreSQL (User/Chatbot Data)                            │
│  - Qdrant (Vector Storage)                                   │
│  - OpenAI / Anthropic (LLM APIs)                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User creates chatbot** → Stored in PostgreSQL with Prisma
2. **User adds knowledge** → Text embedded with Transformers.js → Stored in Qdrant
3. **End-user chats** → Query embedded → Vector search in Qdrant → Context + Query → Deno backend → LLM → Streamed response

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: TailwindCSS v4, Framer Motion
- **Components**: Radix UI, Lucide Icons
- **Markdown**: react-markdown

### Backend
- **API**: Next.js API Routes
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: Better Auth
- **Vector DB**: Qdrant
- **Embeddings**: Transformers.js (@xenova/transformers)
- **Web Scraping**: Cheerio, html-to-text

### AI Runtime
- **Runtime**: Deno
- **Agent**: @corespeed/zypher
- **Models**: OpenAI GPT-4, Anthropic Claude

### DevOps
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Build Tools**: esbuild (SDK), Next.js
- **Containerization**: Docker Compose

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ (for Next.js app)
- **Deno** 2.0+ (for AI agent runtime)
- **pnpm** (package manager)
- **PostgreSQL** (database)
- **Qdrant** (vector database)
- **API Keys**: OpenAI or Anthropic

### Installation Options

#### Option 1: Docker (Recommended for Quick Setup) 🐳

**Fastest way to get started!**

1. **Clone and configure**
   ```bash
   git clone <repository-url>
   cd zypher-assessment
   cp env.example .env
   ```

2. **Edit .env** (minimum required):
   ```bash
   nano .env
   # Change BETTER_AUTH_SECRET to a secure random string
   # Generate with: openssl rand -base64 32
   ```

3. **Build and start**
   ```bash
   chmod +x docker-build.sh
   ./docker-build.sh build
   ./docker-build.sh start
   ```

4. **Run migrations**
   ```bash
   ./docker-build.sh migrate
   ```

5. **Access the application**
   - Web App: http://localhost:3000
   - Deno Backend: http://localhost:8000
   - Qdrant: http://localhost:6333/dashboard

📚 **See [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) for complete Docker documentation**

---

#### Option 2: Local Development

**For active development with hot reload**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zypher-assessment
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create `apps/web/.env`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/zypher"

   # Better Auth
   BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
   BETTER_AUTH_URL="http://localhost:3000"

   # Qdrant
   QDRANT_URL="http://localhost:6333"

   # Deno Backend
   DENO_BACKEND_URL="http://localhost:8000"
   ```

   Create `apps/deno/.env`:
   ```env
   PORT=8000
   NEXT_API_URL=http://localhost:3000
   ```

4. **Start services with Docker** (just PostgreSQL and Qdrant)
   ```bash
   # In apps/web directory
   cd apps/web
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   cd apps/web
   pnpm prisma migrate dev
   ```

6. **Start development servers**

   **Terminal 1 - Next.js (Web)**:
   ```bash
   cd apps/web
   pnpm dev
   ```

   **Terminal 2 - Deno (Agent Runtime)**:
   ```bash
   cd apps/deno
   deno task dev
   ```

7. **Access the application**
   - Web App: http://localhost:3000
   - Deno Backend: http://localhost:8000

---

## 📁 Project Structure

```
zypher-assessment/
├── apps/
│   ├── web/                    # Next.js application
│   │   ├── src/
│   │   │   ├── app/           # App router pages
│   │   │   ├── components/    # React components
│   │   │   ├── lib/           # Utilities, Qdrant, embeddings
│   │   │   ├── types.ts       # TypeScript types
│   │   │   └── sdk-entry.tsx  # SDK entry point
│   │   ├── public/
│   │   │   └── sdk/          # Built SDK files
│   │   ├── prisma/           # Database schema
│   │   └── scripts/          # Build scripts
│   │
│   └── deno/                  # Deno AI runtime
│       ├── lib/              # Zypher agent setup
│       ├── main.ts           # HTTP server & chat handler
│       └── deno.json         # Deno config
│
├── docker-compose.yml         # PostgreSQL + Qdrant
├── turbo.json                # Turborepo config
├── package.json              # Root workspace
└── README.md                 # This file
```

See individual app READMEs for detailed documentation:
- [Web App README](./apps/web/README.md)
- [Deno Backend README](./apps/deno/README.md)

---

## 💻 Development

### Common Commands

```bash
# Install all dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Build all apps
pnpm build

# Run linters
pnpm lint

# Clean all build artifacts
pnpm clean

# Database migrations
cd apps/web && pnpm prisma migrate dev

# Generate Prisma client
cd apps/web && pnpm prisma generate

# Build SDK
cd apps/web && pnpm build:sdk
```

### Development Workflow

1. **Create a new chatbot** at `/dashboard/agents/new`
2. **Add knowledge sources** (text, URLs) on the chatbot detail page
3. **Customize theme** in Settings tab
4. **Preview** in the Preview tab
5. **Copy embed code** from Embed tab
6. **Test SDK** at `/chatbot-test`

### Adding New Features

1. **Frontend changes**: Edit files in `apps/web/src/`
2. **API changes**: Add routes in `apps/web/src/app/api/`
3. **Database changes**: 
   - Update `apps/web/prisma/schema.prisma`
   - Run `pnpm prisma migrate dev`
4. **Agent runtime changes**: Edit `apps/deno/main.ts`
5. **SDK changes**: 
   - Edit `apps/web/src/components/ChatWidget.tsx`
   - Run `pnpm build:sdk`

---

## 🌐 Deployment

### Production Build

```bash
# Build all apps
pnpm build

# Build outputs:
# - apps/web/.next/          (Next.js production build)
# - apps/web/public/sdk/     (SDK bundle)
```

### Environment Variables (Production)

Ensure these are set in your production environment:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="https://your-domain.com"

# Services
QDRANT_URL="https://your-qdrant-instance.com"
DENO_BACKEND_URL="https://your-deno-backend.com"
```

### Deployment Options

1. **Vercel** (Next.js app)
   - Connect GitHub repo
   - Set environment variables
   - Deploy automatically

2. **Deno Deploy** (Agent runtime)
   ```bash
   cd apps/deno
   deno deploy --project=your-project main.ts
   ```

3. **Docker** (Full stack)
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## 📚 Documentation

### User Guides
- [Creating Your First Chatbot](./apps/web/README.md#creating-a-chatbot)
- [Adding Knowledge Sources](./apps/web/README.md#knowledge-base)
- [Customizing Appearance](./apps/web/README.md#theme-customization)
- [Embedding on Your Website](./apps/web/README.md#sdk-integration)
- [SDK Customization](./apps/web/README.md#sdk-customization)

### Developer Guides
- [Web App Architecture](./apps/web/README.md#architecture)
- [Deno Backend Architecture](./apps/deno/README.md#architecture)
- [API Documentation](./apps/web/README.md#api-routes)
- [Database Schema](./apps/web/README.md#database-schema)
- [RAG System](./apps/web/README.md#rag-retrieval-augmented-generation)

### Advanced Topics
- [Vector Embeddings](./apps/web/README.md#embeddings)
- [Streaming Responses](./apps/deno/README.md#streaming)
- [Custom Models](./apps/deno/README.md#custom-models)
- [Theme Variables](./apps/web/README.md#css-variables)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is part of an assessment and is not licensed for public use.

---

## 🆘 Troubleshooting

### Common Issues

**"Deno not found"**
```bash
# Install Deno
curl -fsSL https://deno.land/install.sh | sh
```

**"Cannot connect to Qdrant"**
```bash
# Ensure Qdrant is running
docker-compose up -d qdrant
```

**"Prisma Client not generated"**
```bash
cd apps/web
pnpm prisma generate
```

**"SDK not loading"**
```bash
# Rebuild SDK
cd apps/web
pnpm build:sdk
```

**"Chatbot not responding"**
- Check Deno backend is running on port 8000
- Verify API keys are set for OpenAI/Anthropic
- Check browser console for errors

---

## 📞 Support

For issues and questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review individual app READMEs
3. Check browser console and server logs

---

**Built with ❤️ using Next.js, Deno, and Zypher AI**
