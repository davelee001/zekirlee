"use client";
import Link from "next/link";
import { useState } from "react";
import { useAccount } from "@/hooks/use-account";
import { serializeChatRequest, type SessionMessage } from "@/lib/ai/session";

export function SaveConversation({ messages, disabled }: { messages: SessionMessage[]; disabled: boolean }) {
  const account = useAccount();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function save() {
