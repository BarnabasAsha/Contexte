import OpenAI from "openai";
import { buildDefinitionPrompt, parseDefinitionResponse } from "../lib/prompt.js";
import type { AIProvider, DefinitionRequest, DefinitionResult } from "./types.js";

export class OpenAIProvider implements AIProvider {
  name: string;
  private client: OpenAI;
  private model: string;

  constructor(opts: { name: string; apiKey: string; baseURL?: string; model: string }) {
    this.name = opts.name;
    this.model = opts.model;
    this.client = new OpenAI({
      apiKey: opts.apiKey,
      ...(opts.baseURL && { baseURL: opts.baseURL }),
    });
  }

  async generateDefinition(req: DefinitionRequest): Promise<DefinitionResult> {
    const prompt = buildDefinitionPrompt(req.word, req.context);

    const completion = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      throw new Error(`No response from ${this.name}`);
    }

    return parseDefinitionResponse(text);
  }
}
