import { config } from "../lib/config.js";
import { createProviderWithFallback } from "../providers/index.js";
import type { DefinitionResult } from "../providers/types.js";

const providers = createProviderWithFallback(
  config.primaryProvider,
  config.fallbackProviders
);

export async function getDefinition(
  word: string,
  context: string
): Promise<DefinitionResult> {
  let lastError: Error | undefined;

  for (const provider of providers) {
    try {
      return await provider.generateDefinition({ word, context });
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`Provider ${provider.name} failed:`, lastError.message);
    }
  }

  throw lastError ?? new Error("No AI providers available");
}
