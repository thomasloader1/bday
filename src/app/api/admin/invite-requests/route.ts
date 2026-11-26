import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { listInviteRequests } from "@/lib/inviteRequests/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Every invitation request, newest first. */
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  return NextResponse.json(await listInviteRequests(), { headers: { "Cache-Control": "no-store" } });
}
