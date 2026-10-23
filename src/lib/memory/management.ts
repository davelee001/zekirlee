type Session = { state: "unconfigured" } | { state: "new" } | {
  state: "known";
  stats: () => Promise<number>;
  forget: () => Promise<number>;
  replacementCookie: string;
