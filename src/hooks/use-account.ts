"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env/public";
import { SESSION_KEY } from "@/lib/ai/session";

export const SIGNED_OUT_EVENT = "zekirlee:signed-out";
export const SIGNED_OUT_KEY = "zekirlee.signed-out.v1";
type Account = { state: "loading" | "disabled" | "guest" | "signed-in" | "unavailable"; user: { id: string; email?: string } | null };
