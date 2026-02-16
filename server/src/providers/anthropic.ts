import Anthropic from "@anthropic-ai/sdk";
import { buildDefinitionPrompt, parseDefinitionResponse } from "../lib/prompt.js";
import type { AIProvider, DefinitionRequest, DefinitionResult } from "./types.js";

export class AnthropicProvider implements AIProvider {
  name = "anthropic";
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateDefinition(req: DefinitionRequest): Promise<DefinitionResult> {
    const prompt = buildDefinitionPrompt(req.word, req.context);

    const message = await this.client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (!content || content.type !== "text") {
      throw new Error("Unexpected response type from Anthropic");
    }

    return parseDefinitionResponse((content as { type: "text"; text: string }).text);
  }
}
