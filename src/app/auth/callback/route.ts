import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env/public";
import { completeEmailLink } from "@/lib/auth/email-link";

export async function GET(request: NextRequest) {
  let success = false;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      success = await completeEmailLink(request.nextUrl.searchParams, supabase.auth);
    } catch { /* Keep provider details out of redirect URLs. */ }
  }
  // Fixed destination: never redirect to a user-supplied URL.
