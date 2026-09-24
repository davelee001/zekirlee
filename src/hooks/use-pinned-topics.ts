"use client";
import { useSyncExternalStore } from "react";
import { parsePins } from "@/lib/knowledge";

const key = "zekirlee.pinned-topics.v1";
const event = "zekirlee:pins-changed";
let fallback: string | null = null;
let memoryOnly = false;
function snapshot() {
  if (memoryOnly) return fallback;
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
