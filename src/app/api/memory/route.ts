import { NextRequest, NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { MemWal } from "@mysten-incubation/memwal";
import { z } from "zod";
