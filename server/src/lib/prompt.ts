export function buildDefinitionPrompt(word: string, context: string): string {
  return `You are a language expert. Given a word and its surrounding context, provide a contextual definition.

Word: "${word}"
Context: "${context}"

Respond with ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "word": "${word}",
  "partOfSpeech": "noun|verb|adjective|adverb|etc",
  "literalMeaning": "The general/dictionary meaning of the word",
  "contextualMeaning": "What the word means specifically in this context",
  "confidence": 0.0 to 1.0
}`;
}

export interface ParsedDefinition {
  word: string;
  partOfSpeech: string;
  literalMeaning: string;
  contextualMeaning: string;
  confidence: number;
}

export function parseDefinitionResponse(raw: string): ParsedDefinition {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(cleaned);

  return {
    word: String(parsed.word || ""),
    partOfSpeech: String(parsed.partOfSpeech || "unknown"),
    literalMeaning: String(parsed.literalMeaning || ""),
    contextualMeaning: String(parsed.contextualMeaning || ""),
    confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
  };
}
