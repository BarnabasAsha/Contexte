export const PROVIDER_NAMES = ["anthropic", "openai", "deepseek"] as const;
export type ProviderName = (typeof PROVIDER_NAMES)[number];

export interface DefinitionRequest {
  word: string;
  context: string;
}

export interface DefinitionResult {
  word: string;
  partOfSpeech: string;
  literalMeaning: string;
  contextualMeaning: string;
  confidence: number;
}

export interface AIProvider {
  name: string;
  generateDefinition(req: DefinitionRequest): Promise<DefinitionResult>;
}
