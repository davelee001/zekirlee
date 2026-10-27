type Session = { state: "unconfigured" } | { state: "new" } | {
  state: "known";
  stats: () => Promise<number>;
  forget: () => Promise<number>;
  scope?: "browser" | "account";
  replacementCookie?: string;
};

export function createMemoryManagementHandlers(load: (request: Request) => Promise<Session>) {
  const json = (body: object, status = 200, headers: Record<string, string> = {}) => Response.json(body, {
    status, headers: { "Cache-Control": "private, no-store", ...headers },
  });
  const blocked = (request: Request) => {
    const origin = request.headers.get("origin");
    return (origin !== null && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site";
  };
  return {
    async GET(request: Request) {
      if (blocked(request)) return json({ error: "Use memory settings on this site." }, 403);
      try {
        const session = await load(request);
        if (session.state !== "known") return json({ state: session.state, count: 0 });
        return json({ state: "ready", count: await session.stats() });
      } catch {
        return json({ state: "unavailable", error: "Saved memory could not be checked. Your chat still works." }, 503);
      }
    },
    async DELETE(request: Request) {
      if (blocked(request) || request.headers.get("origin") !== new URL(request.url).origin) return json({ error: "Use memory settings on this site." }, 403);
      if (request.headers.get("x-zekirlee-confirm") !== "forget-memory") return json({ error: "Confirm that you want to clear saved memory." }, 400);
      try {
        const session = await load(request);
        if (session.state === "unconfigured") return json({ error: "Memory is not configured. Nothing was cleared." }, 503);
        if (session.state === "new") return json({ cleared: 0, state: "new" });
        const cleared = await session.forget();
        // Switch namespaces so late writes to the old namespace cannot return in future recalls.
        return json({ cleared, state: "new" }, 200, { "Set-Cookie": session.replacementCookie });
      } catch {
        return json({ error: "Clearing memory could not be confirmed. Retry or refresh the status; chat history is unchanged." }, 503);
      }
    },
  };
}
