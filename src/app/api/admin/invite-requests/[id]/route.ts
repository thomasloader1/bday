import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { requireAdmin } from "@/lib/adminAuth";
import { VersionConflictError } from "@/lib/config/store";
import { InviteRequestError, resolveInviteRequest, type Resolution } from "@/lib/inviteRequests/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.union([
  z.object({
    action: z.literal("approve"),
    mode: z.literal("new"),
    name: z.string().max(80).default(""),
    groups: z.array(z.string()).default([]),
  }),
  z.object({ action: z.literal("approve"), mode: z.literal("link"), guestId: z.number().int() }),
  z.object({ action: z.literal("reject") }),
]);

/**
 * Resolve one request. Body: { action: "approve", mode: "new", name, groups } adds a guest;
 * { action: "approve", mode: "link", guestId } moves an existing guest to the requested number;
 * { action: "reject" }.
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  try {
    const resolution: Resolution = parsed.data;
    return NextResponse.json(await resolveInviteRequest(params.id, resolution));
  } catch (error) {
    if (error instanceof InviteRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof VersionConflictError) {
      return NextResponse.json({ error: "La configuración cambió mientras tanto. Probá de nuevo." }, { status: 409 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "No se pudo guardar el invitado", issues: error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
        { status: 400 }
      );
    }
    console.error("Resolving invite request failed:", error);
    return NextResponse.json({ error: "No se pudo resolver la solicitud" }, { status: 500 });
  }
}
