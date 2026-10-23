type EmailAuth = {
  exchangeCodeForSession: (code: string) => Promise<{ error: unknown }>;
  verifyOtp: (options: { token_hash: string; type: "email" }) => Promise<{ error: unknown }>;
};

export async function completeEmailLink(params: URLSearchParams, auth: EmailAuth) {
  try {
    const code = params.get("code");
    const hash = params.get("token_hash");
    if (code && code.length <= 2048 && !hash) return !(await auth.exchangeCodeForSession(code)).error;
    if (hash && hash.length <= 2048 && params.get("type") === "email" && !code) {
      return !(await auth.verifyOtp({ token_hash: hash, type: "email" })).error;
    }
  } catch { /* Invalid/expired links must not expose provider errors. */ }
  return false;
}
