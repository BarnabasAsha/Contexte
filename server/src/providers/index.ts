import { config } from "../lib/config.js";
import { AnthropicProvider } from "./anthropic.js";
import { OpenAIProvider } from "./openai.js";
import type { AIProvider, ProviderName } from "./types.js";

function getApiKey(name: ProviderName): string {
  const keys: Record<ProviderName, string> = {
    anthropic: config.anthropicApiKey,
    openai: config.openaiApiKey,
    deepseek: config.deepseekApiKey,
  };
  const key = keys[name];
  if (!key) {
    throw new Error(
      `Missing API key for provider "${name}". Set the corresponding env variable.`
    );
  }
  return key;
}

export function createProvider(name: ProviderName): AIProvider {
  const apiKey = getApiKey(name);

  switch (name) {
    case "anthropic":
      return new AnthropicProvider(apiKey);
    case "openai":
      return new OpenAIProvider({
        name: "openai",
        apiKey,
        model: "gpt-4o-mini",
      });
    case "deepseek":
      return new OpenAIProvider({
        name: "deepseek",
        apiKey,
        baseURL: "https://api.deepseek.com",
        model: "deepseek-chat",
      });
  }
}

export function createProviderWithFallback(
  primary: ProviderName,
  fallbacks: ProviderName[]
): AIProvider[] {
  const seen = new Set<ProviderName>();
  const unique: ProviderName[] = [primary];
  seen.add(primary);

  for (const name of fallbacks) {
    if (seen.has(name)) {
      throw new Error(
        `Duplicate provider "${name}" in configuration. Each provider can only appear once.`
      );
    }
    seen.add(name);
    unique.push(name);
  }

  return unique.map(createProvider);
}
