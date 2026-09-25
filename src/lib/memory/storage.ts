import { createHash } from "node:crypto";
import { z } from "zod";

export const factsSchema = z.object({
  facts: z.array(z.object({
    text: z.string().trim().min(1).max(300),
    evidence: z.string().trim().min(1).max(800),
  })).max(3),
