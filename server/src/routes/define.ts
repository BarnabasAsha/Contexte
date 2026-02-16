import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getDefinition } from "../services/definition.js";

const defineSchema = z.object({
  word: z.string().min(1).max(100),
  context: z.string().min(1).max(2000),
});

const define = new Hono();

define.post(
  "/",
  zValidator("json", defineSchema),
  async (c) => {
    const { word, context } = c.req.valid("json");
    const definition = await getDefinition(word, context);
    return c.json({ success: true, definition });
  }
);

export { define };
