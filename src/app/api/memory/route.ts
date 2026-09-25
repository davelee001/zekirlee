import { NextRequest, NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { MemWal } from "@mysten-incubation/memwal";
import { z } from "zod";
import { getLanguageModel } from "@/lib/ai/model";
import { getMemoryConfiguration, verifyMainnetRelayer } from "@/lib/memory/configuration";
import { MEMORY_COOKIE, memoryIdentity } from "@/lib/memory/identity";
import { extractionInstructions, factsSchema, storeUsefulFacts } from "@/lib/memory/storage";

export const runtime = "nodejs";
export const maxDuration = 60;
const schema = z.object({ consent: z.literal(true), text: z.string().trim().min(1).max(8000) }).strict();
const json = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

export async function POST(request: NextRequest) {
