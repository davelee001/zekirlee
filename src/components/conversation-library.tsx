"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SIGNED_OUT_EVENT, useAccount } from "@/hooks/use-account";
import { restoreMessages, SESSION_KEY } from "@/lib/ai/session";
import type { ConversationSummary } from "@/lib/conversations/handler";

export function ConversationLibrary() {
  const account = useAccount();
  const [listing, setListing] = useState<{ owner: string; rows: ConversationSummary[]; hasMore: boolean } | null>(null);
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
