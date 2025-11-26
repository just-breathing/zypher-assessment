# ⚡ Quick Start Guide

Get Zypher Chatbot Platform running in under 5 minutes!

## 🐳 Docker Quick Start (Recommended)

### 1. Prerequisites
- Docker and Docker Compose installed
- 4GB+ RAM available
- Port 3000, 5432, 6333, 8000 available

### 2. Clone & Configure
```bash
git clone <repository-url>
cd zypher-assessment
cp env.example .env
```

### 3. Generate Secret
```bash
# macOS/Linux
echo "BETTER_AUTH_SECRET=\"$(openssl rand -base64 32)\"" >> .env

# Or manually edit .env and add a 32+ character random string
```

### 4. Build & Start
```bash
chmod +x docker-build.sh
./docker-build.sh build    # Build images (takes 2-5 minutes)
./docker-build.sh start    # Start all services
./docker-build.sh migrate  # Run database migrations
```

### 5. Access Application
Open http://localhost:3000

---

## 🎉 Next Steps

### Create Your First Chatbot

1. **Sign Up** at http://localhost:3000/signup
   - Enter your name, email, and password
   - You'll be automatically logged in

2. **Create a Chatbot** at `/dashboard/agents/new`
   - **Name**: "Support Bot"
   - **Description**: "A helpful customer support assistant"
   - **Provider**: OpenAI or Anthropic
   - **Model**: gpt-4-turbo or claude-3-5-sonnet
   - **API Key**: Your OpenAI/Anthropic API key
   - **System Instruction**: "You are a helpful customer support assistant."
   - Click **Create Chatbot**

3. **Add Knowledge**
   - Go to the chatbot detail page
   - Click **Knowledge Base** tab
   - Add text or URLs as knowledge sources
   - Example URL: https://docs.yourproduct.com

4. **Customize Theme**
   - Click **Settings** tab
   - Scroll to **Theme & Layout**
   - Change colors, fonts, size
   - See changes in Preview tab

5. **Get Embed Code**
   - Click **Embed** tab
   - Copy the embed code
   - Paste it into your website's HTML

6. **Test It**
   - Visit http://localhost:3000/chatbot-test
   - See the widget in action
   - Test sending messages

---

## 🔍 Verify Installation

### Check All Services Running
```bash
./docker-build.sh health
```

**Expected output**:
```
✓ postgres (healthy)
✓ qdrant (healthy)
✓ deno (healthy)
✓ web (healthy)
```

### Test Endpoints
```bash
# Web app
curl http://localhost:3000
# Should return HTML

# Deno backend
curl http://localhost:8000/health
# Should return: {"status":"ok"}

# Qdrant
curl http://localhost:6333
# Should return JSON
```

---

## 📊 Useful Commands

```bash
# View logs
./docker-build.sh logs          # All services
./docker-build.sh logs web      # Just web app

# Restart services
./docker-build.sh restart

# Stop services
./docker-build.sh stop

# Clean up
./docker-build.sh clean

# Complete reset
./docker-build.sh reset
```

---

## 🐛 Troubleshooting

### "Port already in use"
```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change the port in docker-compose.yml
```

### Services not healthy
```bash
# Wait 30-60 seconds for initialization
./docker-build.sh health

# Check logs if still failing
./docker-build.sh logs
```

### "Database migration failed"
```bash
# Reset database and remigrate
docker-compose down -v
./docker-build.sh start
./docker-build.sh migrate
```

### Can't access application
```bash
# Check if all services are running
docker-compose ps

# Restart web service
docker-compose restart web

# Check web logs
docker-compose logs web
```

---

## 📚 Full Documentation

- [Main README](./README.md) - Complete project overview
- [Docker Guide](./DOCKER_GUIDE.md) - Detailed Docker instructions
- [Web App README](./apps/web/README.md) - Next.js app documentation
- [Deno Backend README](./apps/deno/README.md) - AI runtime documentation

---

## 🎯 What You Built

### Architecture Overview
```
┌─────────────┐
│   Browser   │ ← User accesses web app
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Next.js    │ ← Dashboard, auth, API
│   (3000)    │
└──┬───────┬──┘
   │       │
   ▼       ▼
┌──────┐ ┌──────┐
│Postgre││Qdrant│ ← Data & vectors
└──────┘ └──────┘
   │
   ▼
┌─────────────┐
│    Deno     │ ← AI agent runtime
│   (8000)    │
└─────────────┘
```

### Features You Have
- ✅ User authentication
- ✅ Multi-chatbot management
- ✅ Knowledge base with RAG
- ✅ Theme customization
- ✅ Embeddable SDK
- ✅ Streaming responses
- ✅ Markdown rendering
- ✅ Light/dark mode

---

## 🚀 Production Deployment

For production deployment:

1. **Update `.env` for production**
   ```env
   BETTER_AUTH_URL="https://your-domain.com"
   NODE_ENV="production"
   ```

2. **Set up SSL/TLS** (use nginx reverse proxy)

3. **Configure automated backups**
   ```bash
   # Backup script
   docker-compose exec postgres pg_dump -U zypher zypher > backup.sql
   ```

4. **Set up monitoring** (Prometheus, Grafana, or similar)

5. **Deploy** using Docker Compose, Kubernetes, or cloud provider

See [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) for detailed production deployment instructions.

---

## 💡 Tips

### Get Better Results
1. Write clear, specific system instructions
2. Add comprehensive knowledge sources
3. Test with various questions
4. Iterate on system instructions

### Optimize Performance
1. Use appropriate model (GPT-4 for complex, GPT-3.5 for simple)
2. Keep knowledge sources focused and relevant
3. Monitor token usage
4. Consider caching for common queries

### Customize Appearance
1. Match your brand colors
2. Test both light and dark modes
3. Ensure good contrast ratios
4. Test on mobile devices

---

**Happy Building! 🎉**

Need help? Check the [full documentation](./README.md) or review the [troubleshooting section](#troubleshooting).

