import { handleConversation } from "@/lib/conversations/server";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  return handleConversation(request, (await context.params).id);
}
export async function DELETE(request: Request, context: Context) {
  return handleConversation(request, (await context.params).id);
}
