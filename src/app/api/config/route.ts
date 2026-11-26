import { NextResponse } from "next/server";
import { readConfig } from "@/lib/config/store";
import { toPublicConfig } from "@/lib/config/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public content (everything but the guest list). */
export async function GET() {
  const config = await readConfig();
  return NextResponse.json(toPublicConfig(config), { headers: { "Cache-Control": "no-store" } });
}
