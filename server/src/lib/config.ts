import dotenv from "dotenv";
import { PROVIDER_NAMES, type ProviderName } from "../providers/types.js";

dotenv.config();

function parseProvider(value: string | undefined): ProviderName {
  if (!value) {
    throw new Error(
      `PRIMARY_PROVIDER is required. Valid values: ${PROVIDER_NAMES.join(", ")}`
    );
  }
  if (!(PROVIDER_NAMES as readonly string[]).includes(value)) {
    throw new Error(
      `Invalid PRIMARY_PROVIDER "${value}". Valid values: ${PROVIDER_NAMES.join(", ")}`
    );
  }
  return value as ProviderName;
}

function parseFallbackProviders(value: string | undefined): ProviderName[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      if (!(PROVIDER_NAMES as readonly string[]).includes(s)) {
        throw new Error(
          `Invalid fallback provider "${s}". Valid values: ${PROVIDER_NAMES.join(", ")}`
        );
      }
      return s as ProviderName;
    });
}

export const config = {
  port: parseInt(process.env.PORT || "3004", 10),
  primaryProvider: parseProvider(process.env.PRIMARY_PROVIDER),
  fallbackProviders: parseFallbackProviders(process.env.FALLBACK_PROVIDERS),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || "",
} as const;
