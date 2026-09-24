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
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(event, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(event, callback); };
}
export function usePinnedTopics() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const pins = parsePins(raw);
  function toggle(id: string) {
    const current = parsePins(snapshot());
    const next = JSON.stringify(current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    fallback = next;
    let saved = true;
    window.dispatchEvent(new Event(event));
    return saved;
  }
  return { pins, toggle };
}
