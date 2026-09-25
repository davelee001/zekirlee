import { NextRequest, NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { MemWal } from "@mysten-incubation/memwal";
import { z } from "zod";
import { getLanguageModel } from "@/lib/ai/model";
import { getMemoryConfiguration, verifyMainnetRelayer } from "@/lib/memory/configuration";
import { MEMORY_COOKIE, memoryIdentity } from "@/lib/memory/identity";
import { extractionInstructions, factsSchema, storeUsefulFacts } from "@/lib/memory/storage";

