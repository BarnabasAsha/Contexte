# Contexte — Product Requirements

## Overview

Contexte is a Chrome extension that lets users select text on any webpage, right-click "Get Context", and receive an AI-powered contextual definition via a tooltip.

## Core Flow

1. User selects text on a webpage
2. Right-click → "Get Context"
3. Content script extracts surrounding context (~200-500 chars)
4. Background script sends word + context to server API
5. Server queries AI provider (with fallback chain)
6. Definition displayed in floating tooltip
7. Lookup saved to history (viewable in popup)

## Server

- **POST /api/define** — Takes `{ word, context }`, returns `{ word, partOfSpeech, literalMeaning, contextualMeaning, confidence }`
- **GET /api/health** — Health check
- AI provider chain: primary provider with automatic fallback
- Rate limiting: 100 req/hour per IP

## Client (Chrome Extension)

- **Popup**: Extension name header, "how to use" instructions, lookup history list, clear/refresh buttons
- **Tooltip**: Floating definition display with loading/error/success states
- **Storage**: Lookup history persisted in chrome.storage.local

## AI Providers

- **Anthropic** (Claude) — via @anthropic-ai/sdk
- **OpenAI** (ChatGPT / DeepSeek) — via openai SDK with configurable baseURL
- Automatic fallback: if primary fails, try next provider in chain
