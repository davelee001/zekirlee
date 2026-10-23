import { handleConversation } from "@/lib/conversations/server";

export const runtime = "nodejs";
export const GET = (request: Request) => handleConversation(request);
export const POST = (request: Request) => handleConversation(request);
