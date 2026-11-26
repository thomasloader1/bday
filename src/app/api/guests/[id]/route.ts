import { NextResponse } from "next/server";
import { readConfig } from "@/lib/config/store";
import { visibleEventsFor } from "@/lib/config/visibility";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One guest by phone number, with only the events they can see. Replaces
 * shipping the whole guest list (and every event) in the client bundle.
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Número inválido" }, { status: 400 });
  }
  const config = await readConfig();
  const guest = config.guests.find((g) => g.id === id);
  if (!guest) {
    return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 });
  }
  return NextResponse.json(
    { ...guest, events: visibleEventsFor(config, guest) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
