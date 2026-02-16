# Contexte

AI-powered browser extension for contextual word definitions.

## Architecture

- **server/** — Hono API server with AI provider abstraction (DeepSeek/Claude/ChatGPT)
- **client/** — Chrome extension (Svelte 4 + Rollup), Manifest V3

## Directory Structure

```
server/src/
  index.ts              — Hono entry point
  routes/               — Route handlers (define, health)
  middleware/            — Rate limiter, error handler
  services/             — Business logic (definition orchestration)
  providers/            — AI provider abstraction (Anthropic, OpenAI/DeepSeek)
  lib/                  — Config, prompt templates

client/src/
  components/           — Svelte components (Popup, Tooltip, HistoryList, etc.)
  scripts/              — background.ts (service worker), content.ts (content script)
  lib/                  — Shared types, API client, chrome.storage helpers
```

## Commands

### Server
```bash
cd server
npm run dev          # Start dev server with hot reload (tsx watch)
npm run build        # Build for production (tsup + tsc declarations)
```

### Client
```bash
cd client
npm run dev          # Build with watch + livereload
npm run build        # Production build
npm run validate     # Svelte type checking
npm run type-check   # TypeScript type checking
```

## Conventions

- Server uses Hono with Zod validation
- Client uses Svelte 4 with TypeScript
- AI providers implement the `AIProvider` interface with automatic fallback
- Shared types live in `client/src/lib/types.ts`
- History stored in `chrome.storage.local`
- Server port: 3004 (configured via .env)
