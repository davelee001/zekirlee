type EmailAuth = {
  exchangeCodeForSession: (code: string) => Promise<{ error: unknown }>;
  verifyOtp: (options: { token_hash: string; type: "email" }) => Promise<{ error: unknown }>;
};

export async function completeEmailLink(params: URLSearchParams, auth: EmailAuth) {
  try {
