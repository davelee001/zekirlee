export const MEMORY_RESET_EVENT = "zekirlee:memory-reset";
export const MEMORY_RESET_KEY = "zekirlee.memory-reset.v1";

export function announceMemoryReset() {
  window.dispatchEvent(new Event(MEMORY_RESET_EVENT));
  // Other open tabs should stop queued saves too. This value contains no memory data.
  try { localStorage.setItem(MEMORY_RESET_KEY, crypto.randomUUID()); } catch { /* Same-tab notification still works. */ }
}
