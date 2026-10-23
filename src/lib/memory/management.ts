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
