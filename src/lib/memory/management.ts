type Session = { state: "unconfigured" } | { state: "new" } | {
  state: "known";
  stats: () => Promise<number>;
  forget: () => Promise<number>;
  replacementCookie: string;
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
